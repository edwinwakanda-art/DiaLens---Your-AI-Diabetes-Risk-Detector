"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  User,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertOctagon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import Sidebar from '../components/Sidebar';

// Sanitasi BASE_URL untuk mencegah double slash atau URL rusak jika di Vercel diakhiri tanda '/'
const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app';
const BASE_URL = RAW_URL.replace(/\/$/, '');

interface MedicalLog {
  id: string;
  date: string;
  age: string;
  weight: string;
  height: string;
  bmi: string;
  highBP: string;
  highChol: string;
  prediction: string;
  status: string;
  ai_recommendation?: string; 
  risk_level?: string;         
  diabetesRisk?: number; 
}

interface StatCardProps {
  title: string;
  value: string;
  desc: string;
  icon: React.ElementType;
  iconBg: string;
  gradientBg: string;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, desc, icon: Icon, iconBg, gradientBg, valueColor = "text-slate-900" }) => (
  <div className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 p-7 bg-gradient-to-br ${gradientBg} shadow-sm transition-all hover:shadow-md`}>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Activity</span>
        <h3 className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</h3>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{desc}</p>
        </div>
      </div>
      <div className={`p-3 rounded-2xl text-white ${iconBg} shadow-sm`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [userName, setUserName] = useState<string>('Pengguna');
  const [screeningData, setScreeningData] = useState<{
    totalScreening: number;
    latestBmi: string;
    aiRiskStatus: string;
    chartData: any[];
    lastLog: MedicalLog | null;
  }>({
    totalScreening: 0,
    latestBmi: '- BMI',
    aiRiskStatus: 'Belum Ada',
    chartData: [],
    lastLog: null
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchHealthRecords = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setUserName(parsed.name);
      }

      if (!token) {
        setApiError('Sesi login tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      // Pemanggilan endpoint yang sudah diperbaiki & disanitasi
      const res = await fetch(`${BASE_URL}/api/health/records`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Backend merespons dengan kode kesalahan status: ${res.status}`);
      }

      const result = await res.json();
      const records = result.records || [];

      if (records.length === 0) {
        setScreeningData({
          totalScreening: 0,
          latestBmi: '- BMI',
          aiRiskStatus: 'Belum Ada',
          chartData: [],
          lastLog: null
        });
      } else {
        // Balik urutan agar data grafik berurutan dari medis terlama -> terbaru
        const sortedRecordsForChart = [...records].reverse();
        const chartDataMapped = sortedRecordsForChart.map((rec: any, idx: number) => ({
          name: `Pemeriksaan ${idx + 1}`,
          bmi: rec.biometrics?.bmi ? parseFloat(rec.biometrics.bmi) : 0,
          risk: rec.results?.diabetesRisk ? parseFloat((rec.results.diabetesRisk * 100).toFixed(1)) : 0
        }));

        const latestRecord = records[0]; 
        const rawBmi = latestRecord.biometrics?.bmi;
        const formattedBmi = rawBmi ? `${parseFloat(rawBmi).toFixed(1)} BMI` : '- BMI';
        const riskStatus = latestRecord.results?.riskLevel || 'Belum Ada';

        const lastLogMapped: MedicalLog = {
          id: latestRecord._id,
          date: latestRecord.createdAt,
          age: latestRecord.biometrics?.age || '-',
          weight: latestRecord.biometrics?.weight || '-',
          height: latestRecord.biometrics?.height || '-',
          bmi: rawBmi ? parseFloat(rawBmi).toFixed(1) : '-',
          highBP: latestRecord.clinical?.highBP || 'No',
          highChol: latestRecord.clinical?.highChol || 'No',
          prediction: latestRecord.results?.prediction === 1 ? 'Diabetes' : 'Non-Diabetes',
          status: riskStatus,
          ai_recommendation: latestRecord.results?.aiRecommendation,
          risk_level: riskStatus,
          diabetesRisk: latestRecord.results?.diabetesRisk
        };

        setScreeningData({
          totalScreening: records.length,
          latestBmi: formattedBmi,
          aiRiskStatus: riskStatus,
          chartData: chartDataMapped,
          lastLog: lastLogMapped
        });
      }
    } catch (err: any) {
      console.error('❌ Error fetching health records:', err);
      setApiError(err.message || 'Terjadi kesalahan sistem saat menghubungi server backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const getRiskColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'low risk':
      case 'low':
        return 'text-emerald-600 bg-emerald-50';
      case 'medium risk':
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'high risk':
      case 'high':
        return 'text-rose-600 bg-rose-50';
      default:
        return 'text-emerald-600 bg-emerald-50';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-[1400px] mx-auto space-y-8">
        
        {/* Banner Selamat Datang */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl shadow-blue-100/40">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100/80">User Dashboard</span>
              <h1 className="text-3xl font-black tracking-tight">Selamat Datang, {userName}!</h1>
            </div>
            <p className="text-xs text-blue-50/90 max-w-sm font-medium leading-relaxed">
              Ini adalah ruang pantau aktivitas kesehatan Anda. Gunakan menu navigasi untuk menguji risiko medis atau melihat riwayat pemeriksaan Anda.
            </p>
          </div>
        </div>

        {/* Panel Notifikasi Error API */}
        {apiError && (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50/60 p-5 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm shadow-rose-200">
                  <AlertOctagon size={20} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-rose-900 tracking-tight">Sinkronisasi Jalur API Terhambat</h4>
                  <p className="text-xs text-rose-700/90 font-medium leading-relaxed">{apiError}</p>
                </div>
              </div>
              <button 
                onClick={fetchHealthRecords}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm shadow-rose-100 transition-all hover:bg-rose-700 active:scale-95"
              >
                <RefreshCw size={14} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
                <span>Muat Ulang</span>
              </button>
            </div>
          </div>
        )}

        {/* Baris Kartu Informasi Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Skrining"
            value={loading ? '...' : `${screeningData.totalScreening} Kali`}
            desc="Jumlah akumulasi semua pemeriksaan Anda."
            icon={TrendingUp}
            iconBg="bg-blue-600"
            gradientBg="from-blue-50/30 to-indigo-50/10"
          />
          <StatCard
            title="Indeks Massa Tubuh"
            value={loading ? '...' : screeningData.latestBmi}
            desc="Hasil BMI terbaru yang dihitung dari entri berat dan tinggi badan terakhir."
            icon={User}
            iconBg="bg-indigo-600"
            gradientBg="from-indigo-50/30 to-purple-50/10"
          />
          <StatCard
            title="Status Risiko AI"
            value={loading ? '...' : screeningData.aiRiskStatus}
            desc="Kategori risiko terakhir yang dipetakan dinamis sesuai kriteria medis."
            icon={Zap}
            iconBg="bg-emerald-600"
            gradientBg="from-emerald-50/40 to-teal-50/10"
            valueColor={
              screeningData.aiRiskStatus.toLowerCase().includes('high') ? 'text-rose-600' :
              screeningData.aiRiskStatus.toLowerCase().includes('medium') ? 'text-amber-500' : 'text-emerald-600'
            }
          />
        </div>

        {/* Baris Konten Analitik & Log Cepat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Grafik Tren Kesehatan */}
          <div className="lg:col-span-2 rounded-[2.5rem] bg-white border border-slate-200/60 p-7 shadow-sm flex flex-col min-h-[420px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Data Analytics</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">Grafik Tren Kesehatan & Risiko DiaLens</h3>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>Grafik BMI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Proyeksi Risiko AI</span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              {loading ? (
                <p className="text-xs font-semibold text-slate-400 italic">Memuat grafik analitik...</p>
              ) : screeningData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={screeningData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="bmi" name="BMI" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" />
                    <Area type="monotone" dataKey="risk" name="Persentase Risiko (%)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs font-semibold text-slate-400 italic">Belum ada rekam medis tersimpan untuk akun ini.</p>
              )}
            </div>
          </div>

          {/* Quick Access & Detail Ringkasan */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Panel Ringkasan Rekam Medis Terakhir */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-6 shadow-sm flex-1 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Latest Summary</p>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Kondisi Medis Terakhir</h3>
              </div>
              
              {loading ? (
                <p className="text-xs font-semibold text-slate-400 italic">Memuat ringkasan data...</p>
              ) : screeningData.lastLog ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">BMI Terakhir</p>
                      <p className="text-sm font-black text-slate-800 mt-0.5">{screeningData.lastLog.bmi}</p>
                    </div>
                    <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Umur / BB / TB</p>
                      <p className="text-sm font-black text-slate-800 mt-0.5">
                        {screeningData.lastLog.age} thn / {screeningData.lastLog.weight}kg / {screeningData.lastLog.height}cm
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">Kolesterol Tinggi:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${screeningData.lastLog.highChol.toLowerCase() === 'yes' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {screeningData.lastLog.highChol.toLowerCase() === 'yes' ? 'Ya' : 'Tidak'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">Tekanan Darah Tinggi:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${screeningData.lastLog.highBP.toLowerCase() === 'yes' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {screeningData.lastLog.highBP.toLowerCase() === 'yes' ? 'Ya' : 'Tidak'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-start gap-3 ${getRiskColor(screeningData.lastLog.status)}`}>
                    {screeningData.lastLog.prediction === 'Diabetes' ? (
                      <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-black tracking-tight">Hasil Prediksi: {screeningData.lastLog.prediction}</p>
                      {screeningData.lastLog.ai_recommendation && (
                        <p className="text-[11px] font-medium leading-relaxed opacity-95 line-clamp-3">
                          {screeningData.lastLog.ai_recommendation}
                        </p>
                      )}
                      <span className="inline-block text-[9px] font-black text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded mt-2">
                        {new Date(screeningData.lastLog.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400 italic">Belum ada riwayat aktivitas log medis.</p>
              )}
            </div>

            {/* Quick Access Menu */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-6 shadow-sm space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Quick Access</p>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Mulai Tindakan</h3>
              </div>
              <div className="space-y-2.5">
                <Link href="/check" className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs transition-transform hover:scale-[1.02] shadow-sm shadow-blue-100">
                  <span>Luncurkan Skrining Baru</span>
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </Link>
                <Link href="/history" className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-xs transition-colors border border-slate-100">
                  <span>Lihat Seluruh Riwayat Medis</span>
                  <ArrowUpRight size={16} strokeWidth={2.5} className="text-slate-400" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}