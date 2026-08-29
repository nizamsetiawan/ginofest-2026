"use client";

import React, { useState } from "react";
import { Info, X, ChevronRight } from "lucide-react";

interface AlertBannerProps {
  onActionClick: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onActionClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[#b5e0ea]/40 border border-[#b5e0ea] text-[13px] text-[#071e49]">
      <div className="flex items-center gap-2.5">
        <Info className="w-4 h-4 text-[#071e49] shrink-0" />
        <span>
          <strong>Informasi Wilayah:</strong> 6 Kecamatan tercatat memiliki prevalensi stunting di atas rata-rata kabupaten dan diprioritaskan untuk pemenuhan gizi protein hewani lokal.
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onActionClick}
          className="font-bold text-[#071e49] hover:underline text-[12px] transition-colors flex items-center gap-1"
        >
          <span>Lihat Menu Terkait</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-md text-[#071e49]/70 hover:text-[#071e49] hover:bg-[#b5e0ea]/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
