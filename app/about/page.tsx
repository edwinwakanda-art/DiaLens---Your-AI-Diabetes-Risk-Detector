"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Activity, Sparkles } from "lucide-react";

const featureList = [
  {
    title: "Analisis Risiko Diabetes",
    description: "Prediksi risiko diabetes berbasis AI dengan penjelasan ringkas agar dokter dapat mengambil tindakan selanjutnya dengan cepat.",
    icon: Activity,
  },
  {
    title: "Proses Skrining Terintegrasi",
    description: "Dukungan proses pemeriksaan end-to-end mulai dari input data sampai riwayat hasil, tanpa perlu pindah aplikasi.",
    icon: Sparkles,
  },
  {
    title: "Privasi dan Keamanan",
    description: "Rancangan sistem mempertahankan kerahasiaan data pasien dan mempermudah kepatuhan regulasi klinis.",
    icon: ShieldCheck,
  },
];

const teamMembers = [
  { name: "Djibrani Yuda", role: "Lead AI Engineer", initials: "DY", bg: "from-blue-100 to-indigo-100", text: "text-indigo-600", desc: "Mengembangkan arsitektur deep learning dan mengoptimalkan akurasi model neural network DiaLens." },
  { name: "Jonathan Alfa", role: "AI Engineer", initials: "JA", bg: "from-purple-100 to-indigo-100", text: "text-purple-600", desc: "Fokus pada integrasi pipeline model AI dan fine-tuning inferensi data klinis." },
  { name: "Reza Maulana", role: "Senior Data Scientist", initials: "RM", bg: "from-emerald-100 to-teal-100", text: "text-emerald-600", desc: "Menganalisis data medis untuk memastikan hasil prediksi yang akurat dan dapat dipertanggungjawabkan." },
  { name: "Farih Kamil", role: "Data Scientist", initials: "FK", bg: "from-teal-100 to-cyan-100", text: "text-teal-600", desc: "Menangani pembersihan dan normalisasi data medis untuk meningkatkan kualitas input model AI." },
  { name: "Edwin Fadhilah", role: "Lead Fullstack Developer", initials: "EF", bg: "from-sky-100 to-blue-100", text: "text-blue-600", desc: "Membangun pengalaman aplikasi Next.js yang responsif dan mengamankan alur data klinis pengguna." },
  { name: "Abinaya Azhar", role: "Fullstack Developer", initials: "AA", bg: "from-slate-100 to-blue-100", text: "text-slate-600", desc: "Mengimplementasikan UI intuitif, manajemen riwayat pemeriksaan, dan performa frontend aplikasi." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-24 px-6 md:px-10 lg:px-16">
      <section className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[3rem] bg-white border border-slate-200/70 p-10 md:p-14 shadow-xl overflow-hidden"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-600 px-4 py-2 text-xs font-black uppercase tracking-[0.3em]">
                About DiaLens
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                Solusi AI untuk skrining dan manajemen risiko diabetes.
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-slate-600 leading-relaxed">
                DiaLens menghadirkan antarmuka klinis modern, prediksi AI yang dapat diandalkan, dan pengalaman pasien yang mudah diikuti — semua dirancang untuk membantu tim perawatan kesehatan membuat keputusan berbasis data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-transform"
                >
                  Mulai Skrining
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-900 hover:bg-slate-50 transition"
                >
                  Lihat Dashboard
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent)]"></div>
              <div className="relative space-y-5">
                <div className="text-sm uppercase tracking-[0.3em] text-blue-100 font-black">Klinik Digital</div>
                <div className="text-6xl font-black leading-none">AI + Data</div>
                <p className="text-sm leading-relaxed text-blue-100/90">
                  Aplikasi yang mendukung alur kerja klinis dan rekam medis dengan pemodelan risiko diabetes yang dapat ditindaklanjuti.
                </p>
                <div className="grid gap-4">
                  <div className="rounded-3xl bg-white/10 p-5 shadow-lg backdrop-blur-sm border border-white/10">
                    <p className="text-sm uppercase tracking-[0.25em] text-blue-100 font-black">Hemat Waktu</p>
                    <p className="mt-2 text-sm text-blue-50 leading-relaxed">Sederhanakan penilaian risiko tanpa proses manual yang berlebihan.</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-5 shadow-lg backdrop-blur-sm border border-white/10">
                    <p className="text-sm uppercase tracking-[0.25em] text-blue-100 font-black">Evaluasi Cepat</p>
                    <p className="mt-2 text-sm text-blue-50 leading-relaxed">Dapatkan wawasan risiko pasien dalam beberapa detik saja.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <section className="pt-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">The Innovators</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Meet Our Special Team</h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Tim lintas keahlian kami memadukan machine learning, pengolahan data klinis, dan pengalaman aplikasi untuk membangun DiaLens.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[2rem] border border-slate-200/70 bg-white p-7 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.bg} border-4 border-white shadow-md flex items-center justify-center mb-5`}>
                  <span className={`font-black text-xl ${member.text}`}>{member.initials}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{member.name}</h3>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-black mt-2">{member.role}</p>
                <p className="mt-4 text-sm text-slate-500 leading-relaxed">{member.desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          {featureList.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="rounded-[2rem] bg-white border border-slate-200/70 p-8 shadow-sm"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-xl font-black text-slate-900">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </section>

        <section className="rounded-[2.5rem] border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white shadow-2xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300 font-black">Misi kami</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">
                Membangun sistem AI yang dapat dipercaya untuk deteksi dini diabetes.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-slate-300 max-w-xl">
                Dengan fokus pada keamanan data, kemudahan penggunaan, dan hasil yang dapat ditindaklanjuti, DiaLens mendukung tenaga kesehatan menangani risiko diabetes lebih cepat dan lebih akurat.
              </p>
            </div>
            <div className="space-y-4 rounded-[2rem] bg-white/5 p-6">
              <div className="flex items-center justify-between rounded-3xl bg-slate-900/80 p-5">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-300">Integrasi klinis</span>
                <span className="font-black text-white">Mudah disesuaikan</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-900/80 p-5">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-300">Kepatuhan</span>
                <span className="font-black text-white">Privasi terjaga</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-900/80 p-5">
                <span className="text-xs uppercase tracking-[0.25em] text-slate-300">Skalabilitas</span>
                <span className="font-black text-white">Dukungan multi-klinik</span>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
