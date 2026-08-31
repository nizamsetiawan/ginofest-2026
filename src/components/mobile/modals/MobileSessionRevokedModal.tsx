"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface MobileSessionRevokedModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const MobileSessionRevokedModal: React.FC<MobileSessionRevokedModalProps> = ({ isOpen, onDismiss }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-red-100 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 mx-auto flex items-center justify-center border border-red-200 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[17px] font-black text-[#2C3968]">Sesi Akses Dinonaktifkan</h3>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            Sesi login akun Anda telah dihentikan oleh Administrator Utama (Super Admin Kabupaten Gresik).
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
          Silakan masuk kembali untuk memulai sesi baru.
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-[13px] shadow-md hover:opacity-95 transition-all cursor-pointer"
        >
          Kembali ke Halaman Awal
        </button>
      </div>
    </div>
  );
};
