"use client";

import React from "react";
import { 
  Users, 
  TrendingDown, 
  Coins, 
  Fish, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { GRESIK_TOTAL_STATS, DistrictData } from "@/data/gresik-districts";
import { formatNumber, formatRupiah } from "@/lib/utils";

interface MetricCardsProps {
  district?: DistrictData;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ district }) => {
  const isAll = !district;

  const targetStudents = isAll ? GRESIK_TOTAL_STATS.totalChildrenTarget : district.targetChildren;
  const servedStudents = isAll ? GRESIK_TOTAL_STATS.totalChildrenServed : Math.round(district.targetChildren * (district.coverageMBG / 100));
  const coveragePercent = isAll ? GRESIK_TOTAL_STATS.overallCoverage : district.coverageMBG;
  
  const stuntingRate = isAll ? GRESIK_TOTAL_STATS.averageStuntingRate : district.stuntingRate;
  const nationalBenchmark = GRESIK_TOTAL_STATS.nationalStuntingBenchmark;

  const monthlyBudget = isAll ? GRESIK_TOTAL_STATS.monthlyAPBDAllocation : district.monthlyBudget;
  const estimatedSavings = isAll ? GRESIK_TOTAL_STATS.monthlySavings : Math.round(district.monthlyBudget * 0.143);

  const localCommodity = isAll ? "Ikan Bandeng, Kupang & Udang" : district.localCommodity;
  const localIndex = isAll ? GRESIK_TOTAL_STATS.localCommodityUtilization : 88.5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Siswa Terlayani MBG (Hijau Terang #92d05d) */}
      <div className="app-card p-5 shadow-subtle hover:shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Cakupan Siswa MBG
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[22px] font-black text-[#071e49] tracking-tight">
                {formatNumber(servedStudents)}
              </span>
              <span className="text-[12px] text-[#64748b] font-medium">
                / {formatNumber(targetStudents)}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaf7e1] border border-[#92d05d]/40 flex items-center justify-center text-[#71aa42]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-semibold mb-1.5">
            <span className="text-[#71aa42] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#92d05d]" />
              Tercapai {coveragePercent}%
            </span>
            <span className="text-[#a5b0b7] font-normal">Target 100%</span>
          </div>
          <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#92d05d] h-full rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(coveragePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>{isAll ? "18 Kecamatan se-Gresik" : `${district.schoolsCount} Sekolah & MI`}</span>
          <span className="font-bold text-[#71aa42] inline-flex items-center">
            <ArrowUpRight className="w-3 h-3" /> +4.2% bln ini
          </span>
        </div>
      </div>

      {/* CARD 2: Prevalensi Stunting Gresik (Biru Muda Pastel #b5e0ea) */}
      <div className="app-card p-5 shadow-subtle hover:shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Prevalensi Stunting
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[22px] font-black text-[#071e49] tracking-tight">
                {stuntingRate}%
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#eaf7e1] text-[#71aa42] border border-[#92d05d]/40">
                -2.8% YoY
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f9fb] border border-[#b5e0ea] flex items-center justify-center text-[#196375]">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
            <span className="text-[#64748b]">Di bawah Nasional ({nationalBenchmark}%)</span>
          </div>
          <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-[#071e49] h-full rounded-l-full" 
              style={{ width: `${(stuntingRate / 30) * 100}%` }} 
            />
            <div 
              className="bg-[#b5e0ea] h-full" 
              style={{ width: `${((nationalBenchmark - stuntingRate) / 30) * 100}%` }} 
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Target 2026: <strong className="text-[#071e49]">&lt;10%</strong></span>
          <span className="text-[#071e49] font-bold inline-flex items-center">
            <ArrowDownRight className="w-3 h-3" /> On-Track
          </span>
        </div>
      </div>

      {/* CARD 3: Efisiensi Anggaran APBD (Emas #d1b06c) */}
      <div className="app-card p-5 shadow-subtle hover:shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Efisiensi Anggaran MBG
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[22px] font-black text-[#071e49] tracking-tight">
                {isAll ? "Rp 4,07 M" : formatRupiah(estimatedSavings)}
              </span>
              <span className="text-[11px] text-[#9c7f3e] font-bold bg-[#f9f4ea] px-1.5 py-0.5 rounded-md border border-[#d1b06c]/40">
                14.3% Hemat
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f9f4ea] border border-[#d1b06c]/40 flex items-center justify-center text-[#d1b06c]">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-medium mb-1.5 text-[#64748b]">
            <span>Rerata/Porsi: <strong className="text-[#071e49]">Rp 12.850</strong></span>
            <span className="line-through text-[#a5b0b7]">Rp 15.000</span>
          </div>
          <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#d1b06c] to-[#92d05d] h-full rounded-full" style={{ width: "85.7%" }} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
          <span className="flex items-center gap-1 text-[#071e49] font-semibold">
            <Sparkles className="w-3 h-3 text-[#d1b06c]" /> AI Menu Optimizer
          </span>
          <span className="font-bold text-[#71aa42]">AKG Terpenuhi</span>
        </div>
      </div>

      {/* CARD 4: Pemanfaatan Pangan Lokal Gresik (Biru Gelap #071e49) */}
      <div className="app-card p-5 shadow-subtle hover:shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              Pangan Lokal Dimanfaatkan
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[22px] font-black text-[#071e49] tracking-tight">
                {localIndex}%
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#b5e0ea]/40 text-[#071e49] border border-[#b5e0ea]">
                SDG 8
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#071e49] border border-[#071e49] flex items-center justify-center text-[#92d05d]">
            <Fish className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
            <span className="text-[#071e49] truncate font-bold" title={localCommodity}>
              {localCommodity}
            </span>
          </div>
          <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#071e49] h-full rounded-full" 
              style={{ width: `${localIndex}%` }}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Daya Serap Petambak & Nelayan</span>
          <span className="font-bold text-[#071e49]">Sentra UMKM</span>
        </div>
      </div>
    </div>
  );
};
