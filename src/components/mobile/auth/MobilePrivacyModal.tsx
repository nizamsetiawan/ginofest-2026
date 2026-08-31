"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface MobilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePrivacyModal: React.FC<MobilePrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 shadow-2xl border border-slate-200 text-left animate-in slide-in-from-bottom-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-light-sea-green" />
            </div>
            <div>
              <h3 className="text-[13.5px] font-black text-ford-blue">Kebijakan Privasi</h3>
              <p className="text-[10px] text-blue-gray">Kcal • Ginofest 2026</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed max-h-[260px] overflow-y-auto pr-1">
          <p>
            Aplikasi <strong>Kcal MBG</strong> berkomitmen melindungi privasi data pribadi warga, orang tua, dan anak sasaran Makan Bergizi Gratis:
          </p>
          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1.5 text-[10.5px]">
            <p>🔒 <strong>Enkripsi Data</strong>: Data pertumbuhan anak dan aduan dienkripsi dengan standar keamanan Cloud Firestore &amp; ISO 27001.</p>
            <p>🥗 <strong>Grounding Gizi</strong>: Data menu mengacu pada TKPI Kemenkes RI &amp; pagu resmi BGN (Rp 15.000/porsi).</p>
            <p>📍 <strong>Transparansi</strong>: Komoditas lokal disuplai oleh UMKM/Gapoktan wilayah kecamatan terdaftar.</p>
          </div>
          <p className="text-[10px] text-slate-400">
            Dengan menggunakan aplikasi ini, Anda menyetujui pemrosesan data gizi anak untuk peningkatan layanan kesehatan publik.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[12px] shadow-xs cursor-pointer"
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
};
