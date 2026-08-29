"use client";

import React from "react";
import { Download } from "lucide-react";

interface NuSantapHeaderProps {
  regionName?: string;
  onDownloadPDF: () => void;
}

export const NuSantapHeader: React.FC<NuSantapHeaderProps> = ({
  regionName = "Kabupaten Gresik",
  onDownloadPDF,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <p className="text-[14px] text-[#475569]">
          Selamat datang, Admin{" "}
          <strong className="text-[#1a73e8] font-black">{regionName}</strong> 👋
        </p>
      </div>

      <button
        onClick={onDownloadPDF}
        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-white bg-[#1a73e8] hover:bg-[#155fc0] rounded-xl shadow-xs transition-all shrink-0"
      >
        <Download className="w-4 h-4" />
        <span>Download PDF</span>
      </button>
    </div>
  );
};
