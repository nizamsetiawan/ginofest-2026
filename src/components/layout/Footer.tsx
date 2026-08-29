"use client";

import React from "react";
import { SITE_CONFIG } from "@/config/site.config";

interface FooterProps {
  onOpenExport: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenExport }) => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-800">{SITE_CONFIG.appName}</span>
          <span>•</span>
          <span>{SITE_CONFIG.fullName} © {SITE_CONFIG.year}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Inovasi Digital {SITE_CONFIG.regency}</span>
          <span>•</span>
          <span>Didukung Google Gemini & Multimodal CV</span>
          <span>•</span>
          <button
            onClick={onOpenExport}
            className="text-emerald-600 font-semibold hover:underline"
          >
            Cetak Dokumen
          </button>
        </div>
      </div>
    </footer>
  );
};
