"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Camera,
  Utensils,
  MessageSquare,
  Sparkles,
  Search,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Heart,
  Baby,
  Activity,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Info,
  ArrowLeft,
  RefreshCw,
  Award
} from "lucide-react";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import {
  saveComplaintToFirestore,
  fetchComplaintsFromFirestore,
  ComplaintRecord,
} from "@/services/firebase-service";

type MobileTab = "home" | "screening" | "menu" | "complaint" | "ai_chat";

export const CitizenMobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [selectedDistrict, setSelectedDistrict] = useState("Kebomas");

  // AI Screening Form State
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState<"L" | "P">("L");
  const [childAgeMonths, setChildAgeMonths] = useState<number>(24);
  const [childWeightKg, setChildWeightKg] = useState<number>(11.5);
  const [childHeightCm, setChildHeightCm] = useState<number>(85.0);
  const [screeningResult, setScreeningResult] = useState<null | {
    status: "Normal" | "Beresiko Stunting" | "Gizi Kurang" | "Sangat Baik";
    score: number;
    color: string;
    description: string;
    recommendations: string[];
    localFoods: string[];
  }>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Complaint Form State
  const [complaintSender, setComplaintSender] = useState("");
  const [complaintPhone, setComplaintPhone] = useState("");
  const [complaintCategory, setComplaintCategory] = useState("Kualitas Menu MBG");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  // Quick AI Screening Calculation (WHO Standard Simulation)
  const handleCalculateNutrition = () => {
    if (!childName.trim()) {
      alert("Silakan masukkan nama anak.");
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      // Simplified WHO height-for-age standard
      const expectedHeight = 75 + childAgeMonths * 0.6;
      const heightDiff = childHeightCm - expectedHeight;

      let resultStatus: "Normal" | "Beresiko Stunting" | "Gizi Kurang" | "Sangat Baik" = "Normal";
      let color = "text-emerald-700 bg-emerald-50 border-emerald-200";
      let desc = "Tumbuh kembang anak sesuai standar usia WHO dan Kemenkes RI.";
      let recommendations = [
        "Lanjutkan pemberian makanan gizi seimbang kaya protein hewani.",
        "Rutin timbang dan ukur tinggi badan di Posyandu setiap bulan.",
        "Pastikan asupan vitamin D dan kalsium harian tercukupi."
      ];
      let localFoods = ["Ikan Bandeng Gresik", "Telur Ayam", "Tempe Kedelai Lokal", "Sayur Bayam"];

      if (heightDiff < -4) {
        resultStatus = "Beresiko Stunting";
        color = "text-red-700 bg-red-50 border-red-200";
        desc = "Tinggi badan anak berada di bawah kurva pertumbuhan standar. Perlu intervensi protein hewani intensif.";
        recommendations = [
          "Segera konsultasikan dengan petugas gizi di Puskesmas kecamatan setempat.",
          "Tingkatkan konsumsi 2 porsi protein hewani setiap hari (Ikan, Telur, Ayam).",
          "Ikuti program Pemberian Makanan Tambahan (PMT) & MBG terpadu."
        ];
        localFoods = ["Ikan Kerapu / Bandeng Segar", "Hati Ayam", "Telur Puyuh", "Kacang Hijau"];
      } else if (childWeightKg < 9.5 && childAgeMonths >= 24) {
        resultStatus = "Gizi Kurang";
        color = "text-amber-700 bg-amber-50 border-amber-200";
        desc = "Berat badan anak perlu ditingkatkan agar seimbang dengan laju pertumbuhannya.";
        recommendations = [
          "Tambahkan lemak sehat seperti minyak kelapa/margarin pada makanan utama.",
          "Beri camilan padat kalori bergizi 2 kali sehari.",
          "Periksa status imunisasi dan asupan zat besi."
        ];
      }

      setScreeningResult({
        status: resultStatus,
        score: Math.min(100, Math.max(40, Math.round(85 + heightDiff * 2))),
        color,
        description: desc,
        recommendations,
        localFoods,
      });
      setIsCalculating(false);
    }, 600);
  };

  // Submit Complaint to Firestore
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSender.trim() || !complaintMessage.trim()) return;

    setIsSubmittingComplaint(true);
    const res = await saveComplaintToFirestore({
      senderName: complaintSender,
      senderContact: complaintPhone,
      category: complaintCategory,
      message: complaintMessage,
      status: "baru",
      createdAtIso: new Date().toISOString(),
    });

    setIsSubmittingComplaint(false);
    if (res.success) {
      setSubmittedTicket(res.docId || "TKT-" + Date.now().toString().slice(-6));
      setComplaintMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center selection:bg-[#1a73e8] selection:text-white">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen flex flex-col shadow-2xl relative pb-20 border-x border-slate-200">
        
        {/* ═══ TOP APP BAR ═══ */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <img src="/logo_app.svg" alt="Kcal" className="w-7 h-7 rounded-lg shadow-2xs" />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-black text-[#071e49] tracking-tight">Kcal Warga</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-50 text-[#1a73e8] border border-blue-200">Gresik</span>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-2.5 h-2.5 text-[#1a73e8]" />
                <span>Kecamatan {selectedDistrict}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-[#1a73e8]"
            >
              {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </header>

        {/* ═══ MAIN TAB CONTENT ═══ */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          
          {/* TAB 1: BERANDA WARGA */}
          {activeTab === "home" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Greeting Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#071e49] to-[#1a73e8] text-white space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-blue-100 backdrop-blur-xs">
                    Program MBG Gresik 2026
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-[16px] font-black leading-tight">Pantau Tumbuh Kembang & Menu Gizi Anak</h2>
                  <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                    Akses menu MBG harian, skrining stunting instan berbasis AI, dan sampaikan aspirasi layanan Anda.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("screening")}
                  className="w-full py-2 bg-white text-[#071e49] hover:bg-blue-50 font-bold text-[12px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>Mulai Cek Status Gizi Anak</span>
                </button>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <button
                  onClick={() => setActiveTab("screening")}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1.5 transition-all cursor-pointer flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1a73e8] flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#071e49] leading-tight">Cek Gizi AI</span>
                </button>

                <button
                  onClick={() => setActiveTab("menu")}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1.5 transition-all cursor-pointer flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#071e49] leading-tight">Menu MBG</span>
                </button>

                <button
                  onClick={() => setActiveTab("complaint")}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1.5 transition-all cursor-pointer flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#071e49] leading-tight">Aduan</span>
                </button>

                <button
                  onClick={() => setActiveTab("ai_chat")}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-[#1a73e8] shadow-2xs space-y-1.5 transition-all cursor-pointer flex flex-col items-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#071e49] leading-tight">Tanya AI</span>
                </button>
              </div>

              {/* Menu Hari Ini Preview */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-[#1a73e8]" />
                    <h3 className="text-[13px] font-bold text-[#071e49]">Menu MBG Hari Ini</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    680 kkal
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <h4 className="text-[12px] font-bold text-[#071e49]">Nasi Pulen + Bandeng Bakar Madu Gresik</h4>
                  <p className="text-[11px] text-slate-600">Sayur Bening Bayam Jagung Manis + Tempe Bacem + Buah Jeruk Segar</p>
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-medium text-slate-500">
                    <span>Protein: <strong>26.4g</strong></span>
                    <span>•</span>
                    <span>Kalsium: <strong>140mg</strong></span>
                    <span>•</span>
                    <span>Zat Besi: <strong>3.2mg</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("menu")}
                  className="w-full py-1.5 text-[11px] font-bold text-[#1a73e8] hover:bg-blue-50 rounded-lg transition-colors text-center"
                >
                  Lihat Jadwal Menu Selengkapnya →
                </button>
              </div>

              {/* Tips Gizi & Edukasi Singkat */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-[12px] font-bold">Pesan Gizi Pemkab Gresik</h4>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  "Konsumsi 1 ekor ikan bandeng atau 1 butir telur setiap hari terbukti efektif mencukupi kebutuhan asam amino esensial untuk mencegah stunting pada 1.000 Hari Pertama Kehidupan (HPK)."
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AI CEK STUNTING MANDIRI */}
          {activeTab === "screening" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1a73e8] flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#071e49]">Skrining Gizi & Stunting AI</h3>
                    <p className="text-[11px] text-slate-500">Standar Antropometri WHO & Kemenkes RI</p>
                  </div>
                </div>

                {/* Form Input */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Lengkap Anak</label>
                    <input
                      type="text"
                      placeholder="Contoh: Muhammad Rayhan"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setChildGender("L")}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${childGender === "L" ? "bg-white text-[#1a73e8] shadow-xs" : "text-slate-500"}`}
                        >
                          Laki-laki
                        </button>
                        <button
                          type="button"
                          onClick={() => setChildGender("P")}
                          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${childGender === "P" ? "bg-white text-pink-600 shadow-xs" : "text-slate-500"}`}
                        >
                          Perempuan
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Usia (Bulan)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={childAgeMonths}
                        onChange={(e) => setChildAgeMonths(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Berat Badan (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={childWeightKg}
                        onChange={(e) => setChildWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Tinggi Badan (cm)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={childHeightCm}
                        onChange={(e) => setChildHeightCm(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateNutrition}
                    disabled={isCalculating}
                    className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menganalisis Kurva Pertumbuhan...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Analisis Status Gizi Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Screening Result Card */}
              {screeningResult && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Hasil Evaluasi</span>
                      <h4 className="text-[14px] font-black text-[#071e49]">{childName} ({childAgeMonths} Bulan)</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${screeningResult.color}`}>
                      {screeningResult.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {screeningResult.description}
                  </p>

                  <div className="space-y-1.5">
                    <h5 className="text-[11px] font-bold text-[#071e49] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rekomendasi Tindakan:</span>
                    </h5>
                    <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc">
                      {screeningResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold text-[#071e49] mb-1.5">Pangan Lokal Gresik Direkomendasikan:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {screeningResult.localFoods.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1a73e8] text-[10px] font-bold border border-blue-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MENU MBG HARIAN */}
          {activeTab === "menu" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-[14px] font-black text-[#071e49]">Menu Makan Bergizi Gratis (MBG)</h3>
                <p className="text-[11px] text-slate-500">Jadwal menu standar bergizi seimbang di sekolah wilayah Kec. {selectedDistrict}</p>
              </div>

              {/* Day Cards */}
              {[
                { day: "Senin", menu: "Nasi Pulen + Bandeng Bakar Madu Gresik", side: "Sayur Bening Bayam + Tempe Bacem + Jeruk", cal: "680 kkal", prot: "26.4g" },
                { day: "Selasa", menu: "Nasi Gurih + Ayam Suwir Bumbu Kuning", side: "Tumis Buncis Jagung + Tahu Kukus + Semangka", cal: "695 kkal", prot: "28.1g" },
                { day: "Rabu", menu: "Nasi Putih + Rolade Ikan Kerapu Segar", side: "Sayur Sop Wortel Kentang + Telur Puyuh + Pisang", cal: "675 kkal", prot: "27.5g" },
                { day: "Kamis", menu: "Nasi Uduk + Telur Dadar Sayur Tebal", side: "Capcay Sayuran Segar + Tempe Mendoan + Melon", cal: "660 kkal", prot: "24.8g" },
                { day: "Jumat", menu: "Nasi Putih + Semur Daging Sapi Lokal", side: "Sayur Lodeh Labu Siam + Kerupuk Udang + Pepaya", cal: "710 kkal", prot: "29.2g" },
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#071e49] text-white text-[10px] font-bold">
                      {m.day}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {m.cal} • Prot: {m.prot}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-bold text-[#071e49]">{m.menu}</h4>
                  <p className="text-[11px] text-slate-500">{m.side}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: ADUAN & ASPIRASI */}
          {activeTab === "complaint" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#071e49]">Pusat Aduan & Aspirasi MBG</h3>
                    <p className="text-[11px] text-slate-500">Terhubung langsung ke Tim Evaluasi Kabupaten</p>
                  </div>
                </div>

                {submittedTicket ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-[13px] font-bold text-emerald-800">Aduan Berhasil Terkirim!</h4>
                    <p className="text-[11px] text-emerald-700">
                      Nomor Tiket Anda: <strong className="font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">{submittedTicket}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Laporan Anda telah tercatat di dashboard resmi Super Admin Pemkab Gresik dan akan segera ditindaklanjuti.
                    </p>
                    <button
                      onClick={() => setSubmittedTicket(null)}
                      className="mt-2 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      Kirim Aduan Lainnya
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComplaint} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Pelapor / Orang Tua</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ibu Siti Rahmawati"
                        value={complaintSender}
                        onChange={(e) => setComplaintSender(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">No. WhatsApp / Kontak</label>
                      <input
                        type="text"
                        placeholder="Contoh: 08123456789"
                        value={complaintPhone}
                        onChange={(e) => setComplaintPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Kategori Laporan</label>
                      <select
                        value={complaintCategory}
                        onChange={(e) => setComplaintCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      >
                        <option value="Kualitas Menu MBG">Kualitas & Rasa Makanan MBG</option>
                        <option value="Ketepatan Waktu">Keterlambatan Pengiriman Menu</option>
                        <option value="Porsi Makanan">Porsi Makanan Kurang Sesuai</option>
                        <option value="Layanan Posyandu">Layanan Posyandu & Faskes</option>
                        <option value="Saran & Masukan">Saran & Apresiasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Isi Pesan / Keluhan</label>
                      <textarea
                        rows={3}
                        placeholder="Tuliskan rincian keluhan, nama sekolah anak, atau saran perbaikan..."
                        value={complaintMessage}
                        onChange={(e) => setComplaintMessage(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[12px] font-medium text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingComplaint}
                      className="w-full py-2.5 bg-[#071e49] hover:bg-[#0d2a63] text-white text-[12px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingComplaint ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim Laporan ke Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Laporan Resmi</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TANYA K-BOT (AI GIZI) */}
          {activeTab === "ai_chat" && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#071e49]">K-Bot Asisten Gizi AI</h3>
                  <p className="text-[11px] text-slate-500">Tanya seputar MPASI, nutrisi balita & pangan lokal</p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[12px] leading-relaxed">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                  <span className="font-bold">Halo Bunda! 🤖</span> Saya K-Bot, asisten gizi cerdas Kabupaten Gresik. Ada yang bisa saya bantu terkait tumbuh kembang atau pola makan si kecil?
                </div>
              </div>

              {/* Sample Quick Questions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Pertanyaan Populer:</span>
                {[
                  "Ikan apa yang paling tinggi protein di Gresik untuk balita?",
                  "Bagaimana cara mengatasi anak yang susah makan sayur?",
                  "Kapan jadwal timbang Posyandu di kecamatan saya?",
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => alert(`Pertanyaan: "${q}"\n\nJawaban K-Bot: Ikan Bandeng dan Kerapu Gresik memiliki kandungan asam lemak Omega-3 dan Protein tinggi 20g/100g yang sangat baik untuk kecerdasan otak balita.`)}
                    className="w-full text-left p-2 rounded-xl bg-white border border-slate-200 hover:border-[#1a73e8] text-[11px] text-slate-700 font-medium transition-colors shadow-2xs"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* ═══ BOTTOM NAVIGATION BAR (NATIVE MOBILE FEEL) ═══ */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around z-50 shadow-lg">
          {[
            { id: "home", label: "Beranda", icon: Home },
            { id: "screening", label: "Cek Gizi", icon: Activity },
            { id: "menu", label: "Menu MBG", icon: Utensils },
            { id: "complaint", label: "Aduan", icon: MessageSquare },
            { id: "ai_chat", label: "Tanya AI", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MobileTab)}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? "text-[#1a73e8] font-black" : "text-slate-400 font-semibold hover:text-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
