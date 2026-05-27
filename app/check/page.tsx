"use client";

import React, { useState, useMemo } from 'react';
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
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-white/80 px-2 py-0.5 rounded-md border border-slate-100">
          {alias}
        </span>
      </div>
      <label className="text-xs font-black uppercase tracking-[0.05em] text-slate-700 block px-0.5">
        {label}
      </label>
    </div>
    <div className="mt-3">
      {children}
    </div>
  </div>
);

// --- HALAMAN UTAMA ---
export default function CheckKesehatanPage() {
  // State Input Form menggunakan standar biner numerik (1/0) untuk model AI
  const [form, setForm] = useState({
    Age: '1',
    Weight: '60',
    Height: '165',
    HighBP: '0',
    HighChol: '0',
    CholCheck: '1',
    PhysActivity: '1',
    Smoker: '0',
    HvyAlcoholConsump: '0'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ prediction: string; computedBmi: string; aiRecommendation: string } | null>(null);

  // Kalkulasi Skor BMI Real-time
  const currentBmi = useMemo(() => {
    const w = parseFloat(form.Weight);
    const h = parseFloat(form.Height) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return '0.0';
  }, [form.Weight, form.Height]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ageLabels: { [key: string]: string } = {
      "1": "18-24 thn", "2": "25-29 thn", "3": "30-34 thn", "4": "35-39 thn",
      "5": "40-44 thn", "6": "45-49 thn", "7": "50-54 thn", "8": "55-59 thn",
      "9": "60-64 thn", "10": "65-69 thn", "11": "70-74 thn", "12": "75-79 thn", "13": "80+ thn"
    };

    try {
      // 1. Ambil token akses login dari localStorage (karena backend dilindungi authMiddleware)
      const token = localStorage.getItem('token'); 
      
      if (!token) {
        alert("Akses ditolak! Silakan login terlebih dahulu ke akun DiaLens Anda.");
        setLoading(false);
        return;
      }

      // 2. Siapkan payload angka biner numerik sesuai spesifikasi skema backend & AI
      const payload = {
        Age: parseInt(form.Age),
        Weight: parseFloat(form.Weight),
        Height: parseFloat(form.Height),
        BMI: parseFloat(currentBmi),
        HighBP: parseInt(form.HighBP),
        HighChol: parseInt(form.HighChol),
        CholCheck: parseInt(form.CholCheck),
        PhysActivity: parseInt(form.PhysActivity),
        Smoker: parseInt(form.Smoker),
        HvyAlcoholConsump: parseInt(form.HvyAlcoholConsump),
        GenHlth: 3 // Nilai default tambahan untuk kebutuhan pemetaan skema database di backend
      };

      // 3. Panggil API Backend DiaLens kamu
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/health/predict';
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Menyertakan token Bearer untuk lolos authMiddleware
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        throw new Error('Sesi login Anda telah habis atau token tidak valid. Silakan login kembali.');
      }

      if (!response.ok) {
        throw new Error('Gagal mendapatkan respon dari server backend.');
      }

      // Respons dari healthController.predict langsung berupa objek, tidak dibungkus .data lagi
      const aiData = await response.json(); 

      // Pemetaan teks tingkat risiko berdasarkan data dinamis probabilistik dari AI
      let predictionText = "Risiko Ringan (12%)";
      const percentage = aiData.probability ? Math.round(aiData.probability * 100) : null;

      if (aiData.risk_level === 'High' || aiData.risk_level === 'high') {
        predictionText = `Risiko Tinggi (${percentage || 76}%)`;
      } else if (aiData.risk_level === 'Medium' || aiData.risk_level === 'medium') {
        predictionText = `Risiko Sedang (${percentage || 43}%)`;
      } else {
        predictionText = `Risiko Ringan (${percentage || 12}%)`;
      }

      // 4. Simpan riwayat cadangan secara lokal di sisi client browser
      const newHistoryItem = {
        id: `DL-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        age: ageLabels[form.Age] || "18-24 thn",
        weight: `${form.Weight} kg`,
        height: `${form.Height} cm`,
        bmi: currentBmi,
        highBP: form.HighBP === "1" ? "Yes" : "No",
        highChol: form.HighChol === "1" ? "Yes" : "No",
        prediction: predictionText,
        status: aiData.risk_level === 'High' ? 'Danger' : aiData.risk_level === 'Medium' ? 'Warning' : 'Safe',
        ai_recommendation: aiData.ai_recommendation
      };

      const existingHistoryRaw = localStorage.getItem('medicalHistory');
      let currentHistory = [];
      if (existingHistoryRaw) {
        currentHistory = JSON.parse(existingHistoryRaw);
      }

      localStorage.setItem('medicalHistory', JSON.stringify([newHistoryItem, ...currentHistory]));

      // 5. Update State untuk langsung menampilkan respon riil server AI ke layar bento box
      setResult({
        prediction: predictionText,
        computedBmi: currentBmi,
        aiRecommendation: aiData.ai_recommendation || "Tidak ada rincian rekomendasi teks yang dikirimkan oleh server AI."
      });

    } catch (error: any) {
      console.error("Terjadi masalah saat berkomunikasi dengan API AI:", error);
      alert(error.message || "Maaf, terjadi gangguan koneksi ke server AI Dialens.");
    } finally {
      setLoading(false);
    }
  };

  // Parser teks fleksibel untuk mengubah format **teks** dan *teks* menjadi HTML bold
  const formatRecommendationText = (text: string) => {
    if (!text) return '';
    
    // Normalisasi: mengubah penulisan double asterisk (**) tim AI menjadi single asterisk (*)
    const normalizedText = text.replace(/\*\*/g, '*');
    
    return normalizedText.split('*').map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-900 bg-blue-50/60 px-1 rounded">{part}</strong> : part
    );
  };

  const inputStyle = "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white shadow-inner text-black cursor-pointer";

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        
        <Sidebar />

        <div className="md:pl-64 pt-20 md:pt-0 w-full">
          <main className="p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Header Area */}
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">AI Medical Screener</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Kalkulator Prediksi Risiko Diabetes</h1>
                </div>
                <div className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                  Isi parameter tubuh Anda di bawah ini secara lengkap. Hasil kalkulasi dan rekomendasi tindakan medis khusus akan ditampilkan penuh di bagian bawah setelah Anda menekan tombol analisis.
                </div>
              </div>
            </div>

            {/* FORM UTAMA */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* LAYOUT FORM FULL 3 KOLOM BENTO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* KELOMPOK 1: BIOMETRIK FISIK */}
                <FormCard label="Kategori Umur" alias="_AGEG5YR" icon={Calendar} iconBg="bg-amber-500" gradientBg="from-amber-50/60 to-white">
                  <select value={form.Age} onChange={e => handleChange('Age', e.target.value)} className={inputStyle}>
                    <option value="1">1 = 18 - 24 tahun</option>
                    <option value="2">2 = 25 - 29 tahun</option>
                    <option value="3">3 = 30 - 34 tahun</option>
                    <option value="4">4 = 35 - 39 tahun</option>
                    <option value="5">5 = 40 - 44 tahun</option>
                    <option value="6">6 = 45 - 49 tahun</option>
                    <option value="7">7 = 50 - 54 tahun</option>
                    <option value="8">8 = 55 - 59 tahun</option>
                    <option value="9">9 = 60 - 64 tahun</option>
                    <option value="10">10 = 65 - 69 tahun</option>
                    <option value="11">11 = 70 - 74 tahun</option>
                    <option value="12">12 = 75 - 79 tahun</option>
                    <option value="13">13 = 80 tahun atau lebih</option>
                  </select>
                </FormCard>

                <FormCard label="Berat Badan (kg)" alias="Weight" icon={Scale} iconBg="bg-sky-500" gradientBg="from-sky-50/60 to-white">
                  <input type="number" value={form.Weight} onChange={e => handleChange('Weight', e.target.value)} placeholder="Contoh: 60" className={inputStyle} required />
                </FormCard>

                <FormCard label="Tinggi Badan (cm)" alias="Height" icon={Activity} iconBg="bg-blue-600" gradientBg="from-blue-50/60 to-white">
                  <input type="number" value={form.Height} onChange={e => handleChange('Height', e.target.value)} placeholder="Contoh: 165" className={inputStyle} required />
                </FormCard>

                {/* KELOMPOK 2: DIAGNOSTIK & GAYA HIDUP */}
                <FormCard label="Tekanan Darah Tinggi" alias="HighBP" icon={HeartPulse} iconBg="bg-rose-500" gradientBg="from-rose-50/60 to-white">
                  <select value={form.HighBP} onChange={e => handleChange('HighBP', e.target.value)} className={inputStyle}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </FormCard>

                <FormCard label="Kolesterol Tinggi" alias="HighChol" icon={Droplets} iconBg="bg-orange-500" gradientBg="from-orange-50/60 to-white">
                  <select value={form.HighChol} onChange={e => handleChange('HighChol', e.target.value)} className={inputStyle}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </FormCard>

                <FormCard label="Pemeriksaan Kolesterol (5 Thn)" alias="CholCheck" icon={Eye} iconBg="bg-emerald-500" gradientBg="from-emerald-50/60 to-white">
                  <select value={form.CholCheck} onChange={e => handleChange('CholCheck', e.target.value)} className={inputStyle}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </FormCard>

                <FormCard label="Aktif Berolahraga" alias="PhysActivity" icon={Dumbbell} iconBg="bg-purple-500" gradientBg="from-purple-50/60 to-white">
                  <select value={form.PhysActivity} onChange={e => handleChange('PhysActivity', e.target.value)} className={inputStyle}>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </FormCard>

                <FormCard label="Status Perokok" alias="Smoker" icon={Cigarette} iconBg="bg-indigo-500" gradientBg="from-indigo-50/60 to-white">
                  <select value={form.Smoker} onChange={e => handleChange('Smoker', e.target.value)} className={inputStyle}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </FormCard>

                <FormCard label="Konsumsi Alkohol Berat" alias="HvyAlcoholConsump" icon={Wine} iconBg="bg-cyan-500" gradientBg="from-cyan-50/60 to-white">
                  <select value={form.HvyAlcoholConsump} onChange={e => handleChange('HvyAlcoholConsump', e.target.value)} className={inputStyle}>
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </FormCard>
              </div>

              {/* LIVE BAR BMI INFO */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-2 rounded-xl text-xs font-black">BMI</div>
                  <span className="text-xs font-bold text-slate-700">Hasil Konversi Otomatis Indeks Massa Tubuh Anda:</span>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-md">{currentBmi}</span>
              </div>

              {/* BUTTON TRIGGER SUBMIT */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3 text-xs md:text-sm uppercase tracking-widest active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sedang Memproses Data Medis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Mulai Analisis AI Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* PANEL OUTPUT HASIL DAN REKOMENDASI DI PALING BAWAH */}
            <div className="pt-4">
              {result ? (
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* Kotak Hasil Diagnostik Utama */}
                  <div className="rounded-[2.5rem] bg-white border border-slate-200/60 p-6 md:p-8 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Analysis Output</p>
                    <h3 className="mt-1 text-xl font-black text-slate-900 tracking-tight">Hasil Deteksi AI DiaLens</h3>
                    
                    <div className={`mt-5 p-6 rounded-3xl flex items-start gap-4 shadow-inner border ${
                      result.prediction.includes('Tinggi') 
                        ? 'bg-rose-50 border-rose-100 text-rose-800' 
                        : result.prediction.includes('Sedang') 
                          ? 'bg-amber-50 border-amber-100 text-amber-800'
                          : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    }`}>
                      <CheckCircle2 size={26} className={`shrink-0 mt-0.5 ${
                        result.prediction.includes('Tinggi') ? 'text-rose-500' : result.prediction.includes('Sedang') ? 'text-amber-500' : 'text-emerald-500'
                      }`} />
                      <div>
                        <p className={`text-[11px] font-black uppercase tracking-wider ${
                          result.prediction.includes('Tinggi') ? 'text-rose-600' : result.prediction.includes('Sedang') ? 'text-amber-600' : 'text-emerald-600'
                        }`}>Status Prediksi Tingkat Risiko</p>
                        <p className="text-xl font-black mt-1 text-slate-900 tracking-tight">{result.prediction}</p>
                        <p className="text-xs text-slate-500 font-medium mt-2">
                          Skor Konversi BMI yang Terkirim: <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{result.computedBmi}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kotak Respon Rekomendasi Medis dari Server */}
                  <div className={`rounded-[2.5rem] bg-white border ${
                    result.prediction.includes('Tinggi') ? 'border-rose-100' : result.prediction.includes('Sedang') ? 'border-amber-100' : 'border-emerald-100'
                  } p-6 md:p-8 shadow-sm space-y-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white shadow-md ${
                        result.prediction.includes('Tinggi') ? 'bg-rose-500' : result.prediction.includes('Sedang') ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                        <Sparkles size={18} />
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
                /* Kondisi Standby saat Belum Menekan Tombol Analisis */
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