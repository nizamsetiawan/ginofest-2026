"use client";

import React from "react";
import { Filter, Download, Grid, Search } from "lucide-react";

interface TableFilterControlsProps {
  activeFilter: "all" | "high" | "medium" | "low" | "bawean";
  setActiveFilter: (filter: "all" | "high" | "medium" | "low" | "bawean") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: () => void;
}

export const TableFilterControls: React.FC<TableFilterControlsProps> = ({
  activeFilter,
  setActiveFilter,
  searchTerm,
  setSearchTerm,
  onExport,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-1">
      {/* Left: Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
        <div className="p-1.5 rounded-lg text-[#071e49] bg-slate-100 shrink-0">
          <Filter className="w-3.5 h-3.5" />
        </div>

        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-all shrink-0 ${
            activeFilter === "all"
              ? "bg-[#071e49] text-white shadow-xs"
              : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
          }`}
        >
          Semua Wilayah (18)
        </button>

        <button
          onClick={() => setActiveFilter("high")}
          className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-all shrink-0 ${
            activeFilter === "high"
              ? "bg-[#fce0db] text-[#b63422] border border-[#fce0db]"
              : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
          }`}
        >
          Prioritas Tinggi (6)
        </button>

        <button
          onClick={() => setActiveFilter("medium")}
          className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-all shrink-0 ${
            activeFilter === "medium"
              ? "bg-[#f9f4ea] text-[#9c7f3e] border border-[#d1b06c]/40"
              : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
          }`}
        >
          Sedang (8)
        </button>

        <button
          onClick={() => setActiveFilter("low")}
          className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-all shrink-0 ${
            activeFilter === "low"
              ? "bg-[#eaf7e1] text-[#71aa42] border border-[#92d05d]/40"
              : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
          }`}
        >
          Rendah (4)
        </button>

        <button
          onClick={() => setActiveFilter("bawean")}
          className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-all shrink-0 ${
            activeFilter === "bawean"
              ? "bg-[#b5e0ea] text-[#071e49] border border-[#b5e0ea]"
              : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
          }`}
        >
          Bawean (2)
        </button>
      </div>

      {/* Right: Export & Search Bar */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onExport}
          title="Export Laporan"
          className="p-1.5 text-[#071e49] hover:bg-slate-100 rounded-lg transition-colors border border-[#e2e8f0]"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-[12px] bg-white text-[#071e49] border border-[#e2e8f0] hover:border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071e49]/20 focus:border-[#071e49] w-44 sm:w-52"
          />
          <Search className="w-3.5 h-3.5 text-[#a5b0b7] absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};
