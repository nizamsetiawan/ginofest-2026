"use client";

import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { Drawer } from "vaul";

interface MobilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePrivacyModal: React.FC<MobilePrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-sm transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1000] max-h-[85vh] bg-white rounded-t-[32px] p-5 pb-safe-nav pb-6 shadow-2xl border-t border-slate-100 flex flex-col focus:outline-none font-sans">
          {/* Spring Physics Drag Handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-300 mb-4 cursor-grab" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#79D7D2]/20 text-ford-blue flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#23B5A8]" />
              </div>
              <div>
                <Drawer.Title className="text-[15px] font-black text-ford-blue">
                  Kebijakan Privasi
                </Drawer.Title>
                <Drawer.Description className="text-[11px] text-slate-500 font-medium">
                  Kcal • Ginofest 2026
                </Drawer.Description>
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

          {/* Content Body */}
          <div className="space-y-3 text-[12px] text-slate-600 leading-relaxed overflow-y-auto pr-1 flex-1">
            <p>
              Aplikasi <strong>Kcal MBG</strong> berkomitmen melindungi privasi data pribadi warga, orang tua, dan anak sasaran Makan Bergizi Gratis:
            </p>
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2 text-[11.5px]">
              <p>🔒 <strong>Enkripsi Data</strong>: Data pertumbuhan anak dan aduan dienkripsi dengan standar keamanan Cloud Firestore &amp; ISO 27001.</p>
              <p>🥗 <strong>Grounding Gizi</strong>: Data menu mengacu pada TKPI Kemenkes RI &amp; pagu resmi BGN (Rp 15.000/porsi).</p>
              <p>📍 <strong>Transparansi</strong>: Komoditas lokal disuplai oleh UMKM/Gapoktan wilayah kecamatan terdaftar.</p>
            </div>
            <p className="text-[11px] text-slate-400">
              Dengan menggunakan aplikasi ini, Anda menyetujui pemrosesan data gizi anak untuk peningkatan layanan kesehatan publik.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13.5px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center"
            >
              Saya Mengerti
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
