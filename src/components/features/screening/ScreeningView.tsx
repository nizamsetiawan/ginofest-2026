"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  ScanLine,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Utensils,
  Clock,
  Building2,
  BadgeCheck,
  RefreshCw,
  Search,
  Check,
  Zap,
  Mail,
  Phone,
  Flame,
  ShieldCheck,
  History,
  FileText,
} from "lucide-react";
import {
  recordQrClaimToFirestore,
  fetchQrClaimsFromFirestore,
  QrClaimRecord,
} from "@/services/firebase-service";

interface DecodedPayload {
  claimId: string;
  type?: string;
  version?: string;
  issuedAt?: string;
  expiresAt?: string;
  beneficiary?: {
    name: string;
    email: string;
    phone?: string;
    district?: string;
  };
  menu?: {
    id?: string;
    name: string;
    kalori: number;
    porsi?: string;
    program?: string;
  };
  program?: {
    name?: string;
    issuer?: string;
    year?: number;
  };
  status?: string;
}

// Preset Demo Payloads for 1-Click Fast Verification Testing
const DEMO_PAYLOADS = [
  {
    title: "Klaim Warga Kebomas — Nasi Ayam Kari",
    payload: JSON.stringify({
      claimId: `MBG-${Date.now()}-AK882`,
      type: "MBG_FOOD_CLAIM",
      version: "1.0",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      beneficiary: {
        name: "Nizam Setiawan",
        email: "nizamsetiawan15@gmail.com",
        phone: "0812-3456-7890",
        district: "Kebomas",
      },
      menu: {
        id: "menu_ayam_kari",
        name: "Nasi Ayam Kari & Sayur Bening (Tinggi Protein & Zat Besi)",
        kalori: 680,
        porsi: "1x Makan Siang",
        program: "Makan Bergizi Gratis",
      },
      program: {
        name: "Ginofest 2026",
        issuer: "SPPG Kemenkes RI - Dinkes Gresik",
        year: 2026,
      },
      status: "VALID",
    }),
  },
  {
    title: "Klaim Warga Manyar — Nasi Bandeng Bakar Madu",
    payload: JSON.stringify({
      claimId: `MBG-${Date.now()}-BD994`,
      type: "MBG_FOOD_CLAIM",
      version: "1.0",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      beneficiary: {
        name: "Siti Rahmawati",
        email: "siti.rahmawati@gmail.com",
        phone: "0857-9876-5432",
        district: "Manyar",
      },
      menu: {
        id: "menu_bandeng_bakar",
        name: "Nasi Bandeng Bakar Madu & Tumis Kangkung (Kaya Omega-3)",
        kalori: 720,
        porsi: "1x Makan Siang",
        program: "Makan Bergizi Gratis",
      },
      program: {
        name: "Ginofest 2026",
        issuer: "SPPG Kemenkes RI - Dinkes Gresik",
        year: 2026,
      },
      status: "VALID",
    }),
  },
];

export const ScreeningView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");
  const [scanMethod, setScanMethod] = useState<"camera" | "demo" | "input">("demo");
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [decodedData, setDecodedData] = useState<DecodedPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // History state
  const [historyList, setHistoryList] = useState<QrClaimRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    const res = await fetchQrClaimsFromFirestore();
    if (res.success) {
      setHistoryList(res.data);
    }
    setIsLoadingHistory(false);
  };

  const handleProcessPayload = (rawString: string) => {
    setErrorMessage("");
    setVerificationSuccess(false);
    try {
      const parsed = JSON.parse(rawString.trim()) as DecodedPayload;
      if (!parsed.claimId || !parsed.beneficiary) {
        setErrorMessage("Format payload QR Code tidak valid untuk program MBG.");
        return;
      }
      setDecodedData(parsed);
    } catch (e) {
      setErrorMessage("Teks/QR tidak dapat diurai. Pastikan format JSON QR Code MBG valid.");
    }
  };

  const handleSimulateScanCamera = () => {
    setIsScanning(true);
    setErrorMessage("");
    setTimeout(() => {
      setIsScanning(false);
      // Process first demo payload
      handleProcessPayload(DEMO_PAYLOADS[0].payload);
    }, 1800);
  };

  const handleConfirmVerification = async () => {
    if (!decodedData) return;
    setIsVerifying(true);
    setErrorMessage("");

    const claimRecord: Omit<QrClaimRecord, "id"> = {
      claimId: decodedData.claimId,
      beneficiaryName: decodedData.beneficiary?.name || "Warga Kebomas",
      beneficiaryEmail: decodedData.beneficiary?.email || "-",
      beneficiaryPhone: decodedData.beneficiary?.phone || "-",
      district: decodedData.beneficiary?.district || "Kebomas",
      menuId: decodedData.menu?.id || "menu_mbg",
      menuName: decodedData.menu?.name || "Nasi Bergizi Kcal",
      calories: decodedData.menu?.kalori || 680,
      porsi: decodedData.menu?.porsi || "1x Makan Siang",
      programName: decodedData.program?.name || "Ginofest 2026",
      verifiedAtIso: new Date().toISOString(),
      verifiedBy: "Staf SPPG Pemkab Gresik",
      status: "VERIFIED",
    };

    const res = await recordQrClaimToFirestore(claimRecord);
    setIsVerifying(false);

    if (res.success) {
      setVerificationSuccess(true);
    } else {
      setErrorMessage(res.error || "Gagal mencatat verifikasi ke Firestore.");
    }
  };

  const resetScanner = () => {
    setDecodedData(null);
    setVerificationSuccess(false);
    setErrorMessage("");
    setManualInput("");
  };

  const filteredHistory = historyList.filter(
    (item) =>
      item.beneficiaryName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.claimId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.district && item.district.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2C3968] to-[#1E2950] text-light-sea-green flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-black text-[#2C3968] tracking-tight">
                  Pusat Pemindaian & Verifikasi QR Code MBG
                </h1>
                <span className="text-[10px] bg-green-02/20 text-ford-blue border border-green-02/40 px-2.5 py-0.5 rounded-full font-bold">
                  SPPG Kemenkes RI
                </span>
              </div>
              <p className="text-[12px] text-[#64748b]">
                Pemindaian & validasi penerimaan porsi Makan Bergizi Gratis warga Kabupaten Gresik
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === "scan"
                ? "bg-white text-ford-blue shadow-2xs"
                : "text-slate-600 hover:text-ford-blue"
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>Pindai QR</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-ford-blue shadow-2xs"
                : "text-slate-600 hover:text-ford-blue"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Verifikasi</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: PEMINDAIAN QR ─── */}
      {activeTab === "scan" && (
        <div className="space-y-6">
          {!decodedData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Scanner Method Selection & Action */}
              <div className="lg:col-span-7 space-y-4">
                {/* Method selector pills */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-[11px] font-bold">
                  <button
                    onClick={() => setScanMethod("demo")}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      scanMethod === "demo"
                        ? "bg-ford-blue text-white shadow-2xs"
                        : "text-slate-600 hover:text-ford-blue"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-green-02" />
                    <span>Pindai Instan (Demo 1-Click)</span>
                  </button>

                  <button
                    onClick={() => setScanMethod("camera")}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      scanMethod === "camera"
                        ? "bg-ford-blue text-white shadow-2xs"
                        : "text-slate-600 hover:text-ford-blue"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-light-sea-green" />
                    <span>Kamera Web Scanner</span>
                  </button>

                  <button
                    onClick={() => setScanMethod("input")}
                    className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      scanMethod === "input"
                        ? "bg-ford-blue text-white shadow-2xs"
                        : "text-slate-600 hover:text-ford-blue"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Input Manual JSON</span>
                  </button>
                </div>

                {/* Mode 1: Fast Demo 1-Click */}
                {scanMethod === "demo" && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-[12px] text-ford-blue">
                      <Sparkles className="w-5 h-5 text-light-sea-green shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Mode Simulasi Instan SPPG:</strong>
                        <p className="mt-0.5 leading-relaxed text-slate-600">
                          Klik salah satu sampel QR Code Klaim Warga di bawah ini untuk mensimulasikan hasil pemindaian langsung oleh staf.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {DEMO_PAYLOADS.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleProcessPayload(item.payload)}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-light-sea-green bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-ford-blue text-green-02 flex items-center justify-center font-bold shrink-0">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] text-ford-blue group-hover:text-light-sea-green transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                Verified Payload • MBG Kemenkes 2026
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1.5 rounded-xl bg-ford-blue text-white group-hover:bg-light-sea-green group-hover:text-ford-blue text-[11px] font-bold transition-all shadow-2xs">
                            Pindai QR ini
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mode 2: Camera Stream Simulation */}
                {scanMethod === "camera" && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-center">
                    <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-white p-6 shadow-inner border-4 border-ford-blue">
                      {/* Laser scanner effect */}
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-02 to-transparent shadow-[0_0_15px_#23B5A8] animate-bounce top-1/3"></div>
                      
                      <div className="w-48 h-48 border-2 border-dashed border-green-02/60 rounded-2xl flex items-center justify-center relative bg-white/5">
                        <QrCode className={`w-20 h-20 text-green-02 ${isScanning ? "animate-pulse" : "opacity-80"}`} />
                      </div>

                      <p className="text-[12px] text-slate-300 font-medium mt-4">
                        {isScanning ? "Memindai QR Code..." : "Arahkan QR Code Warga ke Frame Kamera"}
                      </p>
                    </div>

                    <button
                      onClick={handleSimulateScanCamera}
                      disabled={isScanning}
                      className="w-full py-3.5 rounded-2xl bg-ford-blue hover:bg-ford-blue/90 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ScanLine className={`w-4 h-4 text-green-02 ${isScanning ? "animate-spin" : ""}`} />
                      <span>{isScanning ? "Proses Pemindaian AI..." : "Simulasikan Kamera Memindai QR"}</span>
                    </button>
                  </div>
                )}

                {/* Mode 3: Manual JSON Input */}
                {scanMethod === "input" && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <label className="block font-bold text-[12px] text-ford-blue mb-1.5">
                        Tempel / Paste Payload JSON QR Code Warga
                      </label>
                      <textarea
                        rows={6}
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder='{"claimId":"MBG-...", "beneficiary":{...}, "menu":{...}}'
                        className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-[11px] text-ford-blue focus:bg-white focus:ring-2 focus:ring-light-sea-green/30 focus:border-light-sea-green focus:outline-none transition-all"
                      ></textarea>
                    </div>

                    <button
                      onClick={() => handleProcessPayload(manualInput)}
                      disabled={!manualInput.trim()}
                      className="w-full py-3 rounded-2xl bg-ford-blue hover:bg-ford-blue/90 text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-02" />
                      <span>Dekode Payload QR</span>
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] font-medium flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Information Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gradient-to-br from-[#131C38] via-[#1E2950] to-[#2C3968] p-6 rounded-3xl text-white shadow-md space-y-4 border border-ford-blue/60 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-green-02/10 blur-2xl pointer-events-none"></div>

                  <div className="flex items-center gap-2 text-green-02 text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Petunjuk Staf SPPG</span>
                  </div>

                  <h3 className="font-black text-[16px] text-white leading-snug">
                    Sistem Validasi Distribusi Makanan Bergizi Gratis (MBG)
                  </h3>

                  <ul className="space-y-2.5 text-[11px] text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-02 font-bold mt-0.5">•</span>
                      <span>QR Code secara otomatis dibuat oleh aplikasi warga setelah skrining nutrisi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-02 font-bold mt-0.5">•</span>
                      <span>Pastikan nama warga & rekomendasi porsi sesuai dengan paket yang disiapkan dapur SPPG.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-02 font-bold mt-0.5">•</span>
                      <span>Tekan tombol verifikasi untuk mencatat distribusi secara real-time ke audit audit trail Pemkab Gresik.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* ─── DECODED QR RESULT DISPLAY ─── */
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Back / Reset button */}
              <button
                onClick={resetScanner}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-ford-blue bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-light-sea-green" />
                <span>Pindai QR Lain</span>
              </button>

              {/* Success Stamping Banner */}
              {verificationSuccess && (
                <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-500 shadow-md text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <BadgeCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-[16px] text-emerald-950">
                        BERHASIL DIVERIFIKASI & DIDISTRIBUSIKAN!
                      </h3>
                      <p className="text-[12px] text-emerald-800 font-medium mt-0.5">
                        Porsi MBG telah dicatat atas nama <strong>{decodedData.beneficiary?.name}</strong>.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-mono font-bold text-[10px] self-start sm:self-auto border border-emerald-300">
                    STATUS: VERIFIED
                  </span>
                </div>
              )}

              {/* Main Card: QR Details */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Card Top Banner */}
                <div className="bg-gradient-to-r from-ford-blue to-[#1E2950] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-green-02/20 text-green-02 text-[10px] font-bold border border-green-02/40">
                        {decodedData.program?.name || "Ginofest 2026"}
                      </span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        ID: {decodedData.claimId}
                      </span>
                    </div>
                    <h3 className="text-[17px] font-black text-white">
                      Rincian Dokumen Verifikasi Klaim MBG
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>QR Valid & Legal</span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Grid 2 Columns: Warga Info & Menu Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Warga Card */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                      <div className="flex items-center gap-2 text-ford-blue border-b border-slate-200 pb-2.5">
                        <User className="w-4 h-4 text-light-sea-green" />
                        <h4 className="font-bold text-[13px]">Identitas Penerima (Warga)</h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-ford-blue text-white font-bold text-[14px] flex items-center justify-center shrink-0 shadow-2xs">
                          {(decodedData.beneficiary?.name || "W").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-[14px] text-ford-blue">
                            {decodedData.beneficiary?.name || "Warga Kebomas"}
                          </h5>
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-02/20 text-ford-blue border border-green-02/40">
                            Kecamatan {decodedData.beneficiary?.district || "Kebomas"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] font-medium text-slate-600 pt-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-ford-blue shrink-0" />
                          <span>{decodedData.beneficiary?.email || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-ford-blue shrink-0" />
                          <span>{decodedData.beneficiary?.phone || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Card */}
                    <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3.5">
                      <div className="flex items-center gap-2 text-ford-blue border-b border-emerald-200/80 pb-2.5">
                        <Utensils className="w-4 h-4 text-light-sea-green" />
                        <h4 className="font-bold text-[13px]">Paket Rekomendasi Nutrisi</h4>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-bold text-[13.5px] text-ford-blue leading-snug">
                          {decodedData.menu?.name || "Nasi Bergizi Kcal"}
                        </h5>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-ford-blue text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                            <Flame className="w-3 h-3 text-brand-orange" />
                            <span>{decodedData.menu?.kalori || 680} Kalori</span>
                          </span>

                          <span className="px-2.5 py-1 rounded-lg bg-white text-ford-blue text-[11px] font-bold border border-slate-200 shadow-2xs">
                            {decodedData.menu?.porsi || "1x Makan Siang"}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10.5px] text-slate-500 font-medium">
                        Diterbitkan oleh: <strong>{decodedData.program?.issuer || "SPPG Kemenkes RI"}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Timestamp & Expiry Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-ford-blue" />
                      <span>
                        Waktu Diterbitkan:{" "}
                        <strong>
                          {decodedData.issuedAt
                            ? new Date(decodedData.issuedAt).toLocaleString("id-ID")
                            : "Terbaru"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-ford-blue font-bold">
                      <ShieldCheck className="w-4 h-4 text-light-sea-green" />
                      <span>Berlaku s/d 6 Jam Sejak Diterbitkan</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {!verificationSuccess ? (
                    <button
                      onClick={handleConfirmVerification}
                      disabled={isVerifying}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#35CBC3] to-light-sea-green hover:from-[#22B5AC] hover:to-light-sea-green text-ford-blue font-black text-[14px] flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-ford-blue" />
                      )}
                      <span>
                        {isVerifying
                          ? "Mencatat Verifikasi..."
                          : "Konfirmasi Verifikasi & Catat Penyerahan Porsi MBG"}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={resetScanner}
                        className="px-6 py-3 rounded-2xl bg-ford-blue text-white font-bold text-[12px] flex items-center gap-2 hover:bg-ford-blue/90 shadow-xs cursor-pointer"
                      >
                        <ScanLine className="w-4 h-4 text-green-02" />
                        <span>Pindai QR Warga Berikutnya</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: RIWAYAT VERIFIKASI KLAIM ─── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Top Bar: Search & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari nama warga, kecamatan, atau ID klaim..."
                className="w-full pl-9 pr-4 py-2 text-[12px] bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-light-sea-green/30 focus:border-light-sea-green focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-ford-blue bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ford-blue ${isLoadingHistory ? "animate-spin" : ""}`} />
              <span>Muat Ulang</span>
            </button>
          </div>

          {/* History List */}
          {isLoadingHistory ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-light-sea-green animate-spin mx-auto" />
              <p className="text-[13px] font-bold text-ford-blue">Mengambil Riwayat Verifikasi QR Code...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-[14px] text-ford-blue">Belum Ada Riwayat Verifikasi</h4>
              <p className="text-[12px] text-slate-500 max-w-sm mx-auto">
                Klaim QR Code MBG warga yang diverifikasi oleh staf akan tercantum di sini secara otomatis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id || item.claimId}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[14px] text-ford-blue">
                          {item.beneficiaryName}
                        </span>
                        {item.district && (
                          <span className="px-2 py-0.5 rounded-md bg-green-02/20 text-ford-blue text-[10px] font-bold border border-green-02/40">
                            Kec. {item.district}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {item.claimId}
                        </span>
                      </div>

                      <p className="text-[12px] text-slate-600 font-medium mt-1">
                        {item.menuName} ({item.calories || 680} kcal)
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                        <span>Waktu Verifikasi: {new Date(item.verifiedAtIso).toLocaleString("id-ID")}</span>
                        <span>• Staf: {item.verifiedBy || "SPPG Pemkab Gresik"}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 self-start sm:self-auto shrink-0">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
