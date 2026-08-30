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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-1 font-sans">
      {/* Left: Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
        <div className="p-1.5 rounded-lg text-ford-blue bg-green-tint border border-green-02/30 shrink-0">
          <Filter className="w-3.5 h-3.5 text-light-sea-green" />
        </div>

        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeFilter === "all"
              ? "bg-ford-blue text-white shadow-xs"
              : "bg-slate-100 text-blue-gray hover:bg-slate-200 hover:text-ford-blue"
          }`}
        >
          Semua Wilayah (18)
        </button>

        <button
          onClick={() => setActiveFilter("high")}
          className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeFilter === "high"
              ? "bg-red-50 text-brand-red border border-brand-red/40 shadow-xs"
              : "bg-slate-100 text-blue-gray hover:bg-slate-200 hover:text-ford-blue"
          }`}
        >
          Prioritas Tinggi (6)
        </button>

        <button
          onClick={() => setActiveFilter("medium")}
          className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeFilter === "medium"
              ? "bg-amber-50 text-brand-orange border border-brand-orange/40 shadow-xs"
              : "bg-slate-100 text-blue-gray hover:bg-slate-200 hover:text-ford-blue"
          }`}
        >
          Sedang (8)
        </button>

        <button
          onClick={() => setActiveFilter("low")}
          className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeFilter === "low"
              ? "bg-green-tint text-ford-blue border border-green-02/40 shadow-xs"
              : "bg-slate-100 text-blue-gray hover:bg-slate-200 hover:text-ford-blue"
          }`}
        >
          Rendah (4)
        </button>

        <button
          onClick={() => setActiveFilter("bawean")}
          className={`px-3 py-1.5 text-[12px] font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            activeFilter === "bawean"
              ? "bg-blue-50 text-brand-blue border border-brand-blue/40 shadow-xs"
              : "bg-slate-100 text-blue-gray hover:bg-slate-200 hover:text-ford-blue"
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
          className="p-2 text-ford-blue hover:bg-green-tint rounded-xl transition-colors border border-slate-200 cursor-pointer"
        >
          <Download className="w-4 h-4 text-light-sea-green" />
        </button>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[12.5px] bg-[#F8FAFC] text-ford-blue placeholder:text-blue-gray/60 border border-slate-200 rounded-xl focus:outline-none focus:border-light-sea-green focus:bg-white w-48 font-medium transition-all"
          />
          <Search className="w-3.5 h-3.5 text-blue-gray absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};
