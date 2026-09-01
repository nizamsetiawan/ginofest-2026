"use client";

import React from "react";
import { ShieldCheck, X } from "lucide-react";

interface MobilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePrivacyModal: React.FC<MobilePrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 max-w-full sm:max-w-[360px] w-full space-y-4 shadow-2xl border border-slate-200 text-left animate-in slide-in-from-bottom-6 duration-300 pb-safe-nav pb-6 sm:pb-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center font-bold shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-light-sea-green" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-ford-blue">Kebijakan Privasi</h3>
              <p className="text-[10.5px] text-blue-gray">Kcal • Ginofest 2026</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer transition-all active:scale-95"
          >
            <X className="w-4 h-4 text-ford-blue" />
          </button>
        </div>

        <div className="space-y-2.5 text-[11.5px] text-slate-600 leading-relaxed max-h-[280px] overflow-y-auto pr-1">
          <p>
            Aplikasi <strong>Kcal MBG</strong> berkomitmen melindungi privasi data pribadi warga, orang tua, dan anak sasaran Makan Bergizi Gratis:
          </p>
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2 text-[11px]">
            <p>🔒 <strong>Enkripsi Data</strong>: Data pertumbuhan anak dan aduan dienkripsi dengan standar keamanan Cloud Firestore &amp; ISO 27001.</p>
            <p>🥗 <strong>Grounding Gizi</strong>: Data menu mengacu pada TKPI Kemenkes RI &amp; pagu resmi BGN (Rp 15.000/porsi).</p>
            <p>📍 <strong>Transparansi</strong>: Komoditas lokal disuplai oleh UMKM/Gapoktan wilayah kecamatan terdaftar.</p>
          </div>
          <p className="text-[10.5px] text-slate-400">
            Dengan menggunakan aplikasi ini, Anda menyetujui pemrosesan data gizi anak untuk peningkatan layanan kesehatan publik.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 text-ford-blue font-black text-[13px] shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
};
