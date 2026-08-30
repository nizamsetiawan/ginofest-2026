"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { GresikVectorMap } from "./GresikVectorMap";
import { 
  Map, 
  Grid, 
  MapPin, 
  Sparkles, 
  Fish, 
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

const GresikLeafletMap = dynamic(
  () => import("./GresikLeafletMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] bg-[#f8fafc] animate-pulse rounded-2xl flex flex-col items-center justify-center gap-2 text-[#a5b0b7]">
        <Map className="w-8 h-8 text-[#cdcdd5] animate-bounce" />
        <span className="text-[13px] font-medium">Memuat Peta Spasial GIS Gresik...</span>
      </div>
    )
  }
);

interface GresikMapProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
}

export const GresikMap: React.FC<GresikMapProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [viewMode, setViewMode] = useState<"gis" | "grid">("gis");

  const currentDistrict = GRESIK_DISTRICTS.find((d) => d.id === selectedDistrict);

  return (
    <div className="app-card p-5 shadow-subtle">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-[#e2e8f0] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#fff8f0] text-[#f68a22] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-bold text-[#222222]">
              Pemetaan Spasial Stunting & MBG 18 Kecamatan
            </h2>
          </div>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Analisis sebaran risiko gizi dan utilisasi komoditas pangan lokal Kabupaten Gresik
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] text-[12px] font-semibold">
          <button
            onClick={() => setViewMode("gis")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === "gis"
                ? "bg-white text-[#222222] shadow-xs"
                : "text-[#64748b] hover:text-[#222222]"
            }`}
          >
            <Map className="w-3.5 h-3.5 text-light-sea-green" />
            <span>Peta GIS Satelit</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-white text-[#222222] shadow-xs"
                : "text-[#64748b] hover:text-[#222222]"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#f68a22]" />
            <span>Matriks Wilayah</span>
          </button>
        </div>
      </div>

      {/* Main Map Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map View (8 cols) */}
        <div className="lg:col-span-8">
          {viewMode === "gis" ? (
            <GresikLeafletMap
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
            />
          ) : (
            <GresikVectorMap
              selectedDistrict={selectedDistrict}
              onSelectDistrict={onSelectDistrict}
            />
          )}
        </div>

        {/* District Detail Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-4">
          {currentDistrict ? (
            <div className="space-y-4">
              {/* Header District */}
              <div className="flex items-start justify-between pb-3 border-b border-[#e2e8f0]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#b56114]">
                    Wilayah Terpilih
                  </span>
                  <h3 className="text-[17px] font-black text-[#222222]">
                    Kec. {currentDistrict.name}
                  </h3>
                  <p className="text-[12px] text-[#64748b]">Kabupaten Gresik</p>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                  currentDistrict.riskLevel === "Tinggi"
                    ? "bg-[#fce0db] text-[#b63422]"
                    : currentDistrict.riskLevel === "Sedang"
                    ? "bg-[#ffeecc] text-[#b56114]"
                    : "bg-[#d5f0db] text-[#1e7d36]"
                }`}>
                  Risiko {currentDistrict.riskLevel}
                </span>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#a5b0b7] block">Prevalensi Stunting</span>
                  <span className="text-[15px] font-extrabold text-[#222222]">
                    {currentDistrict.stuntingRate}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#a5b0b7] block">Cakupan MBG</span>
                  <span className="text-[15px] font-extrabold text-green-02">
                    {currentDistrict.coverageMBG}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#a5b0b7] block">Target Anak/Siswa</span>
                  <span className="text-[15px] font-extrabold text-[#222222]">
                    {formatNumber(currentDistrict.targetChildren)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#a5b0b7] block">Fasilitas Sekolah</span>
                  <span className="text-[15px] font-extrabold text-[#222222]">
                    {currentDistrict.schoolsCount} Unit
                  </span>
                </div>
              </div>

              {/* Local Commodity Recommendation */}
              <div className="p-3 rounded-xl bg-[#f0f6ff] border border-[#d1e3fa]">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-light-sea-green mb-1">
                  <Fish className="w-3.5 h-3.5 text-light-sea-green" />
                  <span>Potensi Pangan Unggulan Daerah</span>
                </div>
                <p className="text-[13px] font-semibold text-[#222222]">
                  {currentDistrict.localCommodity}
                </p>
                <div className="mt-2 pt-2 border-t border-[#d1e3fa]/60 flex items-center justify-between text-[11px] text-light-sea-green">
                  <span>Fokus Nutrisi:</span>
                  <strong className="font-semibold text-[#222222]">{currentDistrict.deficiencyFocus}</strong>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectDistrict("all")}
                className="w-full py-2 px-3 text-[12px] font-semibold text-[#222222] bg-white hover:bg-slate-100 border border-[#e2e8f0] rounded-xl transition-colors"
              >
                ← Tampilkan Semua Kecamatan
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-[13px]">
              <div className="pb-3 border-b border-[#e2e8f0]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#b56114]">
                  Ringkasan Spasial
                </span>
                <h3 className="text-[17px] font-black text-[#222222]">
                  18 Kecamatan Kab. Gresik
                </h3>
                <p className="text-[12px] text-[#64748b]">Seluruh Wilayah Daratan & Bawean</p>
              </div>

              <div className="space-y-2 text-[12px] text-[#64748b]">
                <div className="p-3 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-between">
                  <span>Total Sekolah / MI Terlayani:</span>
                  <strong className="font-bold text-[#222222]">728 Sekolah</strong>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-between">
                  <span>Total Posyandu Terintegrasi:</span>
                  <strong className="font-bold text-[#222222]">1.034 Pos</strong>
                </div>
                <div className="p-3 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-between">
                  <span>Kecamatan Risiko Tinggi:</span>
                  <span className="font-bold text-[#b63422] bg-[#fce0db] px-2 py-0.5 rounded-md border border-[#fce0db]">
                    6 Wilayah
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#fff8f0] border border-[#ffe6c1] text-[12px] text-[#773e0e]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#f68a22]" />
                  <span>Prioritas Intervensi Khusus</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#924c10]">
                  Kec. Sangkapura & Tambak (Pulau Bawean) serta Kec. Balongpanggang & Benjeng mendapat alokasi menu tinggi Ikan Tongkol, Kupang Sidayu, dan Sayur Kelor untuk mempercepat penurunan stunting.
                </p>
              </div>

              <p className="text-[11px] text-[#a5b0b7] italic text-center">
                💡 Klik titik marker pada peta untuk melihat data detail kecamatan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
