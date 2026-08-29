"use client";

import React, { useState } from "react";
import { GRESIK_COMMODITIES } from "@/data/commodities";
import { formatRupiah } from "@/lib/utils";
import { 
  Fish, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  MapPin
} from "lucide-react";

export const CommodityMarketView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = GRESIK_COMMODITIES.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.localOrigin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="app-card p-5 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 mb-4 border-b border-[#e2e8f0] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f0f6ff] text-[#1a73e8] flex items-center justify-center">
              <Fish className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-bold text-[#222222]">
              Monitoring Komoditas & Pasar Pangan Gresik
            </h2>
          </div>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Harga riil terintegrasi Disperindag / BPS Gresik untuk menjaga stabilitas biaya MBG
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#a5b0b7] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari komoditas/asal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f68a22]/30 focus:border-[#f68a22] w-44"
            />
          </div>

          {/* Category tabs */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-[12px] py-1.5 px-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl font-medium text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#f68a22]/30"
          >
            <option value="all">Semua Kategori</option>
            <option value="Protein Hewani">Protein Hewani</option>
            <option value="Protein Nabati">Protein Nabati</option>
            <option value="Karbohidrat">Karbohidrat</option>
            <option value="Sayuran & Buah">Sayuran & Buah</option>
          </select>
        </div>
      </div>

      {/* Table of Commodities */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#e2e8f0] text-[#64748b] font-semibold uppercase tracking-wider text-[10px] bg-[#f8fafc]">
              <th className="py-2.5 px-3">Komoditas Gresik</th>
              <th className="py-2.5 px-3">Kategori</th>
              <th className="py-2.5 px-3">Harga Acuan</th>
              <th className="py-2.5 px-3">Status Pasokan</th>
              <th className="py-2.5 px-3">Sentra / Asal Daerah</th>
              <th className="py-2.5 px-3">Keunggulan Nutrisi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-[#222222] text-[13px]">{item.name}</div>
                  <div className="text-[11px] text-[#a5b0b7]">Satuan: /{item.unit}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#f1f5f9] text-[#222222] border border-[#e2e8f0]">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-extrabold text-[#222222]">
                    {formatRupiah(item.currentPrice)}
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    {item.priceChange <= 0 ? (
                      <span className="text-[#2bb34d] font-semibold inline-flex items-center">
                        <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                        {item.priceChange}% (Stabil)
                      </span>
                    ) : (
                      <span className="text-[#f0624d] font-semibold inline-flex items-center">
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                        +{item.priceChange}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    item.stockStatus === "Melimpah"
                      ? "bg-[#d5f0db] text-[#1e7d36] border border-[#d5f0db]"
                      : "bg-[#d1e3fa] text-[#1251a3] border border-[#d1e3fa]"
                  }`}>
                    <CheckCircle className="w-2.5 h-2.5" />
                    {item.stockStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#64748b]">
                  <span className="flex items-center gap-1 text-[12px] font-medium text-[#222222]">
                    <MapPin className="w-3 h-3 text-[#f68a22] shrink-0" />
                    {item.localOrigin}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[12px] font-medium text-[#222222] bg-[#f8fafc] px-2 py-1 rounded-md block max-w-xs truncate border border-[#e2e8f0]" title={item.keyNutrition}>
                    {item.keyNutrition}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
