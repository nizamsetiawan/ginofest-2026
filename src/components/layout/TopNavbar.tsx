"use client";

import React from "react";
import { 
  Building2, 
  Search, 
  Bell, 
  Grid, 
  ChevronDown, 
  MessageSquareHeart
} from "lucide-react";

interface TopNavbarProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  onOpenChat: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeModule,
  setActiveModule,
  onOpenChat,
}) => {
  return (
    <header className="w-full bg-[#071e49] text-white select-none sticky top-0 z-50 shadow-md border-b border-[#0d2a63]">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Brand Logo & GreatDay Module Dropdowns */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d1b06c] to-[#92d05d] text-[#071e49] font-black text-sm tracking-wider">
              G
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-[16px] text-white tracking-tight">GScan</span>
              <span className="text-[#92d05d] font-bold text-[12px]">MBG</span>
            </div>
          </div>

          {/* GreatDay Top Module Navigation (Core, Operasional, Logistik, Laporan) */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-slate-200">
            <button 
              onClick={() => setActiveModule("core")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:text-white transition-colors ${
                activeModule === "core" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Data Wilayah & Siswa</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b5e0ea]" />
            </button>

            <button 
              onClick={() => setActiveModule("operational")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:text-white transition-colors ${
                activeModule === "operational" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Operasional MBG</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b5e0ea]" />
            </button>

            <button 
              onClick={() => setActiveModule("logistics")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:text-white transition-colors ${
                activeModule === "logistics" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Komoditas & Pasar</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b5e0ea]" />
            </button>

            <button 
              onClick={() => setActiveModule("reports")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md hover:text-white transition-colors ${
                activeModule === "reports" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Laporan & Evaluasi</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b5e0ea]" />
            </button>
          </nav>
        </div>

        {/* Right: Organization Badge, Search Ctrl+/, Chat, Notification, Avatar */}
        <div className="flex items-center gap-3">
          {/* Org Badge in Amber Gold */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#d1b06c]/20 text-[#d1b06c] border border-[#d1b06c]/40 text-[12px] font-bold">
            <Building2 className="w-3.5 h-3.5 text-[#d1b06c]" />
            <span>Pemkab Gresik - Dinkes</span>
          </div>

          {/* Search bar with Ctrl+/ shortcut */}
          <div className="relative hidden xl:block">
            <Search className="w-3.5 h-3.5 text-[#b5e0ea]/70 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-12 py-1 text-[12px] bg-[#0d2a63] text-white placeholder:text-slate-300 border border-[#163f8c] rounded-md focus:outline-none focus:border-[#92d05d] w-44"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 bg-[#163f8c] px-1 rounded">
              Ctrl+/
            </span>
          </div>

          {/* Quick Consultation */}
          <button 
            onClick={onOpenChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#92d05d] hover:bg-[#71aa42] text-[#071e49] text-[12px] font-bold shadow-xs transition-colors"
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Konsultasi</span>
          </button>

          {/* Notification Bell */}
          <button className="relative p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#92d05d]"></span>
          </button>

          {/* Grid icon */}
          <button className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-md transition-colors hidden sm:block">
            <Grid className="w-4 h-4" />
          </button>

          {/* User Avatar Circle */}
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#d1b06c] text-[#071e49] font-black text-[12px] ring-2 ring-white/30 cursor-pointer">
            G
          </div>
        </div>
      </div>
    </header>
  );
};
