"use client";

import React from "react";
import { GRESIK_DISTRICTS, DistrictData } from "@/data/gresik-districts";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface GresikVectorMapProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
}

export const GresikVectorMap: React.FC<GresikVectorMapProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const northDistricts = GRESIK_DISTRICTS.filter((d) =>
    ["panceng", "ujungpangkah", "sidayu", "dukun", "bungah"].includes(d.id)
  );
  const centralDistricts = GRESIK_DISTRICTS.filter((d) =>
    ["manyar", "gresik", "kebomas", "duduksampeyan", "cerme"].includes(d.id)
  );
  const southDistricts = GRESIK_DISTRICTS.filter((d) =>
    ["benjeng", "balongpanggang", "menganti", "kedamean", "wringinanom", "driyorejo"].includes(d.id)
  );
  const baweanDistricts = GRESIK_DISTRICTS.filter((d) =>
    ["sangkapura", "tambak"].includes(d.id)
  );

  return (
    <div className="w-full space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] py-2 px-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
        <span className="font-semibold text-[#222222]">Tingkat Risiko Stunting:</span>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 font-medium text-[#1e7d36]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2bb34d]"></span> Rendah (&lt;10%)
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-[#b56114]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f68a22]"></span> Waspada (10-14%)
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-[#b63422]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0624d]"></span> Prioritas/Tinggi (&gt;14%)
          </span>
        </div>
      </div>

      {/* Grid of Districts by Geographical Zones */}
      <div className="space-y-3">
        {/* ZONA 1: KEPULAUAN BAWEAN */}
        <div className="p-3 rounded-xl bg-[#f0f6ff]/50 border border-[#d1e3fa]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#1a73e8] uppercase tracking-wider">
              🌊 Zona Kepulauan Bawean (Terluar)
            </span>
            <span className="text-[11px] text-[#1a73e8] font-medium">2 Kecamatan</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {baweanDistricts.map((d) => (
              <DistrictButton
                key={d.id}
                district={d}
                isSelected={selectedDistrict === d.id}
                onSelect={() => onSelectDistrict(d.id)}
              />
            ))}
          </div>
        </div>

        {/* ZONA 2: GRESIK UTARA */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              🌾 Zona Gresik Utara (Pesisir & Tambak)
            </span>
            <span className="text-[11px] text-[#64748b] font-medium">5 Kecamatan</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {northDistricts.map((d) => (
              <DistrictButton
                key={d.id}
                district={d}
                isSelected={selectedDistrict === d.id}
                onSelect={() => onSelectDistrict(d.id)}
              />
            ))}
          </div>
        </div>

        {/* ZONA 3: GRESIK TENGAH */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              🏢 Zona Gresik Tengah & Pusat Kota
            </span>
            <span className="text-[11px] text-[#64748b] font-medium">5 Kecamatan</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {centralDistricts.map((d) => (
              <DistrictButton
                key={d.id}
                district={d}
                isSelected={selectedDistrict === d.id}
                onSelect={() => onSelectDistrict(d.id)}
              />
            ))}
          </div>
        </div>

        {/* ZONA 4: GRESIK SELATAN */}
        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              🚜 Zona Gresik Selatan (Pertanian & Penyangga)
            </span>
            <span className="text-[11px] text-[#64748b] font-medium">6 Kecamatan</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {southDistricts.map((d) => (
              <DistrictButton
                key={d.id}
                district={d}
                isSelected={selectedDistrict === d.id}
                onSelect={() => onSelectDistrict(d.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DistrictButton: React.FC<{
  district: DistrictData;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ district, isSelected, onSelect }) => {
  const getBadge = () => {
    if (district.riskLevel === "Tinggi") {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#b63422] bg-[#fce0db] px-1.5 py-0.5 rounded">
          <AlertTriangle className="w-2.5 h-2.5 text-[#f0624d]" />
          {district.stuntingRate}%
        </span>
      );
    }
    if (district.riskLevel === "Sedang") {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#b56114] bg-[#ffeecc] px-1.5 py-0.5 rounded">
          {district.stuntingRate}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#1e7d36] bg-[#d5f0db] px-1.5 py-0.5 rounded">
        <CheckCircle className="w-2.5 h-2.5 text-[#2bb34d]" />
        {district.stuntingRate}%
      </span>
    );
  };

  return (
    <button
      onClick={onSelect}
      type="button"
      className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group ${
        isSelected
          ? "bg-[#222222] text-white border-[#222222] shadow-xs ring-2 ring-[#f68a22]/50"
          : "bg-white hover:bg-slate-50 border-[#e2e8f0] hover:border-[#cdcdd5]"
      }`}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <span className={`text-[12px] font-bold truncate ${isSelected ? "text-white" : "text-[#222222] group-hover:text-[#f68a22]"}`}>
          {district.name}
        </span>
        {getBadge()}
      </div>

      <div className="text-[10px] text-[#64748b] truncate w-full flex items-center justify-between">
        <span className={isSelected ? "text-slate-300" : "text-[#64748b]"}>
          MBG: {district.coverageMBG}%
        </span>
        <span className={`font-semibold ${isSelected ? "text-[#f8a44b]" : "text-[#222222]"}`}>
          {district.targetChildren.toLocaleString("id-ID")}
        </span>
      </div>
    </button>
  );
};
