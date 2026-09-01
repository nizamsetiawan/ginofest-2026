"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Activity,
  MessageSquare,
  Sparkles,
  ChevronRight,
  LogOut,
  Building2,
  HelpCircle,
  FileText
} from "lucide-react";
import { Page } from "konsta/react";
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
    <div className="space-y-4 font-sans pb-6 animate-in fade-in duration-200 select-none">
      {/* ═══ 1. CLEAN PROFILE HEADER CARD ═══ */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-green-02 to-light-sea-green text-ford-blue flex items-center justify-center text-lg font-black shadow-xs shrink-0">
            {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-black text-ford-blue truncate">
                {citizenUser?.name || "Muhammad Nizam Setiawan"}
              </h3>
              <ShieldCheck className="w-4 h-4 text-light-sea-green shrink-0" />
            </div>
            <p className="text-[11px] text-blue-gray truncate font-medium">
              {citizenUser?.email || "nizam@gresik.go.id"}
            </p>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-tint text-[10px] font-bold text-ford-blue border border-green-02/30">
                <MapPin className="w-2.5 h-2.5 text-light-sea-green" />
                <span>Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. KARTU ANAK MBG (CLEAN & COMPACT) ═══ */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">👧</span>
            <div>
              <h4 className="text-[12.5px] font-black text-ford-blue">Aisyah Putri Ramadhani</h4>
              <p className="text-[10px] text-blue-gray">SD Negeri 1 Kebomas • Kelas 4B</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-green-tint text-ford-blue text-[10px] font-black border border-green-02/30">
            22/22 Porsi
          </span>
        </div>
      </div>

      {/* ═══ 3. GROUPED LIST MENU (IOS SETTINGS STYLE) ═══ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {/* Menu 1: Skrining Gizi */}
        <button
          type="button"
          onClick={() => setActiveTab("screening")}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-tint flex items-center justify-center text-light-sea-green">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-ford-blue block">Riwayat Skrining AI</span>
              <span className="text-[10px] text-blue-gray block">Status gizi &amp; biometrik anak</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>

        {/* Menu 2: Pengaduan MBG */}
        <button
          type="button"
          onClick={() => setActiveTab("complaint")}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-brand-orange">
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-ford-blue block">Pusat Aduan MBG</span>
              <span className="text-[10px] text-blue-gray block">Laporkan porsi / kualitas menu</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>

        {/* Menu 3: K-Bot AI */}
        <button
          type="button"
          onClick={() => setActiveTab("ai_chat")}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-ford-blue block">Konsultasi Nutrisi AI</span>
              <span className="text-[10px] text-blue-gray block">Tanya K-Bot seputar menu sehat</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>

        {/* Menu 4: Puskesmas Pembina */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-ford-blue">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-ford-blue block">Puskesmas Kebomas</span>
              <span className="text-[10px] text-blue-gray block">dr. Fitri Nuraini, Sp.GK (Posyandu Tgl 15)</span>
            </div>
          </div>
          <span className="text-[9.5px] font-bold text-light-sea-green bg-green-tint px-2 py-0.5 rounded-md">
            Pembina
          </span>
        </div>
      </div>

      {/* ═══ 4. CLEAN LOGOUT BUTTON ═══ */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-brand-red/20 text-brand-red text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
};
