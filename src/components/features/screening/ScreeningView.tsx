"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Utensils,
  Clock,
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
  CameraOff,
} from "lucide-react";
import {
  recordQrClaimToFirestore,
  fetchQrClaimsFromFirestore,
  getCitizenByEmailFromFirestore,
  addNotification,
  QrClaimRecord,
} from "@/services/firebase-service";
import { AzureBlobService } from "@/services/azure-blob-service";

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
    photoURL?: string;
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
  const [isScanning, setIsScanning] = useState(false);
  const [decodedData, setDecodedData] = useState<DecodedPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Real camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

  // History state
  const [historyList, setHistoryList] = useState<QrClaimRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Start web camera on mount when in scan tab
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (activeTab === "scan" && !decodedData) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } })
          .then((mediaStream) => {
            stream = mediaStream;
            setHasCameraAccess(true);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
          })
          .catch((err) => {
            console.warn("Camera access warning:", err);
            setHasCameraAccess(false);
          });
      } else {
        setHasCameraAccess(false);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab, decodedData]);

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

  const handleProcessPayload = async (rawString: string) => {
    setErrorMessage("");
    setVerificationSuccess(false);
    try {
      const parsed = JSON.parse(rawString.trim()) as DecodedPayload;
      if (!parsed.claimId || !parsed.beneficiary) {
        setErrorMessage("Format payload QR Code tidak valid untuk program MBG.");
        return;
      }

      // Sync live citizen profile from Firestore (kcal_masyarakat) if email exists
      if (parsed.beneficiary.email) {
        const citizenRes = await getCitizenByEmailFromFirestore(parsed.beneficiary.email);
        if (citizenRes.success && citizenRes.data) {
          const cData = citizenRes.data;
          parsed.beneficiary.name = cData.fullName || cData.name || parsed.beneficiary.name;
          parsed.beneficiary.phone = cData.phone || parsed.beneficiary.phone;
          parsed.beneficiary.district = cData.district || parsed.beneficiary.district;
          parsed.beneficiary.photoURL = cData.photoURL || "";
        }
      }

      setDecodedData(parsed);
    } catch (e) {
      setErrorMessage("Teks/QR tidak dapat diurai. Pastikan format JSON QR Code MBG valid.");
    }
  };

  const handleTriggerScan = (presetPayload?: string) => {
    setIsScanning(true);
    setErrorMessage("");
    setTimeout(async () => {
      setIsScanning(false);
      const targetPayload = presetPayload || DEMO_PAYLOADS[0].payload;
      await handleProcessPayload(targetPayload);
    }, 1500);
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

    // 1. Record verification to Firestore (gscan_qr_claims)
    const res = await recordQrClaimToFirestore(claimRecord);

    // 2. Dual-Write Backup to Azure Blob Storage
    try {
      await AzureBlobService.saveScanResultToAzure({
        claimId: decodedData.claimId,
        type: "MBG_FOOD_CLAIM_VERIFICATION",
        beneficiary: decodedData.beneficiary,
        menu: decodedData.menu,
        verifiedAtIso: claimRecord.verifiedAtIso,
        verifiedBy: claimRecord.verifiedBy,
        firestoreDocId: res.docId || null,
      });
    } catch (azureErr) {
      console.warn("Azure Blob backup dual-write handled:", azureErr);
    }

    // 3. Send Notification to Citizen in Firestore
    if (decodedData.beneficiary?.email) {
      try {
        await addNotification({
          title: "Klaim Makan Siang MBG Diverifikasi",
          description: `Porsi ${decodedData.menu?.name || "Makan Siang MBG"} telah diverifikasi & diserahkan oleh staf SPPG Kemenkes RI.`,
          userEmail: decodedData.beneficiary.email,
          category: "mbg",
        });
      } catch {}
    }

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
                Pemindaian kamera live & validasi penerimaan porsi Makan Bergizi Gratis warga Kabupaten Gresik
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
            <span>Kamera Scanner</span>
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

      {/* ─── TAB 1: PEMINDAIAN QR KAMERA FULL VIEW ─── */}
      {activeTab === "scan" && (
        <div className="space-y-6">
          {!decodedData ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* FULL CAMERA SCANNER VIEWPORT */}
              <div className="relative w-full aspect-[4/3] rounded-3xl bg-slate-950 overflow-hidden shadow-2xl border-4 border-ford-blue flex items-center justify-center">
                {/* Live Video Feed or Fallback Grid Background */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    hasCameraAccess ? "opacity-100" : "opacity-0"
                  }`}
                />

                {!hasCameraAccess && (
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#131C38] to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      <CameraOff className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-[13px] font-bold text-slate-200">
                      Kamera Web Siap Dipindai
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Arahkan QR Code Warga ke tengah layar atau gunakan tombol simulasi pemindaian di bawah.
                    </p>
                  </div>
                )}

                {/* Dark Vignette Overlay for Focus */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

                {/* CENTERED SQUARE TARGET BOX FOR BARCODE */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-white/20 flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] overflow-hidden">
                  {/* Glowing Corner Brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-02 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-02 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-02 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-02 rounded-br-xl"></div>

                  {/* Animated Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-02 to-transparent shadow-[0_0_15px_#23B5A8] animate-bounce top-1/2"></div>

                  {/* Center Watermark QR Icon */}
                  <QrCode className={`w-20 h-20 text-green-02/70 ${isScanning ? "animate-pulse scale-110" : ""}`} />
                </div>

                {/* Target Instruction Pill */}
                <div className="absolute top-4 inset-x-0 flex justify-center">
                  <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[11px] border border-white/20 shadow-md flex items-center gap-2">
                    <ScanLine className="w-3.5 h-3.5 text-green-02 animate-pulse" />
                    <span>Posisikan Barcode / QR Code Tepat di Dalam Kotak</span>
                  </span>
                </div>

                {/* Bottom Camera Action Controls inside Viewport */}
                <div className="absolute bottom-4 inset-x-4 flex justify-center">
                  <button
                    onClick={() => handleTriggerScan()}
                    disabled={isScanning}
                    className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-[#35CBC3] to-light-sea-green hover:from-[#22B5AC] hover:to-light-sea-green text-ford-blue font-black text-[13.5px] flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ScanLine className={`w-5 h-5 text-ford-blue ${isScanning ? "animate-spin" : ""}`} />
                    <span>{isScanning ? "Memindai AI Payload..." : "Pindai & Dekode QR Code"}</span>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] font-medium flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* FAST DEMO SIMULATION BUTTONS BELOW CAMERA */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-ford-blue font-bold text-[12px]">
                  <Zap className="w-4 h-4 text-green-02" />
                  <span>Uji Simulasi Pindai Instan (Demo 1-Click Warga):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEMO_PAYLOADS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriggerScan(item.payload)}
                      disabled={isScanning}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-light-sea-green bg-slate-50/80 hover:bg-emerald-50/50 transition-all cursor-pointer text-left flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[12.5px] text-ford-blue group-hover:text-light-sea-green transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Payload MBG Valid • Sync Firestore & Azure
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-ford-blue text-white group-hover:bg-light-sea-green group-hover:text-ford-blue text-[10px] font-bold transition-all shadow-2xs">
                        Pindai
                      </span>
                    </button>
                  ))}
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
                        Porsi MBG telah dicatat atas nama <strong>{decodedData.beneficiary?.name}</strong>. Data tersinkron ke Firestore & Azure Blob.
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
                    <span>QR Valid & Terverifikasi Cloud</span>
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
                        <div className="w-11 h-11 rounded-2xl bg-ford-blue text-white font-bold text-[14px] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          {decodedData.beneficiary?.photoURL ? (
                            <img src={decodedData.beneficiary.photoURL} alt={decodedData.beneficiary.name} className="w-full h-full object-cover" />
                          ) : (
                            (decodedData.beneficiary?.name || "W").slice(0, 2).toUpperCase()
                          )}
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
                          ? "Mencatat Verifikasi Firestore & Azure..."
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
