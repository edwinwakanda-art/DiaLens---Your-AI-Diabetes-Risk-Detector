"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Activity, Zap, 
  BarChart3, Microscope, FileSpreadsheet
} from 'lucide-react';

// --- 1. HELPER COMPONENTS (Didefinisikan dengan tipe data agar tidak merah) ---

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem = ({ label, value }: StatItemProps) => (
  <div className="space-y-1 text-black">
    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">{label}</p>
  </div>
);

interface FeatureItemProps {
  num: string;
  icon: React.ElementType; // Tipe data khusus untuk komponen ikon
  title: string;
  desc: string;
}

const FeatureItem = ({ num, icon: Icon, title, desc }: FeatureItemProps) => (
  <div className="space-y-6 group">
    <div className="relative">
      <span className="text-7xl font-black text-slate-50 absolute -top-8 -left-2 z-0 group-hover:text-blue-50 transition-colors">{num}</span>
      <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white relative z-10 shadow-xl group-hover:bg-blue-600 transition-colors">
        <Icon size={24} />
      </div>
    </div>
    <h3 className="text-2xl font-black tracking-tight pt-4 text-black">{title}</h3>
    <p className="text-slate-500 font-medium text-sm leading-relaxed">{desc}</p>
  </div>
);

// --- 2. MAIN LANDING PAGE ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Activity size={22} strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900 uppercase">DiaLens AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Technology</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Evidence</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Resources</a>
          </div>

          <Link href="/check" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95">
            New Analysis
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Clinical Grade AI Detector
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 text-black">
              The Clinical Curator <br /> 
              <span className="text-blue-600 font-black">for Diabetes Risk.</span>
            </h1>
            
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              DiaLens leverages state-of-the-art neural networks to analyze patient data, providing clinicians with high-fidelity risk assessments.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/check" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1">
                Start Screening
              </Link>
              <button className="bg-white border-2 border-slate-100 px-10 py-5 rounded-2xl font-bold text-lg text-slate-600 hover:bg-slate-50 transition-all">
                View Clinical Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-100">
              <StatItem label="Sensitivity" value="99.2%" />
              <StatItem label="Scans Processed" value="2.4M+" />
              <StatItem label="Clinicians" value="150+" />
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="relative">
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-50 relative z-10 overflow-hidden text-black">
               <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                     <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">AI Insight Pane</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Patient ID: #DL-892042</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Normal Vitality</div>
               </div>
               
               <div className="h-48 w-full bg-slate-900 rounded-2xl mb-8 flex items-center justify-center">
                  <Activity className="text-blue-400 animate-pulse" size={48} />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Zap className="text-blue-600 mb-2" size={20} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-tight">Predictive Analysis</p>
                    <p className="text-xs font-bold text-slate-700">Risk coefficient reduced by <span className="text-emerald-500">12%</span>.</p>
                  </div>
                  <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-200">
                    <BarChart3 className="mb-2 opacity-70" size={20} />
                    <h4 className="text-3xl font-black tracking-tight">98%</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Confidence</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-24 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="max-w-2xl text-black">
            <h2 className="text-5xl font-black tracking-tighter mb-6">Beyond Raw Data. <br /> Meaningful Curation.</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              DiaLens transforms chaotic biological data points into a clear, editorial diagnostic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureItem 
              num="01" icon={Microscope} title="Multi-Modal Ingestion" 
              desc="Securely upload BMI data, retinal images, and genomic markers into a unified profile." 
            />
            <FeatureItem 
              num="02" icon={Zap} title="Neural Synthesis" 
              desc="Identifying sub-clinical risk markers invisible to the human eye." 
            />
            <FeatureItem 
              num="03" icon={FileSpreadsheet} title="Editorial Reporting" 
              desc="Receive a curated diagnostic summary with actionable insights." 
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-slate-100 text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <span className="text-xl font-bold uppercase tracking-tighter">DiaLens AI</span>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">The Clinical Curator for metabolic health.</p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-slate-300 mb-6 text-black">Product</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 uppercase tracking-tighter">
              <li className="hover:text-blue-600 cursor-pointer transition-colors text-black">Risk Detector</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors text-black">Insight Pane</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}