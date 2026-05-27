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

// =========================================================================
// 🔒 FUNGSI FORMAT URL: Memaksa format URL agar selalu absolut (bukan relatif)
// =========================================================================
const getCleanBaseUrl = (): string => {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app';
  
  rawUrl = rawUrl.trim();
  rawUrl = rawUrl.replace(/['"]/g, '');

  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  if (rawUrl.endsWith('/')) {
    rawUrl = rawUrl.slice(0, -1);
  }

  return rawUrl;
};

const BASE_URL = getCleanBaseUrl();

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

const StatCard = ({ title, value, desc, icon: Icon, iconBg, gradientBg, valueColor = "text-slate-900" }: StatCardProps) => (
  <div className={`rounded-[2rem] border border-slate-200/60 bg-gradient-to-b ${gradientBg} p-6 shadow-sm transition-all duration-300 hover:shadow-md`}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white/80 px-2 py-0.5 rounded-md border border-slate-100">
        Aktivitas Pengguna
      </span>
      <div className={`p-2.5 rounded-xl ${iconBg} text-white shadow-sm`}>
        <Icon size={16} />
      </div>
    </div>
    <div className="mt-4">
      <h3 className={`text-2xl font-black tracking-tight ${valueColor}`}>{value}</h3>
      <p className="text-xs font-black uppercase tracking-[0.05em] text-slate-700 mt-1">{title}</p>
      <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState('Pengguna DiaLens');
  const [historyData, setHistoryData] = useState<MedicalLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [screeningData, setScreeningData] = useState<{
    totalScreening: string;
    lastBmi: string;
    lastRisk: string;
    lastLog: MedicalLog | null;
  }>({
    totalScreening: '0 Kali',
    lastBmi: '- BMI',
    lastRisk: 'Belum Ada',
    lastLog: null,
  });

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const token = localStorage.getItem('token'); 
      if (!token) {
        setErrorMessage("Token autentikasi tidak ditemukan. Silakan lakukan login ulang ke sistem DiaLens.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/health/records`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Server Backend merespons dengan kode kesalahan status: ${res.status}`);
      }

      const resJson = await res.json();
      
      // =========================================================================
      // 🚀 PARSING FLEXIBLE: Membaca array data dari struktur JSON backend apa pun
      // =========================================================================
      let history: any[] = [];
      if (Array.isArray(resJson)) {
        history = resJson;
      } else if (resJson && typeof resJson === 'object') {
        history = resJson.records || resJson.data || resJson.history || [];
      }

      // Jika data rekam medis memang masih kosong dari database MongoDB cloud
      if (history.length === 0) {
        setHistoryData([]);
        setScreeningData({
          totalScreening: '0 Kali',
          lastBmi: '- BMI',
          lastRisk: 'Belum Ada',
          lastLog: null,
        });
        setLoading(false);
        return;
      }

      // Menerapkan pemetaan struktur data agar sesuai dengan model visual frontend
      const normalizedHistory: MedicalLog[] = history.map((log: any) => {
        const ageVal = log.age || log.biometrics?.age || log.biometrics?.Age || '-';
        const weightVal = log.weight || log.biometrics?.weight || '-';
        const heightVal = log.height || log.biometrics?.height || '-';

        let extractedBmi = log.bmi || log.biometrics?.bmi ?? undefined;
        
        if ((extractedBmi === undefined || Number(extractedBmi) === 0 || extractedBmi === '-') && weightVal !== '-') {
          const w = parseFloat(String(weightVal));
          const h = parseFloat(String(heightVal)) / 100;
          if (w > 0 && h > 0) {
            extractedBmi = (w / (h * h)).toFixed(1);
          }
        }

        const finalBmi = (extractedBmi !== undefined && extractedBmi !== null && String(extractedBmi).trim() !== '') ? String(extractedBmi) : '-';
        
        let extractedPrediction = log.prediction || log.risk_level || log.results?.riskLevel || log.results?.prediction || 'Low';
        if (extractedPrediction === 1 || extractedPrediction === "1" || extractedPrediction === "High") extractedPrediction = 'High';
        if (extractedPrediction === 0 || extractedPrediction === "0" || extractedPrediction === "Low") extractedPrediction = 'Low';

        let finalDiabetesRisk = undefined;
        if (log.diabetesRisk !== undefined && log.diabetesRisk !== null) {
          finalDiabetesRisk = Number(log.diabetesRisk);
        } else if (log.results && log.results.diabetesRisk !== undefined) {
          finalDiabetesRisk = Number(log.results.diabetesRisk);
        }

        return {
          id: log.id || log._id || 'DL-Log',
          date: log.date || log.createdAt || new Date().toISOString(),
          age: String(ageVal),
          weight: String(weightVal),
          height: String(heightVal),
          bmi: finalBmi,
          highBP: log.highBP || log.clinical?.highBP || 'No',
          highChol: log.highChol || log.clinical?.highChol || 'No',
          prediction: String(extractedPrediction),
          status: log.status || (extractedPrediction === 'High' ? 'Warning' : 'Safe'),
          ai_recommendation: log.ai_recommendation || log.results?.aiRecommendation || 'Tidak ada rekomendasi dari AI.',
          risk_level: log.risk_level || String(extractedPrediction),
          diabetesRisk: finalDiabetesRisk
        };
      });

      // Mengurutkan data berdasarkan waktu dari terlama ke terbaru untuk grafik Recharts
      const sortedForChart = [...normalizedHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setHistoryData(sortedForChart);

      // Mengambil entri terbaru untuk komponen pencatatan kartu statistik atas
      const latestLog = [...normalizedHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      const riskStatus = latestLog.prediction ? latestLog.prediction.split(' (')[0] : 'Low';

      setScreeningData({
        totalScreening: `${normalizedHistory.length} Kali`,
        lastBmi: latestLog.bmi !== '-' && latestLog.bmi !== '0' ? `${latestLog.bmi} BMI` : '- BMI',
        lastRisk: riskStatus,
        lastLog: latestLog,
      });

    } catch (error: any) {
      console.error("Log kesalahan penarikan data API:", error);
      setErrorMessage(error.message || "Gagal menyinkronkan data grafik dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setDisplayName(storedName);
      }
    }
    fetchHealthRecords();
  }, []);

  const getRiskStyles = (risk: string) => {
    const normRisk = risk.toLowerCase();
    if (normRisk.includes('tinggi') || normRisk === 'danger' || normRisk === 'high') {
      return {
        bg: 'bg-rose-500',         
        text: 'text-rose-600',
        cardBg: 'from-rose-50/60 to-white',
        border: 'border-rose-100',
        icon: ShieldAlert
      };
    }
    if (normRisk.includes('sedang') || normRisk === 'warning' || normRisk === 'medium' || normRisk.includes('ringan')) {
      return {
        bg: 'bg-orange-500',       
        text: 'text-orange-600',
        cardBg: 'from-orange-50/60 to-white',
        border: 'border-orange-100',
        icon: AlertTriangle
      };
    }
    return {
      bg: 'bg-emerald-500',        
      text: 'text-emerald-600',
      cardBg: 'from-emerald-50/60 to-white',
      border: 'border-emerald-100',
      icon: CheckCircle2
    };
  };

  const currentRiskStyle = getRiskStyles(screeningData.lastRisk);
  const StatusIcon = currentRiskStyle.icon;

  const chartData = historyData.map(({ date, bmi, prediction, diabetesRisk }) => {
    let riskPercent = 15;
    
    if (diabetesRisk !== undefined && diabetesRisk !== null) {
      riskPercent = diabetesRisk;
    } else {
      const normPred = prediction.toLowerCase();
      if (normPred.includes('sedang') || normPred === 'medium' || normPred.includes('ringan')) riskPercent = 45;
      if (normPred.includes('tinggi') || normPred === 'high') riskPercent = 75;
    }

    return {
      Tanggal: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
               ' ' + new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      'Indeks Massa Tubuh (BMI)': parseFloat(bmi) || 0,
      'Tingkat Risiko AI (%)': riskPercent,
    };
  });

  const formatRecommendationText = (text: string) => {
    if (!text) return '';
    return text.split('*').map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-900 bg-blue-50/60 px-1 rounded">{part}</strong> : part
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        <Sidebar />
        <div className="md:pl-64 pt-20 md:pt-0 w-full">
          <main className="p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100/60 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">Panel Ringkasan</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Selamat Datang, {displayName}!</h1>
                </div>
                <div className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                  Ini adalah ruang pantau aktivitas kesehatan Anda. Gunakan menu navigasi untuk menguji risiko medis atau melihat riwayat pemeriksaan Anda.
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="rounded-[2rem] border-2 border-rose-100 bg-rose-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                  <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-200">
                    <AlertOctagon size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-900 tracking-tight">Sinkronisasi API Terhambat</h4>
                    <p className="text-xs text-rose-700 font-medium mt-0.5 leading-relaxed max-w-2xl">{errorMessage}</p>
                  </div>
                </div>
                <button 
                  onClick={fetchHealthRecords}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  <span>Muat Ulang</span>
                </button>
              </div>
            )}

            {/* Grid Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Skrining" value={screeningData.totalScreening} desc="Jumlah akumulasi pemeriksaan Anda." icon={TrendingUp} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white" />
              <StatCard title="Indeks Massa Tubuh" value={screeningData.lastBmi} desc="Hasil BMI dari entri tinggi dan berat badan terakhir Anda." icon={User} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white" />
              <StatCard 
                title="Status Risiko AI" 
                value={screeningData.lastRisk} 
                desc="Kategori risiko terakhir yang dipetakan dinamis sesuai kriteria medis." 
                icon={Zap} 
                iconBg={currentRiskStyle.bg} 
                gradientBg={currentRiskStyle.cardBg} 
                valueColor={currentRiskStyle.text}
              />
            </div>

            {/* DIAGRAM TREN */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Analisis Grafik</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Grafik Tren Kesehatan & Risiko DiaLens</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                    <span className="text-slate-600">Grafik BMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="text-slate-600">Proyeksi Risiko AI</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-72 text-xs font-semibold">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic gap-2">
                    <RefreshCw size={14} className="animate-spin text-indigo-500" />
                    <span>Sinkronisasi grafik dengan database...</span>
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="Tanggal" stroke="#94a3b8" tickLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                      <Area type="monotone" dataKey="Indeks Massa Tubuh (BMI)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" />
                      <Area type="monotone" dataKey="Tingkat Risiko AI (%)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorRisk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic">Belum ada rekam medis tersimpan untuk akun ini.</div>
                )}
              </div>
            </div>

            {/* KOTAK REKOMENDASI MEDIS OTOMATIS */}
            <div className={`rounded-[2.5rem] bg-white border ${currentRiskStyle.border} p-6 md:p-8 shadow-sm space-y-4`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${currentRiskStyle.bg} text-white shadow-md`}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Rekomendasi Klinis</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Saran Kesehatan Terpersonalisasi (AI)</h3>
                </div>
              </div>

              {loading ? (
                <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin text-slate-400" />
                  <span>Mengekstrak rekomendasi medis...</span>
                </div>
              ) : screeningData.lastLog?.ai_recommendation ? (
                <div className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/80 rounded-2xl p-6 border border-slate-100 whitespace-pre-line shadow-inner">
                  {formatRecommendationText(screeningData.lastLog.ai_recommendation)}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed">
                  Belum memiliki data diagnosis rekomendasi dari database cluster.
                </div>
              )}
            </div>

            {/* Log Activity & Tombol Tindakan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-sm space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Riwayat Log</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Timeline Pemeriksaan Terbaru</h3>
                </div>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-xs font-semibold text-slate-400 italic">Sinkronisasi log aktivitas...</p>
                  ) : screeningData.lastLog ? (
                    <div className={`flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border ${currentRiskStyle.border}`}>
                      <div className={`p-2 ${currentRiskStyle.bg} text-white rounded-xl mt-0.5 shadow-sm`}>
                        <StatusIcon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Melakukan Cek Kesehatan Mandiri ({screeningData.lastLog.id})</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          Sistem memproses data fisik dengan hasil kesimpulan tingkat risiko <span className={`font-bold ${currentRiskStyle.text}`}>{screeningData.lastLog.prediction}</span>.
                        </p>
                        <span className="inline-block text-[9px] font-black text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded mt-2">
                          {new Date(screeningData.lastLog.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 italic">Belum ada riwayat aktivitas log medis ditemukan.</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 rounded-[2.5rem] bg-white border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Akses Cepat</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Mulai Tindakan</h3>
                </div>
                <div className="space-y-2.5">
                  <Link href="/check" className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs transition-transform hover:scale-[1.02] shadow-sm shadow-blue-100">
                    <span>Luncurkan Skrining Baru</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}