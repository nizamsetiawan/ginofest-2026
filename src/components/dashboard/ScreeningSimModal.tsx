"use client";

import React, { useState } from "react";
import { 
  X, 
  ScanLine, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Heart
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface ScreeningSimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreeningSimModal: React.FC<ScreeningSimModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  const [childName, setChildName] = useState("Ahmad Fauzi");
  const [ageMonths, setAgeMonths] = useState(36);
  const [heightCm, setHeightCm] = useState(88.5);
  const [weightKg, setWeightKg] = useState(11.2);
  const [districtId, setDistrictId] = useState("manyar");
  const [symptoms, setSymptoms] = useState<string[]>(["Pucat pada kuku & kelopak mata"]);

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    setStep("analyzing");
    setTimeout(() => {
      setStep("result");
    }, 2000);
  };

  const handleReset = () => {
    setStep("input");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/60">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Simulasi Uji Screening Tumbuh Kembang (CV + GenAI)
                <span className="text-[10px] bg-teal-100/70 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                  Demo Warga
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Penapisan awal indikator antropometri & defisiensi nutrisi anak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === "input" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Form ini mensimulasikan modul penapisan fisik anak berbasis Computer Vision dan Kuesioner GenAI yang digunakan kader Posyandu & orang tua di Gresik.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Anak / Balita</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kecamatan Domisili</label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {GRESIK_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        Kec. {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usia (Bulan)</label>
                  <input
                    type="number"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Simulasi Input Foto Fisik CV</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-2.5 text-center bg-slate-50 cursor-pointer flex items-center justify-center gap-2 text-slate-600">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-[11px]">Foto Postur Terlampir (Demo)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 animate-pulse">
                <ScanLine className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  Memproses Analisis Antropometri & Multi-modal AI...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Mencocokkan Z-Score WHO Kemenkes RI, indeks mikronutrien, dan rekomendasi komoditas pangan pasar Gresik.
                </p>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-amber-950 text-sm">
                        Indikasi: Berisiko Stunting Ringan (Mild Growth Faltering)
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Z-Score TB/U: -2.1 SD (Di bawah kurva baku WHO untuk usia 36 bulan).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Prioritas Intervensi
                  </span>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Rekomendasi AI Intervensi Gizi Lokal Gresik:
                </h5>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-emerald-950 font-medium">
                      <strong>Asupan Kupang Segar Sidayu:</strong> Tinggi zat besi (15.6 mg/100g) untuk mengatasi defisiensi mikronutrien dan anemia.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-blue-950 font-medium">
                      <strong>Ikan Bandeng Cabut Duri Manyar:</strong> Sumber protein berkualitas tinggi & omega-3 untuk stimulasi pertumbuhan linier tulang.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-medium">
                      <strong>Kunjungan Posyandu Terdekat:</strong> Rujuk ke Posyandu Manyar untuk suplementasi Vitamin A & pendampingan gizi MBG.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step === "input" ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Mulai Analisis AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : step === "result" ? (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Uji Data Lain
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition-all"
              >
                Selesai
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
