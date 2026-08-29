"use client";

import React from "react";
import {
  ScanLine,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  RotateCcw,
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { useScreening } from "@/hooks/useScreening";

export const ScreeningView: React.FC = () => {
  const { step, formData, setFormData, result, startAnalysis, resetScreening } = useScreening();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Scan QR Code
            </h1>
            <span className="text-[10px] bg-blue-100 text-[#1a73e8] px-2.5 py-0.5 rounded-full font-bold">
              Demo Warga
            </span>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Simulasi uji screening tumbuh kembang anak berbasis Computer Vision & GenAI
          </p>
        </div>

        {step === "input" && (
          <button
            onClick={startAnalysis}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-bold text-white bg-[#1a73e8] hover:bg-[#155fc0] shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <ScanLine className="w-4 h-4" />
            <span>Mulai Analisis AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {step === "result" && (
          <button
            onClick={resetScreening}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-bold text-[#071e49] bg-white border border-[#cbd5e1] hover:bg-slate-50 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Uji Data Lain</span>
          </button>
        )}
      </div>

      {/* Step: Input Form */}
      {step === "input" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-[12px] text-[#071e49] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
            <span>
              Form ini mensimulasikan modul penapisan fisik anak berbasis Computer Vision dan Kuesioner GenAI yang digunakan kader Posyandu & orang tua di Gresik.
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-[12px]">
              <div>
                <label className="block font-bold text-[#071e49] mb-1.5">Nama Anak / Balita</label>
                <input
                  type="text"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071e49] mb-1.5">Kecamatan Domisili</label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:outline-none transition-all"
                >
                  {GRESIK_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      Kec. {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#071e49] mb-1.5">Usia (Bulan)</label>
                <input
                  type="number"
                  value={formData.ageMonths}
                  onChange={(e) => setFormData({ ...formData, ageMonths: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071e49] mb-1.5">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071e49] mb-1.5">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071e49] mb-1.5">Simulasi Input Foto Fisik CV</label>
                <div className="border-2 border-dashed border-[#cbd5e1] hover:border-[#1a73e8] rounded-xl p-3 text-center bg-[#f8fafc] cursor-pointer flex items-center justify-center gap-2 text-slate-600 h-[46px] transition-colors">
                  <Camera className="w-4 h-4 text-[#1a73e8]" />
                  <span className="font-semibold text-[11px]">Foto Postur Terlampir (Demo)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Analyzing */}
      {step === "analyzing" && (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-[#1a73e8] animate-pulse">
              <ScanLine className="w-10 h-10 animate-spin" />
            </div>
            <div>
              <h3 className="font-black text-[18px] text-[#071e49]">
                Memproses Analisis Antropometri & Multi-modal AI...
              </h3>
              <p className="text-[13px] text-[#64748b] mt-1.5 max-w-md mx-auto leading-relaxed">
                Mencocokkan Z-Score WHO Kemenkes RI, indeks mikronutrien, dan rekomendasi komoditas pangan pasar Gresik.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-[16px] text-amber-950">{result.diagnosis}</h3>
                  <p className="text-[13px] text-amber-800 mt-0.5 leading-relaxed">
                    Z-Score TB/U: {result.zScoreHeightForAge} SD (Di bawah kurva baku WHO untuk usia balita).
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-lg bg-amber-200 text-amber-900 shrink-0 self-start">
                Prioritas Intervensi
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-6 space-y-4">
            <h4 className="font-bold text-[14px] text-[#071e49] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1a73e8]" />
              <span>Rekomendasi AI Intervensi Gizi Lokal Gresik</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
              {result.localFoodRecommendations.map((food, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#1a73e8] shrink-0 mt-0.5" />
                  <span className="text-[#071e49] font-medium leading-relaxed">
                    <strong>{food.foodName} ({food.origin}):</strong> {food.benefits}
                  </span>
                </div>
              ))}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <span className="text-slate-800 font-medium leading-relaxed">
                  <strong>Rujukan Pelayanan Terdekat:</strong> {result.posyanduReferral} untuk suplementasi Vitamin A & pendampingan gizi MBG.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
