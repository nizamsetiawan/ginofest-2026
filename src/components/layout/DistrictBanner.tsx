"use client";

import React from "react";
import { DistrictData } from "@/types";

interface DistrictBannerProps {
  district?: DistrictData;
  onReset: () => void;
}

export const DistrictBanner: React.FC<DistrictBannerProps> = ({ district, onReset }) => {
  if (!district) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
          📍
        </div>
        <div className="text-xs">
          <span className="font-bold text-sm block sm:inline mr-2">
            Memfilter Data Wilayah: Kec. {district.name}
          </span>
          <span className="text-emerald-200">
            Prevalensi Stunting {district.stuntingRate}% • Komoditas Utama: {district.localCommodity}
          </span>
        </div>
      </div>
      <button
        onClick={onReset}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all self-start sm:self-auto shrink-0"
      >
        Reset ke Seluruh Gresik
      </button>
    </div>
  );
};
