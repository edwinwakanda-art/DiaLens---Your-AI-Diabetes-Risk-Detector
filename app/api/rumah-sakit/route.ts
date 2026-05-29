import { NextRequest, NextResponse } from "next/server";
import { INDONESIA_PROVINCES } from "../../lib/indonesia-provinces";

const HOSPITAL_API_BASE_URL = (
  process.env.API_CO_ID_BASE_URL || "https://use.api.co.id"
).replace(/\/$/, "");

const HOSPITAL_API_KEY = process.env.API_CO_ID_KEY || "";

const clampIntegerParam = (
  value: string | null,
  fallback: number,
  max: number
) => {
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.min(parsedValue, max);
};

const getApiMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = String((payload as { message?: unknown }).message ?? "").trim();
    return message || fallback;
  }

  return fallback;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!HOSPITAL_API_KEY) {
    return NextResponse.json(
      {
        is_success: false,
        message: "Konfigurasi API rumah sakit belum tersedia.",
        data: null,
      },
      { status: 500 }
    );
  }

  const provinceCode = request.nextUrl.searchParams.get("province_code")?.trim() || "";
  const provinceIsValid = INDONESIA_PROVINCES.some(
    (province) => province.code === provinceCode
  );

  if (!provinceIsValid) {
    return NextResponse.json(
      {
        is_success: false,
        message: "Kode provinsi tidak valid.",
        data: null,
      },
      { status: 400 }
    );
  }

  const page = clampIntegerParam(request.nextUrl.searchParams.get("page"), 1, 10_000);
  const size = clampIntegerParam(request.nextUrl.searchParams.get("size"), 20, 100);
  const name = request.nextUrl.searchParams.get("name")?.trim();

  const apiUrl = new URL("/hospitals/indonesia/", HOSPITAL_API_BASE_URL);
  apiUrl.searchParams.set("province_code", provinceCode);
  apiUrl.searchParams.set("page", String(page));
  apiUrl.searchParams.set("size", String(size));

  if (name) {
    apiUrl.searchParams.set("name", name);
  }

  try {
    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-co-id": HOSPITAL_API_KEY,
      },
      cache: "no-store",
    });

    const contentType = apiResponse.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await apiResponse.json().catch(() => null)
      : await apiResponse.text().catch(() => "");

    if (!apiResponse.ok) {
      return NextResponse.json(
        {
          is_success: false,
          message: getApiMessage(payload, "Gagal mengambil data rumah sakit."),
          data: payload,
        },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(payload, {
      status: apiResponse.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Hospital API proxy error:", error);
    return NextResponse.json(
      {
        is_success: false,
        message: "Koneksi ke layanan rumah sakit tidak tersedia.",
        data: null,
      },
      { status: 502 }
    );
  }
}
