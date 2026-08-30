"use client";

import React, { useState } from "react";
import { OFFICIAL_GRESIK_DATA } from "@/data/gresik-official-stunting";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { GresikIsolatedMap } from "./GresikIsolatedMap";
import { ChevronDown, MapPin, Building2, Layers, X, Activity, HeartHandshake, GraduationCap } from "lucide-react";

interface PrevalenceMapViewProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
}

export const PrevalenceMapView: React.FC<PrevalenceMapViewProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [selectedProvince, setSelectedProvince] = useState("JAWA TIMUR");
  const [selectedRegency, setSelectedRegency] = useState(selectedDistrict || "all");
  const [selectedYearFilter, setSelectedYearFilter] = useState("(All)");
  const [metricMode, setMetricMode] = useState<"stunting" | "sembuh" | "lulus">("stunting");
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [isCardDismissed, setIsCardDismissed] = useState(false);

  const activeYearData = OFFICIAL_GRESIK_DATA["2026"];
  const previousYearData = OFFICIAL_GRESIK_DATA["2025"];

  // Active district id (only when hovered or specifically selected, NOT when 'all')
  const activeDistrictId = hoveredDistrictId || (selectedRegency !== "all" ? selectedRegency : null);
  const showPopupCard = Boolean(activeDistrictId) && !isCardDismissed;

  const currentDistrictInfo = activeDistrictId 
    ? GRESIK_DISTRICTS.find((d) => d.id === activeDistrictId) 
    : null;

  const activeDistrictRecord = currentDistrictInfo
    ? activeYearData.records.find((r) => r.kecamatan.toLowerCase() === currentDistrictInfo.name.toLowerCase())
    : null;

  const prevDistrictRecord = (currentDistrictInfo && activeDistrictRecord)
    ? previousYearData.records.find((r) => r.kecamatan.toLowerCase() === activeDistrictRecord.kecamatan.toLowerCase())
    : null;

  const handleDistrictChange = (distId: string) => {
    setSelectedRegency(distId);
    onSelectDistrict(distId);
    setIsCardDismissed(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Title */}
      <div className="pb-1">
        <h1 className="text-[26px] font-black text-[#2C3968] tracking-tight">
          Peta Prevalensi Stunting Kabupaten Gresik
        </h1>
      </div>

      {/* 2. Top Filter Controls & Metric Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 text-[12px]">
          {/* Provinsi */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
              Provinsi
            </label>
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="appearance-none bg-white border border-[#cbd5e1] rounded-lg px-3 py-1.5 pr-8 text-[12px] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] min-w-[130px]"
              >
                <option value="JAWA TIMUR">JAWA TIMUR</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Kabupaten/Kecamatan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
              Kabupaten/Kecamatan
            </label>
            <div className="relative">
              <select
                value={selectedRegency}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="appearance-none bg-white border border-[#cbd5e1] rounded-lg px-3 py-1.5 pr-8 text-[12px] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] min-w-[180px]"
              >
                <option value="all">(Semua Kecamatan)</option>
                {GRESIK_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    KEC. {d.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tahun Prioritas */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
              Tahun Prioritas
            </label>
            <div className="relative">
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="appearance-none bg-white border border-[#cbd5e1] rounded-lg px-3 py-1.5 pr-8 text-[12px] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] min-w-[120px]"
              >
                <option value="(All)">(All)</option>
                <option value="2026">2026 (Terkini)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Metric Layer Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200 self-start lg:self-end font-sans shadow-2xs">
          <button
            onClick={() => setMetricMode("stunting")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              metricMode === "stunting"
                ? "bg-red-50 text-brand-red border border-brand-red/30 shadow-xs"
                : "text-blue-gray hover:text-ford-blue hover:bg-white/60"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${metricMode === "stunting" ? "text-brand-red" : "text-blue-gray"}`} />
            <span>Balita Stunting</span>
          </button>

          <button
            onClick={() => setMetricMode("sembuh")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              metricMode === "sembuh"
                ? "bg-blue-50 text-ford-blue border border-ford-blue/30 shadow-xs"
                : "text-blue-gray hover:text-ford-blue hover:bg-white/60"
            }`}
          >
            <HeartHandshake className={`w-3.5 h-3.5 ${metricMode === "sembuh" ? "text-ford-blue" : "text-blue-gray"}`} />
            <span>Balita Sembuh</span>
          </button>

          <button
            onClick={() => setMetricMode("lulus")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              metricMode === "lulus"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
                : "text-blue-gray hover:text-ford-blue hover:bg-white/60"
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${metricMode === "lulus" ? "text-emerald-700" : "text-blue-gray"}`} />
            <span>Balita Lulus</span>
          </button>
        </div>
      </div>

      {/* 3. Subtitle Header */}
      <div className="text-center pt-1 font-sans">
        <h3 className="text-[15px] font-bold text-ford-blue">
          Peta Sebaran Kecamatan Prioritas{" "}
          <span className={`font-bold ${
            metricMode === "stunting" 
              ? "text-brand-red" 
              : metricMode === "sembuh" 
              ? "text-ford-blue" 
              : "text-emerald-600"
          }`}>
            {metricMode === "stunting" ? "Balita Stunting" : metricMode === "sembuh" ? "Balita Sembuh" : "Balita Lulus"}
          </span>
        </h3>
      </div>

      {/* 4. Interactive Thematic Map Area */}
      <div className="relative bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-xs">
        <GresikIsolatedMap
          selectedDistrict={selectedRegency}
          onSelectDistrict={handleDistrictChange}
          hoveredDistrictId={hoveredDistrictId}
          setHoveredDistrictId={(id) => {
            setHoveredDistrictId(id);
            if (id) setIsCardDismissed(false);
          }}
          metricMode={metricMode}
        />

        {/* 5. Floating Popup Card (Only when hovered or selected) */}
        {showPopupCard && activeDistrictRecord && (
          <div className="absolute bottom-16 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-[#e2e8f0] space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative text-center space-y-0.5">
              <button
                onClick={() => setIsCardDismissed(true)}
                className="absolute right-0 top-0 p-1 text-[#94a3b8] hover:text-[#2C3968] rounded-lg hover:bg-slate-100 transition-colors"
                title="Tutup Informasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold tracking-wider text-[#64748b] uppercase">
                KABUPATEN GRESIK
              </span>
              <h4 className="text-[16px] font-black text-[#2C3968] tracking-tight uppercase">
                KECAMATAN {activeDistrictRecord.kecamatan}
              </h4>
              <p className="text-[12px] font-bold text-ford-blue">
                Kecamatan Prioritas Tahun 2026
              </p>
              <p className="text-[10px] text-[#94a3b8]">
                Sumber data: Dinas Kesehatan Kab. Gresik
              </p>
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-[#cbd5e1]"></div>

            {/* Metrics per year */}
            <div className="space-y-1.5 text-[12px] text-[#475569]">
              <div className="flex items-center justify-between">
                <span>Kasus Stunting Tahun 2026:</span>
                <strong className="text-red-600 font-bold">
                  {activeDistrictRecord.balitaStunting} Jiwa ({activeDistrictRecord.balitaStunting > 250 ? "Sangat Tinggi" : activeDistrictRecord.balitaStunting > 100 ? "Tinggi" : "Sedang"})
                </strong>
              </div>

              {prevDistrictRecord && (
                <div className="flex items-center justify-between">
                  <span>Kasus Stunting Tahun 2025:</span>
                  <strong className="text-[#2C3968] font-semibold">
                    {prevDistrictRecord.balitaStunting} Jiwa
                  </strong>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9] text-[11px]">
                <span className="text-emerald-600 font-bold">
                  Sembuh: {activeDistrictRecord.balitaSembuh}
                </span>
                <span className="text-light-sea-green font-bold">
                  Lulus: {activeDistrictRecord.balitaLulus}
                </span>
              </div>
            </div>

            {/* Bottom Attribution in Red */}
            <div className="text-center pt-1 border-t border-[#f1f5f9]">
              <span className="text-[10px] font-semibold text-red-600">
                Sumber data: E-PPGBM / Dinas Kesehatan Kab. Gresik
              </span>
            </div>
          </div>
        )}

        {/* 6. Bottom Color Legend */}
        <div className="p-3 bg-white border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-3 font-semibold text-[#475569]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#eab308]"></span>
              <span>Prioritas Tahun 2026 (&gt;300 Kasus)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#35CBC3]"></span>
              <span>Prioritas Tahun 2025 (150-300 Kasus)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#16a34a]"></span>
              <span>Prioritas Tahun 2024 (50-150 Kasus)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#dc2626]"></span>
              <span>Intervensi Khusus Stunting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-xs bg-[#7c3aed]"></span>
              <span>Prioritas Terkendali (&lt;50 Kasus)</span>
            </div>
          </div>

          <div className="text-[#2C3968] font-bold shrink-0">
            Sumber Data: Dinas Kesehatan Kab. Gresik
          </div>
        </div>
      </div>
    </div>
  );
};
