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
    <header className="w-full bg-ford-blue text-white select-none sticky top-0 z-50 shadow-md border-b border-ford-blue/80 font-sans">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Brand Logo & GreatDay Module Dropdowns */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="/logo_app.svg"
              alt="Kcal Logo"
              className="w-8 h-8 rounded-xl"
            />
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-[16px] text-white tracking-tight">Kcal</span>
              <span className="text-green-02 font-bold text-[12px]">MBG</span>
            </div>
          </div>

          {/* Top Module Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium text-slate-200">
            <button 
              onClick={() => setActiveModule("core")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-white transition-colors ${
                activeModule === "core" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Data Wilayah & Siswa</span>
              <ChevronDown className="w-3.5 h-3.5 text-green-02" />
            </button>

            <button 
              onClick={() => setActiveModule("operational")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-white transition-colors ${
                activeModule === "operational" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Operasional MBG</span>
              <ChevronDown className="w-3.5 h-3.5 text-green-02" />
            </button>

            <button 
              onClick={() => setActiveModule("logistics")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-white transition-colors ${
                activeModule === "logistics" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Komoditas & Pasar</span>
              <ChevronDown className="w-3.5 h-3.5 text-green-02" />
            </button>

            <button 
              onClick={() => setActiveModule("reports")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg hover:text-white transition-colors ${
                activeModule === "reports" ? "text-white font-bold bg-white/15" : ""
              }`}
            >
              <span>Laporan & Evaluasi</span>
              <ChevronDown className="w-3.5 h-3.5 text-green-02" />
            </button>
          </nav>
        </div>

        {/* Right: Organization Badge, Search Ctrl+/, Chat, Notification, Avatar */}
        <div className="flex items-center gap-3">
          {/* Org Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-02/20 text-green-02 border border-green-02/40 text-[12px] font-bold">
            <Building2 className="w-3.5 h-3.5 text-green-02" />
            <span>Pemkab Gresik - Dinkes</span>
          </div>

          {/* Search bar with Ctrl+/ shortcut */}
          <div className="relative hidden xl:block">
            <Search className="w-3.5 h-3.5 text-blue-gray absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-12 py-1 text-[12px] bg-white/10 text-white placeholder:text-slate-300 border border-white/20 rounded-lg focus:outline-none focus:border-green-02 w-44"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 bg-white/15 px-1 rounded">
              Ctrl+/
            </span>
          </div>

          {/* Quick Consultation */}
          <button 
            onClick={onOpenChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-02 hover:bg-light-sea-green text-ford-blue text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Konsultasi AI</span>
          </button>

          {/* Notification Bell */}
          <button className="relative p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange"></span>
          </button>

          {/* Grid icon */}
          <button className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block cursor-pointer">
            <Grid className="w-4 h-4" />
          </button>

          {/* User Avatar Circle */}
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-light-sea-green text-ford-blue font-bold text-[12px] ring-2 ring-white/30 cursor-pointer">
            G
          </div>
        </div>
      </div>
    </header>

  );
};
