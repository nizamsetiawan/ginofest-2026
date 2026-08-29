"use client";

import React, { useState } from "react";
import { 
  Scan, 
  Sparkles, 
  MapPin, 
  QrCode, 
  Bell, 
  HelpCircle, 
  Settings, 
  Search,
  Database
} from "lucide-react";
import { AdminProfile } from "@/data/admin-profiles";

export type NavKey = "scan" | "generate" | "rag_db" | "map" | "qrcode" | "notifications" | "help" | "settings";

interface NuSantapSidebarProps {
  activeNav: NavKey;
  setActiveNav: (nav: NavKey) => void;
  currentAdmin: AdminProfile;
  unreadNotifCount?: number;
}

export const NuSantapSidebar: React.FC<NuSantapSidebarProps> = ({
  activeNav,
  setActiveNav,
  currentAdmin,
  unreadNotifCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const isBottomActive = (key: NavKey) => activeNav === key;

  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] h-screen flex flex-col justify-between p-4 select-none shrink-0 sticky top-0">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Brand Logo in Blue & White */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-black text-sm shadow-xs">
            G
          </div>
          <span className="text-[18px] font-black text-[#071e49] tracking-tight">
            GScan
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari menu"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-[13px] bg-white border border-[#e2e8f0] rounded-xl placeholder:text-[#94a3b8] text-[#071e49] focus:outline-none focus:border-[#1a73e8] transition-all"
          />
          <Search className="w-4 h-4 text-[#94a3b8] absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Main Navigation Menu in White & Blue */}
        <nav className="space-y-1 pt-1">
          {/* 1. Hasil Scan */}
          <button
            onClick={() => setActiveNav("scan")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeNav === "scan"
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "text-[#475569] hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Hasil Scan</span>
          </button>

          {/* 2. Generate Menu */}
          <button
            onClick={() => setActiveNav("generate")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeNav === "generate"
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "text-[#475569] hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Menu</span>
          </button>

          {/* 3. Basis Data RAG */}
          <button
            onClick={() => setActiveNav("rag_db")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeNav === "rag_db"
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "text-[#475569] hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Basis Data RAG</span>
          </button>

          {/* 4. Peta Prevalensi */}
          <button
            onClick={() => setActiveNav("map")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeNav === "map"
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "text-[#475569] hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Peta Prevalensi</span>
          </button>

          {/* 5. Scan QR Code */}
          <button
            onClick={() => setActiveNav("qrcode")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              activeNav === "qrcode"
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "text-[#475569] hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
        <div className="space-y-1 text-[13px] text-[#475569]">
          <button 
            onClick={() => setActiveNav("notifications")}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all font-medium cursor-pointer ${
              isBottomActive("notifications")
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`w-4 h-4 ${isBottomActive("notifications") ? "text-[#1a73e8]" : "text-[#64748b]"}`} />
              <span>Notifikasi</span>
            </div>
            {unreadNotifCount > 0 && <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>}
          </button>

          <button 
            onClick={() => setActiveNav("help")}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all font-medium cursor-pointer ${
              isBottomActive("help")
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${isBottomActive("help") ? "text-[#1a73e8]" : "text-[#64748b]"}`} />
            <span>Bantuan</span>
          </button>

          <button 
            onClick={() => setActiveNav("settings")}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all font-medium cursor-pointer ${
              isBottomActive("settings")
                ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                : "hover:bg-slate-50 hover:text-[#1a73e8]"
            }`}
          >
            <Settings className={`w-4 h-4 ${isBottomActive("settings") ? "text-[#1a73e8]" : "text-[#64748b]"}`} />
            <span>Pengaturan</span>
          </button>
        </div>

        {/* User Info Bar */}
        <button 
          onClick={() => setActiveNav("settings")}
          className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/30 transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white font-black text-[12px] flex items-center justify-center shadow-xs">
              {currentAdmin.initials}
            </div>
          </div>

          <div className="flex-1 overflow-hidden truncate">
            <h4 className="text-[12px] font-bold text-[#071e49] truncate group-hover:text-[#1a73e8] transition-colors">
              {currentAdmin.name} <span className="font-semibold text-[#64748b]">({currentAdmin.regionLabel})</span>
            </h4>
            <p className="text-[10px] text-[#64748b] truncate mt-0.5">
              {currentAdmin.email}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};
