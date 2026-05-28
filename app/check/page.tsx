"use client";

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Scale,
  HeartPulse,
  Droplets,
  Eye,
  Dumbbell,
  Cigarette,
  CheckCircle2,
  Info,
  Sparkles,
  RefreshCw,
  Percent,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app';
const BASE_URL = RAW_URL.replace(/\/$/, '');

interface FormCardProps {
  label: string;
  alias: string;
  icon: React.ElementType;
  iconBg: string;
  gradientBg: string;
  children: React.ReactNode;
  className?: string;
}

const FormCard = ({ label, alias, icon: Icon, iconBg, gradientBg, children, className = "" }: FormCardProps) => (
  <div className={`rounded-[2rem] border border-slate-200/60 bg-gradient-to-b ${gradientBg} p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200/80 flex flex-col justify-between group ${className}`}>
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className={`p-2 rounded-xl text-white ${iconBg} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
          {alias}
        </span>
      </div>
      <div>
        <h4 className="text-xs font-black uppercase tracking-[0.05em] text-slate-700">{label}</h4>
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

interface PredictionResult {
  prediction: string;
  probability: number;
  riskLevel: string;
  aiRecommendation: string;
}

export default function CheckPage() {
  const [ageGroup, setAgeGroup] = useState('1'); 
  const [heightCm, setHeightCm] = useState('');  
  const [weightKg, setWeightKg] = useState('');  
  const [bmi, setBmi] = useState('0');           

  const [highBP, setHighBP] = useState('0');
  const [highChol, setHighChol] = useState('0');
  const [cholCheck, setCholCheck] = useState('1');
  const [smoker, setSmoker] = useState('0');
  const [physActivity, setPhysActivity] = useState('1');
  const [hvyAlcoholConsump, setHvyAlcoholConsump] = useState('0');
  const [genHlth, setGenHlth] = useState('3');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const heightMeters = parseFloat(heightCm) / 100;
    const weight = parseFloat(weightKg);

    if (heightMeters > 0 && weight > 0) {
      const calculatedBmi = weight / (heightMeters * heightMeters);
      setBmi(calculatedBmi.toFixed(1));
    } else {
      setBmi('0');
    }
  }, [heightCm, weightKg]);

  const getRiskStyles = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    if (level === 'tinggi' || level === 'high') {
      return {
        bg: 'bg-red-50/40 border-red-100/60',
        text: 'text-red-600',
        badge: 'bg-red-50 text-red-600 border-red-100',
        indicator: 'text-red-100/50',
        label: 'text-red-500',
        cardBorder: 'border-red-200'
      };
    } else if (level === 'sedang' || level === 'medium') {
      return {
        bg: 'bg-orange-50/40 border-orange-100/60',
        text: 'text-orange-600',
        badge: 'bg-orange-50 text-orange-600 border-orange-100',
        indicator: 'text-orange-100/50',
        label: 'text-orange-500',
        cardBorder: 'border-orange-200'
      };
    } else {
      return {
        bg: 'bg-green-50/40 border-green-100/60',
        text: 'text-green-600',
        badge: 'bg-green-50 text-green-600 border-green-100',
        indicator: 'text-green-100/50',
        label: 'text-green-500',
        cardBorder: 'border-green-200'
      };
    }
  };

  const riskStyles = result ? getRiskStyles(result.riskLevel) : getRiskStyles('rendah');

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    // MURNI KANTONG 9 DATA (TIDAK DITAMBAHKAN VARIABEL APAPUN AGAR API TIDAK ERROR)
    const payload = {
      Age: parseInt(ageGroup),
      BMI: parseFloat(bmi) || 22.0,
      HighBP: parseInt(highBP),
      HighChol: parseInt(highChol),
      CholCheck: parseInt(cholCheck),
      Smoker: parseInt(smoker),
      HvyAlcoholConsump: parseInt(hvyAlcoholConsump),
      PhysActivity: parseInt(physActivity),
      GenHlth: parseInt(genHlth)
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Sesi masuk telah berakhir. Silakan lakukan login ulang.');
      }

      const res = await fetch(`${BASE_URL}/api/health/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          // ✨ AMAN: Kirim BB dan TB lewat Header HTTP terpisah
          'X-User-Weight': weightKg || "-",
          'X-User-Height': heightCm || "-"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Gagal memproses data. Kode status server: ${res.status}`);
      }

      const resJson = await res.json();
      const rawData = resJson.data || resJson;

      let prediksiIndo = 'Bukan Diabetes';
      if (rawData.prediction === 1 || rawData.prediction === '1' || String(rawData.risk_level).toLowerCase().includes('high')) {
        prediksiIndo = 'Terdeteksi Risiko Diabetes';
      }

      let tingkatRisikoIndo = 'Rendah';
      const rLevel = String(rawData.risk_level || '').toLowerCase();
      if (rLevel.includes('high') || rLevel.includes('tinggi')) tingkatRisikoIndo = 'Tinggi';
      if (rLevel.includes('medium') || rLevel.includes('sedang')) tingkatRisikoIndo = 'Sedang';

      const probValue = rawData.probability !== undefined 
        ? (rawData.probability <= 1 ? Math.round(rawData.probability * 100) : Math.round(rawData.probability))
        : 0;

      setResult({
        prediction: prediksiIndo,
        probability: probValue,
        riskLevel: tingkatRisikoIndo,
        aiRecommendation: rawData.ai_recommendation || rawData.aiRecommendation || 'Tetap jaga pola makan sehat, batasi konsumsi gula berlebih, dan lakukan aktivitas fisik secara teratur.'
      });

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi gangguan eksternal saat menghubungi server AI.');
    } finally {
      setLoading(false);
    }
  };

  const formatRecommendationText = (text: string) => {
    if (!text) return '';
    return text.split('*').map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-extrabold text-blue-900 bg-blue-50 px-1 rounded">{part}</strong> : part
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        <Sidebar />
        <div className="md:pl-64 pt-20 md:pt-0 w-full">
          <main className="p-8 max-w-7xl mx-auto space-y-6">
            
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100/60 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">Skrining Kesehatan</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Analisis Risiko Diabetes AI</h1>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-[2rem] border border-blue-200 bg-blue-50/50 p-5 flex items-start gap-4">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-900">Kendala Integrasi Server</h4>
                  <p className="text-xs text-blue-700 font-medium mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <FormCard label="Kelompok Usia Anda" alias="Demografi" icon={Calendar} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Level 1 (Usia 18 - 24)</option>
                    <option value="2">Level 2 (Usia 25 - 29)</option>
                    <option value="3">Level 3 (Usia 30 - 34)</option>
                    <option value="4">Level 4 (Usia 35 - 39)</option>
                    <option value="5">Level 5 (Usia 40 - 44)</option>
                    <option value="6">Level 6 (Usia 45 - 49)</option>
                    <option value="7">Level 7 (Usia 50 - 54)</option>
                    <option value="8">Level 8 (Usia 55 - 59)</option>
                    <option value="9">Level 9 (Usia 60 - 64)</option>
                    <option value="10">Level 10 (Usia 65 - 69)</option>
                    <option value="11">Level 11 (Usia 70 - 74)</option>
                    <option value="12">Level 12 (Usia 75 - 79)</option>
                    <option value="13">Level 13 (Usia 80 atau lebih tua)</option>
                  </select>
                </FormCard>

                <FormCard label="Tinggi Badan" alias="Antropometri" icon={Scale} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <div className="relative flex items-center">
                    <input type="number" required placeholder="Contoh: 170" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 pr-10 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    <span className="absolute right-3 text-[10px] font-black text-slate-400 uppercase">cm</span>
                  </div>
                </FormCard>

                <FormCard label="Berat Badan" alias="Massa Tubuh" icon={Scale} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <div className="relative flex items-center">
                    <input type="number" required placeholder="Contoh: 68" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 pr-10 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    <span className="absolute right-3 text-[10px] font-black text-slate-400 uppercase">kg</span>
                  </div>
                </FormCard>

                <FormCard label="Tekanan Darah Tinggi" alias="Hipertensi" icon={HeartPulse} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={highBP} onChange={(e) => setHighBP(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Ada / Normal</option>
                    <option value="1">Ya, Ada Riwayat</option>
                  </select>
                </FormCard>

                <FormCard label="Kolesterol Tinggi" alias="Lipid" icon={Droplets} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={highChol} onChange={(e) => setHighChol(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Ada / Normal</option>
                    <option value="1">Ya, Di Atas Batas</option>
                  </select>
                </FormCard>

                <FormCard label="Cek Kolesterol (5 Thn Terakhir)" alias="Pemeriksaan" icon={Eye} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={cholCheck} onChange={(e) => setCholCheck(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Ya, Pernah Cek</option>
                    <option value="0">Belum Pernah</option>
                  </select>
                </FormCard>

                <FormCard label="Riwayat Merokok" alias="Eksternal" icon={Cigarette} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={smoker} onChange={(e) => setSmoker(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Merokok</option>
                    <option value="1">Ya, Perokok Aktif</option>
                  </select>
                </FormCard>

                <FormCard label="Aktivitas Fisik / Olahraga" alias="Kebugaran" icon={Dumbbell} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={physActivity} onChange={(e) => setPhysActivity(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Rutin Beraktivitas</option>
                    <option value="0">Tidak Pernah / Jarang</option>
                  </select>
                </FormCard>

                <FormCard 
                  label="Indeks Massa Tubuh (BMI)" 
                  alias="Kalkulasi" 
                  icon={Activity} 
                  iconBg="bg-indigo-600" 
                  gradientBg="from-indigo-50/40 to-white"
                  className="sm:col-span-2 lg:col-span-2"
                >
                  <div className="w-full bg-blue-50/60 border border-blue-200 text-blue-700 font-black rounded-xl p-2.5 text-center text-sm shadow-inner mt-2">
                    {bmi} <span className="text-[10px] font-medium text-slate-500 ml-1">kg/m²</span>
                  </div>
                </FormCard>

                <FormCard 
                  label="Kondisi Kesehatan Umum" 
                  alias="Kuesioner" 
                  icon={Eye} 
                  iconBg="bg-blue-600" 
                  gradientBg="from-blue-50/40 to-white"
                  className="sm:col-span-2 lg:col-span-2"
                >
                  <select value={genHlth} onChange={(e) => setGenHlth(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all mt-2">
                    <option value="1">Sangat Baik (Excellent)</option>
                    <option value="2">Baik Sekali (Very Good)</option>
                    <option value="3">Cukup Baik (Good)</option>
                    <option value="4">Kurang Baik (Fair)</option>
                    <option value="5">Buruk (Poor)</option>
                  </select>
                </FormCard>

              </div>

              <div className="flex justify-center pt-4 w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-4 px-6 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sedang Mengalkulasi Parameter Medis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Mulai Analisis AI Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4">
              {result ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className={`rounded-[2.5rem] bg-white border p-6 md:p-8 shadow-sm flex flex-col gap-6 ${riskStyles.cardBorder}`}>
                    <div className={`flex flex-col items-center justify-center p-6 rounded-3xl border relative overflow-hidden w-full max-w-md mx-auto ${riskStyles.bg}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${riskStyles.label}`}>Persentase Risiko</p>
                      <h2 className={`text-5xl font-black my-2 tracking-tighter ${riskStyles.text}`}>{result.probability}%</h2>
                      <p className={`text-[10px] font-bold bg-white px-3 py-1 rounded-full shadow-sm border ${riskStyles.badge}`}>Tingkat Kerawanan Sistemis</p>
                    </div>

                    <div className="text-center space-y-3 max-w-xl mx-auto border-t border-slate-100 pt-4 w-full">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs border ${riskStyles.badge}`}>
                        <CheckCircle2 size={14} />
                        <span>{result.prediction}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Kategori risiko: <span className={`font-black ${riskStyles.text}`}>{result.riskLevel}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-sm text-center">
                  <h4 className="text-sm font-bold text-slate-800">Menunggu Inisiasi Skrining</h4>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}