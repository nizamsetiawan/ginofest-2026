"use client";

import React from "react";
import { Sparkles, ScanLine, Bot, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/config/site.config";

interface GovHeroBannerProps {
  onOpenScreening: () => void;
  onOpenChat: () => void;
}

export const GovHeroBanner: React.FC<GovHeroBannerProps> = ({
  onOpenScreening,
  onOpenChat,
}) => {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-[#131C38] via-[#1E2950] to-[#2C3968] p-6 sm:p-8 text-white shadow-xl border border-ford-blue/60 font-sans relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-green-02/15 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-light-sea-green/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-02/20 border border-green-02/40 text-green-02 text-[12px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-green-02" />
            <span>Integrasi Multimodal AI & Computer Vision</span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-white">
            Solusi Digital Cerdas Pelayanan Publik {SITE_CONFIG.regency}
          </h2>
          <p className="text-[13px] text-blue-100/90 leading-relaxed font-normal">
            Menghubungkan data kesehatan Puskesmas, harga riil pasar komoditas ikan/sayur, dan kecerdasan Google Gemini untuk mewujudkan generasi emas Gresik tanpa stunting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenScreening}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-ford-blue font-bold text-[12px] shadow-sm transition-all cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-light-sea-green" />
            <span>Simulasi Screening Anak</span>
          </button>

          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12px] shadow-sm transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-ford-blue" />
            <span>Tanya Asisten AI Gizi</span>
            <ArrowRight className="w-3.5 h-3.5 text-ford-blue" />
          </button>
        </div>
      </div>
    </section>
  );
};
