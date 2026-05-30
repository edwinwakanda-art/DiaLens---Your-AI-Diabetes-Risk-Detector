"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Hospital,
  LogOut,
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    router.push('/');
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-100 bg-white p-6 lg:block">
        
        {/* AREA LOGO DENGAN TEXT WELCOME DAN GARIS PEMISAH BAWAH */}
        <div className="flex flex-col pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <Image 
              src="/favicon.ico" 
              alt="DiaLens AI Logo" 
              width={34} 
              height={34} 
              className="object-contain"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">WELCOME TO</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">DIALENS AI</span>
            </div>
          </div>
        </div>

        {/* DAFTAR MENU SIDEBAR */}
        <nav className="mt-6 space-y-2 flex flex-col">
          <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} />
          <SidebarItem href="/check" icon={Activity} label="Check Kesehatan" active={pathname === '/check'} />
          <SidebarItem href="/history" icon={ShieldCheck} label="Riwayat" active={pathname === '/history'} />
          <SidebarItem href="/rumah-sakit" icon={Hospital} label="Rumah Sakit" active={pathname === '/rumah-sakit'} />
          <SidebarItem href="/information" icon={Sparkles} label="Informasi" active={pathname === '/information'} />
        </nav>

        <div className="absolute bottom-6 left-6 right-6 pt-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all text-left cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-5 py-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Image 
            src="/favicon.ico" 
            alt="DiaLens AI Logo" 
            width={28} 
            height={28} 
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">WELCOME TO</span>
            <span className="text-sm font-black text-slate-900 tracking-tight">DIALENS AI</span>
          </div>
        </div>
        <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50">
          <Menu size={20} />
        </button>
      </div>

      {/* MOBILE SIDEBAR DRAWNER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
          <aside className="fixed inset-y-0 right-0 z-50 w-64 bg-white p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Image 
                    src="/favicon.ico" 
                    alt="DiaLens AI Logo" 
                    width={28} 
                    height={28} 
                    className="object-contain"
                    priority
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">WELCOME TO</span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">DIALENS AI</span>
                  </div>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-6 space-y-2.5 flex flex-col">
                <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/check" icon={Activity} label="Check Kesehatan" active={pathname === '/check'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/history" icon={ShieldCheck} label="Riwayat" active={pathname === '/history'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/rumah-sakit" icon={Hospital} label="Rumah Sakit" active={pathname === '/rumah-sakit'} onClick={() => setMobileSidebarOpen(false)} />
                <SidebarItem href="/information" icon={Sparkles} label="Informasi" active={pathname === '/information'} onClick={() => setMobileSidebarOpen(false)} />
              </nav>

              <div className="pt-6 border-t border-slate-100">
                <button onClick={() => { setMobileSidebarOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all text-left">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}