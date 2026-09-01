"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { Dialog, DialogButton } from "konsta/react";

interface MobileSessionRevokedModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const MobileSessionRevokedModal: React.FC<MobileSessionRevokedModalProps> = ({ isOpen, onDismiss }) => {
  return (
    <Dialog
      opened={isOpen}
      onBackdropClick={onDismiss}
      title={
        <div className="flex flex-col items-center gap-2 text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-6 h-6 text-brand-red" />
          </div>
          <span className="text-[15px] font-black text-ford-blue">Sesi Akses Dinonaktifkan</span>
        </div>
      }
      content={
        <div className="space-y-2 text-center text-[12px] text-blue-gray leading-relaxed pt-1">
          <p>
            Sesi login akun Anda telah dihentikan oleh Administrator Super Admin Kabupaten Gresik.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-ford-blue font-medium">
            Silakan masuk kembali untuk memulai sesi baru.
          </div>
        </div>
      }
      buttons={
        <DialogButton
          onClick={onDismiss}
          className="bg-brand-red text-white font-bold text-[12px] py-2.5 rounded-xl"
        >
          Kembali ke Halaman Masuk
        </DialogButton>
      }
    />
  );
};
