"use client";

import React from "react";
import { Activity } from "lucide-react";
import { ScreeningResult } from "../types";

interface MobileScreeningTabProps {
  childName: string;
  setChildName: (name: string) => void;
  childGender: "L" | "P";
  setChildGender: (g: "L" | "P") => void;
  childAgeMonths: number;
  setChildAgeMonths: (age: number) => void;
  childWeightKg: number;
  setChildWeightKg: (w: number) => void;
  childHeightCm: number;
  setChildHeightCm: (h: number) => void;
  screeningResult: ScreeningResult | null;
  isCalculating: boolean;
  onCalculate: () => void;
}

export const MobileScreeningTab: React.FC<MobileScreeningTabProps> = ({
  childName,
  setChildName,
  childGender,
  setChildGender,
  childAgeMonths,
  setChildAgeMonths,
  childWeightKg,
  setChildWeightKg,
  childHeightCm,
  setChildHeightCm,
  screeningResult,
  isCalculating,
  onCalculate,
}) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-ford-blue">Skrining Gizi &amp; Stunting AI</h3>
            <p className="text-[10px] text-blue-gray">Standar Antropometri WHO &amp; Kemenkes RI</p>
          </div>
        </div>

        <div className="space-y-2 pt-0.5">
          <div>
            <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Nama Lengkap Anak</label>
            <input
              type="text"
              placeholder="Contoh: Muhammad Rayhan"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Jenis Kelamin</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChildGender("L")}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${childGender === "L" ? "bg-white text-ford-blue shadow-2xs" : "text-blue-gray"}`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setChildGender("P")}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${childGender === "P" ? "bg-white text-brand-red shadow-2xs" : "text-blue-gray"}`}
                >
                  Perempuan
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Usia (Bulan)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={childAgeMonths}
                onChange={(e) => setChildAgeMonths(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                value={childWeightKg}
                onChange={(e) => setChildWeightKg(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Tinggi Badan (cm)</label>
              <input
                type="number"
                step="0.5"
                value={childHeightCm}
                onChange={(e) => setChildHeightCm(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onCalculate}
            disabled={isCalculating}
            className="w-full py-2.5 bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
          >
            {isCalculating ? "Menganalisis Kurva WHO..." : "Analisis Status Gizi"}
          </button>
        </div>
      </div>

      {/* Screening Result Card */}
      {screeningResult && (
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-2 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase text-blue-gray">Hasil Evaluasi</span>
              <h4 className="text-[13px] font-bold text-ford-blue">{childName}</h4>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${screeningResult.color}`}>
              {screeningResult.status}
            </span>
          </div>

          <p className="text-[10.5px] text-ford-blue leading-relaxed font-medium bg-[#F8FAFC] p-2 rounded-xl border border-slate-100">
            {screeningResult.description}
          </p>

          <div className="space-y-1">
            <h5 className="text-[10.5px] font-bold text-ford-blue">Rekomendasi Tindakan:</h5>
            <ul className="text-[10px] text-blue-gray space-y-0.5 pl-4 list-disc">
              {screeningResult.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
