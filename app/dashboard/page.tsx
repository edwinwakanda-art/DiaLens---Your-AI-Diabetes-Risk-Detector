"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  LogOut,
  TrendingUp,
  User,
  Zap,
  Clock,
  ArrowUpRight,
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
}

interface StatCardProps {
  title: string;
  value: string;
  desc: string;
  icon: React.ElementType;
  iconBg: string;
  gradientBg: string;
}

const StatCard = ({ title, value, desc, icon: Icon, iconBg, gradientBg }: StatCardProps) => (
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
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-xs font-black uppercase tracking-[0.05em] text-slate-700 mt-1">{title}</p>
      <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();

  const [displayName] = useState(() => {
    if (typeof window === 'undefined') return 'Pengguna DiaLens';
    return localStorage.getItem('userName') || 'Pengguna DiaLens';
  });
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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const defaultData: MedicalLog[] = [
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
      },
      {
        id: 'DL-8941',
        date: '2026-04-12',
        age: '25-29 thn',
        weight: '60 kg',
        height: '165 cm',
        bmi: '22.0',
        highBP: 'No',
        highChol: 'No',
        prediction: 'Risiko Ringan (12%)',
        status: 'Safe',
      },
      {
        id: 'DL-8712',
        date: '2026-03-01',
        age: '60-64 thn',
        weight: '72 kg',
        height: '160 cm',
        bmi: '28.1',
        highBP: 'Yes',
        highChol: 'No',
        prediction: 'Risiko Sedang (43%)',
        status: 'Warning',
      },
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

    if (history.length > 0) {
      const latest = history[0];
      const riskStatus = latest.prediction.split(' (')[0];

      // eslint-disable-next-line
      setScreeningData({
        totalScreening: `${history.length} Kali`,
        lastBmi: `${latest.bmi} BMI`,
        lastRisk: riskStatus,
        lastLog: latest,
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        <div className="md:hidden fixed top-4 left-4 right-4 z-40 flex items-center justify-between p-3 bg-white rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <Image src="/Logo%20Dialens%20AI.png" alt="DiaLens" height={32} width={32} className="h-8 w-auto rounded-md" />
            <div>
              <p className="text-sm font-bold truncate max-w-xs">{displayName}</p>
            </div>
          </div>
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
            <LayoutDashboard size={18} />
          </button>
        </div>

        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col bg-white border-r border-slate-100 p-6 md:justify-between z-30">
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-2">
              <Image src="/Logo%20Dialens%20AI.png" alt="DiaLens" height={40} width={40} className="h-10 w-auto rounded-md" />
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

        <div className="md:pl-64 w-full">
          <main className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Skrining"
                value={screeningData.totalScreening}
                desc="Jumlah akumulasi semua pemeriksaan yang tersimpan dalam riwayat medis Anda."
                icon={TrendingUp}
                iconBg="bg-amber-500"
                gradientBg="from-amber-50/60 to-white"
              />
              <StatCard
                title="Indeks Massa Tubuh"
                value={screeningData.lastBmi}
                desc="Hasil BMI terbaru yang dihitung dari entri berat dan tinggi badan terakhir."
                icon={User}
                iconBg="bg-sky-500"
                gradientBg="from-sky-50/60 to-white"
              />
              <StatCard
                title="Status Risiko AI"
                value={screeningData.lastRisk}
                desc="Kategori risiko terakhir yang dihasilkan oleh kalkulator AI."
                icon={Zap}
                iconBg={
                  screeningData.lastRisk === 'Risiko Tinggi'
                    ? 'bg-rose-500'
                    : screeningData.lastRisk === 'Risiko Sedang'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }
                gradientBg="from-purple-50/60 to-white"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 rounded-[2.5rem] bg-white border border-slate-200/60 p-8 shadow-sm space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Activity Logs</p>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Timeline Aktivitas Terbaru</h3>
                </div>
                <div className="space-y-4">
                  {screeningData.lastLog ? (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Melakukan Cek Kesehatan Mandiri ({screeningData.lastLog.id})</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Sistem berhasil memprediksi parameter fisik dengan kesimpulan {screeningData.lastLog.prediction}.
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

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl text-white">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Welcome</p>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">DiaLens</h2>
                  </div>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-lg">
                  ✕
                </button>
              </div>

              <nav className="mt-6 space-y-2.5 flex flex-col">
                <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/check" icon={Activity} label="Check Kesehatan" active={pathname === '/check'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/history" icon={ShieldCheck} label="History" active={pathname === '/history'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/information" icon={Sparkles} label="Information" active={pathname === '/information'} onClick={() => setMobileSidebarOpen(false)} />
              </nav>

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all text-left"
                >
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
