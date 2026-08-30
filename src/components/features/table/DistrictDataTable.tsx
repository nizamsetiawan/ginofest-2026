"use client";

import React, { useState } from "react";
import { GRESIK_DISTRICTS, DistrictData } from "@/data/gresik-districts";
import { formatNumber } from "@/lib/utils";
import { 
  MoreVertical, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown
} from "lucide-react";

interface DistrictDataTableProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
  activeFilter: "all" | "high" | "medium" | "low" | "bawean";
  searchTerm: string;
}

export const DistrictDataTable: React.FC<DistrictDataTableProps> = ({
  selectedDistrict,
  onSelectDistrict,
  activeFilter,
  searchTerm,
}) => {
  const [sortField, setSortField] = useState<keyof DistrictData>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredDistricts = GRESIK_DISTRICTS.filter((d) => {
    if (activeFilter === "high" && d.riskLevel !== "Tinggi") return false;
    if (activeFilter === "medium" && d.riskLevel !== "Sedang") return false;
    if (activeFilter === "low" && d.riskLevel !== "Rendah") return false;
    if (activeFilter === "bawean" && !["sangkapura", "tambak"].includes(d.id)) return false;

    if (searchTerm) {
      const matchName = d.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFood = d.localCommodity.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFocus = d.deficiencyFocus.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchFood || matchFocus;
    }

    return true;
  });

  // Sorting
  const sortedDistricts = [...filteredDistricts].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === "number" && typeof valB === "number") {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof DistrictData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getInitials = (name: string) => {
    const parts = name.replace("Kec. ", "").split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarBg = (risk: string) => {
    if (risk === "Tinggi") return "bg-red-50 text-brand-red border border-brand-red/30";
    if (risk === "Sedang") return "bg-amber-50 text-brand-orange border border-brand-orange/30";
    return "bg-green-tint text-ford-blue border border-green-02/40";
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-200 bg-[#F8FAFC] text-ford-blue font-bold text-[12px] select-none">
              <th 
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:text-light-sea-green transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Kecamatan / Wilayah</span>
                  <ChevronDown className="w-3 h-3 text-light-sea-green" />
                </div>
              </th>

              <th 
                onClick={() => handleSort("stuntingRate")}
                className="py-3 px-4 cursor-pointer hover:text-light-sea-green transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Prevalensi Stunting</span>
                  <ChevronDown className="w-3 h-3 text-light-sea-green" />
                </div>
              </th>

              <th 
                onClick={() => handleSort("targetChildren")}
                className="py-3 px-4 cursor-pointer hover:text-light-sea-green transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Target Siswa MBG</span>
                  <ChevronDown className="w-3 h-3 text-light-sea-green" />
                </div>
              </th>

              <th 
                onClick={() => handleSort("coverageMBG")}
                className="py-3 px-4 cursor-pointer hover:text-light-sea-green transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Cakupan Program MBG</span>
                  <ChevronDown className="w-3 h-3 text-light-sea-green" />
                </div>
              </th>

              <th className="py-3 px-4">Komoditas Pangan Gresik</th>
              <th className="py-3 px-4">Fokus Nutrisi MBG</th>
              <th className="py-3 px-4 text-center">Faskes / Sekolah</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {sortedDistricts.map((district, idx) => {
              const isSelected = selectedDistrict === district.id;
              const initials = getInitials(district.name);
              const avatarClass = getAvatarBg(district.riskLevel);

              return (
                <tr 
                  key={district.id}
                  onClick={() => onSelectDistrict(district.id)}
                  className={`hover:bg-green-tint/30 transition-colors cursor-pointer ${
                    isSelected ? "bg-green-tint/50 border-l-4 border-light-sea-green" : ""
                  }`}
                >
                  {/* Column 1: Avatar + Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarClass}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-ford-blue text-[13px] hover:underline">
                          Kec. {district.name}
                        </div>
                        <div className="text-[11px] text-blue-gray">
                          GSK-MBG-{String(idx + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Stunting Rate Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                      district.riskLevel === "Tinggi"
                        ? "bg-red-50 text-brand-red border border-brand-red/30"
                        : district.riskLevel === "Sedang"
                        ? "bg-amber-50 text-brand-orange border border-brand-orange/30"
                        : "bg-green-tint text-ford-blue border border-green-02/40"
                    }`}>
                      {district.riskLevel === "Tinggi" && <AlertTriangle className="w-3 h-3 text-brand-red" />}
                      {district.riskLevel === "Rendah" && <CheckCircle2 className="w-3 h-3 text-green-02" />}
                      {district.stuntingRate}% ({district.riskLevel})
                    </span>
                  </td>

                  {/* Column 3: Target Children */}
                  <td className="py-3.5 px-4 font-bold text-ford-blue">
                    {formatNumber(district.targetChildren)}
                    <span className="text-[11px] text-blue-gray font-normal block">
                      anak terdata
                    </span>
                  </td>

                  {/* Column 4: MBG Coverage Progress */}
                  <td className="py-3.5 px-4">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-light-sea-green">{district.coverageMBG}%</span>
                        <span className="text-blue-gray font-normal">Aktif</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-02 h-full rounded-full" 
                          style={{ width: `${district.coverageMBG}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Local Commodity */}
                  <td className="py-3.5 px-4 text-ford-blue font-medium text-[12px]">
                    <span className="truncate block max-w-xs" title={district.localCommodity}>
                      {district.localCommodity}
                    </span>
                  </td>

                  {/* Column 6: Deficiency Focus */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-tint text-ford-blue border border-green-02/30 block max-w-[180px] truncate" title={district.deficiencyFocus}>
                      {district.deficiencyFocus}
                    </span>
                  </td>

                  {/* Column 7: Schools & Posyandu */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-ford-blue text-[12px]">
                      {district.schoolsCount}
                    </span>
                    <span className="text-[11px] text-blue-gray block">
                      {district.posyanduCount} Pos
                    </span>
                  </td>

                  {/* Column 8: Action Three Dots Menu */}
                  <td className="py-3.5 px-3 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDistrict(district.id);
                      }}
                      className="p-1 rounded-lg text-blue-gray hover:text-ford-blue hover:bg-green-tint transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-3 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[12px] text-blue-gray gap-2">
        <span>
          Menampilkan <strong className="text-ford-blue">{sortedDistricts.length}</strong> dari <strong className="text-ford-blue">18 Kecamatan</strong> se-Kabupaten Gresik
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-ford-blue font-bold">
          <span className="w-2 h-2 rounded-full bg-green-02"></span>
          <span>Sinkron Real-time Badan Gizi Nasional & Dinkes Gresik</span>
        </div>
      </div>
    </div>
  );
};
