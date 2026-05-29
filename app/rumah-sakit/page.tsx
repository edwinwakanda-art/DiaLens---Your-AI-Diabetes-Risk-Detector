"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bed,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hospital,
  MapPin,
  MapPinned,
  Phone,
  RefreshCw,
  Search,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  DEFAULT_PROVINCE_CODE,
  getProvinceByCode,
  INDONESIA_PROVINCES,
} from "../lib/indonesia-provinces";

interface HospitalFacilities {
  land_area?: string | null;
  building_area?: string | null;
  total_beds?: number | null;
}

interface HospitalBeds {
  class_i?: number | null;
  class_ii?: number | null;
  class_iii?: number | null;
  hcu?: number | null;
  perinatology?: number | null;
  icu_with_ventilator?: number | null;
}

interface HospitalServices {
  count?: number | null;
  list?: string[] | null;
}

interface HospitalStaff {
  total?: number | null;
  general_practitioner?: number | null;
  basic_specialist?: number | null;
  other_specialist?: number | null;
}

interface HospitalItem {
  code?: string | null;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  type?: string | null;
  class?: string | null;
  blu_status?: string | null;
  ownership?: string | null;
  director?: string | null;
  facilities?: HospitalFacilities | null;
  beds?: HospitalBeds | null;
  services?: HospitalServices | null;
  staff?: HospitalStaff | null;
  province_code?: string | null;
  regency_code?: string | null;
  scraped_at?: string | null;
}

interface HospitalPaging {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

interface HospitalsResponse {
  is_success?: boolean;
  message?: string;
  data?: HospitalItem[] | null;
  paging?: HospitalPaging | null;
}

interface SummaryCardProps {
  title: string;
  value: string;
  caption: string;
  icon: React.ElementType;
  iconBg: string;
  valueColor?: string;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const toDisplayText = (value: unknown, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const toFiniteNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value: unknown, fallback = "-") => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue)
    ? numberValue.toLocaleString("id-ID")
    : fallback;
};

const formatDate = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return "-";

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const SummaryCard = ({
  title,
  value,
  caption,
  icon: Icon,
  iconBg,
  valueColor = "text-slate-900",
}: SummaryCardProps) => (
  <div className="rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {title}
        </p>
        <h3 className={`mt-2 text-2xl font-black tracking-tight ${valueColor}`}>
          {value}
        </h3>
      </div>
      <div className={`rounded-2xl p-3 text-white shadow-sm ${iconBg}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="mt-3 text-[11px] font-semibold leading-relaxed text-slate-500">
      {caption}
    </p>
  </div>
);

const HospitalCard = ({ hospital }: { hospital: HospitalItem }) => {
  const services = hospital.services?.list?.filter(Boolean).slice(0, 3) || [];

  return (
    <article className="flex min-h-[300px] flex-col rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-sm shadow-blue-100">
            <Hospital size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              {toDisplayText(hospital.type, "Rumah Sakit")}
            </p>
            <h3 className="mt-1 text-base font-black leading-snug tracking-tight text-slate-900">
              {toDisplayText(hospital.name, "Nama rumah sakit tidak tersedia")}
            </h3>
          </div>
        </div>
        <span className="shrink-0 rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
          {toDisplayText(hospital.code)}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-xs font-semibold text-slate-600">
        <div className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-blue-500" />
          <span className="leading-relaxed">{toDisplayText(hospital.address)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={15} className="shrink-0 text-blue-500" />
          <span>{toDisplayText(hospital.phone, "Tidak tersedia")}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-slate-100 pt-5 text-xs">
        <div>
          <p className="font-black uppercase tracking-[0.12em] text-slate-400">Kelas</p>
          <p className="mt-1 font-black text-slate-900">
            {toDisplayText(hospital.class)}
          </p>
        </div>
        <div>
          <p className="font-black uppercase tracking-[0.12em] text-slate-400">Status</p>
          <p className="mt-1 font-black text-slate-900">
            {toDisplayText(hospital.blu_status)}
          </p>
        </div>
        <div>
          <p className="font-black uppercase tracking-[0.12em] text-slate-400">Pemilik</p>
          <p className="mt-1 font-black text-slate-900">
            {toDisplayText(hospital.ownership)}
          </p>
        </div>
        <div>
          <p className="font-black uppercase tracking-[0.12em] text-slate-400">Regency</p>
          <p className="mt-1 font-black text-slate-900">
            {toDisplayText(hospital.regency_code)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Bed size={14} />
            <span className="font-black uppercase">Bed</span>
          </div>
          <p className="mt-1 font-black text-slate-900">
            {formatNumber(hospital.facilities?.total_beds)}
          </p>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Stethoscope size={14} />
            <span className="font-black uppercase">Layanan</span>
          </div>
          <p className="mt-1 font-black text-slate-900">
            {formatNumber(hospital.services?.count)}
          </p>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users size={14} />
            <span className="font-black uppercase">Staff</span>
          </div>
          <p className="mt-1 font-black text-slate-900">
            {formatNumber(hospital.staff?.total)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        {services.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-3">
            {services.map((service, index) => (
              <span
                key={`${service}-${index}`}
                className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-100"
              >
                {service}
              </span>
            ))}
          </div>
        )}
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Update {formatDate(hospital.scraped_at)}
        </p>
      </div>
    </article>
  );
};

const LoadingCard = ({ index }: { index: number }) => (
  <div className="min-h-[300px] rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-sm">
    <div className="animate-pulse space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-100" />
          <div className="space-y-2">
            <div className="h-2.5 w-28 rounded bg-slate-100" />
            <div className="h-4 w-44 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-6 w-14 rounded-xl bg-slate-100" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 rounded bg-slate-100" />
        <div className="h-10 rounded bg-slate-100" />
        <div className="h-10 rounded bg-slate-100" />
        <div className="h-10 rounded bg-slate-100" />
      </div>
      <div className="h-9 rounded bg-slate-100" />
    </div>
    <span className="sr-only">Loading card {index + 1}</span>
  </div>
);

export default function RumahSakitPage() {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(DEFAULT_PROVINCE_CODE);
  const [nameInput, setNameInput] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [paging, setPaging] = useState<HospitalPaging | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const selectedProvince = useMemo(
    () => getProvinceByCode(selectedProvinceCode) || INDONESIA_PROVINCES[0],
    [selectedProvinceCode]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadHospitals = async () => {
      try {
        const params = new URLSearchParams({
          province_code: selectedProvinceCode,
          page: String(page),
          size: String(pageSize),
        });

        if (submittedName) {
          params.set("name", submittedName);
        }

        const response = await fetch(`/api/rumah-sakit?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
        });

        const payload: HospitalsResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || payload.is_success === false) {
          throw new Error(payload.message || "Gagal mengambil data rumah sakit.");
        }

        if (controller.signal.aborted) {
          return;
        }

        setHospitals(Array.isArray(payload.data) ? payload.data : []);
        setPaging(payload.paging || null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Kesalahan sinkronisasi rumah sakit:", error);
        setHospitals([]);
        setPaging(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Koneksi data rumah sakit tidak tersedia."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadHospitals();
    return () => controller.abort();
  }, [page, pageSize, refreshNonce, selectedProvinceCode, submittedName]);

  const totalItems = paging?.total_item ?? hospitals.length;
  const totalPages = Math.max(paging?.total_page ?? 1, 1);
  const currentPage = paging?.page ?? page;
  const totalBedsOnPage = hospitals.reduce(
    (total, hospital) => total + toFiniteNumber(hospital.facilities?.total_beds),
    0
  );
  const totalStaffOnPage = hospitals.reduce(
    (total, hospital) => total + toFiniteNumber(hospital.staff?.total),
    0
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setPage(1);
    setSubmittedName(nameInput.trim());
  };

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setErrorMessage(null);
    setSelectedProvinceCode(event.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setErrorMessage(null);
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const clearSearch = () => {
    setLoading(true);
    setErrorMessage(null);
    setNameInput("");
    setSubmittedName("");
    setPage(1);
  };

  const refreshHospitals = () => {
    setLoading(true);
    setErrorMessage(null);
    setRefreshNonce((current) => current + 1);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        <Sidebar />

        <div className="w-full pt-20 md:pl-64 md:pt-0">
          <main className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 p-7 text-white shadow-xl shadow-blue-100/60 md:p-8">
              <div className="absolute right-0 top-0 h-72 w-72 translate-x-12 -translate-y-16 rounded-full bg-white/10 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white/15 p-3 shadow-sm ring-1 ring-white/20">
                    <Hospital size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-100">
                      Direktori Faskes
                    </p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">
                      Rumah Sakit Indonesia
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                      <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                        {selectedProvince.name}
                      </span>
                      <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                        Kode {selectedProvince.code}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshHospitals}
                  disabled={loading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-xs font-black text-blue-700 shadow-sm transition-all hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                  <span>Muat Ulang</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex flex-col gap-4 rounded-[2rem] border border-rose-100 bg-rose-50/70 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-rose-500 p-3 text-white shadow-sm">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-900">
                      Data Rumah Sakit Belum Tersedia
                    </h4>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-rose-700">
                      {errorMessage}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refreshHospitals}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-black text-white shadow-sm transition-all hover:bg-rose-700"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  <span>Coba Lagi</span>
                </button>
              </div>
            )}

            <form
              onSubmit={handleSearchSubmit}
              className="rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_0.65fr_auto] lg:items-end">
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Provinsi
                  </span>
                  <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white"
                  >
                    {INDONESIA_PROVINCES.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Nama RS
                  </span>
                  <input
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    placeholder="RSUD, Siloam, Hermina"
                    className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Per Halaman
                  </span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-xs font-black text-white shadow-sm shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.99]"
                  >
                    <Search size={15} />
                    <span>Cari</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearSearch}
                    disabled={!nameInput && !submittedName}
                    title="Reset pencarian"
                    className="inline-flex min-h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SummaryCard
                title="Total Data"
                value={formatNumber(totalItems, "0")}
                caption={`Rumah sakit di ${selectedProvince.name}`}
                icon={Building2}
                iconBg="bg-blue-600"
                valueColor="text-blue-700"
              />
              <SummaryCard
                title="Tempat Tidur"
                value={formatNumber(totalBedsOnPage, "0")}
                caption="Akumulasi pada halaman aktif"
                icon={Bed}
                iconBg="bg-emerald-600"
                valueColor="text-emerald-700"
              />
              <SummaryCard
                title="Tenaga Medis"
                value={formatNumber(totalStaffOnPage, "0")}
                caption="Total staff pada halaman aktif"
                icon={MapPinned}
                iconBg="bg-cyan-600"
                valueColor="text-cyan-700"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Hasil Pencarian
                </p>
                <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900">
                  {submittedName
                    ? `${submittedName} di ${selectedProvince.name}`
                    : `Semua Rumah Sakit di ${selectedProvince.name}`}
                </h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <LoadingCard key={index} index={index} />
                ))
              ) : hospitals.length > 0 ? (
                hospitals.map((hospital, index) => (
                  <HospitalCard
                    key={`${hospital.code || hospital.name || "hospital"}-${index}`}
                    hospital={hospital}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <Hospital size={22} />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-800">
                    Rumah sakit tidak ditemukan
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {selectedProvince.name} dengan kode {selectedProvince.code}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-[2rem] border border-slate-200/70 bg-white p-3 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setErrorMessage(null);
                  setPage((current) => Math.max(current - 1, 1));
                }}
                disabled={loading || currentPage <= 1}
                title="Halaman sebelumnya"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="px-3 text-center text-xs font-black text-slate-600">
                {formatNumber(hospitals.length, "0")} data tampil
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setErrorMessage(null);
                  setPage((current) => Math.min(current + 1, totalPages));
                }}
                disabled={loading || currentPage >= totalPages}
                title="Halaman berikutnya"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
