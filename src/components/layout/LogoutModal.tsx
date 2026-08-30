"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminProfile } from "@/data/admin-profiles";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin?: AdminProfile;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const displayName = user?.name || currentAdmin?.name || "Administrator";
  const displayRegion = user?.regionLabel || currentAdmin?.regionLabel || "Kabupaten Gresik";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200 cursor-default"
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
          <LogOut className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-[#2C3968]">Keluar dari Akun?</h3>
          <p className="text-[12px] text-[#64748b] mt-1.5 leading-relaxed">
            Apakah Anda yakin ingin mengakhiri sesi akun{" "}
            <strong className="text-[#2C3968] font-bold">{displayName}</strong>{" "}
            ({displayRegion})?
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
