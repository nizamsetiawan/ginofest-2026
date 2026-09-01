"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface MobileSessionRevokedModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const MobileSessionRevokedModal: React.FC<MobileSessionRevokedModalProps> = ({ isOpen, onDismiss }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in font-sans">
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-red-100 animate-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 mx-auto flex items-center justify-center border border-red-200 shadow-xs">
          <ShieldAlert className="w-7 h-7 text-brand-red" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[16px] font-black text-ford-blue">Sesi Akses Dinonaktifkan</h3>
          <p className="text-[11.5px] text-blue-gray leading-relaxed">
            Sesi login akun Anda telah dihentikan oleh Administrator Super Admin Kabupaten Gresik.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-ford-blue font-medium">
          Silakan masuk kembali untuk memulai sesi baru.
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl bg-brand-red hover:bg-red-700 text-white font-black text-[12px] shadow-md transition-all cursor-pointer active:scale-95"
        >
          Kembali ke Halaman Masuk
        </button>
      </div>
    </div>
  );
};
