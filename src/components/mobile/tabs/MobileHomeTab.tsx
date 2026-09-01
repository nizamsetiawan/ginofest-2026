"use client";

import React from "react";
import { ChevronRight, Search, Bell } from "lucide-react";
import { Page } from "konsta/react";
import { CitizenUser, AtmosphereState, MobileTab } from "../types";

interface MobileHomeTabProps {
  citizenUser: CitizenUser | null;
  atmosphere: AtmosphereState;
  setActiveTab: (tab: MobileTab) => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  citizenUser,
}) => {
  const userName = citizenUser?.name || "Muhammad Nizam Setiawan";
  const userDistrict = citizenUser?.district || "Menganti";

  return (
    <Page className="p-4 space-y-4 font-sans select-none bg-[#F8FAFC] min-h-full">
      {/* ═══ 1. TOP HEADER: ENTITY BARIS 1 ═══ */}
      <div className="flex items-center justify-between pt-1 px-0.5">
        <button
          type="button"
          onClick={() => alert("Wilayah Kerja: Dinas Kesehatan & Satgas MBG Kabupaten Gresik")}
          className="flex items-center gap-1.5 text-[13.5px] font-bold text-ford-blue hover:text-light-sea-green transition-colors cursor-pointer min-w-0"
        >
          <span className="truncate">Kabupaten Gresik • MBG Gizi</span>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => alert("Fitur Pencarian: Cari data gizi dan layanan...")}
          className="p-1.5 rounded-full hover:bg-slate-200/60 text-ford-blue transition-colors cursor-pointer"
          title="Pencarian"
        >
          <Search className="w-4.5 h-4.5 text-ford-blue" />
        </button>
      </div>

      {/* ═══ 2. USER PROFILE BARIS 2 ═══ */}
      <div className="flex items-center justify-between px-0.5 pt-0.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-green-02 to-light-sea-green text-ford-blue flex items-center justify-center font-black text-sm shadow-xs shrink-0 border border-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-[14px] font-black text-ford-blue truncate leading-tight">
              {userName}
            </h2>
            <p className="text-[11.5px] text-blue-gray truncate font-medium">
              Orang Tua Siswa • Kec. {userDistrict}
            </p>
          </div>
        </div>

        {/* Clean Bell Notification */}
        <button
          type="button"
          onClick={() => alert("Pemberitahuan aktif.")}
          className="w-8.5 h-8.5 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-ford-blue hover:bg-slate-50 transition-all cursor-pointer relative shrink-0"
        >
          <Bell className="w-4 h-4 text-ford-blue" />
          <span className="w-2 h-2 rounded-full bg-brand-orange absolute top-1.5 right-1.5 border border-white" />
        </button>
      </div>
    </Page>
  );
};
