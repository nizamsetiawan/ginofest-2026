"use client";

import React, { useState } from "react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { OFFICIAL_GRESIK_DATA } from "@/data/gresik-official-stunting";

interface GresikIsolatedMapProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
  hoveredDistrictId: string | null;
  setHoveredDistrictId: (id: string | null) => void;
  metricMode: "stunting" | "sembuh" | "lulus";
}

export const GresikIsolatedMap: React.FC<GresikIsolatedMapProps> = ({
  selectedDistrict,
  onSelectDistrict,
  hoveredDistrictId,
  setHoveredDistrictId,
  metricMode = "stunting",
}) => {
  const activeYearData = OFFICIAL_GRESIK_DATA["2026"];

  // Color mapping based on Stunting cases
  const getChoroplethColor = (cases: number, isSelected: boolean, isHovered: boolean) => {
    if (isSelected || isHovered) return "#2C3968"; // High-contrast navy when active

    if (metricMode === "stunting") {
      if (cases >= 300) return "#fef08a"; // 🟨 Sangat Tinggi (>300)
      if (cases >= 150) return "#bfdbfe"; // 🟦 Tinggi (150-300)
      if (cases >= 50) return "#bbf7d0";  // 🟩 Sedang (50-150)
      return "#e9d5ff";                   // 🟪 Terkendali (<50)
    }

    if (metricMode === "sembuh") {
      if (cases >= 500) return "#93c5fd";
      if (cases >= 250) return "#bfdbfe";
      return "#dbeafe";
    }

    // Lulus mode
    if (cases >= 300) return "#86efac";
    if (cases >= 150) return "#bbf7d0";
    return "#dcfce7";
  };

  const getBorderColor = (cases: number, isSelected: boolean) => {
    if (isSelected) return "#2C3968";
    if (cases >= 300) return "#ca8a04";
    if (cases >= 150) return "#2563eb";
    if (cases >= 50) return "#16a34a";
    return "#9333ea";
  };

  const getPinColor = (cases: number) => {
    if (cases >= 300) return "#eab308"; // 🟨
    if (cases >= 150) return "#35CBC3"; // 🟦
    if (cases >= 50) return "#16a34a";  // 🟩
    return "#9333ea";                   // 🟪
  };

  // Geographic SVG Coordinates for 18 Districts
  const districtSvgCoords: Record<string, { x: number; y: number; path: string; labelOffset?: { x: number; y: number } }> = {
    // 1. Mainland Northern Coast (Pantura Gresik)
    "panceng": {
      x: 270, y: 155,
      path: "M200,135 L310,125 L335,175 L230,185 Z",
    },
    "dukun": {
      x: 230, y: 210,
      path: "M180,175 L255,165 L275,230 L185,240 Z",
    },
    "ujungpangkah": {
      x: 380, y: 140,
      path: "M310,125 L435,100 L455,165 L335,175 Z",
    },
    "sidayu": {
      x: 350, y: 200,
      path: "M275,175 L410,165 L425,230 L295,240 Z",
    },
    "bungah": {
      x: 370, y: 260,
      path: "M295,240 L425,230 L450,290 L320,300 Z",
    },
    // 2. Central Industrial & City
    "manyar": {
      x: 430, y: 315,
      path: "M350,290 L470,265 L500,340 L375,350 Z",
    },
    "gresik": {
      x: 485, y: 360,
      path: "M450,340 L515,335 L525,390 L465,395 Z",
    },
    "kebomas": {
      x: 440, y: 380,
      path: "M380,350 L465,345 L475,415 L395,425 Z",
    },
    "duduksampeyan": {
      x: 310, y: 335,
      path: "M230,300 L350,290 L370,380 L245,390 Z",
    },
    "cerme": {
      x: 395, y: 440,
      path: "M330,390 L455,380 L470,470 L345,480 Z",
    },
    "benjeng": {
      x: 290, y: 420,
      path: "M210,390 L330,380 L345,470 L225,480 Z",
    },
    "balongpanggang": {
      x: 205, y: 465,
      path: "M130,435 L250,425 L265,515 L145,525 Z",
    },
    // 3. Southern Urban / Industrial
    "menganti": {
      x: 445, y: 495,
      path: "M370,465 L490,455 L505,540 L385,550 Z",
    },
    "kedamean": {
      x: 350, y: 530,
      path: "M275,500 L395,490 L410,570 L290,580 Z",
    },
    "wringinanom": {
      x: 330, y: 585,
      path: "M255,555 L375,545 L390,625 L270,635 Z",
    },
    "driyorejo": {
      x: 465, y: 565,
      path: "M390,535 L510,525 L525,605 L405,615 Z",
    },
    // 4. Bawean Island Inset (Top Right Box)
    "sangkapura": {
      x: 715, y: 185,
      path: "M640,150 L775,140 L795,230 L660,240 Z",
    },
    "tambak": {
      x: 720, y: 105,
      path: "M645,75 L780,65 L795,145 L665,155 Z",
    },
  };

  return (
    <div className="relative w-full h-[550px] bg-[#f8fafc] rounded-2xl overflow-hidden select-none border border-[#e2e8f0]">
      {/* SVG Thematic Choropleth Map */}
      <svg 
        viewBox="0 0 900 650" 
        className="w-full h-full object-contain"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Subtle Background Elements */}
        <defs>
          <pattern id="dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />

        {/* Surrounding Geography Labels */}
        <text x="560" y="240" fill="#94a3b8" fontSize="13" fontStyle="italic" fontWeight="600">
          Laut Jawa / Selat Madura
        </text>
        <text x="60" y="330" fill="#cbd5e1" fontSize="12" fontWeight="bold">
          ← KAB. LAMONGAN
        </text>
        <text x="560" y="470" fill="#cbd5e1" fontSize="12" fontWeight="bold">
          KOTA SURABAYA →
        </text>
        <text x="350" y="640" fill="#cbd5e1" fontSize="12" fontWeight="bold">
          ↓ KAB. SIDOARJO / MOJOKERTO
        </text>

        {/* Bawean Island Inset Box */}
        <g>
          <rect 
            x="605" y="30" width="235" height="240" 
            rx="16" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 5" 
          />
          <rect x="605" y="30" width="235" height="32" rx="16" fill="#e8f0fe" />
          <text x="620" y="52" fill="#35CBC3" fontSize="11" fontWeight="bold">
            🏝️ KEPULAUAN BAWEAN (GRESIK)
          </text>
        </g>

        {/* 18 Kecamatan Districts with Choropleth Colors and Direct Data Labels */}
        {GRESIK_DISTRICTS.map((district) => {
          const coords = districtSvgCoords[district.id];
          if (!coords) return null;

          const isSelected = selectedDistrict === district.id;
          const isHovered = hoveredDistrictId === district.id;

          const distRecord = activeYearData.records.find(
            (r) => r.kecamatan.toLowerCase() === district.name.toLowerCase()
          );

          const valueDisplay = distRecord
            ? metricMode === "stunting" 
              ? distRecord.balitaStunting 
              : metricMode === "sembuh" 
              ? distRecord.balitaSembuh 
              : distRecord.balitaLulus
            : 50;

          const choroplethFill = getChoroplethColor(valueDisplay, isSelected, isHovered);
          const borderStroke = getBorderColor(valueDisplay, isSelected);
          const pinFill = getPinColor(valueDisplay);

          const isHighContrastActive = isSelected || isHovered;

          return (
            <g 
              key={district.id}
              onClick={() => onSelectDistrict(district.id)}
              onMouseEnter={() => setHoveredDistrictId(district.id)}
              onMouseLeave={() => setHoveredDistrictId(null)}
              className="cursor-pointer transition-all duration-150 group"
            >
              {/* Colored District Boundary Polygon */}
              <path
                d={coords.path}
                fill={choroplethFill}
                stroke={borderStroke}
                strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "1.2"}
                className="transition-all duration-200"
              />

              {/* District Name Label */}
              <text
                x={coords.x}
                y={coords.y - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill={isHighContrastActive ? "#ffffff" : "#2C3968"}
                className="pointer-events-none drop-shadow-xs select-none"
              >
                {district.name}
              </text>

              {/* DIRECT NUMBER BADGE (Membuat persebaran sangat mudah dibaca langsung) */}
              <g transform={`translate(${coords.x}, ${coords.y + 12})`}>
                <rect
                  x="-28"
                  y="-10"
                  width="56"
                  height="18"
                  rx="6"
                  fill={isHighContrastActive ? "#35CBC3" : "#ffffff"}
                  stroke={isHighContrastActive ? "#ffffff" : borderStroke}
                  strokeWidth="1"
                  className="shadow-xs"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill={isHighContrastActive ? "#ffffff" : "#2C3968"}
                  className="pointer-events-none"
                >
                  {valueDisplay} {metricMode === "stunting" ? "ks" : "jiwa"}
                </text>
              </g>

              {/* Pin Indicator */}
              <circle
                cx={coords.x}
                cy={coords.y - 1}
                r={isSelected ? "5" : "4"}
                fill={pinFill}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Interactive Guide */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#e2e8f0] shadow-xs text-[11px] font-bold text-[#2C3968] flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#35CBC3] animate-ping"></span>
        <span>Peta Tematik Stunting: Setiap kecamatan menampilkan warna & jumlah kasus langsung</span>
      </div>
    </div>
  );
};
