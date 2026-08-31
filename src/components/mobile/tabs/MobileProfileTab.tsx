"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Activity,
  MessageSquare,
  Sparkles,
  ChevronRight,
  LogOut
} from "lucide-react";
import { CitizenUser, MobileTab } from "../types";

interface MobileProfileTabProps {
  citizenUser: CitizenUser | null;
  setActiveTab: (tab: MobileTab) => void;
  onLogout: () => void;
}

export const MobileProfileTab: React.FC<MobileProfileTabProps> = ({
  citizenUser,
  setActiveTab,
  onLogout,
}) => {
  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Citizen Profile Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-ford-blue via-[#1E2950] to-light-sea-green text-white space-y-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-[18px] font-bold text-white shadow-inner">
            {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-bold leading-tight truncate">
                {citizenUser?.name || "Warga Gresik"}
              </h3>
              <ShieldCheck className="w-3.5 h-3.5 text-green-02 shrink-0" />
            </div>
            <p className="text-[11px] text-blue-100 truncate mt-0.5">
              {citizenUser?.email || "warga@gresik.id"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[9.5px] font-bold text-blue-100 border border-white/20">
                <MapPin className="w-2.5 h-2.5 text-brand-orange" />
                <span>Kec. {citizenUser?.district || "Kebomas"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center border-t border-white/10">
          <div className="p-1.5 rounded-xl bg-white/10">
            <span className="block text-[13px] font-bold text-white">1</span>
            <span className="text-[9.5px] text-blue-100">Anak Dipantau</span>
          </div>
          <div className="p-1.5 rounded-xl bg-white/10">
            <span className="block text-[13px] font-bold text-green-02">Optimal</span>
            <span className="text-[9.5px] text-blue-100">Status Gizi</span>
          </div>
          <div className="p-1.5 rounded-xl bg-white/10">
            <span className="block text-[13px] font-bold text-brand-orange">MBG</span>
            <span className="text-[9.5px] text-blue-100">Aktif Sekolah</span>
          </div>
        </div>
      </div>

      {/* Menu & Layanan Warga */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <h4 className="text-[11px] font-bold text-blue-gray uppercase tracking-wider px-1">
          Layanan &amp; Pengaturan
        </h4>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("screening")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span>Riwayat Skrining Gizi AI</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-gray" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("complaint")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span>Pusat Pengaduan Menu MBG</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-gray" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_chat")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Konsultasi Nutrisi K-Bot AI</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-gray" />
          </button>
        </div>
      </div>

      {/* Tombol Keluar Sesi */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-brand-red/30 text-brand-red text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
};
