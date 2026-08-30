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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* CARD 1: Siswa Terlayani MBG (Green 02 & Light Sea Green) */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs hover:border-green-02/60 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-gray uppercase tracking-wider">
              Cakupan Siswa MBG
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-ford-blue tracking-tight">
                {formatNumber(servedStudents)}
              </span>
              <span className="text-[12px] text-blue-gray font-medium">
                / {formatNumber(targetStudents)}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-tint border border-green-02/40 flex items-center justify-center text-light-sea-green">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-semibold mb-1.5">
            <span className="text-light-sea-green flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-02" />
              Tercapai {coveragePercent}%
            </span>
            <span className="text-blue-gray font-normal">Target 100%</span>
          </div>
          <div className="w-full bg-brand-gray h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-02 h-full rounded-full transition-all duration-700" 
              style={{ width: `${Math.min(coveragePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-blue-gray">
          <span>{isAll ? "18 Kecamatan se-Gresik" : `${district.schoolsCount} Sekolah & MI`}</span>
          <span className="font-bold text-light-sea-green inline-flex items-center">
            <ArrowUpRight className="w-3 h-3" /> +4.2% bln ini
          </span>
        </div>
      </div>

      {/* CARD 2: Prevalensi Stunting Gresik (Blue / Violet Gradient) */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs hover:border-brand-blue/60 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-gray uppercase tracking-wider">
              Prevalensi Stunting
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-ford-blue tracking-tight">
                {stuntingRate}%
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-green-tint text-ford-blue border border-green-02/40">
                -2.8% YoY
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-brand-blue/30 flex items-center justify-center text-brand-blue">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
            <span className="text-blue-gray">Di bawah Nasional ({nationalBenchmark}%)</span>
          </div>
          <div className="w-full bg-brand-gray h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-ford-blue h-full rounded-l-full" 
              style={{ width: `${(stuntingRate / 30) * 100}%` }} 
            />
            <div 
              className="bg-brand-blue/40 h-full" 
              style={{ width: `${((nationalBenchmark - stuntingRate) / 30) * 100}%` }} 
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-blue-gray">
          <span>Target 2026: <strong className="text-ford-blue">&lt;10%</strong></span>
          <span className="text-ford-blue font-bold inline-flex items-center">
            <ArrowDownRight className="w-3 h-3" /> On-Track
          </span>
        </div>
      </div>

      {/* CARD 3: Efisiensi Anggaran APBD (Brand Orange / Yellow Accent) */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs hover:border-brand-orange/60 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-gray uppercase tracking-wider">
              Efisiensi Anggaran MBG
            </p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-ford-blue tracking-tight">
                {isAll ? "Rp 4,07 M" : formatRupiah(estimatedSavings)}
              </span>
              <span className="text-[11px] text-brand-orange font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-brand-orange/40">
                14.3% Hemat
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-medium mb-1.5 text-blue-gray">
            <span>Rerata/Porsi: <strong className="text-ford-blue">Rp 12.850</strong></span>
            <span className="line-through text-slate-400">Rp 15.000</span>
          </div>
          <div className="w-full bg-brand-gray h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-brand-orange to-green-02 h-full rounded-full" style={{ width: "85.7%" }} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-blue-gray">
          <span className="flex items-center gap-1 text-ford-blue font-semibold">
            <Sparkles className="w-3 h-3 text-brand-orange" /> AI Optimizer
          </span>
          <span className="font-bold text-light-sea-green">AKG Terpenuhi</span>
        </div>
      </div>

      {/* CARD 4: Pemanfaatan Pangan Lokal Gresik (Ford Blue & Green 02) */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs hover:border-ford-blue/60 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-gray uppercase tracking-wider">
              Pangan Lokal Dimanfaatkan
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-ford-blue tracking-tight">
                {localIndex}%
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-green-tint text-ford-blue border border-green-02/40">
                SDG 8
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-ford-blue border border-ford-blue flex items-center justify-center text-green-02">
            <Fish className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
            <span className="text-ford-blue truncate font-bold" title={localCommodity}>
              {localCommodity}
            </span>
          </div>
          <div className="w-full bg-brand-gray h-2 rounded-full overflow-hidden">
            <div 
              className="bg-ford-blue h-full rounded-full" 
              style={{ width: `${localIndex}%` }}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] text-blue-gray">
          <span>Daya Serap Nelayan</span>
          <span className="font-bold text-ford-blue">Sentra UMKM</span>
        </div>
      </div>
    </div>
  );

};
