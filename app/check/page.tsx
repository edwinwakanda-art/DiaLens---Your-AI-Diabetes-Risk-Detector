"use client";

import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Scale,
  HeartPulse,
  Droplets,
  Eye,
  Dumbbell,
  Cigarette,
  Wine,
  CheckCircle2,
  Info,
  Sparkles,
  RefreshCw,
  Percent,
  AlertCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// Mengamankan URL dari tanda '/' di ujung variabel Vercel
const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app';
const BASE_URL = RAW_URL.replace(/\/$/, '');

interface FormCardProps {
  label: string;
  alias: string;
  icon: React.ElementType;
  iconBg: string;
  gradientBg: string;
  children: React.ReactNode;
}

// BENTO GRID FORM CARD - MEMPERTAHANKAN DESAIN ASLI KAMU
const FormCard = ({ label, alias, icon: Icon, iconBg, gradientBg, children }: FormCardProps) => (
  <div className={`rounded-[2rem] border border-slate-200/50 bg-gradient-to-b ${gradientBg} p-5 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between`}>
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className={`p-2 rounded-xl text-white ${iconBg} shadow-sm`}>
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
  // FORM STATE ASLI KAMU
  const [age, setAge] = useState('');
  const [bmi, setBmi] = useState('');
  const [highBP, setHighBP] = useState('0');
  const [highChol, setHighChol] = useState('0');
  const [cholCheck, setCholCheck] = useState('1');
  const [smoker, setSmoker] = useState('0');
  const [stroke, setStroke] = useState('0');
  const [heartDiseaseorAttack, setHeartDiseaseorAttack] = useState('0');
  const [physActivity, setPhysActivity] = useState('1');
  const [fruits, setFruits] = useState('1');
  const [veggies, setVeggies] = useState('1');
  const [hvyAlcoholConsump, setHvyAlcoholConsump] = useState('0');
  const [anyHealthcare, setAnyHealthcare] = useState('1');
  const [noDocbcCost, setNoDocbcCost] = useState('0');
  const [genHlth, setGenHlth] = useState('3');
  const [mentHlth, setMentHlth] = useState('0');
  const [physHlth, setPhysHlth] = useState('0');
  const [diffWalk, setDiffWalk] = useState('0');
  const [sex, setSex] = useState('1');
  const [education, setEducation] = useState('5');
  const [income, setIncome] = useState('6');

  // APP LOGIC & STATE
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    // Pemetaan Payload Mengikuti Parameter healthController.js Backend Kamu
    const payload = {
      Age: parseInt(age) || 30,
      BMI: parseFloat(bmi) || 22.0,
      HighBP: highBP === '1' ? 'Yes' : 'No',
      HighChol: highChol === '1' ? 'Yes' : 'No',
      CholCheck: parseInt(cholCheck),
      Smoker: smoker === '1' ? 'Yes' : 'No',
      Stroke: stroke === '1' ? 'Yes' : 'No',
      HeartDiseaseorAttack: heartDiseaseorAttack === '1' ? 'Yes' : 'No',
      PhysActivity: physActivity === '1' ? 'Yes' : 'No',
      Fruits: parseInt(fruits),
      Veggies: parseInt(veggies),
      HvyAlcoholConsump: hvyAlcoholConsump === '1' ? 'Yes' : 'No',
      AnyHealthcare: parseInt(anyHealthcare),
      NoDocbcCost: parseInt(noDocbcCost),
      GenHlth: genHlth === '1' ? 'Excellent' : genHlth === '2' ? 'Very Good' : genHlth === '3' ? 'Good' : genHlth === '4' ? 'Fair' : 'Poor',
      MentHlth: parseInt(mentHlth),
      PhysHlth: parseInt(physHlth),
      DiffWalk: diffWalk === '1' ? 'Yes' : 'No',
      Sex: sex === '1' ? 'Male' : 'Female',
      Education: parseInt(education),
      Income: parseInt(income)
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Gagal memproses data. Kode status server: ${res.status}`);
      }

      const resJson = await res.json();
      const rawData = resJson.data || resJson;

      // 🎯 NORMALISASI HASIL KE BAHASA INDONESIA
      let prediksiIndo = 'Bukan Diabetes';
      if (rawData.prediction === 1 || rawData.prediction === '1' || String(rawData.risk_level).toLowerCase().includes('high')) {
        prediksiIndo = 'Terdeteksi Risiko Diabetes';
      }

      let tingkatRisikoIndo = 'Rendah';
      const rLevel = String(rawData.risk_level || '').toLowerCase();
      if (rLevel.includes('high') || rLevel.includes('tinggi')) tingkatRisikoIndo = 'Tinggi';
      if (rLevel.includes('medium') || rLevel.includes('sedang')) tingkatRisikoIndo = 'Sedang';

      // 🎯 MENGUBAH PROBABILITAS MENJADI PERSENTASE ASLI (0-100%)
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
            
            {/* Header Form */}
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100/60 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">Skrining Kesehatan</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Analisis Risiko Diabetes AI</h1>
                </div>
                <div className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                  Masukkan data biometrik dan kondisi klinis terbaru Anda secara akurat untuk mendapatkan hasil komputasi risiko medis terpersonalisasi.
                </div>
              </div>
            </div>

            {/* Error Message Panel */}
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

            {/* Form Konten (Bento Grid) */}
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <FormCard label="Umur Anda (Tahun)" alias="Umur" icon={Calendar} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <input type="number" required placeholder="Contoh: 35" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </FormCard>

                <FormCard label="Indeks Massa Tubuh" alias="BMI" icon={Scale} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <input type="number" step="0.1" required placeholder="Contoh: 23.5" value={bmi} onChange={(e) => setBmi(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </FormCard>

                <FormCard label="Tekanan Darah Tinggi" alias="Hipertensi" icon={HeartPulse} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={highBP} onChange={(e) => setHighBP(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Ada / Normal</option>
                    <option value="1">Ya, Ada Riwayat</option>
                  </select>
                </FormCard>

                <FormCard label="Kolesterol Tinggi" alias="Kolesterol" icon={Droplets} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
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

                <FormCard label="Riwayat Merokok" alias="Gaya Hidup" icon={Cigarette} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={smoker} onChange={(e) => setSmoker(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Merokok</option>
                    <option value="1">Ya, Perokok Aktif</option>
                  </select>
                </FormCard>

                <FormCard label="Pernah Mengalami Stroke?" alias="Vaskular" icon={HeartPulse} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={stroke} onChange={(e) => setStroke(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Pernah</option>
                    <option value="1">Ya, Pernah</option>
                  </select>
                </FormCard>

                <FormCard label="Jantung Koroner / Serangan" alias="Kardio" icon={HeartPulse} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={heartDiseaseorAttack} onChange={(e) => setHeartDiseaseorAttack(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Ada</option>
                    <option value="1">Ya, Ada Riwayat</option>
                  </select>
                </FormCard>

                <FormCard label="Aktivitas Fisik / Olahraga" alias="Kebugaran" icon={Dumbbell} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={physActivity} onChange={(e) => setPhysActivity(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Rutin Beraktivitas</option>
                    <option value="0">Tidak Pernah / Jarang</option>
                  </select>
                </FormCard>

                <FormCard label="Konsumsi Alkohol Tinggi" alias="Toksisitas" icon={Wine} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={hvyAlcoholConsump} onChange={(e) => setHvyAlcoholConsump(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Mengonsumsi</option>
                    <option value="1">Ya, Konsumsi Tinggi</option>
                  </select>
                </FormCard>

                <FormCard label="Jaminan Kesehatan / Asuransi" alias="Klinis" icon={Eye} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={anyHealthcare} onChange={(e) => setAnyHealthcare(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Memiliki Jaminan</option>
                    <option value="0">Tidak Ada</option>
                  </select>
                </FormCard>

                <FormCard label="Kendala Biaya ke Dokter" alias="Finansial" icon={Eye} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={noDocbcCost} onChange={(e) => setNoDocbcCost(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Ada Kendala</option>
                    <option value="1">Ya, Ada Kendala</option>
                  </select>
                </FormCard>

                <FormCard label="Kondisi Kesehatan Umum" alias="Perspektif" icon={Eye} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={genHlth} onChange={(e) => setGenHlth(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Sangat Baik (Excellent)</option>
                    <option value="2">Baik Sekali (Very Good)</option>
                    <option value="3">Cukup Baik (Good)</option>
                    <option value="4">Kurang Baik (Fair)</option>
                    <option value="5">Buruk (Poor)</option>
                  </select>
                </FormCard>

                <FormCard label="Hari Buruk Kesehatan Mental" alias="Mental" icon={Eye} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <input type="number" min="0" max="30" placeholder="Skala 0-30 Hari" value={mentHlth} onChange={(e) => setMentHlth(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </FormCard>

                <FormCard label="Hari Sakit Fisik (30 Hari Terakhir)" alias="Fisik" icon={Eye} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <input type="number" min="0" max="30" placeholder="Skala 0-30 Hari" value={physHlth} onChange={(e) => setPhysHlth(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </FormCard>

                <FormCard label="Kesulitan Berjalan / Tangga" alias="Mobilitas" icon={Eye} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={diffWalk} onChange={(e) => setDiffWalk(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="0">Tidak Ada Kesulitan</option>
                    <option value="1">Ya, Mengalami Kesulitan</option>
                  </select>
                </FormCard>

                <FormCard label="Jenis Kelamin Biologis" alias="Gender" icon={Eye} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="1">Laki-laki</option>
                    <option value="0">Perempuan</option>
                  </select>
                </FormCard>

                <FormCard label="Tingkat Pendidikan Terakhir" alias="Edukasi" icon={Eye} iconBg="bg-indigo-600" gradientBg="from-indigo-50/40 to-white">
                  <select value={education} onChange={(e) => setEducation(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="6">Sarjana / Universitas</option>
                    <option value="5">Diploma / Kuliah</option>
                    <option value="4">Lulus SMA</option>
                    <option value="3">Lulus SMP</option>
                    <option value="2">Lulus SD</option>
                    <option value="1">Tidak Sekolah</option>
                  </select>
                </FormCard>

                <FormCard label="Skala Pendapatan Tahunan" alias="Ekonomi" icon={Eye} iconBg="bg-blue-600" gradientBg="from-blue-50/40 to-white">
                  <select value={income} onChange={(e) => setIncome(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                    <option value="8">Tinggi (Maksimal)</option>
                    <option value="6">Menengah Atas</option>
                    <option value="4">Menengah</option>
                    <option value="2">Menengah Bawah</option>
                    <option value="1">Sangat Rendah</option>
                  </select>
                </FormCard>

              </div>

              {/* 🎯 TOMBOL SEKARANG BERADA DI TENGAH DENGAN WARNA INTERAKTIF BIRU KONSISTEN */}
              <div className="flex justify-center pt-4 w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-80 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-4 px-6 rounded-2xl transition-all duration-300 shadow-md shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
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

            {/* AREA RESPONS HASIL */}
            <div className="pt-4">
              {result ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* PANEL DIAGNOSIS UTAMA (BIRU KONSISTEN & BAHASA INDONESIA) */}
                  <div className="rounded-[2.5rem] bg-white border border-blue-200 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">Hasil Pemetaan</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">Kesimpulan Diagnosis AI</h3>
                      </div>

                      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100 font-black text-xs">
                        <CheckCircle2 size={14} />
                        <span>{result.prediction}</span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Sistem mengklasifikasikan bahwa berdasarkan kondisi fisik Anda saat ini, Anda berada pada tingkat kategori risiko <span className="font-black text-blue-600">{result.riskLevel}</span>.
                      </p>
                    </div>

                    {/* BLOK PERSENTASE WARNA BIRU INTERAKTIF */}
                    <div className="flex flex-col items-center justify-center p-6 bg-blue-50/40 rounded-3xl border border-blue-100/60 relative overflow-hidden">
                      <div className="absolute right-2 top-2 text-blue-100/50 pointer-events-none">
                        <Percent size={80} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">Persentase Risiko</p>
                      <h2 className="text-5xl font-black text-blue-600 my-2 tracking-tighter">
                        {result.probability}%
                      </h2>
                      <p className="text-[10px] text-blue-700 font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-blue-100/70">
                        Tingkat Kerawanan Sistemis
                      </p>
                    </div>
                  </div>

                  {/* 🎯 KOTAK REKOMENDASI MEDIS OTOMATIS (DI BAWAH HASIL) */}
                  <div className="rounded-[2.5rem] bg-white border border-blue-200 p-6 md:p-8 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">AI Medical Advice</p>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Rekomendasi Klinis Terpersonalisasi</h3>
                      </div>
                    </div>

                    <div className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/80 rounded-2xl p-6 border border-slate-100 whitespace-pre-line shadow-inner">
                      {formatRecommendationText(result.aiRecommendation)}
                    </div>
                  </div>

                </div>
              ) : (
                /* KONDISI STANDBY - MEMPERTAHANKAN STRUKTUR ASLI KAMU */
                <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-sm text-center">
                  <div className="max-w-md mx-auto py-6 space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-400">
                      <Info size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Menunggu Inisiasi Skrining</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Silakan isi semua parameter bento grid di atas terlebih dahulu, kemudian klik tombol <strong>Mulai Analisis AI Sekarang</strong> untuk memunculkan ringkasan prediksi risiko beserta instruksi klinis dari server secara lengkap di area ini.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </main>
        </div>

      </div>
    </div>
  );
}