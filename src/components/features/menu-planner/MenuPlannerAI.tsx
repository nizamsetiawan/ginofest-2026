"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Download, 
  MapPin
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MenuPlannerAIProps {
  selectedDistrict: string;
}

interface DayMenuState {
  day: string;
  monthYear: string;
  menuTitle: string | null;
  calories: number;
  cost: number;
  protein?: number;
  iron?: number;
  localOrigin?: string;
}

export const MenuPlannerAI: React.FC<MenuPlannerAIProps> = ({ selectedDistrict }) => {
  const [targetDistrictId, setTargetDistrictId] = useState<string>(selectedDistrict || "manyar");
  const [targetStudents, setTargetStudents] = useState<number>(12500);
  const [isGenerating, setIsGenerating] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [selectedRecipeToast, setSelectedRecipeToast] = useState<string | null>(null);

  const [aiRecipePool, setAiRecipePool] = useState<string[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  const [logisticsBOM, setLogisticsBOM] = useState<any[]>([]);

  // Initial Empty Days state
  const [days, setDays] = useState<DayMenuState[]>([
    { day: "Senin", monthYear: "November 2026", menuTitle: null, calories: 667, cost: 14200 },
    { day: "Selasa", monthYear: "November 2026", menuTitle: null, calories: 610, cost: 14700 },
    { day: "Rabu", monthYear: "November 2026", menuTitle: null, calories: 618, cost: 14400 },
    { day: "Kamis", monthYear: "November 2026", menuTitle: null, calories: 526, cost: 13800 },
    { day: "Jumat", monthYear: "November 2026", menuTitle: null, calories: 602, cost: 14900 },
  ]);

  // Fetch Master Prompt from API
  const fetchMenu = async (autoApply: boolean = false) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/generate-menu?districtId=${targetDistrictId}&students=${targetStudents}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiRecipePool(data.availableGeneratedRecipes || []);
          setBudgetSummary(data.budgetSummary);
          setLogisticsBOM(data.logisticsBOM || []);

          if (autoApply) {
            setDays(data.weeklyPlan);
            setSelectedRecipeToast(`Menu MBG Kec. ${data.districtName} berhasil digenerate!`);
            setTimeout(() => setSelectedRecipeToast(null), 3000);
          }
        }
      }
    } catch (err) {
      console.warn("Gagal generate menu:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchMenu(false);
  }, [targetDistrictId]);

  // Generate All Days Menu
  const handleGenerateAll = () => {
    fetchMenu(true);
  };

  // Re-generate single day
  const handleRegenerateDay = (idx: number) => {
    if (!aiRecipePool.length) return;
    const randomRecipe = aiRecipePool[Math.floor(Math.random() * aiRecipePool.length)];
    const updated = [...days];
    updated[idx] = {
      ...updated[idx],
      menuTitle: randomRecipe,
    };
    setDays(updated);
  };

  // Select a recipe from bottom list
  const handleSelectRecipeFromList = (recipe: string) => {
    const targetIdx = days.findIndex((d) => !d.menuTitle) !== -1 
      ? days.findIndex((d) => !d.menuTitle) 
      : carouselIndex;

    const updated = [...days];
    updated[targetIdx] = {
      ...updated[targetIdx],
      menuTitle: recipe,
    };
    setDays(updated);
    setSelectedRecipeToast(`Menu diterapkan untuk ${updated[targetIdx].day}!`);
    setTimeout(() => setSelectedRecipeToast(null), 2500);
  };

  // Calculate estimated weekly expense
  const generatedCount = days.filter((d) => d.menuTitle !== null).length;
  const minCost = generatedCount > 0 ? generatedCount * 13800 : 0;
  const maxCost = generatedCount > 0 ? generatedCount * 15000 : 0;

  // Visible days in carousel (3 at a time)
  const visibleDays = days.slice(carouselIndex, carouselIndex + 3);
  const currentDistrictInfo = GRESIK_DISTRICTS.find((d) => d.id === targetDistrictId) || GRESIK_DISTRICTS[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Section: Title, District Selector, Expense Counter, Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-[#f1f5f9]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-black text-[#071e49] tracking-tight">
              Generate Menu
            </h1>
            {/* Inline District Selector */}
            <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-1 text-[12px] font-bold text-[#071e49]">
              <MapPin className="w-3.5 h-3.5 text-[#1a73e8]" />
              <select
                value={targetDistrictId}
                onChange={(e) => setTargetDistrictId(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                {GRESIK_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    Kec. {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[13px] text-[#64748b]">
              Estimasi Pengeluaran Minggu Ini:
            </span>
            <span className="text-[20px] font-black text-[#071e49]">
              Rp {minCost.toLocaleString("id-ID")} - Rp {maxCost.toLocaleString("id-ID")}
            </span>
            <span className="text-[13px] text-[#1a73e8] font-bold">/anak</span>
          </div>
        </div>

        {/* Action Buttons in Solid Blue (Matching Reference) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsLogisticsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[13px] font-bold shadow-xs transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Laporan Bahan Pokok</span>
          </button>

          <button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[13px] font-bold shadow-xs transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Menyusun Menu..." : "Generate Semua Menu"}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {selectedRecipeToast && (
        <div className="p-3 bg-[#e8f0fe] border border-[#badafe] text-[#1a73e8] rounded-xl text-[12px] font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{selectedRecipeToast}</span>
        </div>
      )}

      {/* 2. Carousel Row of Days (Senin, Selasa, Rabu, ...) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
          disabled={carouselIndex === 0}
          className="w-10 h-10 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#155fc0] transition-colors shrink-0 shadow-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
          {visibleDays.map((dayItem, idx) => {
            const actualIdx = carouselIndex + idx;
            const hasMenu = dayItem.menuTitle !== null;

            return (
              <div
                key={dayItem.day}
                className="bg-[#edf2f7]/70 rounded-2xl p-4 flex flex-col justify-between min-h-[145px] border border-[#e2e8f0] transition-all hover:bg-slate-100/90"
              >
                <div className="flex items-baseline justify-between pb-1">
                  <h3 className="text-[14px] font-bold text-[#071e49]">
                    {dayItem.day}
                  </h3>
                  <span className="text-[11px] text-[#64748b]">
                    {dayItem.monthYear}
                  </span>
                </div>

                <div className="py-2 text-center">
                  {hasMenu ? (
                    <div className="space-y-1">
                      <p className="text-[12px] font-bold text-[#071e49] line-clamp-2">
                        {dayItem.menuTitle}
                      </p>
                      <span className="text-[10px] font-semibold text-[#1a73e8] bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                        ~Rp {dayItem.cost.toLocaleString("id-ID")} / porsi ({dayItem.calories} Kkal)
                      </span>
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#64748b]">
                      Belum ada menu!
                    </p>
                  )}
                </div>

                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => handleRegenerateDay(actualIdx)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[11px] font-bold shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Re-generate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setCarouselIndex(Math.min(days.length - 3, carouselIndex + 1))}
          disabled={carouselIndex >= days.length - 3}
          className="w-10 h-10 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#155fc0] transition-colors shrink-0 shadow-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Bottom Section: —— Menu Generasi AI —— */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center gap-3 text-[12px] text-[#64748b]">
          <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>
          <span className="font-semibold">
            Menu Generasi AI (Kec. {currentDistrictInfo.name})
          </span>
          <div className="flex-1 h-[1px] bg-[#e2e8f0]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {aiRecipePool.length > 0 ? (
            aiRecipePool.map((recipe, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecipeFromList(recipe)}
                className="w-full py-3 px-4 rounded-2xl bg-[#edf2f7]/60 hover:bg-[#e8f0fe] border border-transparent hover:border-[#badafe] text-[12px] font-semibold text-[#071e49] hover:text-[#1a73e8] text-center transition-all duration-150 truncate block group shadow-2xs"
                title={recipe}
              >
                {recipe}
              </button>
            ))
          ) : (
            <div className="col-span-2 text-center py-6 text-[12px] text-[#64748b]">
              Klik <strong>Generate Semua Menu</strong> untuk memuat rekomendasi masakan bergizi.
            </div>
          )}
        </div>
      </div>

      {/* 4. Modal "Laporan Bahan Pokok & Anggaran MBG" */}
      {isLogisticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div 
            className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5 text-[#071e49]">
                <div className="w-9 h-9 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black tracking-tight">
                    Laporan Kebutuhan Bahan Pokok & Anggaran MBG
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Wilayah Kec. {currentDistrictInfo.name} ({targetStudents.toLocaleString("id-ID")} Siswa / Minggu)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLogisticsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#071e49] hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Budget Summary Mini Cards */}
            {budgetSummary && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#64748b] font-bold block">Pagu Resmi BGN:</span>
                  <strong className="text-[14px] font-black text-[#071e49]">
                    Rp {budgetSummary.totalPlafonWeekly?.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#64748b] font-bold block">Realisasi Biaya:</span>
                  <strong className="text-[14px] font-black text-[#1a73e8]">
                    Rp {budgetSummary.totalCostWeekly?.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[10px] text-[#64748b] font-bold block">Penghematan APBD:</span>
                  <strong className="text-[14px] font-black text-emerald-600">
                    Rp {budgetSummary.totalSavingsWeekly?.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>
            )}

            {/* Table of BOM */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-[#e2e8f0] max-h-72">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead className="bg-[#f8fafc] text-[#071e49] font-bold sticky top-0 border-b border-[#e2e8f0]">
                  <tr>
                    <th className="py-2.5 px-3">Komoditas Bahan Pokok</th>
                    <th className="py-2.5 px-3">Volume Pengadaan</th>
                    <th className="py-2.5 px-3">Rekomendasi Pemasok</th>
                    <th className="py-2.5 px-3 text-right">Estimasi Anggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {logisticsBOM.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-[#071e49]">{item.item}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1a73e8]">{item.volume}</td>
                      <td className="py-2.5 px-3 text-[#64748b]">{item.supplierRecom}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#071e49]">
                        Rp {Math.round(item.totalCost).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748b]">
              <span>Plafon Resmi: Rp 15.000 / porsi • 100% Pangan Lokal Terpenuhi</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Mengunduh laporan PDF...")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setIsLogisticsModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071e49] font-bold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
