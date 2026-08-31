"use client";

import React from "react";
import { Smartphone, Share } from "lucide-react";

interface MobileIOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileIOSInstallModal: React.FC<MobileIOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 text-center animate-in slide-in-from-bottom-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-green-tint text-ford-blue mx-auto flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-ford-blue">Pasang di Layar Utama iPhone</h3>
          <p className="text-[11px] text-blue-gray">Jadikan Kcal seperti aplikasi bawaan iOS:</p>
        </div>
        <div className="p-3 bg-[#F8FAFC] rounded-2xl text-left text-[11px] space-y-2.5 text-ford-blue">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-light-sea-green text-ford-blue font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
            <span>Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-light-sea-green mx-0.5" /> di Safari.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-light-sea-green text-ford-blue font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
            <span>Pilih opsi <strong>&quot;Tambah ke Layar Utama&quot;</strong>.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-light-sea-green text-ford-blue font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
            <span>Ketuk <strong>&quot;Tambah&quot;</strong> di pojok kanan atas.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-ford-blue hover:bg-light-sea-green text-white font-bold rounded-xl text-[12px] transition-colors cursor-pointer"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};
