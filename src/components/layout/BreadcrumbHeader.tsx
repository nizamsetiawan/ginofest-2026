"use client";

import React from "react";
import { Plus, Printer, ChevronRight, Download } from "lucide-react";

interface BreadcrumbHeaderProps {
  title: string;
  category: string;
  onGenerateAI: () => void;
  onPrintReport: () => void;
}

export const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({
  title,
  category,
  onGenerateAI,
  onPrintReport,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
      {/* Breadcrumbs & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-[#64748b] mb-1">
          <span>Home</span>
          <ChevronRight className="w-3 h-3 text-[#cbd5e1]" />
          <span>{category}</span>
          <ChevronRight className="w-3 h-3 text-[#cbd5e1]" />
          <span className="font-semibold text-[#071e49]">{title}</span>
        </div>
        <h1 className="text-[20px] font-black text-[#071e49] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGenerateAI}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-white bg-[#071e49] hover:bg-[#0d2a63] rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 text-[#92d05d]" />
          <span>Susun Menu Baru</span>
        </button>

        <button
          onClick={onPrintReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold text-[#071e49] bg-white hover:bg-[#f0f9fb] border border-[#d1b06c] rounded-xl shadow-xs transition-all"
        >
          <Printer className="w-4 h-4 text-[#d1b06c]" />
          <span>Cetak Laporan</span>
        </button>
      </div>
    </div>
  );
};
