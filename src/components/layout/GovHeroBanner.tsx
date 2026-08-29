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
    <section className="rounded-3xl bg-gradient-to-r from-[#071e49] via-[#0d2a63] to-[#163f8c] p-6 sm:p-8 text-white shadow-card border border-[#0d2a63]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d1b06c]/20 border border-[#d1b06c]/40 text-[#d1b06c] text-[12px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#d1b06c]" />
            Integrasi Multimodal AI & Computer Vision
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-black tracking-tight text-white">
            Solusi Digital Cerdas Pelayanan Publik {SITE_CONFIG.regency}
          </h2>
          <p className="text-[13px] text-[#b5e0ea] leading-relaxed">
            Menghubungkan data kesehatan Puskesmas, harga riil pasar komoditas ikan/sayur, dan kecerdasan Google Gemini untuk mewujudkan generasi emas Gresik tanpa stunting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenScreening}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#f0f9fb] text-[#071e49] font-bold text-[12px] shadow-sm transition-all"
          >
            <ScanLine className="w-4 h-4 text-[#196375]" />
            <span>Simulasi Screening Anak</span>
          </button>

          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#92d05d] hover:bg-[#71aa42] text-[#071e49] font-black text-[12px] shadow-sm transition-all"
          >
            <Bot className="w-4 h-4 text-[#071e49]" />
            <span>Tanya Asisten AI Gizi</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#071e49]" />
          </button>
        </div>
      </div>
    </section>
  );
};
