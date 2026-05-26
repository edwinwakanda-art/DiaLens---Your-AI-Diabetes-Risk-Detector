"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  User,
  Zap,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
// Import modul Recharts untuk Diagram
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
        User Activity
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
  const [displayName] = useState(() => {
    if (typeof window === 'undefined') return 'Pengguna DiaLens';
    return localStorage.getItem('userName') || 'Pengguna DiaLens';
  });
  
  const [historyData, setHistoryData] = useState<MedicalLog[]>([]);
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

  useEffect(() => {
    // Data default simulasi yang diisi menggunakan format single asterisk (*) dari backend kamu
    const defaultData: MedicalLog[] = [
      { 
        id: 'DL-4385', 
        date: '2026-05-26', 
        age: '25-29 thn', 
        weight: '60 kg', 
        height: '165 cm', 
        bmi: '22.0', 
        highBP: 'No', 
        highChol: 'No', 
        prediction: 'Risiko Ringan (12%)', 
        status: 'Safe',
        risk_level: 'Low',
        ai_recommendation: '*Interpretasi hasil* \nHasil skrining Anda menunjukkan risiko diabetes sebesar 19,8% dengan level "Low". Faktor "GenHlth" (kesehatan umum) menurunkan risiko, sementara "Age_BMI_Risk" sedikit menaikkan risiko; kolesterol Anda masih baik.\n\n*3 langkah konkret untuk minggu ini* \n1. *Tingkatkan serat harian* – Tambahkan satu porsi buah (mis. apel atau beri) dan satu porsi sayur berdaun hijau dalam setiap makan utama. Serat membantu mengontrol gula darah. \n2. *Jaga pola makan seimbang* – Ganti satu lauk berlemak (mis. gorengan) dengan protein tanpa lemak seperti ikan kukus atau tahu, serta pilih karbohidrat komplek (beras merah, quinoa, atau kacang). \n3. *Aktivitas ringan tiap hari* – Lakukan berjalan cepat 30 menit (atau 10 menit tiga kali) setelah makan siang atau malam. Ini mudah dilakukan dan mendukung kontrol berat badan serta sensitivitas insulin.\n\n*Kapan harus ke dokter* \nJika Anda merasakan gejala seperti haus berlebihan, sering buang air kecil, atau penurunan berat badan yang tidak dijelaskan dalam 2-3 minggu ke depan, atau bila hasil tes gula darah rutin (sebelum atau setelah makan) berada di atas batas normal, segeralah konsultasikan ke dokter.\n\n*Catatan:* Informasi ini merupakan hasil skrining AI DiaLens, bukan diagnosis medis. Untuk kepastian, silakan periksakan diri ke dokter.\n\nSemangat! Langkah kecil hari ini akan membantu Anda mempertahankan kesehatan jangka panjang. 🚀'
      },
      { 
        id: 'DL-9082', 
        date: '2026-05-18', 
        age: '45-49 thn', 
        weight: '78 kg', 
        height: '168 cm', 
        bmi: '27.6', 
        highBP: 'Yes', 
        highChol: 'Yes', 
        prediction: 'Risiko Tinggi (76%)', 
        status: 'Danger',
        risk_level: 'High',
        ai_recommendation: '*Interpretasi hasil* \nHasil prediksi cepat menunjukkan tingkat risiko tinggi. \n\n*3 langkah konkret untuk minggu ini* \n1. *Kurangi Karbohidrat* – Kurangi takaran porsi nasi putih harian. \n2. *Olahraga Rutin* – Lakukan kardio ringan terukur. \n3. *Cek Laboratorium* – Konsultasikan nilai HbA1c Anda.'
      }
    ];

    let history: MedicalLog[] = [];
    const storedHistory = localStorage.getItem('medicalHistory');

    if (storedHistory) {
      try {
        history = JSON.parse(storedHistory) as MedicalLog[];
      } catch {
        history = defaultData;
        localStorage.setItem('medicalHistory', JSON.stringify(defaultData));
      }
    } else {
      history = defaultData;
      localStorage.setItem('medicalHistory', JSON.stringify(defaultData));
    }

    // Mengurutkan data secara kronologis (lampau ke baru) khusus untuk kebutuhan Diagram Recharts
    const sortedForChart = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setHistoryData(sortedForChart);

    if (history.length > 0) {
      const latest = history[0];
      const riskStatus = latest.prediction.split(' (')[0];

      setScreeningData({
        totalScreening: `${history.length} Kali`,
        lastBmi: `${latest.bmi} BMI`,
        lastRisk: riskStatus,
        lastLog: latest,
      });
    }
  }, []);

  const getRiskStyles = (risk: string) => {
    if (risk.includes('Tinggi')) {
      return {
        bg: 'bg-rose-500',         
        text: 'text-rose-600',
        cardBg: 'from-rose-50/60 to-white',
        border: 'border-rose-100',
        icon: ShieldAlert
      };
    }
    if (risk.includes('Sedang')) {
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

  // Memetakan riwayat rekam medis ke bentuk data diagram interaktif
  const chartData = historyData.map(({ date, bmi, prediction }) => {
    let riskPercent = 15; 
    if (prediction.includes('Sedang')) riskPercent = 45;
    if (prediction.includes('Tinggi')) riskPercent = 75;

    return {
      Tanggal: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      'Indeks Massa Tubuh (BMI)': parseFloat(bmi),
      'Tingkat Risiko AI (%)': riskPercent,
    };
  });

  // Parser teks akurat dengan pemisah tunggal '*' sesuai response backend Railway kamu
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
            
            {/* Header Dashboard */}
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100/60 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">User Dashboard</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Selamat Datang, {displayName}!</h1>
                </div>
                <div className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                  Ini adalah ruang pantau aktivitas kesehatan Anda. Gunakan menu navigasi untuk menguji risiko medis atau melihat riwayat pemeriksaan Anda.
                </div>
              </div>
            </div>

            {/* Grid Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Skrining" value={screeningData.totalScreening} desc="Jumlah akumulasi semua pemeriksaan Anda." icon={TrendingUp} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white" />
              <StatCard title="Indeks Massa Tubuh" value={screeningData.lastBmi} desc="Hasil BMI terbaru yang dihitung dari entri berat dan tinggi badan terakhir." icon={User} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white" />
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

            {/* DIAGRAM TREN DIAGRAM TETAP AMAN DI SINI */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Data Analytics</p>
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
                {chartData.length > 0 ? (
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
                      <YAxis stroke="#94a3b8" tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                      <Area type="monotone" dataKey="Indeks Massa Tubuh (BMI)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" />
                      <Area type="monotone" dataKey="Tingkat Risiko AI (%)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorRisk)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic">Memuat grafik...</div>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">AI Medical Advice</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Rekomendasi Klinis Terpersonalisasi</h3>
                </div>
              </div>

              {screeningData.lastLog?.ai_recommendation ? (
                <div className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/80 rounded-2xl p-6 border border-slate-100 whitespace-pre-line shadow-inner">
                  {formatRecommendationText(screeningData.lastLog.ai_recommendation)}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed">
                  Belum ada data rekomendasi medis dari server.
                </div>
              )}
            </div>

            {/* Log Activity & Quick Access */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div className="lg:col-span-2 rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-sm space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Activity Logs</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Timeline Aktivitas Terbaru</h3>
                </div>
                <div className="space-y-4">
                  {screeningData.lastLog ? (
                    <div className={`flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border ${currentRiskStyle.border}`}>
                      <div className={`p-2 ${currentRiskStyle.bg} text-white rounded-xl mt-0.5 shadow-sm`}>
                        <StatusIcon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Melakukan Cek Kesehatan Mandiri ({screeningData.lastLog.id})</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          Sistem berhasil memprediksi parameter fisik dengan kesimpulan <span className={`font-bold ${currentRiskStyle.text}`}>{screeningData.lastLog.prediction}</span>.
                        </p>
                        <span className="inline-block text-[9px] font-black text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded mt-2">
                          {screeningData.lastLog.date}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 italic">Belum ada riwayat aktivitas log medis.</p>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1 rounded-[2.5rem] bg-white border border-slate-200/60 p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Quick Access</p>
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