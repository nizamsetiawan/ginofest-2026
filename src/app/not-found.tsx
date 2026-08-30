import Link from "next/link";
import { Home, HelpCircle, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#F8FAFC] text-ford-blue p-6 font-sans overflow-hidden">
      {/* Decorative Ambient Radial Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-02/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-light-sea-green/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic 404 Card */}
      <div className="relative z-10 max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Large Prominent 404 Display */}
        <div className="relative inline-block select-none">
          <span className="text-[84px] sm:text-[110px] font-black tracking-tight leading-none bg-gradient-to-b from-ford-blue via-ford-blue to-[#4A5D94] bg-clip-text text-transparent block">
            404
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-brand-red border border-brand-red/30 text-[11px] font-bold shadow-2xs -mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Halaman Tidak Ditemukan</span>
          </div>
        </div>

        {/* Informative Description */}
        <div className="space-y-2">
          <h2 className="text-[20px] sm:text-[22px] font-bold text-ford-blue tracking-tight">
            Tautan Tidak Tersedia atau Telah Dipindahkan
          </h2>
          <p className="text-[13px] text-blue-gray leading-relaxed max-w-sm mx-auto">
            Halaman web atau endpoint yang Anda tuju sedang tidak aktif. Pastikan URL yang dimasukkan sudah benar atau kembali ke dashboard utama.
          </p>
        </div>

        {/* Dual High-Contrast Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[13px] shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4 text-ford-blue" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/pemerintah?tab=bantuan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[13px] border border-slate-200 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-ford-blue" />
            <span>Pusat Bantuan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
