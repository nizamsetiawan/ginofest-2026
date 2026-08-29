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
    if (risk === "Tinggi") return "bg-[#fce0db] text-[#b63422]";
    if (risk === "Sedang") return "bg-[#f9f4ea] text-[#9c7f3e]";
    return "bg-[#eaf7e1] text-[#71aa42]";
  };

  return (
    <div className="w-full bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#071e49] font-bold text-[12px] select-none">
              <th 
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:text-[#0d2a63] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Kecamatan / Wilayah</span>
                  <ChevronDown className="w-3 h-3 text-[#d1b06c]" />
                </div>
              </th>

              <th 
                onClick={() => handleSort("stuntingRate")}
                className="py-3 px-4 cursor-pointer hover:text-[#0d2a63] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Prevalensi Stunting</span>
                  <ChevronDown className="w-3 h-3 text-[#d1b06c]" />
                </div>
              </th>

              <th 
                onClick={() => handleSort("targetChildren")}
                className="py-3 px-4 cursor-pointer hover:text-[#0d2a63] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Target Siswa MBG</span>
                  <ChevronDown className="w-3 h-3 text-[#d1b06c]" />
                </div>
              </th>

              <th 
                onClick={() => handleSort("coverageMBG")}
                className="py-3 px-4 cursor-pointer hover:text-[#0d2a63] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Cakupan Program MBG</span>
                  <ChevronDown className="w-3 h-3 text-[#d1b06c]" />
                </div>
              </th>

              <th className="py-3 px-4">Komoditas Pangan Gresik</th>
              <th className="py-3 px-4">Fokus Nutrisi MBG</th>
              <th className="py-3 px-4 text-center">Faskes / Sekolah</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#f1f5f9]">
            {sortedDistricts.map((district, idx) => {
              const isSelected = selectedDistrict === district.id;
              const initials = getInitials(district.name);
              const avatarClass = getAvatarBg(district.riskLevel);

              return (
                <tr 
                  key={district.id}
                  onClick={() => onSelectDistrict(district.id)}
                  className={`hover:bg-[#f0f9fb]/60 transition-colors cursor-pointer ${
                    isSelected ? "bg-[#f0f9fb] border-l-4 border-[#071e49]" : ""
                  }`}
                >
                  {/* Column 1: Avatar + Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarClass}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-[#071e49] text-[13px] hover:underline">
                          Kec. {district.name}
                        </div>
                        <div className="text-[11px] text-[#64748b]">
                          GSK-MBG-{String(idx + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Stunting Rate Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      district.riskLevel === "Tinggi"
                        ? "bg-[#fce0db] text-[#b63422]"
                        : district.riskLevel === "Sedang"
                        ? "bg-[#f9f4ea] text-[#9c7f3e]"
                        : "bg-[#eaf7e1] text-[#71aa42]"
                    }`}>
                      {district.riskLevel === "Tinggi" && <AlertTriangle className="w-3 h-3 text-[#f0624d]" />}
                      {district.riskLevel === "Rendah" && <CheckCircle2 className="w-3 h-3 text-[#92d05d]" />}
                      {district.stuntingRate}% ({district.riskLevel})
                    </span>
                  </td>

                  {/* Column 3: Target Children */}
                  <td className="py-3.5 px-4 font-semibold text-[#071e49]">
                    {formatNumber(district.targetChildren)}
                    <span className="text-[11px] text-[#64748b] font-normal block">
                      anak terdata
                    </span>
                  </td>

                  {/* Column 4: MBG Coverage Progress */}
                  <td className="py-3.5 px-4">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-[#71aa42]">{district.coverageMBG}%</span>
                        <span className="text-[#64748b] font-normal">Aktif</span>
                      </div>
                      <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#92d05d] h-full rounded-full" 
                          style={{ width: `${district.coverageMBG}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Column 5: Local Commodity */}
                  <td className="py-3.5 px-4 text-[#071e49] font-medium text-[12px]">
                    <span className="truncate block max-w-xs" title={district.localCommodity}>
                      {district.localCommodity}
                    </span>
                  </td>

                  {/* Column 6: Deficiency Focus */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f0f9fb] text-[#071e49] border border-[#b5e0ea] block max-w-[180px] truncate" title={district.deficiencyFocus}>
                      {district.deficiencyFocus}
                    </span>
                  </td>

                  {/* Column 7: Schools & Posyandu */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-[#071e49] text-[12px]">
                      {district.schoolsCount}
                    </span>
                    <span className="text-[11px] text-[#64748b] block">
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
                      className="p-1 rounded-md text-[#64748b] hover:text-[#071e49] hover:bg-[#b5e0ea]/30 transition-colors"
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
      <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#64748b] gap-2">
        <span>
          Menampilkan <strong>{sortedDistricts.length}</strong> dari <strong>18 Kecamatan</strong> se-Kabupaten Gresik
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-[#071e49] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#92d05d]"></span>
          <span>Sinkron Real-time Badan Gizi Nasional & Dinkes Gresik</span>
        </div>
      </div>
    </div>
  );
};
