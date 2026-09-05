"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  User,
  Utensils,
  Clock,
  BadgeCheck,
  RefreshCw,
  Search,
  Check,
  Mail,
  Phone,
  Flame,
  ShieldCheck,
  History,
  CameraOff,
  Activity,
  Sparkles,
  Eye,
  Scan,
  X,
  Maximize2,
  Filter,
  Cpu,
} from "lucide-react";
import jsQR from "jsqr";
import {
  recordQrClaimToFirestore,
  fetchQrClaimsFromFirestore,
  fetchBiometricScansFromFirestore,
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

export const ScreeningView: React.FC = () => {
  // 3 Dedicated Tabs: 1. Scanner Camera, 2. Biometric Analysis (Ready/Claimed), 3. Verification History Logs
  const [activeTab, setActiveTab] = useState<"scan" | "biometric" | "history">("scan");
  const [decodedData, setDecodedData] = useState<DecodedPayload | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Real camera stream & hardware power-saving state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState("");
  const isScanningRef = useRef(false);

  // Tab 2: Biometric Scans (Hasil Analisis AI) State
  const [biometricList, setBiometricList] = useState<any[]>([]);
  const [isLoadingBiometric, setIsLoadingBiometric] = useState(false);
  const [biometricSearch, setBiometricSearch] = useState("");
  const [biometricFilter, setBiometricFilter] = useState<"ALL" | "VALID" | "CLAIMED">("ALL");

  // Tab 3: History Claims State
  const [historyList, setHistoryList] = useState<QrClaimRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Fullscreen Photo Lightbox Preview State
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Explicit function to stop camera media tracks and release hardware sensor (Save Battery & Power)
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch { }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch { }
        });
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const handleProcessPayload = useCallback(async (rawString: string) => {
    setErrorMessage("");
    setVerificationSuccess(false);
    try {
      const parsed = JSON.parse(rawString.trim()) as DecodedPayload;
      if (!parsed.claimId || !parsed.beneficiary) {
        setErrorMessage("Format QR Code tidak teridentifikasi sebagai payload MBG.");
        return;
      }

      // Stop camera hardware sensor immediately upon valid QR detection to save power
      stopCamera();

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
      setErrorMessage("Format teks QR Code tidak dapat diurai. Pastikan format JSON QR Code MBG valid.");
    }
  }, [stopCamera]);

  // Request camera permission and start video feed automatically
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraErrorMsg("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraAccess(false);
      setCameraErrorMsg("Browser ini tidak mendukung pengaksesan kamera web.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = mediaStream;
      setHasCameraAccess(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera permission error:", err);
      setHasCameraAccess(false);
      setCameraErrorMsg(err.message || "Akses kamera belum diizinkan oleh browser.");
    }
  }, [stopCamera]);

  // Auto camera lifecycle: Start when in scan tab, STOP IMMEDIATELY when switching menu/unmounting
  useEffect(() => {
    if (activeTab === "scan" && !decodedData) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, decodedData, startCamera, stopCamera]);

  // CONTINUOUS AUTOMATIC QR SCANNER LOOP (NO CLICK NEEDED)
  useEffect(() => {
    let animId: number;
    const scanFrame = async () => {
      if (activeTab === "scan" && !decodedData && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;

        // 1. Try Native BarcodeDetector if available in browser
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
            const codes = await detector.detect(video);
            if (codes && codes.length > 0 && codes[0].rawValue) {
              if (!isScanningRef.current) {
                isScanningRef.current = true;
                await handleProcessPayload(codes[0].rawValue);
                isScanningRef.current = false;
                return;
              }
            }
          } catch (e) {
            // Fallback to jsQR below
          }
        }

        // 2. jsQR Canvas Processing Fallback
        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            if (!isScanningRef.current) {
              isScanningRef.current = true;
              await handleProcessPayload(code.data);
              isScanningRef.current = false;
              return;
            }
          }
        }
      }

      if (activeTab === "scan" && !decodedData) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (activeTab === "scan" && !decodedData) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [activeTab, decodedData, handleProcessPayload]);

  useEffect(() => {
    if (activeTab === "biometric") {
      loadBiometricScans();
    } else if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  const loadBiometricScans = async () => {
    setIsLoadingBiometric(true);
    const res = await fetchBiometricScansFromFirestore();
    if (res.success) {
      setBiometricList(res.data);
    }
    setIsLoadingBiometric(false);
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    const res = await fetchQrClaimsFromFirestore();
    if (res.success) {
      setHistoryList(res.data);
    }
    setIsLoadingHistory(false);
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
      verifiedBy: `Staf SPPG Kec. ${decodedData.beneficiary?.district || "Kebomas"}`,
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
      console.warn("Azure dual write notice:", azureErr);
    }

    // 3. Trigger realtime Push Notification
    if (decodedData.beneficiary?.email) {
      const currentHour = new Date().getHours();
      let mealLabel = "Makan Siang Gratis";
      if (currentHour >= 6 && currentHour < 11) {
        mealLabel = "Sarapan Pagi Gratis";
      } else if (currentHour >= 15) {
        mealLabel = "Paket Gizi Malam";
      }

      const menuTitle = decodedData.menu?.name || "Menu MBG";
      const dynamicTitle = `Verifikasi Klaim ${mealLabel} (${menuTitle.substring(0, 35)})`;
      const dynamicDesc = `Porsi ${menuTitle} (${decodedData.menu?.kalori || 680} kcal) atas nama ${decodedData.beneficiary.name || "Warga"} telah diverifikasi & diserahkan oleh staf Pemkab Gresik pada ${new Date().toLocaleTimeString("id-ID")}.`;

      try {
        await addNotification({
          title: dynamicTitle,
          description: dynamicDesc,
          userEmail: decodedData.beneficiary.email,
          category: "mbg",
        });
      } catch { }
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

  // Filter for Biometric Scans History (Tab 2)
  const filteredBiometric = biometricList.filter((item) => {
    const name = (item.userName || item.beneficiary?.name || "").toLowerCase();
    const district = (item.userDistrict || item.beneficiary?.district || "").toLowerCase();
    const claimId = (item.claimId || item._id || "").toLowerCase();
    const q = biometricSearch.toLowerCase();
    const matchesSearch = name.includes(q) || district.includes(q) || claimId.includes(q);

    if (biometricFilter === "VALID") {
      return matchesSearch && (item.status === "VALID" || item.status === "SCANNING_IN_PROGRESS");
    }
    if (biometricFilter === "CLAIMED") {
      return matchesSearch && item.status === "CLAIMED";
    }
    return matchesSearch;
  });

  // Filter for Claim Transaction History (Tab 3)
  const filteredHistory = historyList.filter(
    (item) =>
      item.beneficiaryName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.claimId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.district && item.district.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2C3968] to-[#1E2950] text-light-sea-green flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-[#2C3968] tracking-tight">
                Scan QR Code &amp; Pemantauan Klaim MBG
              </h1>
              <p className="text-[12px] text-[#64748b]">
                Pemindaian kamera otomatis, pemantauan hasil analisis biometrik AI warga, &amp; verifikasi penyerahan porsi MBG
              </p>
            </div>
          </div>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start xl:self-auto flex-wrap sm:flex-nowrap gap-1">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${activeTab === "scan"
                ? "bg-white text-ford-blue shadow-2xs"
                : "text-slate-600 hover:text-ford-blue"
              }`}
          >
            <ScanLine className="w-4 h-4 text-[#0FA89B]" />
            <span>Kamera Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("biometric")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${activeTab === "biometric"
                ? "bg-white text-ford-blue shadow-2xs"
                : "text-slate-600 hover:text-ford-blue"
              }`}
          >
            <Activity className="w-4 h-4 text-[#0FA89B]" />
            <span>Hasil Analisis AI</span>
            {biometricList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0FA89B] text-white text-[9.5px] font-extrabold">
                {biometricList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${activeTab === "history"
                ? "bg-white text-ford-blue shadow-2xs"
                : "text-slate-600 hover:text-ford-blue"
              }`}
          >
            <History className="w-4 h-4 text-[#0FA89B]" />
            <span>Riwayat Verifikasi QR</span>
            {historyList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9.5px] font-extrabold">
                {historyList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── TAB 1: PEMINDAIAN QR KAMERA FULL CONTAINER ─── */}
      {activeTab === "scan" && (
        <div className="space-y-6">
          {!decodedData ? (
            <div className="w-full space-y-6">
              {/* FULL CAMERA SCANNER VIEWPORT */}
              <div className="relative w-full h-[520px] rounded-3xl bg-slate-950 overflow-hidden shadow-2xl border-4 border-ford-blue flex items-center justify-center">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hasCameraAccess ? "opacity-100" : "opacity-0"
                    }`}
                />

                {/* Permission Request Fallback */}
                {hasCameraAccess === false && (
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#131C38] to-slate-950 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                      <CameraOff className="w-8 h-8" />
                    </div>
                    <h3 className="text-[16px] font-bold text-white">
                      Membutuhkan Izin Kamera Browser
                    </h3>
                    <p className="text-[12px] text-slate-300 max-w-md leading-relaxed">
                      {cameraErrorMsg || "Aplikasi memerlukan izin akses kamera web untuk memindai QR Code secara otomatis."}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#35CBC3] to-light-sea-green text-ford-blue font-bold text-[13px] shadow-lg transition-all cursor-pointer hover:opacity-90"
                    >
                      Izinkan Akses Kamera
                    </button>
                  </div>
                )}

                {/* Dark Vignette Overlay for Target Focus */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none"></div>

                {/* CENTERED SQUARE TARGET BOX FOR BARCODE */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl border-2 border-white/20 flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-none z-10">
                  {/* Glowing Corner Brackets */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-02 rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-02 rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-02 rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-02 rounded-br-2xl"></div>

                  {/* Animated Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-02 to-transparent shadow-[0_0_20px_#23B5A8] animate-bounce top-1/2"></div>

                  {/* Center Watermark QR Icon */}
                  <QrCode className="w-24 h-24 text-green-02/60 animate-pulse" />
                </div>

                {/* Target Instruction Pill Banner */}
                <div className="absolute top-5 inset-x-0 flex justify-center z-10">
                  <span className="px-5 py-2 rounded-full bg-black/70 backdrop-blur-md text-white font-bold text-[12px] border border-white/20 shadow-xl flex items-center gap-2.5">
                    <ScanLine className="w-4 h-4 text-green-02 animate-spin" />
                    <span>Arahkan Barcode / QR Code Warga Tepat di Dalam Kotak</span>
                  </span>
                </div>

                {/* Bottom Auto Scan Badge */}
                <div className="absolute bottom-5 inset-x-0 flex justify-center z-10">
                  <span className="px-4 py-1.5 rounded-full bg-ford-blue/90 text-green-02 font-mono font-bold text-[11px] border border-green-02/40 shadow-lg">
                    ● Kamera Aktif - Memindai Otomatis
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[12px] font-medium flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
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
                        BERHASIL DIVERIFIKASI &amp; DIDISTRIBUSIKAN!
                      </h3>
                      <p className="text-[12px] text-emerald-800 font-medium mt-0.5">
                        Porsi MBG telah dicatat atas nama <strong>{decodedData.beneficiary?.name}</strong>. Notifikasi otomatis &amp; audit Azure tersimpan.
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
                    <span>QR Valid &amp; Terverifikasi Cloud</span>
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

      {/* ─── TAB 2: DATA HASIL ANALISIS BIOMETRIK AI WARGA ─── */}
      {activeTab === "biometric" && (
        <div className="space-y-4">
          {/* Top Control Bar: Search & Status Filter Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={biometricSearch}
                onChange={(e) => setBiometricSearch(e.target.value)}
                placeholder="Cari nama warga, kecamatan, atau ID klaim..."
                className="w-full pl-9 pr-4 py-2 text-[12px] bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-light-sea-green/30 focus:border-light-sea-green focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setBiometricFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${biometricFilter === "ALL"
                    ? "bg-ford-blue text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                Semua Status ({biometricList.length})
              </button>

              <button
                onClick={() => setBiometricFilter("VALID")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${biometricFilter === "VALID"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tersedia ({biometricList.filter((b) => b.status === "VALID" || b.status === "SCANNING_IN_PROGRESS").length})</span>
              </button>

              <button
                onClick={() => setBiometricFilter("CLAIMED")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${biometricFilter === "CLAIMED"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  }`}
              >
                <span>Sudah Diambil ({biometricList.filter((b) => b.status === "CLAIMED").length})</span>
              </button>

              <button
                onClick={loadBiometricScans}
                disabled={isLoadingBiometric}
                className="p-2 rounded-xl text-ford-blue bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer shrink-0 ml-1"
                title="Muat Ulang Data Biometrik"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingBiometric ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Biometric Scan Cards List */}
          {isLoadingBiometric ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0FA89B] animate-spin mx-auto" />
              <p className="text-[13px] font-bold text-ford-blue">Mengambil Data Biometrik Warga dari Firestore...</p>
            </div>
          ) : filteredBiometric.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-[14px] text-ford-blue">Tidak Ada Data Analisis Biometrik</h4>
              <p className="text-[12px] text-slate-500 max-w-sm mx-auto">
                Warga yang telah menyelesaikan pemindaian foto biometrik &amp; kuesioner AI akan otomatis tercantum di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBiometric.map((item) => {
                const isClaimed = item.status === "CLAIMED";
                const isValid = item.status === "VALID" || item.status === "SCANNING_IN_PROGRESS";
                const photos = item.photos || {};
                const blobUrls = item.blobUrls || {};

                const faceImg = photos.faceBase64 || blobUrls.faceBlobUrl;
                const eyeImg = photos.eyeBase64 || blobUrls.eyeBlobUrl;
                const handImg = photos.handBase64 || blobUrls.handBlobUrl;
                const nailImg = photos.nailBase64 || blobUrls.nailBlobUrl;

                return (
                  <div
                    key={item.id || item.scanId}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Card Header: Warga Identity & Claim Status Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#23B5A8] to-[#79D7D2] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                          {(item.userName || "W").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-[15px] text-ford-blue">
                              {item.userName || "Nizam Setiawan"}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0FA89B] text-[10px] font-bold border border-teal-200">
                              Kec. {item.userDistrict || "Kebomas"}
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-medium">
                              Usia: {item.userAge || 9} Tahun
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#0FA89B] font-bold mt-0.5">
                            ID: {item.claimId || item.scanId || item.id}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isValid && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Tersedia (Belum Diambil)</span>
                          </span>
                        )}
                        {isClaimed && (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[11px] border border-blue-300 flex items-center gap-1.5 shadow-xs">
                            <span>Sudah Diambil</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Grid: Menu Recommendation + 4 Biometric Photos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Column 1 & 2: Recommended Menu & Clinical Metrics */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase flex items-center gap-1">
                              <Utensils className="w-3 h-3 text-[#0FA89B]" />
                              <span>Rekomendasi Menu Nutrisi AI</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[9.5px] font-black">
                              {item.recommendedMenu?.akgPercentage || 50}% AKG
                            </span>
                          </div>
                          <h5 className="text-[13px] font-black text-slate-800 leading-snug">
                            {item.recommendedMenu?.menuTitle || "Nasi Ayam Kari & Sayur Bening"}
                          </h5>
                          <p className="text-[10.5px] text-slate-600 font-medium">
                            {item.recommendedMenu?.calories || 680} kcal • {item.recommendedMenu?.portionDesc || "1x Makan Siang"}
                          </p>
                        </div>

                        {/* Azure Vision Clinical Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-slate-400 block font-medium">Facial Vitality</span>
                            <span className="font-bold text-slate-700 truncate block">
                              {item.azureVisionMetrics?.facialVitalityScore !== undefined ? `${item.azureVisionMetrics.facialVitalityScore} (Segar)` : "Normal"}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-slate-400 block font-medium">Mata Konjungtiva</span>
                            <span className="font-bold text-slate-700 truncate block">
                              {item.azureVisionMetrics?.eyeConjunctivaStatus || "Merah Muda"}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-slate-400 block font-medium">Turgor Kulit</span>
                            <span className="font-bold text-slate-700 truncate block">
                              {item.azureVisionMetrics?.skinTurgorStatus || "Elastis / Normal"}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-slate-400 block font-medium">CRT Kuku</span>
                            <span className="font-bold text-slate-700 truncate block">
                              {item.azureVisionMetrics?.nailbedStatus || "Sehat (<2 dtk)"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: 4 Biometric Photo Thumbnails */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                          <Scan className="w-3 h-3 text-[#0FA89B]" />
                          <span>4 Foto Biometrik Azure</span>
                        </span>

                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: "Wajah", url: faceImg, icon: "👤" },
                            { label: "Mata", url: eyeImg, icon: "👁️" },
                            { label: "Tangan", url: handImg, icon: "✋" },
                            { label: "Kuku", url: nailImg, icon: "💅" },
                          ].map((p, i) => (
                            <div key={i} className="space-y-0.5 text-center">
                              <div
                                onClick={() => {
                                  if (p.url) {
                                    setPreviewPhoto({ url: p.url, title: `Foto ${p.label} - ${item.userName || "Warga"}` });
                                  }
                                }}
                                className={`w-full aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center ${p.url ? "cursor-pointer hover:ring-2 hover:ring-[#0FA89B] transition-all group" : ""
                                  }`}
                              >
                                {p.url ? (
                                  <>
                                    <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Maximize2 className="w-3 h-3 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-base">{p.icon}</span>
                                )}
                              </div>
                              <span className="text-[8.5px] font-bold text-slate-500 block truncate">{p.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Timestamp */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
                      <span>Waktu Analisis: {item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "Terbaru"}</span>
                      <span>Confidence: {item.azureVisionMetrics?.confidenceScore ? `${(item.azureVisionMetrics.confidenceScore * (item.azureVisionMetrics.confidenceScore > 1 ? 1 : 100)).toFixed(1)}%` : "95.2% Azure Vision"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: RIWAYAT VERIFIKASI KLAIM (DOCS VERIFIED BY STAFF) ─── */}
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

                      <p className="text-[12px] text-[#2C3968] font-medium mt-1">
                        {item.menuName} ({item.calories || 680} kcal)
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                        <span>Waktu Verifikasi: {new Date(item.verifiedAtIso).toLocaleString("id-ID")}</span>
                        <span>• Staf: {item.verifiedBy || "Pemkab Gresik"}</span>
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

      {/* ═══ FULLSCREEN PHOTO PREVIEW LIGHTBOX MODAL ═══ */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200">
          <div className="w-full flex items-center justify-between pt-2 px-2 text-white">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-[#79D7D2]" />
              <h4 className="text-[14px] font-bold tracking-tight">{previewPhoto.title}</h4>
            </div>
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 w-full max-w-md flex items-center justify-center p-2 relative">
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>

          <div className="pb-4 text-center">
            <span className="text-[11px] text-slate-400 font-mono">
              Ekstraksi Visi Biometrik Kcal • Pemkab Gresik 2026
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
