"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { formatNumber } from "@/lib/utils";
import { Fish, Building, Users } from "lucide-react";

interface GresikLeafletMapProps {
  selectedDistrict: string;
  onSelectDistrict: (id: string) => void;
}

const MapController: React.FC<{ selectedDistrict: string }> = ({ selectedDistrict }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDistrict === "all") {
      map.flyTo([-7.18, 112.58], 10, { duration: 1.2 });
    } else {
      const target = GRESIK_DISTRICTS.find((d) => d.id === selectedDistrict);
      if (target) {
        map.flyTo([target.lat, target.lng], 13, { duration: 1.2 });
      }
    }
  }, [selectedDistrict, map]);

  return null;
};

export const GresikLeafletMap: React.FC<GresikLeafletMapProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[460px] bg-[#f8fafc] animate-pulse rounded-xl flex items-center justify-center text-[#64748b] text-[13px]">
        Memuat Peta Spasial Kab. Gresik...
      </div>
    );
  }

  const getColor = (risk: string) => {
    if (risk === "Tinggi") return "#f0624d"; // Danger
    if (risk === "Sedang") return "#d1b06c"; // MBG Emas
    return "#92d05d"; // MBG Hijau Terang
  };

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-[#e2e8f0]">
      <MapContainer
        center={[-7.18, 112.58]}
        zoom={10}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedDistrict={selectedDistrict} />

        {GRESIK_DISTRICTS.map((district) => {
          const isSelected = selectedDistrict === district.id;
          const color = getColor(district.riskLevel);

          return (
            <React.Fragment key={district.id}>
              <CircleMarker
                center={[district.lat, district.lng]}
                radius={isSelected ? 16 : 11}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.75,
                  color: isSelected ? "#2C3968" : "#ffffff",
                  weight: isSelected ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => onSelectDistrict(district.id),
                }}
              >
                <Popup className="gscan-popup">
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#e2e8f0]">
                      <span className="font-extrabold text-[13px] text-[#2C3968]">
                        Kec. {district.name}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${color}30`, color: color === "#92d05d" ? "#71aa42" : color === "#d1b06c" ? "#9c7f3e" : color }}
                      >
                        {district.riskLevel} ({district.stuntingRate}%)
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[12px] text-[#64748b]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#64748b]">
                          <Users className="w-3 h-3 text-[#a5b0b7]" /> Target Siswa:
                        </span>
                        <strong className="text-[#2C3968]">
                          {formatNumber(district.targetChildren)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[#64748b]">
                          <Building className="w-3 h-3 text-[#a5b0b7]" /> Cakupan MBG:
                        </span>
                        <strong className="text-[#71aa42] font-bold">
                          {district.coverageMBG}%
                        </strong>
                      </div>

                      <div className="pt-1.5 mt-1.5 border-t border-[#e2e8f0]">
                        <span className="flex items-center gap-1 text-[11px] text-[#64748b] mb-0.5">
                          <Fish className="w-3 h-3 text-[#2C3968]" /> Komoditas Lokal:
                        </span>
                        <p className="text-[11px] font-semibold text-[#2C3968]">
                          {district.localCommodity}
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectDistrict(district.id)}
                        className="w-full mt-2 py-1 px-2 text-[11px] font-bold text-white bg-[#2C3968] hover:bg-[#0d2a63] rounded-lg transition-colors"
                      >
                        Pilih & Analisis Detail
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#e2e8f0] shadow-sm text-[12px]">
        <span className="font-bold text-[#2C3968] block mb-1">Peta Risiko Gizi Gresik</span>
        <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#92d05d]"></span> Rendah
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d1b06c]"></span> Sedang
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f0624d]"></span> Tinggi
          </span>
        </div>
      </div>
    </div>
  );
};

export default GresikLeafletMap;
