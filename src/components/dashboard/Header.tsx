"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Download, 
  Bot, 
  ScanLine, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { SITE_CONFIG } from "@/config/site.config";

interface HeaderProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
  onOpenChat: () => void;
  onOpenScreening: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onOpenChat,
  onOpenScreening,
  onOpenExport,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3.5 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f68a22] to-[#f79638] shadow-sm text-white font-extrabold text-lg tracking-wider">
              <span>G</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a73e8] ring-2 ring-white"></span>
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-extrabold text-[#222222] tracking-tight">
                  GScan <span className="text-[#f68a22] font-bold">AI</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ffe6c1] text-[#b56114] border border-[#fde2bb]">
                  <ShieldCheck className="w-3 h-3 text-[#f68a22]" />
                  {SITE_CONFIG.regency}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f0f6ff] text-[#1a73e8] border border-[#d1e3fa]">
                  <Sparkles className="w-3 h-3 text-[#1a73e8]" />
                  MBG 2026
                </span>
              </div>
              <p className="text-[12px] text-[#64748b] font-medium">
                {SITE_CONFIG.fullName} • Optimalisasi Pangan & Stunting
              </p>
            </div>
          </div>

          {/* District & Period Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* District Selector */}
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#f68a22]" />
              </div>
              <select
                value={selectedDistrict}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-8 py-1.5 text-[13px] font-semibold text-[#222222] bg-[#f8fafc] hover:bg-slate-100 border border-[#e2e8f0] hover:border-[#cdcdd5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f68a22]/30 focus:border-[#f68a22] transition-all appearance-none cursor-pointer"
              >
                <option value="all">📍 Seluruh Kab. Gresik (18 Kec)</option>
                <optgroup label="18 Kecamatan se-Gresik">
                  {GRESIK_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      Kec. {d.name} ({d.stuntingRate}%)
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Date Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[12px] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#a5b0b7]" />
              <span>{currentDateTime || "Maret 2026"}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <button
                onClick={onOpenScreening}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#222222] bg-white hover:bg-slate-50 border border-[#e2e8f0] hover:border-[#cdcdd5] rounded-xl shadow-xs transition-all"
                title="Simulasi Screening Tumbuh Kembang"
              >
                <ScanLine className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span className="hidden sm:inline">Uji Screening</span>
              </button>

              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-[#b56114] bg-[#ffe6c1]/60 hover:bg-[#ffe6c1] border border-[#fde2bb] rounded-xl transition-all"
                title="Asisten Konsultasi Gizi AI"
              >
                <Bot className="w-3.5 h-3.5 text-[#f68a22]" />
                <span>AI Gizi</span>
              </button>

              <button
                onClick={onOpenExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#222222] hover:bg-[#111111] rounded-xl shadow-xs transition-all"
                title="Cetak & Export Laporan MBG Pemkab"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Laporan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
