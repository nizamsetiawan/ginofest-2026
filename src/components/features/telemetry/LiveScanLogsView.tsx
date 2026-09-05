"use client";

import React from "react";
import { Terminal, ExternalLink } from "lucide-react";

export const LiveScanLogsView: React.FC = () => {
  const handleOpenConsole = () => {
    window.open("/pemerintah/console", "_blank");
  };

  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0FA89B] border border-teal-200/80 flex items-center justify-center mx-auto shadow-2xs">
          <Terminal className="w-7 h-7 text-[#0FA89B] animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-ford-blue tracking-tight">
            Kcal Realtime AI Log Console
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman console terminal IDE berjalan secara independen di tab baru browser (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-ford-blue font-mono font-bold text-[11px]">/pemerintah/console</code>).
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleOpenConsole}
            className="w-full py-3 px-5 rounded-2xl bg-[#0FA89B] hover:bg-[#0d9388] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Ulang Full Console (Tab Baru) ↗</span>
          </button>
        </div>
      </div>
    </div>
  );
};
