"use client";

<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React from 'react';
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  LogOut,
  BookOpen,
  Calendar,
  Scale,
  HeartPulse,
  Droplets,
  Eye,
  Dumbbell,
  Cigarette,
  Wine
<<<<<<< HEAD
  , Menu, X
} from 'lucide-react';
import Image from 'next/image';
=======
} from 'lucide-react';
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e

// --- COMPONENT: SIDEBAR ITEM ---
interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

<<<<<<< HEAD
const SidebarItem = ({ href, icon: Icon, label, active = false, onClick }: SidebarItemProps & { onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
=======
const SidebarItem = ({ href, icon: Icon, label, active = false }: SidebarItemProps) => (
  <Link
    href={href}
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e
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

// --- COMPONENT: COLORFUL INFORMATION CARD ---
interface InfoCardProps {
  title: string;
  alias: string;
  description: string;
  optionsExplanation: string;
  icon: React.ElementType;
  gradientBg: string;   // Untuk background atas kartu
  iconContainerBg: string; // Untuk warna wadah ikon
  iconColor: string;    // Warna ikon lucide
  badgeBg: string;      // Warna badge kode
  badgeText: string;
}

const InfoCard = ({ 
  title, 
  alias, 
  description, 
  optionsExplanation, 
  icon: Icon, 
  gradientBg, 
  iconContainerBg, 
  iconColor,
  badgeBg,
  badgeText
}: InfoCardProps) => (
  <div className={`rounded-[2.5rem] border border-slate-200/50 bg-gradient-to-b ${gradientBg} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-full`}>
    <div>
      {/* Bagian Atas: Ikon Tematik & Badge Kode */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className={`p-3 rounded-2xl ${iconContainerBg} shadow-sm`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider ${badgeBg} ${badgeText}`}>
          Code: {alias}
        </span>
      </div>
      
      {/* Judul Parameter */}
      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
        {title}
      </h3>
      
      {/* Deskripsi Medis */}
      <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
        {description}
      </p>
    </div>

    {/* Keterangan Panduan Input (Bagian Bawah Kotak) */}
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 border border-white/60 shadow-inner">
      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Panduan Pengisian:</p>
      <p className="text-xs font-bold text-slate-700 leading-normal">{optionsExplanation}</p>
    </div>
  </div>
);

export default function InformationPage() {
  const pathname = usePathname();
  const router = useRouter();
<<<<<<< HEAD
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
=======
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  // Data parameter dengan dekorasi warna-warni (Gradient & Icon Tematik)
  const glossaryData = [
    {
      title: "Kategori Umur",
      alias: "_AGEG5YR",
      description: "Pengelompokan usia ke dalam rentang skala 5 tahunan. Penting karena risiko diabetes meningkat seiring bertambahnya usia biologis.",
      optionsExplanation: "Pilih kategori 1 (18-24 tahun) hingga kategori 13 (80 tahun ke atas) sesuai dengan umur Anda saat ini.",
      icon: Calendar,
      gradientBg: "from-amber-50/60 to-white",
      iconContainerBg: "bg-amber-500",
      iconColor: "text-white",
      badgeBg: "bg-amber-100/70",
      badgeText: "text-amber-700"
    },
    {
      title: "Berat & Tinggi Badan (BMI)",
      alias: "BMI Calculator",
      description: "Indikator massa tubuh untuk mendeteksi tingkat obesitas. Berat badan berlebih adalah pemicu utama resistensi insulin.",
      optionsExplanation: "Masukkan berat (kg) & tinggi (cm). Sistem otomatis menghitung skor BMI Anda (Normal: 18.5 - 24.9).",
      icon: Scale,
      gradientBg: "from-blue-50/60 to-white",
      iconContainerBg: "bg-blue-600",
      iconColor: "text-white",
      badgeBg: "bg-blue-100/70",
      badgeText: "text-blue-700"
    },
    {
      title: "Tekanan Darah Tinggi",
      alias: "HighBP",
      description: "Kondisi hipertensi kronis yang memaksa jantung bekerja lebih keras. Sangat erat kaitannya dengan komplikasi diabetes.",
      optionsExplanation: "Pilih 'Yes' jika Anda didiagnosis memiliki tekanan darah tinggi atau rutin meminum obat penurun tensi.",
      icon: HeartPulse,
      gradientBg: "from-rose-50/60 to-white",
      iconContainerBg: "bg-rose-500",
      iconColor: "text-white",
      badgeBg: "bg-rose-100/70",
      badgeText: "text-rose-700"
    },
    {
      title: "Kolesterol Tinggi",
      alias: "HighChol",
      description: "Tingginya kadar lemak jahat (LDL) dalam darah yang memicu penyumbatan pembuluh darah arteria.",
      optionsExplanation: "Pilih 'Yes' jika hasil tes laboratorium lipid terakhir Anda menunjukkan angka kolesterol di atas batas normal.",
      icon: Droplets,
      gradientBg: "from-orange-50/60 to-white",
      iconContainerBg: "bg-orange-500",
      iconColor: "text-white",
      badgeBg: "bg-orange-100/70",
      badgeText: "text-orange-700"
    },
    {
      title: "Pemeriksaan Kolesterol",
      alias: "CholCheck",
      description: "Rutinitas pengecekan atau skrining berkala medis untuk memantau kadar lemak tubuh dalam jangka panjang.",
      optionsExplanation: "Pilih 'Yes' jika Anda pernah melakukan cek kadar kolesterol ke dokter/klinik setidaknya sekali dalam 5 tahun terakhir.",
      icon: Eye,
      gradientBg: "from-emerald-50/60 to-white",
      iconContainerBg: "bg-emerald-500",
      iconColor: "text-white",
      badgeBg: "bg-emerald-100/70",
      badgeText: "text-emerald-700"
    },
    {
      title: "Aktivitas Fisik / Olahraga",
      alias: "PhysActivity",
      description: "Tingkat keaktifan tubuh bergerak. Olahraga membantu membakar sisa gula darah dan meningkatkan sensitivitas insulin.",
      optionsExplanation: "Pilih 'Yes' jika Anda aktif berolahraga (jalan kaki, gym, lari) minimal 20-30 menit dalam sebulan terakhir.",
      icon: Dumbbell,
      gradientBg: "from-purple-50/60 to-white",
      iconContainerBg: "bg-purple-500",
      iconColor: "text-white",
      badgeBg: "bg-purple-100/70",
      badgeText: "text-purple-700"
    },
    {
      title: "Status Perokok",
      alias: "Smoker",
      description: "Zat kimia rokok merusak sel tubuh dan memicu peradangan, yang melipatgandakan risiko terkena diabetes tipe 2.",
      optionsExplanation: "Pilih 'Yes' jika Anda merokok aktif saat ini atau telah mengonsumsi lebih dari 100 batang rokok seumur hidup.",
      icon: Cigarette,
      gradientBg: "from-indigo-50/60 to-white",
      iconContainerBg: "bg-indigo-500",
      iconColor: "text-white",
      badgeBg: "bg-indigo-100/70",
      badgeText: "text-indigo-700"
    },
    {
      title: "Konsumsi Alkohol Berat",
      alias: "HvyAlcoholConsump",
      description: "Kebiasaan minum alkohol berlebih yang dapat merusak fungsi organ pankreas dalam memproduksi hormon insulin.",
      optionsExplanation: "Pilih 'Yes' jika Anda mengonsumsi alkohol >14 gelas/minggu (Pria) atau >7 gelas/minggu (Wanita).",
      icon: Wine,
      gradientBg: "from-cyan-50/60 to-white",
      iconContainerBg: "bg-cyan-500",
      iconColor: "text-white",
      badgeBg: "bg-cyan-100/70",
      badgeText: "text-cyan-700"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans selection:bg-blue-100">
      <div className="flex">
        
<<<<<<< HEAD
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

        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col bg-white border-r border-slate-100 p-6 md:justify-between z-30">
          <div className="space-y-8">
            {/* LOGO */}
            <div className="flex items-center gap-3 px-2">
              <Image src="/Logo%20Dialens%20AI.png" alt="DiaLens" height={40} width={40} className="h-10 w-auto rounded-md" />
=======
        {/* SIDEBAR NAVIGATION (KONSISTEN, DENGAN BADGE AKTIF WARNA BIRU SOLID) */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 p-6 flex flex-col justify-between z-30">
          <div className="space-y-8">
            {/* LOGO */}
            <div className="flex items-center gap-3 px-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
                <Activity size={20} strokeWidth={3} />
              </div>
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Welcome</p>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">DiaLens</h2>
              </div>
            </div>

            {/* NAVIGASI UTAMA */}
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

        {/* AREA PANEL UTAMA (KANAN) */}
<<<<<<< HEAD
        <div className="md:pl-64 w-full">
=======
        <div className="pl-64 w-full">
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e
          <main className="p-8 max-w-7xl mx-auto space-y-6">
            
            {/* BANNER UTAMA DENGAN GRADASI BERWARNA CERAH */}
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl text-white">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-200">Medical Dictionary</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Kamus Indikator Medis</h1>
                  </div>
                </div>
                <div className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed font-medium">
                  Baca penjelasan lengkap dari setiap indikator klinis yang kami gunakan. Dipandu dengan infografis mini untuk memudahkan pemahaman skrining Anda.
                </div>
              </div>
            </div>

            {/* GRID SEPARATED INFO CARDS YANG COLORFUL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {glossaryData.map((item, idx) => (
                <InfoCard 
                  key={idx}
                  title={item.title}
                  alias={item.alias}
                  description={item.description}
                  optionsExplanation={item.optionsExplanation}
                  icon={item.icon}
                  gradientBg={item.gradientBg}
                  iconContainerBg={item.iconContainerBg}
                  iconColor={item.iconColor}
                  badgeBg={item.badgeBg}
                  badgeText={item.badgeText}
                />
              ))}
            </div>

          </main>
        </div>

<<<<<<< HEAD
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

=======
>>>>>>> a0e0a7c11251a12cf805781c702258b11b80c17e
      </div>
    </div>
  );
}