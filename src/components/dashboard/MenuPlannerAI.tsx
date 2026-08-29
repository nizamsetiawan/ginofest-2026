"use client";

import React, { useState } from "react";
import { WEEKLY_MBG_MENUS, MealDayPlan } from "@/data/default-menus";
import { 
  Sparkles, 
  ChefHat, 
  Utensils, 
  Coins, 
  Flame, 
  ShieldCheck, 
  Fish, 
  Check, 
  RefreshCw,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface MenuPlannerAIProps {
  selectedDistrict: string;
}

export const MenuPlannerAI: React.FC<MenuPlannerAIProps> = ({ selectedDistrict }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<MealDayPlan[]>(WEEKLY_MBG_MENUS);
  const [aiOptimizationMode, setAiOptimizationMode] = useState<"balanced" | "iron" | "budget">("balanced");
  const [customPrompt, setCustomPrompt] = useState("");

  const currentMeal = activePlan[selectedDayIndex];

  // Handle AI Regeneration Simulation
  const handleRegenerateWithAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Simulate AI updating recipes based on optimization focus
      if (aiOptimizationMode === "iron") {
        const updated = [...activePlan];
        updated[selectedDayIndex] = {
          ...updated[selectedDayIndex],
          menuName: `[AI Iron-Boost] ${updated[selectedDayIndex].menuName.replace("Nasi", "Nasi Beras Merah")}`,
          ironMg: Math.round(updated[selectedDayIndex].ironMg * 1.35 * 10) / 10,
          description: `${updated[selectedDayIndex].description} Ditambahkan ekstrak daun kelor dan Kupang Sidayu segar untuk memaksimalkan penyerapan zat besi.`,
          localIngredientPercent: 98,
        };
        setActivePlan(updated);
      } else if (aiOptimizationMode === "budget") {
        const updated = [...activePlan];
        updated[selectedDayIndex] = {
          ...updated[selectedDayIndex],
          estimatedCostPerPortion: Math.max(10500, updated[selectedDayIndex].estimatedCostPerPortion - 1200),
          savingPerPortion: updated[selectedDayIndex].savingPerPortion + 1200,
          description: `${updated[selectedDayIndex].description} Formulasi disesuaikan memanfaatkan harga grosir komoditas panen raya Gresik.`,
        };
        setActivePlan(updated);
      }
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-sm">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                AI Menu Planner & Commodity Cost Optimizer
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Gemini AI Engine
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekomendasi menu bergizi terstandarisasi Kemenkes berbasis potensi komoditas pangan lokal Gresik
          </p>
        </div>

        {/* AI Parameters Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Fokus Optimasi:</span>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setAiOptimizationMode("balanced")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aiOptimizationMode === "balanced"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Nutrisi Seimbang
            </button>
            <button
              onClick={() => setAiOptimizationMode("iron")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aiOptimizationMode === "iron"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tinggi Zat Besi (Anti-Stunting)
            </button>
            <button
              onClick={() => setAiOptimizationMode("budget")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                aiOptimizationMode === "budget"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Efisiensi APBD
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {activePlan.map((plan, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={plan.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <span className="block text-xs font-bold">{plan.day}</span>
              <span className={`block text-[11px] font-semibold mt-1 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`}>
                {formatRupiah(plan.estimatedCostPerPortion)}
              </span>
              <span className={`block text-[10px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                {plan.caloriesKcal} kcal
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Meal Card Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meal Description & Composition (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100/70 text-amber-900 font-bold text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                {currentMeal.dayIndo}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {currentMeal.localIngredientPercent}% Komoditas Gresik
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
              {currentMeal.menuName}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {currentMeal.description}
            </p>

            {/* Menu Ingredients Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-200/70 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Fish className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Protein Utama (Lokal)
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {currentMeal.mainProtein}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Karbohidrat
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {currentMeal.carbSource}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Sayur & Serat
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {currentMeal.vegetable}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Buah & Tambahan Gizi
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {currentMeal.fruit} + {currentMeal.extraNutrition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Regeneration Trigger */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 text-white">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ingin variasi resep komoditas alternatif untuk hari ini?</span>
            </div>
            <button
              onClick={handleRegenerateWithAI}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Meracik AI..." : "Regenerate AI"}</span>
            </button>
          </div>
        </div>

        {/* Right: Nutrition & Budget Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Nutrition Facts Panel */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Kandungan Nutrisi Terukur (AKG)</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                Standar Kemenkes RI
              </span>
            </h4>

            <div className="space-y-3 text-xs">
              {/* Energi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-600">Energi Total:</span>
                  <strong className="font-bold text-slate-900">{currentMeal.caloriesKcal} kcal</strong>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(currentMeal.caloriesKcal / 600) * 100}%` }} />
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-600">Protein Hewani & Nabati:</span>
                  <strong className="font-bold text-emerald-600">{currentMeal.proteinGrams} gram</strong>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(currentMeal.proteinGrams / 35) * 100}%` }} />
                </div>
              </div>

              {/* Zat Besi (Fe) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-600">Zat Besi (Fe) Anti-Anemia:</span>
                  <strong className="font-bold text-indigo-600">{currentMeal.ironMg} mg</strong>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(currentMeal.ironMg / 10) * 100}%` }} />
                </div>
              </div>

              {/* Kalsium */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-600">Kalsium Pertumbuhan Tulang:</span>
                  <strong className="font-bold text-teal-600">{currentMeal.calciumMg} mg</strong>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(currentMeal.calciumMg / 400) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Budget & APBD Efficiency Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Kalkulasi Biaya APBD
              </span>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                Hemat Rp {currentMeal.savingPerPortion.toLocaleString("id-ID")}/porsi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">Pagu APBD Gresik</span>
                <span className="text-slate-400 line-through font-semibold text-xs">
                  {formatRupiah(currentMeal.apbdStandardCost)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white border border-emerald-700">
                <span className="text-[10px] text-emerald-200 block">Realisasi AI Menu</span>
                <span className="font-extrabold text-sm">
                  {formatRupiah(currentMeal.estimatedCostPerPortion)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-900 mt-2.5 leading-tight">
              ✅ Penghematan diperoleh dari rantai pasok lokal petani & nelayan tambak Gresik tanpa perantara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
