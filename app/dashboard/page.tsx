"use client";

import React from 'react';
import { 
  Activity, LayoutDashboard, Users, AlertCircle, 
  CheckCircle2, TrendingUp, Bell, Search, Plus, ArrowUpRight 
} from 'lucide-react';

// --- 1. KOMPONEN KECIL ---

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  color: { bg: string; text: string };
}

const StatCard = ({ icon: Icon, label, value, trend, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color.bg} ${color.text}`}>
        <Icon size={24} />
      </div>
      <span className={`text-xs font-bold flex items-center gap-1 ${trend.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
        {trend} {trend.includes('+') && <ArrowUpRight size={12} />}
      </span>
    </div>
    <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
  </div>
);

interface PatientProps {
  name: string;
  id: string;
  status: string;
  lastAnalysis: string;
}

const PatientQueueItem = ({ name, id, status, lastAnalysis }: PatientProps) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-4 text-black">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 uppercase">
        {name.substring(0, 2)}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900">{name}</h4>
        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">ID: {id}</p>
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
        status === 'Emergency Review' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
      }`}>{status}</span>
    </div>
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-slate-400 font-medium tracking-wide">Last Analysis: <span className="text-slate-900">{lastAnalysis}</span></span>
      <button className="text-blue-600 font-bold hover:underline">Open Case</button>
    </div>
  </div>
);

interface InsightProps {
  tag: string;
  title: string;
  desc: string;
  time: string;
  color: string;
}

const InsightItem = ({ tag, title, desc, time, color }: InsightProps) => (
  <div className="border-l-4 border-slate-100 pl-4 py-1 hover:border-blue-200 transition-all text-black">
    <div className="flex items-center justify-between mb-1">
      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${color}`}>{tag}</span>
      <span className="text-[10px] text-slate-400 font-bold uppercase">{time}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

// --- 2. HALAMAN UTAMA DASHBOARD ---

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <Activity size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">DiaLens AI</span>
        </div>
        <nav className="space-y-1 flex-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 cursor-pointer">
            <LayoutDashboard size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
            <Users size={20} />
            <span className="font-bold text-sm">Patient Records</span>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Clinical Overview</h1>
            <p className="text-slate-400 font-medium text-sm">Central diagnostic hub for current facility status.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search patient..." 
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-blue-100 text-black"
              />
            </div>
            
            {/* Tombol Bell Ditambahkan di Sini agar warna tidak oranye */}
            <button className="relative p-3 text-slate-400 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100">
              <Plus size={18} /> New Analysis
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={Users} label="Total Patients" value="1,284" trend="+12%" 
            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} 
          />
          <StatCard 
            icon={AlertCircle} label="Critical Risks" value="24" trend="+5" 
            color={{ bg: 'bg-red-50', text: 'text-red-600' }} 
          />
          <StatCard 
            icon={CheckCircle2} label="AI Precision" value="98.2%" trend="High" 
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} 
          />
          <StatCard 
            icon={TrendingUp} label="Analyses This Week" value="342" trend="+18%" 
            color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-10">Diagnosis Trends</h3>
            <div className="h-64 bg-slate-50 rounded-3xl flex items-end justify-around p-6">
              {[40, 70, 45, 90, 65, 50, 80].map((h, i) => (
                <div key={i} className="w-12 bg-blue-200 hover:bg-blue-600 transition-all cursor-pointer rounded-t-xl" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" /> AI Insights Feed
            </h3>
            <div className="space-y-6">
              <InsightItem 
                tag="CRITICAL" title="Abnormal Pattern" 
                desc="Patient #9210 shows signs of severe retinopathy." 
                time="2h ago" color="text-red-600 bg-red-50"
              />
              <InsightItem 
                tag="STABLE" title="Recovery Progress" 
                desc="Patient #1185 macular edema reduced by 14%." 
                time="14m ago" color="text-emerald-600 bg-emerald-50"
              />
            </div>
          </div>
        </div>

        <section className="mt-12 mb-10">
          <h3 className="text-xl font-bold text-slate-900 mb-6 px-2">Active Patient Queue</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PatientQueueItem name="Elena Rodriguez" id="IDG-0021" status="Emergency Review" lastAnalysis="14 Oct 2023" />
            <PatientQueueItem name="Marcus Chen" id="IDG-0043" status="Improving" lastAnalysis="12 Oct 2023" />
            <PatientQueueItem name="Sarah Jenkins" id="IDG-1024" status="Improving" lastAnalysis="Just Now" />
          </div>
        </section>
      </main>
    </div>
  );
}