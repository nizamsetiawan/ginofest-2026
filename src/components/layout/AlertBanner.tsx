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
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-green-tint border border-green-02/40 text-[13px] text-ford-blue font-sans shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-green-02/20 text-light-sea-green flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5 text-light-sea-green shrink-0" />
        </div>
        <span>
          <strong className="text-ford-blue font-bold">Informasi Wilayah:</strong> 6 Kecamatan tercatat memiliki prevalensi stunting di atas rata-rata kabupaten dan diprioritaskan untuk pemenuhan gizi protein hewani lokal.
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onActionClick}
          className="font-bold text-light-sea-green hover:text-ford-blue hover:underline text-[12px] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Lihat Menu Terkait</span>
          <ChevronRight className="w-3.5 h-3.5 text-light-sea-green" />
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-lg text-blue-gray hover:text-ford-blue hover:bg-green-02/20 transition-colors cursor-pointer"
          title="Tutup banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
