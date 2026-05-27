"use client";

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Heart, 
  User, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// --- DEFINISI BACKEND URL PRODUCTION RAILWAY ---
// Ini ditambahkan agar Next.js tidak memunculkan error "Cannot find name 'BACKEND_URL'" saat build
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app';

interface HealthRecord {
  _id: string;
  createdAt: string;
  prediction: string;
  diabetesRisk?: number;
  bmi: number;
  age: number;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Pasien");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("Sesi Anda habis. Silakan login kembali.");
          setLoading(false);
          return;
        }

        // Mengambil data profil / nama user jika ada di localStorage
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);

        // Memanggil API Riwayat Rekam Medis dari Backend Railway
        const response = await fetch(`${BACKEND_URL}/api/health/records`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data riwayat (Status: ${response.status})`);
        }

        const data = await response.json();
        // Pastikan format data disesuaikan dengan array response dari backend kamu
        setRecords(Array.isArray(data) ? data : data.records || []);
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message || "Gagal terhubung ke server backend Railway.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Menghitung statistik sederhana dari riwayat pemeriksaan
  const totalPemeriksaan = records.length;
  const rekamMedisTerakhir = records[0] || null;
  const statusRisikoTerakhir = rekamMedisTerakhir?.prediction || "Belum ada data";

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans">
      <div className="flex">
        <Sidebar />

        <div className="md:pl-64 pt-20 md:pt-0 w-full">
          <main className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Sapaan Welcome */}
            <div className="space-y-1">
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                Selamat Datang Kembali, {userName}! 👋
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Berikut adalah ringkasan status klinis dan riwayat analisis kesehatan Anda.
              </p>
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-3">
                <AlertCircle size={16} className="text-rose-500" />
                <p>{error}</p>
              </div>
            )}

            {/* BENTO STATISTIK RINGKASAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Stat 1 */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Skrining</p>
                  <h3 className="text-lg font-black text-slate-800 mt-0.5">{totalPemeriksaan} Kali</h3>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${statusRisikoTerakhir.toLowerCase().includes('high') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Heart size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Risiko Terakhir</p>
                  <h3 className="text-lg font-black text-slate-800 mt-0.5">{statusRisikoTerakhir}</h3>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">BMI Terakhir</p>
                  <h3 className="text-lg font-black text-slate-800 mt-0.5">
                    {rekamMedisTerakhir ? `${rekamMedisTerakhir.bmi} kg/m²` : '-'}
                  </h3>
                </div>
              </div>

            </div>

            {/* TABEL / LIST RIWAYAT MEDIS */}
            <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">Riwayat Skrining Terkini</h2>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Memuat riwayat medis dari server Railway...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Belum ada riwayat pemeriksaan kesehatan ditemukan. Silakan masuk ke menu Cek Kesehatan untuk memulai.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-3 px-2">Tanggal Pemeriksaan</th>
                        <th className="py-3 px-2">Usia Klinis</th>
                        <th className="py-3 px-2">Skor BMI</th>
                        <th className="py-3 px-2 text-right">Hasil Prediksi AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {records.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-2 text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 px-2">Kategori Usia ke-{item.age}</td>
                          <td className="py-3.5 px-2 font-mono font-bold text-slate-600">{item.bmi}</td>
                          <td className="py-3.5 px-2 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
                              item.prediction.toLowerCase().includes('high')
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              {item.prediction}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}