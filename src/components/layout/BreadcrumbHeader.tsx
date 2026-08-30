"use client";

import React from "react";
import { Plus, Printer, ChevronRight } from "lucide-react";

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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-200 font-sans">
      {/* Breadcrumbs & Title */}
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-blue-gray mb-1">
          <span>Home</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span>{category}</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="font-bold text-ford-blue">{title}</span>
        </div>
        <h1 className="text-[22px] font-bold text-ford-blue tracking-tight">
          {title}
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGenerateAI}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-ford-blue bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-ford-blue" />
          <span>Susun Menu Baru</span>
        </button>

        <button
          onClick={onPrintReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold text-ford-blue bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-light-sea-green" />
          <span>Cetak Laporan</span>
        </button>
      </div>
    </div>
  );
};
