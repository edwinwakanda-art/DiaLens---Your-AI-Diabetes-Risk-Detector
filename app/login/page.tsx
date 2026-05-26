"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Silakan isi semua kredensial klinis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mengirim data login ke endpoint login backend Vercel kamu
      const response = await fetch('https://dia-lens-backend.vercel.app/api/health/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Menangkap error "Email atau Password salah" dari backend
        throw new Error(data.message || 'Gagal masuk. Periksa kembali akun Anda.');
      }

      // Menyimpan data token keamanan ke localStorage browser
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userName', data.user.name);

      // Berhasil masuk -> Arahkan langsung ke dashboard aplikasi
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] text-slate-900 font-sans flex flex-col justify-center items-center p-4">
      <main className="w-full max-w-[440px] bg-white rounded-[2.5rem] border border-slate-200/50 p-10 shadow-xl shadow-blue-100/50 flex flex-col items-center z-10">
        
        <div className="w-16 h-16 mb-2">
          <Image
            src="/Logo%20Dialens%20AI.png"
            alt="DiaLens Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain rounded-2xl shadow-sm"
          />
        </div>

        <h1 className="text-xl font-black text-slate-900 tracking-tight mt-3 text-center">
          Masuk ke DiaLens
        </h1>
        <p className="text-[11px] font-bold text-slate-400 mt-1.5 text-center">
          Masukkan email dan kata sandi Anda untuk mengakses dashboard kesehatan AI.
        </p>

        <form onSubmit={handleLogin} className="w-full mt-6 space-y-4">
          {error && (
            <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="contoh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-[#00AEEF] focus:bg-white text-black shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 py-3 text-xs font-bold text-slate-800 outline-none focus:border-[#00AEEF] focus:bg-white text-black shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-[#009cd6] text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Memvalidasi...' : 'Masuk Aplikasi'}</span>
          </button>
        </form>

        <p className="text-[11px] font-bold text-slate-400 mt-6 text-center">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-[#00AEEF] hover:underline font-black">
            Daftar di sini
          </Link>
        </p>
      </main>
    </div>
  );
}