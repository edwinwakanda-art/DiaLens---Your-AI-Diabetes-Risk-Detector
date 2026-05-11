"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Activity, LayoutDashboard, UserCircle, Settings, 
  FileText, Search, Bell, ChevronRight, Info, Send 
} from 'lucide-react';

// --- 1. KOMPONEN PENDUKUNG (Tipe Data Spesifik agar Tidak Merah) ---

interface SidebarProps { 
  icon: React.ElementType; // Menggunakan ElementType untuk komponen ikon
  label: string; 
  active?: boolean; 
}

const SidebarItem = ({ icon: Icon, label, active = false }: SidebarProps) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
  }`}>
    <Icon size={20} />
    <span className="font-bold text-sm">{label}</span>
  </div>
);

interface InputProps { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; // Tipe fungsi yang benar
  placeholder: string; 
  type?: string; 
}

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }: InputProps) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{label}</label>
    <input 
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-black transition-all placeholder:text-slate-300"
    />
  </div>
);

interface TestItemProps { 
  name: string; 
  date: string; 
  status: string; 
  color: string; 
}

const RecentTestItem = ({ name, date, status, color }: TestItemProps) => (
  <div className="flex items-center justify-between p-3 border border-slate-50 rounded-xl hover:bg-slate-50 transition-colors">
    <div>
      <p className="text-xs font-bold text-black">{name}</p>
      <p className="text-[10px] text-slate-400">{date}</p>
    </div>
    <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${color}`}>{status}</span>
  </div>
);
// --- 2. HALAMAN UTAMA ---

export default function CheckPage() {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    bmi: '',
    glucose: '',
    bloodPressure: '',
    insulin: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Data Pasien Terkirim:", formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Analisis AI Berhasil! Data telah dikirim ke model DiaLens.");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Activity size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">DiaLens AI</span>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem icon={UserCircle} label="Patient Records" active />
          <SidebarItem icon={FileText} label="Reports" />
          <SidebarItem icon={Search} label="Analysis" />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={14} />
            <span className="text-blue-600">New Intake Form</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><Bell size={20} /></button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-black leading-none uppercase">Abinaya Azhar</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Fullstack Dev</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AA</div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Patient Intake Form</h1>
            <p className="text-slate-400 text-sm">Lengkapi data biometrik pasien untuk analisis risiko AI.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  Step 1: Patient Biometrics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField label="Age" name="age" value={formData.age} onChange={handleChange} placeholder="Years" type="number" />
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 tracking-wider">Gender</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-black transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <InputField label="BMI Index" name="bmi" value={formData.bmi} onChange={handleChange} placeholder="e.g. 24.5" type="number" />
                  <InputField label="Systolic BP" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="mmHg" type="number" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  Step 2: Diagnostic Data
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField label="Glucose Level" name="glucose" value={formData.glucose} onChange={handleChange} placeholder="mg/dL" type="number" />
                  <InputField label="Insulin Level" name="insulin" value={formData.insulin} onChange={handleChange} placeholder="mu U/ml" type="number" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Processing..." : "Run AI Risk Analysis"}
                {!isSubmitting && <Send size={18} />}
              </button>
            </div>

            {/* Sidebar Kanan */}
            <div className="space-y-6">
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 border border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg"><Info size={20} /></div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">AI Guidelines</h3>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Gunakan data medis terbaru. Pastikan satuan ukur sesuai dengan standar yang diminta sistem.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recent Tests</h3>
                <div className="space-y-3">
                  <RecentTestItem name="Sarah Miller" date="12 May 2024" status="High" color="text-red-600 bg-red-50 border border-red-100" />
                  <RecentTestItem name="John Doe" date="11 May 2024" status="Low" color="text-green-600 bg-green-50 border border-green-100" />
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}