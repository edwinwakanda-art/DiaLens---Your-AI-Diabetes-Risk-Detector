"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  LogOut,
  Search,
  Calendar,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Menu,
  X
} from 'lucide-react';
import Image from 'next/image';

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ href, icon: Icon, label, active = false, onClick }: SidebarItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all font-bold text-sm ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </Link>
);

interface HistoryItem {
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
}

export default function HistoryPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const defaultData: HistoryItem[] = [
      { id: "DL-9082", date: "2026-05-18", age: "45-49 thn", weight: "78 kg", height: "168 cm", bmi: "27.6", highBP: "Yes", highChol: "Yes", prediction: "Risiko Tinggi (76%)", status: "Danger" },
      { id: "DL-8941", date: "2026-04-12", age: "25-29 thn", weight: "60 kg", height: "165 cm", bmi: "22.0", highBP: "No", highChol: "No", prediction: "Risiko Ringan (12%)", status: "Safe" },
      { id: "DL-8712", date: "2026-03-01", age: "60-64 thn", weight: "72 kg", height: "160 cm", bmi: "28.1", highBP: "Yes", highChol: "No", prediction: "Risiko Sedang (43%)", status: "Warning" }
    ];

    const stored = localStorage.getItem('medicalHistory');
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistoryData(JSON.parse(stored));
    } else {
      localStorage.setItem('medicalHistory', JSON.stringify(defaultData));
      setHistoryData(defaultData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const filteredData = historyData.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        
        {/* MOBILE TOPBAR */}
        <div className="md:hidden fixed top-4 left-4 right-4 z-40 flex items-center justify-between p-3 bg-white rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Image src="/Logo%20Dialens%20AI.png" alt="DiaLens" height={32} width={32} className="h-8 w-auto rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION (DESKTOP) */}
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col bg-white border-r border-slate-100 p-6 md:justify-between z-30">
          <div className="space-y-8">
            {/* LOGO */}
            <div className="flex items-center gap-3 px-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
                <Activity size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Welcome</p>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">DiaLens</h2>
              </div>
            </div>

            <nav className="space-y-1.5 flex flex-col">
              <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />
              <SidebarItem href="/check" icon={Activity} label="Check Kesehatan" active={pathname === '/check'} />
              <SidebarItem href="/history" icon={ShieldCheck} label="History" active={pathname === '/history'} />
              <SidebarItem href="/information" icon={Sparkles} label="Information" active={pathname === '/information'} />
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all text-left">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* AREA PANEL KANAN */}
        <div className="md:pl-64 pt-20 md:pt-0 w-full">
          <main className="p-8 max-w-7xl mx-auto space-y-6">
            
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">Screening Logs</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Riwayat Pemeriksaan Medis</h1>
                </div>
                <div className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                  Pantau dan tinjau kembali hasil kalkulasi risiko diabetes dari pemeriksaan yang telah Anda lakukan sebelumnya dalam satu rekapan tabel terpadu.
                </div>
              </div>
            </div>

            {/* SEARCH & UTILITY */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari ID Pemeriksaan..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white text-black"
                />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Rekaman: <span className="text-blue-600 font-black">{filteredData.length} Data</span>
              </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="rounded-[2.5rem] bg-white border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400">ID / Tanggal</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400">Profil Fisik</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400">Hasil BMI</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400">Hipertensi</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400">Kolesterol</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400">Prediksi AI</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        
                        <td className="p-5">
                          <div className="font-black text-xs text-slate-900">{row.id}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar size={11} /> {row.date}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="text-xs font-bold text-slate-800">Umur: {row.age}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            {row.weight} / {row.height}
                          </div>
                        </td>

                        <td className="p-5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 text-xs font-black">
                            <Scale size={12} />
                            {row.bmi}
                          </div>
                        </td>

                        <td className="p-5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            row.highBP === 'Yes' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {row.highBP}
                          </span>
                        </td>

                        <td className="p-5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            row.highChol === 'Yes' 
                              ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {row.highChol}
                          </span>
                        </td>

                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            {row.status === 'Danger' && <AlertTriangle size={14} className="text-rose-500" />}
                            {row.status === 'Warning' && <AlertTriangle size={14} className="text-amber-500" />}
                            {row.status === 'Safe' && <CheckCircle2 size={14} className="text-emerald-500" />}
                            
                            <span className={`text-xs font-black ${
                              row.status === 'Danger' ? 'text-rose-600' :
                              row.status === 'Warning' ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {row.prediction}
                            </span>
                          </div>
                        </td>

                        <td className="p-5 text-center">
                          <button className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm">
                            <Eye size={12} />
                            <span>Detail</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6">
              <div className="flex items-center justify-between">
                <div />
                <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-6 space-y-2.5 flex flex-col">
                <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/check" icon={Activity} label="Check Kesehatan" active={pathname === '/check'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/history" icon={ShieldCheck} label="History" active={pathname === '/history'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/information" icon={Sparkles} label="Information" active={pathname === '/information'} onClick={() => setMobileSidebarOpen(false)} />
              </nav>

              <div className="pt-6 border-t border-slate-100">
                <button onClick={() => { setMobileSidebarOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all text-left">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}