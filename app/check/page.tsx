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
  Sparkles
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// --- CONFIGURATION: BASE URL PRODUCTION RAILWAY ---
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dialens-backend-production.up.railway.app';

// --- COMPONENT: COLORFUL FORM CARD (BENTO GRID) ---
interface FormCardProps {
  label: string;
  alias: string;
  icon: React.ElementType;
  iconBg: string;
  gradientBg: string;
  children: React.ReactNode;
}

const FormCard = ({ label, alias, icon: Icon, iconBg, gradientBg, children }: FormCardProps) => (
  <div className={`rounded-[2rem] border border-slate-200/50 bg-gradient-to-b ${gradientBg} p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between`}>
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className={`p-2.5 rounded-xl ${iconBg} text-white shadow-sm`}>
          <Icon size={16} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono bg-white/80 px-2 py-0.5 rounded-md border border-slate-100">
          {alias}
        </span>
      </div>
      <div>
        <h3 className="text-xs font-black text-slate-800 tracking-tight">{label}</h3>
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

export default function CheckKesehatanPage() {
  // 1. State Form Input
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [highBP, setHighBP] = useState('');
  const [highChol, setHighChol] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState('');
  const [smoker, setSmoker] = useState('');
  const [hvyAlcohol, setHvyAlcohol] = useState('');

  // 2. State Loading & Hasil Analisis API
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // 3. Fungsi Submit Data ke Backend Railway
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    // Validasi token login terlebih dahulu
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg("Sesi masuk Anda telah habis atau token tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    // Validasi sederhana kelengkapan input formulir
    if (!age || !weight || !height || !highBP || !highChol || !bloodSugar || !physicalActivity || !smoker || !hvyAlcohol) {
      setErrorMsg("Mohon lengkapi seluruh 9 parameter kesehatan pada bento grid di atas.");
      setLoading(false);
      return;
    }

    // Konversi nilai berat badan (kg) dan tinggi badan (cm) menjadi BMI standar
    const heightInMeters = Number(height) / 100;
    const computedBMI = Number(weight) / (heightInMeters * heightInMeters);
    const finalBMI = parseFloat(computedBMI.toFixed(1));

    // Susun objek data (payload) sesuai kebutuhan skema backend & service AI
    const payload = {
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      bmi: finalBMI,
      highBP: highBP,
      highChol: highChol,
      bloodSugar: bloodSugar,
      physicalActivity: physicalActivity,
      smoker: smoker,
      hvyAlcohol: hvyAlcohol
    };

    try {
      // Menembak endpoint backend Express di Railway secara dinamis
      const response = await fetch(`${BASE_URL}/api/health/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server merespon dengan status error: ${response.status}`);
      }

      const resData = await response.json();
      
      // Simpan data respons dari model AI ke state untuk ditampilkan ke bento box bawah
      setResult({
        prediction: resData.prediction || resData.risk_level || 'Low Risk',
        diabetesRisk: resData.diabetesRisk !== undefined ? resData.diabetesRisk : null,
        aiRecommendation: resData.recommendation || resData.message || 'Tetap jaga pola makan sehat, batasi konsumsi gula berlebih, serta lakukan aktivitas fisik secara teratur setiap hari.'
      });

    } catch (err: any) {
      console.error("Gagal melakukan analisis kesehatan:", err);
      setErrorMsg(err.message || "Gagal mendapatkan respon dari server backend Railway.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi pembantu untuk merapikan baris teks rekomendasi dari AI
  const formatRecommendationText = (text: string) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n');
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        <Sidebar />

        <div className="md:pl-64 pt-20 md:pt-0 w-full">
          <main className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Header Dashboard */}
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 shadow-md text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-200 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-100/90">DiaLens Intelligent Core</p>
                </div>
                <h1 className="text-2xl font-black tracking-tight">Skrining Risiko Diabetes AI</h1>
                <p className="text-xs text-blue-50/80 font-medium max-w-xl">
                  Masukkan parameter biometrik dan klinis harian Anda. Algoritma kami akan menghitung tingkat probabilitas risiko medis secara real-time.
                </p>
              </div>
            </div>

            {/* Error Container */}
            {errorMsg && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-xs font-semibold text-rose-700 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Main Form Dashboard */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* BENTO GRID 3x3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* CARD 1: USIA */}
                <FormCard label="Rentang Usia Klinis" alias="AGE-PRM" icon={Calendar} iconBg="bg-blue-500" gradientBg="from-blue-50/50 to-white">
                  <select 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-colors"
                  >
                    <option value="">Pilih rentang usia...</option>
                    <option value="1">18 - 24 Tahun</option>
                    <option value="2">25 - 29 Tahun</option>
                    <option value="3">30 - 34 Tahun</option>
                    <option value="4">35 - 39 Tahun</option>
                    <option value="5">40 - 44 Tahun</option>
                    <option value="6">45 - 49 Tahun</option>
                    <option value="7">50 - 54 Tahun</option>
                    <option value="8">55 - 59 Tahun</option>
                    <option value="9">60 - 64 Tahun</option>
                    <option value="10">65 - 69 Tahun</option>
                    <option value="11">70 - 74 Tahun</option>
                    <option value="12">75 - 79 Tahun</option>
                    <option value="13">80 Tahun ke atas</option>
                  </select>
                </FormCard>

                {/* CARD 2: BERAT BADAN */}
                <FormCard label="Berat Badan Aktual" alias="WGT-KG" icon={Scale} iconBg="bg-indigo-500" gradientBg="from-indigo-50/40 to-white">
                  <div className="relative flex items-center">
                    <input 
                      type="number" 
                      placeholder="Contoh: 68"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 transition-colors"
                    />
                    <span className="absolute right-4 text-[10px] font-black text-slate-400 uppercase">KG</span>
                  </div>
                </FormCard>

                {/* CARD 3: TINGGI BADAN */}
                <FormCard label="Tinggi Badan Tegak" alias="HGT-CM" icon={Activity} iconBg="bg-violet-500" gradientBg="from-violet-50/40 to-white">
                  <div className="relative flex items-center">
                    <input 
                      type="number" 
                      placeholder="Contoh: 170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 text-xs font-bold text-slate-700 outline-none focus:border-violet-400 transition-colors"
                    />
                    <span className="absolute right-4 text-[10px] font-black text-slate-400 uppercase">CM</span>
                  </div>
                </FormCard>

                {/* CARD 4: HIPERTENSI */}
                <FormCard label="Riwayat Tekanan Darah Tinggi" alias="HBP-SYS" icon={HeartPulse} iconBg="bg-rose-500" gradientBg="from-rose-50/40 to-white">
                  <div className="grid grid-cols-2 gap-3">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHighBP(opt)}
                        className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                          highBP === opt 
                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FormCard>

                {/* CARD 5: KOLESTEROL */}
                <FormCard label="Riwayat Kolesterol Tinggi" alias="CHO-VAL" icon={Droplets} iconBg="bg-amber-500" gradientBg="from-amber-50/40 to-white">
                  <div className="grid grid-cols-2 gap-3">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHighChol(opt)}
                        className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                          highChol === opt 
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FormCard>

                {/* CARD 6: GULA DARAH */}
                <FormCard label="Kondisi Gula Darah Tinggi" alias="BSG-GLU" icon={Sparkles} iconBg="bg-emerald-500" gradientBg="from-emerald-50/40 to-white">
                  <div className="grid grid-cols-2 gap-3">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBloodSugar(opt)}
                        className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                          bloodSugar === opt 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FormCard>

                {/* CARD 7: AKTIVITAS FISIK */}
                <FormCard label="Rutin Olahraga (30 Menit / Hari)" alias="EXE-ACT" icon={Dumbbell} iconBg="bg-cyan-500" gradientBg="from-cyan-50/40 to-white">
                  <div className="grid grid-cols-2 gap-3">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPhysicalActivity(opt)}
                        className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                          physicalActivity === opt 
                            ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FormCard>

                {/* CARD 8: PEROKOK */}
                <FormCard label="Riwayat / Status Perokok Aktif" alias="SMK-HAB" icon={Cigarette} iconBg="bg-orange-500" gradientBg="from-orange-50/40 to-white">
                  <div className="grid grid-cols-2 gap-3">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSmoker(opt)}
                        className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                          smoker === opt 
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FormCard>

                {/* CARD 9: ALCOHOL */}
                <FormCard label="Konsumsi Alkohol Berat" alias="ALC-CON" icon={Wine} iconBg="bg-fuchsia-500" gradientBg="from-fuchsia-50/40 to-white">
                  <div className="grid grid-cols-2 gap-3">
                    {['Ya', 'Tidak'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHvyAlcohol(opt)}
                        className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                          hvyAlcohol === opt 
                            ? 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-sm shadow-fuchsia-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </FormCard>

              </div>

              {/* ACTION SUBMIT BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-10 py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-98 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{loading ? 'Memproses Matriks AI...' : 'Mulai Analisis AI Sekarang'}</span>
                </button>
              </div>

            </form>

            {/* CONTAINER DOCK HASIL PREDIKSI (BOX BAWAH) */}
            <div className="pt-4">
              {result ? (
                <div className="rounded-[2.5rem] bg-white border border-blue-100 p-8 shadow-sm space-y-6">
                  
                  {/* Bagian Atas: Tingkat Risiko */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/60">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">Hasil Diagnosis DiaLens AI</h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Berhasil disinkronisasi dengan core cluster server Railway.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-wider ${
                        result.prediction.toLowerCase().includes('high')
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${result.prediction.toLowerCase().includes('high') ? 'bg-blue-600 animate-pulse' : 'bg-emerald-500'}`} />
                        <span>{result.prediction} {result.diabetesRisk !== null ? `(${Math.round(result.diabetesRisk)}%)` : ''}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bagian Bawah: Rekomendasi Klinis */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <Eye size={14} className="text-blue-500" />
                      <span>Rekomendasi Tindakan Medis Preventif:</span>
                    </div>

                    <div className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/80 rounded-2xl p-6 border border-slate-100 whitespace-pre-line shadow-inner">
                      {formatRecommendationText(result.aiRecommendation)}
                    </div>
                  </div>

                </div>
              ) : (
                /* Kondisi Standby sebelum kirim formulir */
                <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-sm text-center">
                  <div className="max-w-md mx-auto py-6 space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-400">
                      <Info size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Menunggu Inisiasi Skrining</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Silakan isi semua parameter bento grid di atas terlebih dadaulu, kemudian klik tombol <strong>Mulai Analisis AI Sekarang</strong> untuk memunculkan ringkasan prediksi risiko beserta instruksi klinis dari server secara lengkap di area ini.
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