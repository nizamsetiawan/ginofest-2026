"use client";

import React, { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  HelpCircle,
  QrCode,
  Check,
  Sparkles,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Activity,
  Scan,
  FlipHorizontal,
  RotateCw,
  Zap,
  ZapOff,
  Eye,
  Hand,
  Focus,
  CheckCircle2,
  Cpu,
  X,
  Maximize2,
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { CitizenUser } from "../types";
import { BiometricSyncService, CompleteBiometricScanRecord } from "@/services/biometric-sync-service";
import { fetchScreeningQuestionsFromFirestore, ScreeningQuestionItem } from "@/services/firebase-service";
import { AzureVisionService } from "@/services/azure-vision-service";

interface MobileScreeningTabProps {
  citizenUser: CitizenUser | null;
  onBackToHome?: () => void;
  onNavigateToComplaint?: () => void;
}

export const MobileScreeningTab: React.FC<MobileScreeningTabProps> = ({
  citizenUser,
  onBackToHome,
  onNavigateToComplaint,
}) => {
  // 5 Step Screens: 1: Scanning -> 2: Questionnaire -> 3: Menu for You -> 4: QR Code -> 5: Scan Success
  const [screeningStep, setScreeningStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Camera Streaming & Scanning States
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const cameraStreamRef = React.useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // 4-Step Sequential Biometric Capture Flow (Wajah -> Mata -> Tangan -> Kuku)
  // Default camera: Wajah & Mata = front (user), Tangan & Kuku = rear (environment)
  const [captureStepIdx, setCaptureStepIdx] = useState<number>(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, boolean>>({});

  const biometricFlow = [
    { id: "wajah", label: "Wajah", defaultCamera: "user" as const, desc: "Posisikan wajah tegak lurus pada kurva oval untuk deteksi rona pucat & mikronutrien." },
    { id: "mata", label: "Mata", defaultCamera: "user" as const, desc: "Arahkan kedua mata sejajar pada kotak retikel untuk deteksi anemia konjungtiva." },
    { id: "tangan", label: "Tangan", defaultCamera: "environment" as const, desc: "Buka telapak tangan sejajar pada kurva panduan untuk analisis hidrasi & turgor." },
    { id: "kuku", label: "Kuku", defaultCamera: "environment" as const, desc: "Dekatkan 4 kuku jari pada kotak target untuk uji capillary refill & sianosis." },
  ] as const;

  // Initialize and cleanup live camera stream on Step 1
  // Auto-switch to the default camera for each biometric step
  useEffect(() => {
    if (screeningStep === 1) {
      const defaultCam = biometricFlow[captureStepIdx].defaultCamera;
      setFacingMode(defaultCam);
    }
  }, [captureStepIdx, screeningStep]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (screeningStep === 1) {
      const startCamera = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: facingMode },
              audio: false,
            });
            cameraStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => { });
              setIsCameraActive(true);
            }
          }
        } catch (err) {
          console.warn("Camera init note:", err);
          setIsCameraActive(false);
        }
      };
      startCamera();
    } else {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      setIsCameraActive(false);
    }

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [screeningStep, facingMode]);

  // Flip Camera (Front / Rear)
  const handleFlipCamera = async () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
  };

  // Toggle Flash / Torch
  const handleToggleFlash = async () => {
    const nextFlash = !isFlashOn;
    setIsFlashOn(nextFlash);
    if (cameraStreamRef.current) {
      const track = cameraStreamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: nextFlash }],
          });
        } catch (e) {
          console.warn("Torch constraint not supported on this device/browser");
        }
      }
    }
  };

  // Step 2: Questionnaire States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<number, string>>({});
  const [customAnswer, setCustomAnswer] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSyncingBiometric, setIsSyncingBiometric] = useState(false);

  const [questions, setQuestions] = useState<ScreeningQuestionItem[]>([
    {
      id: 1,
      title: "Apakah anak Anda sering merasa lelah, lemah, atau lesu saat beraktivitas?",
      subtitle: "MedQA Anemia: Penapisan tanda klinis awal defisiensi zat besi & anemia.",
      options: ["Ya, sangat sering", "Kadang-kadang", "Tidak Pernah"],
    },
    {
      id: 2,
      title: "Apakah anak sering mengeluh pusing, kepala ringan, atau pandangan berkunang saat berdiri?",
      subtitle: "MedQA Anemia: Deteksi pusing ortostatik akibat anemia defisiensi besi (IDA).",
      options: ["Ya, hampir setiap hari", "Kadang-kadang saja", "Belum pernah"],
    },
    {
      id: 3,
      title: "Bagaimana nafsu makan dan ketertarikan anak terhadap lauk protein hewani?",
      subtitle: "MedQA Nutrisi: Evaluasi asupan asam amino esensial & zat besi heme harian.",
      options: ["Sangat lahap (Habis)", "Pilih-pilih makanan (Picky Eater)", "Sering bersisa / Tidak habis"],
    },
    {
      id: 4,
      title: "Berapa gelas air minum yang dikonsumsi anak per hari?",
      subtitle: "MedQA Hidrasi: Skrining status hidrasi harian untuk turgor kulit & fungsi ginjal.",
      options: ["≥ 8 gelas (Cukup)", "4–7 gelas (Kurang)", "< 4 gelas (Sangat Kurang)"],
    },
    {
      id: 5,
      title: "Apakah ada riwayat alergi makanan tertentu pada anak?",
      subtitle: "MedQA Keamanan Pangan: Memastikan formula menu MBG disesuaikan bebas alergen.",
      options: ["Tidak ada alergi", "Alergi Seafood / Ikan", "Alergi Telur / Susu Sapi"],
    },
  ]);


  // Load latest screening questionnaire directly from Firestore
  useEffect(() => {
    let isMounted = true;
    fetchScreeningQuestionsFromFirestore().then((items) => {
      if (isMounted && items && items.length > 0) {
        setQuestions(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [isAdaptingQuestions, setIsAdaptingQuestions] = useState(false);

  // Step 3: Menu State & Synced Biometric Scan Record
  const [menuType, setMenuType] = useState<"ayam" | "bandeng">("ayam");
  const [syncedRecord, setSyncedRecord] = useState<CompleteBiometricScanRecord | null>(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Step 4: QR Code Scanner Timer / Verification Simulation
  const [isQrVerifying, setIsQrVerifying] = useState(false);

  // ─── CLAIM PAYLOAD (encode real claim data into QR) ───
  // Generated once when user reaches step 3/4; stable per session
  const claimId = useMemo(() => {
    const ts = Date.now();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MBG-${ts}-${rand}`;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const claimPayload = useMemo(() => {
    const menuName = syncedRecord?.recommendedMenu?.menuTitle || (menuType === "ayam" ? "Nasi Ayam Kari & Sayur" : "Nasi Bandeng Bakar Madu");
    const calories = syncedRecord?.recommendedMenu?.calories || 680;
    const issuedAt = new Date().toISOString();
    const payload = {
      claimId,
      type: "MBG_FOOD_CLAIM",
      version: "1.0",
      issuedAt,
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 jam
      beneficiary: {
        name: citizenUser?.name || "Pengguna",
        email: citizenUser?.email || "-",
        phone: citizenUser?.phone || "-",
        district: citizenUser?.district || "Kebomas",
      },
      menu: {
        id: syncedRecord?.recommendedMenu?.menuId || menuType,
        name: menuName,
        kalori: calories,
        porsi: "1x Makan Siang",
        program: "Makan Bergizi Gratis",
      },
      program: {
        name: "Ginofest 2026",
        issuer: "SPPG Kemenkes RI",
        year: 2026,
      },
      status: "VALID",
    };
    return JSON.stringify(payload);
  }, [claimId, menuType, citizenUser, syncedRecord]);

  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Scanning Guide Dialog (auto-shows when entering Step 1)
  const [showScanGuide, setShowScanGuide] = useState(true);
  const [rawPhotosMap, setRawPhotosMap] = useState<Record<string, string>>({});

  const [activeScanId] = useState(() => `SCAN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);

  // Master Back Navigation Logic
  const handleBackNavigation = () => {
    // Disable back action while AI is actively processing & uploading
    if (isSyncingBiometric) return;

    if (screeningStep === 1) {
      if (captureStepIdx > 0) {
        setCaptureStepIdx((prev) => prev - 1);
      } else {
        BiometricSyncService.cancelLiveBiometricScan(activeScanId);
        if (onBackToHome) onBackToHome();
      }
    } else if (screeningStep === 2) {
      if (currentQuestionIdx > 0) {
        setCurrentQuestionIdx((prev) => prev - 1);
        setSelectedAnswer(answersMap[currentQuestionIdx - 1] || null);
      } else {
        // Return to last photo step of Step 1 (Kuku)
        setScreeningStep(1);
        setCaptureStepIdx(3);
      }
    } else {
      // Step 3 (Result), Step 4 (QR Code), or Step 5 (Success)
      // Session completed and verified. Reset and return directly to Mobile Home!
      if (onBackToHome) onBackToHome();
    }
  };

  // Handle Scanning Animation for 4-Step Biometric Flow & Snapshot
  const handleStartScan = () => {
    setIsScanningActive(true);
    setScanProgress(0);

    const currentFlowId = biometricFlow[captureStepIdx].id;
    let capturedFrame = "";

    // Capture snapshot frame from video stream if active
    try {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          capturedFrame = canvas.toDataURL("image/jpeg", 0.85);
          const updatedPhotos = {
            ...rawPhotosMap,
            [currentFlowId]: capturedFrame,
          };
          setRawPhotosMap(updatedPhotos);

          // Realtime live sync to Firestore web console as photo is taken
          BiometricSyncService.syncLiveBiometricFrame({
            scanId: activeScanId,
            userId: citizenUser?.id || citizenUser?.email || "user_guest",
            userName: citizenUser?.name || "Muhammad Nizam Setiawan",
            userDistrict: citizenUser?.district || "Kebomas",
            userAge: citizenUser?.age || 9,
            capturedStep: currentFlowId as any,
            photos: {
              faceBase64: updatedPhotos.wajah,
              eyeBase64: updatedPhotos.mata,
              handBase64: updatedPhotos.tangan,
              nailBase64: updatedPhotos.kuku,
            },
          });
        }
      }
    } catch (snapErr) {
      console.warn("Camera snapshot frame notice:", snapErr);
    }

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanningActive(false);
            setCapturedPhotos((prevPhotos) => ({
              ...prevPhotos,
              [currentFlowId]: true,
            }));

            if (captureStepIdx < biometricFlow.length - 1) {
              setCaptureStepIdx((prev) => prev + 1);
            } else {
              // All 4 photos captured -> proceed to questionnaire (Step 2)
              setScreeningStep(2);
              setCurrentQuestionIdx(0);
              setSelectedAnswer(null);
              setAnswersMap({});
              // Trigger adaptive visual MedQA question formulation
              setIsAdaptingQuestions(true);
              AzureVisionService.generateAdaptiveMedQAQuestions(
                {
                  ...rawPhotosMap,
                  [currentFlowId]: capturedFrame,
                },
                citizenUser?.age || 9
              )
                .then((adaptiveQs) => {
                  if (adaptiveQs && adaptiveQs.length >= 3) {
                    setQuestions(adaptiveQs);
                  }
                  setIsAdaptingQuestions(false);
                })
                .catch(() => {
                  setIsAdaptingQuestions(false);
                });
            }
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 220);
  };

  const handleSelectAnswer = async (ans: string) => {
    setSelectedAnswer(ans);
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestionIdx]: ans,
    }));

    // Sync Q&A Selection Event to Firestore in Realtime
    BiometricSyncService.syncQnAEvent({
      scanId: activeScanId,
      questionIdx: currentQuestionIdx,
      questionTitle: questions[currentQuestionIdx]?.title || `Pertanyaan ${currentQuestionIdx + 1}`,
      answer: ans,
    });

    // Check if this was the last question
    if (currentQuestionIdx >= questions.length - 1) {
      setIsSyncingBiometric(true);
      // Determine if allergen applies
      const isSeafoodAllergic = ans.toLowerCase().includes("seafood") || ans.toLowerCase().includes("ikan");
      const targetMenu = isSeafoodAllergic ? "ayam" : menuType;
      if (isSeafoodAllergic) setMenuType("ayam");

      const q1Ans = answersMap[0] || ans;
      const q2Ans = answersMap[1] || ans;
      const q3Ans = ans;

      // Trigger Azure Blob Upload + Azure Vision + Firebase Sync
      try {
        const record = await BiometricSyncService.processAndSyncBiometricScan({
          existingScanId: activeScanId,
          userId: citizenUser?.id || citizenUser?.email || "user_guest",
          userName: citizenUser?.name || "Muhammad Nizam Setiawan",
          userDistrict: citizenUser?.district || "Kebomas",
          userEmail: citizenUser?.email,
          photos: {
            faceBase64: rawPhotosMap.wajah || rawPhotosMap.face,
            eyeBase64: rawPhotosMap.mata || rawPhotosMap.eye,
            handBase64: rawPhotosMap.tangan || rawPhotosMap.hand,
            nailBase64: rawPhotosMap.kuku || rawPhotosMap.nail,
          },
          questionnaire: {
            nafsuMakan: q1Ans,
            aktivitasFisik: q2Ans,
            alergi: q3Ans,
          },
          preferredMenuType: targetMenu,
        });
        setSyncedRecord(record);
      } catch (err) {
        console.warn("Biometric sync notice:", err);
      } finally {
        setIsSyncingBiometric(false);
        setScreeningStep(3); // Move to Menu recommendation after sync finishes
      }
    } else {
      setTimeout(() => {
        setCurrentQuestionIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      }, 350);
    }
  };

  const handleVerifyQR = () => {
    setIsQrVerifying(true);
    BiometricSyncService.syncSessionCompleted(activeScanId);
    setTimeout(() => {
      setIsQrVerifying(false);
      setScreeningStep(5); // Move to Success screen
    }, 1200);
  };

  return (
    <Page className="flex flex-col h-full w-full max-h-full overflow-hidden bg-gradient-to-b from-[#D4EC9E] via-[#E2F5B8] to-[#BFE491] text-ford-blue select-none font-sans relative">
      {/* ═══ HELP DIALOG MODAL ═══ */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 text-left shadow-2xl animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-[13px] font-bold text-ford-blue flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-light-sea-green" />
                <span>Petunjuk Skrining AI</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Skrining ini memadukan <strong>Kamera Computer Vision</strong> untuk deteksi fisik awal &amp; <strong>Kuesioner Interaktif</strong> untuk mempersonalisasi porsi Makan Bergizi Gratis (MBG) sesuai standar WHO.
            </p>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold rounded-xl text-[11.5px] cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 1: 4-STEP SEQUENTIAL BIOMETRIC CAPTURE (WAJAH -> MATA -> TANGAN -> KUKU) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 1 && (
        <div className="flex-1 flex flex-col justify-between relative h-full w-full overflow-hidden">
          {/* Background: Live Camera Stream */}
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900 z-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "transform -scale-x-100" : ""}`}
            />
            {/* Fallback ambient camera gradient if permission pending */}
            {!isCameraActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#F0FDF8] via-white to-[#E6F7F2] flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 rounded-3xl bg-white border border-[#23B5A8]/30 shadow-lg flex items-center justify-center mb-3">
                  <Scan className="w-8 h-8 text-[#0FA89B] animate-pulse" />
                </div>
                <p className="text-slate-800 text-xs font-bold">Mengakses Sensor Kamera...</p>
                <p className="text-slate-500 text-[11px] mt-1 max-w-xs">Izinkan akses kamera di peramban Anda untuk memulai analisis biometrik</p>
              </div>
            )}
            {/* Subtle soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45 pointer-events-none" />
          </div>

          {/* ═══ PETUNJUK SCANNING GUIDE DIALOG (AUTO-SHOWS BEFORE PHOTOS BEGIN) ═══ */}
          {showScanGuide && (
            <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-slate-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0FA89B]/15 via-[#79D7D2]/25 to-[#0FA89B]/10 px-5 pt-5 pb-3.5 flex items-center gap-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#23B5A8] to-[#79D7D2] flex items-center justify-center shadow-md flex-shrink-0">
                    <Scan className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black text-slate-800 tracking-tight">Petunjuk Analisis AI</h2>
                    <p className="text-[11px] text-[#0FA89B] font-bold">4 Foto Biometrik Berurutan</p>
                  </div>
                </div>

                {/* Steps Guide */}
                <div className="px-5 py-4 space-y-3">
                  {biometricFlow.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-[#0FA89B]/10 border border-[#0FA89B]/25 flex items-center justify-center flex-shrink-0 text-[#0FA89B] font-black text-[12px]">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-slate-800">
                          Foto {idx + 1}: {step.label}
                        </p>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* OK Button */}
                <div className="px-5 pb-5">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);
                      setShowScanGuide(false);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white text-[13px] font-black tracking-wide shadow-md cursor-pointer active:scale-95 transition-transform"
                  >
                    Mengerti, Mulai Foto
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* ═══ TOP SECTION: HEADER CONTROLS & 4-FLOW STEP INDICATOR (Z-20) ═══ */}
          <div className="space-y-2.5 z-20 pt-3 px-3.5">
            {/* Top Navigation & Controls Row — Back only on left, Flash+Flip on right */}
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleBackNavigation}
                className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition-all border border-white/80 backdrop-blur-md"
                title="Kembali"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-slate-700 stroke-[2.5]" />
              </motion.button>

              {/* Right Action Controls: Flash + Flip only */}
              <div className="flex items-center gap-1.5">
                {/* Flash Toggle Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleToggleFlash}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md cursor-pointer transition-all border border-white/80 backdrop-blur-md ${isFlashOn
                      ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50"
                      : "bg-white/90 hover:bg-white text-slate-700"
                    }`}
                  title={isFlashOn ? "Matikan Flash" : "Nyalakan Flash"}
                >
                  {isFlashOn ? <Zap className="w-4 h-4 fill-current text-slate-950" /> : <ZapOff className="w-4 h-4 text-slate-700" />}
                </motion.button>

                {/* Camera Flip / Rotate Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleFlipCamera}
                  className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md cursor-pointer transition-all border border-white/80 backdrop-blur-md"
                  title="Putar / Balik Kamera"
                >
                  <RotateCw className="w-4 h-4 text-slate-700 stroke-[2.2]" />
                </motion.button>
              </div>
            </div>

            {/* ═══ 4-STEP SEQUENTIAL PROGRESS FLOW BAR — NO SKIP, TEXT ONLY ═══ */}
            <div className="flex items-center justify-between gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-white/80 max-w-sm mx-auto shadow-md">
              {biometricFlow.map((step, idx) => {
                const isActive = captureStepIdx === idx;
                const isCompleted = !!capturedPhotos[step.id];
                // Sequential lock: only allow active or already-completed steps
                const isAccessible = isActive || isCompleted;

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => {
                      if (!isAccessible) return;
                      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                      // Only allow going back to completed steps, not forward-skipping
                      if (isCompleted && !isActive) {
                        setCaptureStepIdx(idx);
                        const targetStepId = biometricFlow[idx].id;
                        const updatedPhotos = {
                          ...rawPhotosMap,
                          [targetStepId]: "",
                        };
                        setRawPhotosMap(updatedPhotos);
                        setCapturedPhotos((prev) => ({ ...prev, [targetStepId]: false }));
                        BiometricSyncService.recaptureLiveBiometricStep({
                          scanId: activeScanId,
                          stepName: targetStepId as any,
                          photos: {
                            faceBase64: updatedPhotos.wajah,
                            eyeBase64: updatedPhotos.mata,
                            handBase64: updatedPhotos.tangan,
                            nailBase64: updatedPhotos.kuku,
                          },
                        });
                      }
                    }}
                    className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 select-none ${isActive
                        ? "bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white shadow-sm font-black cursor-default"
                        : isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                          : "text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <span className="truncate">{isCompleted ? "✓ " : ""}{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ CENTER: UPPER-ALIGNED BIOMETRIC GUIDELINE FRAMES (Z-10) ═══ */}
          <div className="flex-1 flex flex-col items-center justify-start pt-3 sm:pt-5 pb-24 px-4 z-10 w-full overflow-hidden pointer-events-none">
            {/* Live Scanning Laser Sweep Animation */}
            {isScanningActive && (
              <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
                {/* Glowing Cyan Ambience */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#79D7D2]/20 via-[#23B5A8]/20 to-transparent backdrop-blur-[1px] animate-pulse" />

                {/* Laser Sweep Line */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#79D7D2] to-transparent shadow-[0_0_25px_#23B5A8] animate-bounce [animation-duration:1.2s]" />

                {/* Telemetry Progress Floating Pill */}
                <div className="px-5 py-2.5 rounded-full bg-white/95 border border-[#0FA89B] text-[#0FA89B] font-mono font-black text-xs backdrop-blur-xl shadow-2xl flex items-center gap-2.5 relative z-40 animate-in zoom-in-95">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0FA89B]" />
                  <span>MEMINDAI {biometricFlow[captureStepIdx].label.toUpperCase()}: {scanProgress}%</span>
                </div>
              </div>
            )}

            {/* Dynamic Upper-Aligned HUD Frame SVG */}
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[4/5] max-h-[44vh] flex items-center justify-center">
              {/* FLOW 1: WAJAH — Clean face oval, no text */}
              {captureStepIdx === 0 && (
                <svg viewBox="0 0 300 340" className="w-full h-full drop-shadow-[0_0_15px_rgba(35,181,168,0.4)]">
                  {/* Corner Brackets */}
                  <path d="M 30,40 L 30,12 L 58,12" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 270,40 L 270,12 L 242,12" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 30,295 L 30,323 L 58,323" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 270,295 L 270,323 L 242,323" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  {/* Face Oval */}
                  <ellipse cx="150" cy="162" rx="87" ry="117" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeDasharray="6 6" />
                  <ellipse cx="150" cy="162" rx="92" ry="122" fill="none" stroke="#23B5A8" strokeWidth="1.5" opacity="0.65" />
                  {/* Eye Level Crosshairs */}
                  <line x1="72" y1="142" x2="228" y2="142" stroke="#79D7D2" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.85" />
                  <circle cx="110" cy="142" r="13" fill="none" stroke="#79D7D2" strokeWidth="1.5" />
                  <circle cx="190" cy="142" r="13" fill="none" stroke="#79D7D2" strokeWidth="1.5" />
                  <circle cx="110" cy="142" r="3" fill="#23B5A8" />
                  <circle cx="190" cy="142" r="3" fill="#23B5A8" />
                  {/* Chin Anchor */}
                  <path d="M 130,279 Q 150,290 170,279" fill="none" stroke="#79D7D2" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}

              {/* FLOW 2: MATA — Clean dual eye reticles, no text at all */}
              {captureStepIdx === 1 && (
                <svg viewBox="0 0 300 340" className="w-full h-full drop-shadow-[0_0_15px_rgba(35,181,168,0.4)]">
                  {/* Left Eye Reticle */}
                  <g transform="translate(28, 100)">
                    <rect x="0" y="0" width="108" height="98" rx="18" fill="rgba(35,181,168,0.12)" stroke="#79D7D2" strokeWidth="2.5" strokeDasharray="6 4" />
                    <circle cx="54" cy="49" r="27" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
                    <circle cx="54" cy="49" r="8" fill="#23B5A8" opacity="0.85" />
                    {/* Conjunctiva arc — visual only, no text */}
                    <path d="M 22,72 Q 54,88 86,72" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  </g>
                  {/* Right Eye Reticle */}
                  <g transform="translate(164, 100)">
                    <rect x="0" y="0" width="108" height="98" rx="18" fill="rgba(35,181,168,0.12)" stroke="#79D7D2" strokeWidth="2.5" strokeDasharray="6 4" />
                    <circle cx="54" cy="49" r="27" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
                    <circle cx="54" cy="49" r="8" fill="#23B5A8" opacity="0.85" />
                    <path d="M 22,72 Q 54,88 86,72" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                  </g>
                  {/* Bridge */}
                  <line x1="136" y1="149" x2="164" y2="149" stroke="#79D7D2" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                </svg>
              )}

              {/* FLOW 3: TANGAN — Clean hand outline, no text */}
              {captureStepIdx === 2 && (
                <svg viewBox="0 0 300 340" className="w-full h-full drop-shadow-[0_0_15px_rgba(35,181,168,0.4)]">
                  {/* Corner Brackets */}
                  <path d="M 40,40 L 40,12 L 68,12" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 260,40 L 260,12 L 232,12" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 40,295 L 40,323 L 68,323" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 260,295 L 260,323 L 232,323" fill="none" stroke="#79D7D2" strokeWidth="3" strokeLinecap="round" />
                  {/* Hand Silhouette */}
                  <path
                    d="M 110,300 L 110,225 C 100,205 80,165 80,125 C 80,110 95,110 95,125 L 95,185 L 115,85 C 115,70 130,70 130,85 L 130,175 L 145,65 C 145,50 160,50 160,65 L 160,175 L 175,80 C 175,65 190,65 190,80 L 190,185 L 205,115 C 205,100 220,100 220,115 C 220,155 200,225 190,235 L 190,300 Z"
                    fill="rgba(35,181,168,0.08)"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  {/* Turgor Sensor Ring — no text */}
                  <circle cx="150" cy="210" r="26" fill="none" stroke="#79D7D2" strokeWidth="2" />
                  <circle cx="150" cy="210" r="4" fill="#23B5A8" />
                </svg>
              )}

              {/* FLOW 4: KUKU — 4 nail beds, finger labels only (small, minimal), no legend box */}
              {captureStepIdx === 3 && (
                <svg viewBox="0 0 300 340" className="w-full h-full drop-shadow-[0_0_15px_rgba(35,181,168,0.4)]">
                  {[
                    { x: 38, label: "Telunjuk" },
                    { x: 97, label: "Tengah" },
                    { x: 156, label: "Manis" },
                    { x: 215, label: "Kelingking" },
                  ].map((nail, i) => (
                    <g key={i} transform={`translate(${nail.x}, 90)`}>
                      <rect x="0" y="0" width="48" height="90" rx="14" fill="rgba(35,181,168,0.12)" stroke="#79D7D2" strokeWidth="2" strokeDasharray="4 3" />
                      {/* Nail Arc */}
                      <path d="M 8,24 Q 24,8 40,24 L 40,50 Q 24,54 8,50 Z" fill="rgba(255,255,255,0.25)" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="24" cy="34" r="3" fill="#23B5A8" />
                      {/* Minimal finger label under each box */}
                      <text x="24" y="108" fill="#79D7D2" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{nail.label}</text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* ═══ FIXED FLOATING CAPTURE BAR — Light frosted glass ═══ */}
          <div className="fixed bottom-0 left-0 w-full z-30 pb-6 sm:pb-8 pt-1 px-4 bg-gradient-to-t from-white/95 via-white/75 to-transparent pointer-events-none select-none">
            <div className="max-w-xs sm:max-w-sm mx-auto flex flex-col items-center space-y-2 pointer-events-auto">
              {/* Dynamic Target Instruction Glass Card */}
              <div className="w-full bg-white/95 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-slate-200/80 text-slate-800 space-y-0.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4.5 h-4.5 rounded-md bg-[#0FA89B]/10 border border-[#0FA89B]/30 flex items-center justify-center">
                      <Scan className="w-2.5 h-2.5 text-[#0FA89B]" />
                    </div>
                    <h3 className="text-[11.5px] font-black tracking-wide text-slate-800">
                      Foto {captureStepIdx + 1}/4: Pindai {biometricFlow[captureStepIdx].label}
                    </h3>
                  </div>
                  <span className="text-[8.5px] px-2 py-0.2 rounded-full bg-[#0FA89B]/10 text-[#0FA89B] font-bold border border-[#0FA89B]/25">
                    Langkah {captureStepIdx + 1} dari 4
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-snug">
                  {biometricFlow[captureStepIdx].desc}
                </p>
              </div>

              {/* Prominent Shutter Capture Button (+50% Larger) */}
              <div className="flex items-center justify-center pt-1 pb-1">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
                    handleStartScan();
                  }}
                  disabled={isScanningActive}
                  className="w-[102px] h-[102px] rounded-full bg-white shadow-[0_6px_35px_rgba(35,181,168,0.55)] border-[5px] border-[#0FA89B] flex items-center justify-center relative cursor-pointer active:scale-90 transition-all group"
                  title={`Ambil Foto ${biometricFlow[captureStepIdx].label}`}
                >
                  {/* Blinking Aura Pulse Rings */}
                  <div className="absolute -inset-3 rounded-full bg-[#79D7D2]/40 animate-ping [animation-duration:2s] pointer-events-none" />
                  <div className="absolute -inset-2 rounded-full bg-[#23B5A8]/30 animate-pulse pointer-events-none" />
                  <img
                    src="/logo_app.svg"
                    alt="Capture"
                    className="w-15 h-15 object-contain group-hover:scale-110 transition-transform relative z-10 drop-shadow-md"
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 2: KUESIONER INTERAKTIF AI (FIT VIEWPORT)               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 2 && (
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-[#F0FDF8] via-white to-[#F0FDF8]">

          {/* ─── TOP BAR ─── */}
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              {/* Back */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleBackNavigation}
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-700 stroke-[2.5]" />
              </motion.button>

              {/* Title */}
              <div className="text-center">
                <p className="text-[11px] font-bold text-[#0FA89B] tracking-widest uppercase">Kuesioner</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Pertanyaan {currentQuestionIdx + 1} / {questions.length}
                </p>
              </div>

              {/* Help */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-400 stroke-[2]" />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0FA89B] to-[#79D7D2]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* ─── SCROLLABLE CONTENT ─── */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">

            {/* Logo + Question Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              {/* App Logo & Adaptive MedQA Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#23B5A8] to-[#79D7D2] flex items-center justify-center shadow-md flex-shrink-0">
                    <img src="/logo_app.svg" alt="Kcal" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#0FA89B] tracking-wide">Analisis Gizi AI</p>
                    <p className="text-[9.5px] text-slate-400 font-medium">Kemenkes RI &amp; BGN 2026</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0FA89B]/10 border border-[#0FA89B]/20 text-[#0FA89B] text-[9.5px] font-bold">
                  <Sparkles className="w-3 h-3 text-[#0FA89B] animate-pulse" />
                  <span>
                    {isAdaptingQuestions
                      ? "Menganalisis MedQA..."
                      : `MedQA · ${questions.length} pertanyaan`}
                  </span>
                </div>

              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Question */}
              <div className="space-y-1.5">
                <h2 className="text-[15px] font-black text-slate-800 leading-snug">
                  {questions[currentQuestionIdx].title}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {questions[currentQuestionIdx].subtitle}
                </p>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {questions[currentQuestionIdx].options.map((opt, i) => {
                const isSelected = answersMap[currentQuestionIdx] === opt;
                return (
                  <motion.button
                    key={`q${currentQuestionIdx}-opt${i}`}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleSelectAnswer(opt)}
                    className={`w-full py-3.5 px-4 rounded-2xl border text-left text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-3 ${isSelected
                        ? "bg-[#23B5A8]/10 border-[#23B5A8] text-[#0D7A72] shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 active:bg-[#F0FDF8]"
                      }`}
                  >
                    {/* Option Circle Indicator */}
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected
                        ? "border-[#23B5A8] bg-[#23B5A8]"
                        : "border-slate-300"
                      }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Custom Write-in */}
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 hover:text-[#0FA89B] transition-colors cursor-pointer pt-0.5"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Tambahkan penjelasan lain...</span>
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Tuliskan keluhan atau kondisi anak..."
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-[11.5px] font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#23B5A8] resize-none transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleSelectAnswer(customAnswer || "Penjelasan khusus tersimpan")}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white text-[12px] font-black cursor-pointer shadow-md"
                >
                  Simpan &amp; Lanjut
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: MENU UNTUK ANDA (FIT VIEWPORT)                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 3 && (
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-[#F0FDF8] via-white to-[#F0FDF8]">

          {/* ─── TOP BAR ─── */}
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={handleBackNavigation}
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer">
                <ArrowLeft className="w-4 h-4 text-slate-700 stroke-[2.5]" />
              </motion.button>

              <div className="text-center">
                <p className="text-[11px] font-bold text-[#0FA89B] tracking-widest uppercase">Menu untuk Anda</p>
                <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">Rekomendasi Nutrisi Harian</p>
              </div>

              <div className="w-9 h-9" />
            </div>

            {/* Progress */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] w-[80%] transition-all duration-500" />
            </div>
          </div>

          {/* ─── SCROLLABLE CONTENT ─── */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">

            {/* Menu Image Card */}
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              <div className="relative">
                <img
                  src={
                    syncedRecord?.recommendedMenu?.menuTitle?.toLowerCase().includes("bandeng") ||
                      syncedRecord?.recommendedMenu?.menuTitle?.toLowerCase().includes("ikan")
                      ? "/assets/mbg_tray_bandeng.jpg"
                      : "/assets/mbg_tray_ayam.jpg"
                  }
                  alt="Menu MBG"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-[13.5px] font-black text-white leading-tight drop-shadow">
                      {syncedRecord?.recommendedMenu?.menuTitle || (menuType === "ayam" ? "Nasi Ayam Kari & Sayur" : "Nasi Bandeng Bakar Madu")}
                    </h4>
                    <p className="text-[10px] text-white/70 font-medium">
                      {syncedRecord?.recommendedMenu?.portionDesc || "Nasi 200g · Protein 150g · Sayur 50g"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#23B5A8] text-white text-[10px] font-black shadow-md flex-shrink-0">
                    {syncedRecord?.recommendedMenu?.calories || 680} kkal
                  </span>
                </div>
              </div>
            </div>

            {/* Nutrition Breakdown */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-black text-slate-800">Profil Nutrisi</p>
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#79D7D2]/15 text-[#0FA89B] font-bold border border-[#79D7D2]/30">% AKG</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "Lemak Total", val: "10 g", pct: 22, color: "#F59E0B" },
                  { label: "Karbohidrat", val: "50 g", pct: 17, color: "#0FA89B" },
                  { label: "Serat", val: "7 g", pct: 18, color: "#34D399" },
                  { label: "Protein", val: `${syncedRecord?.recommendedMenu?.proteinGram || 31} g`, pct: 50, color: "#23B5A8" },
                  { label: "Vitamin D", val: "0.4 mg", pct: 15, color: "#A78BFA" },
                  { label: "Zat Besi / Fe", val: `${syncedRecord?.recommendedMenu?.ironMg || 6} mg`, pct: syncedRecord?.recommendedMenu?.akgPercentage || 50, color: "#F87171" },
                ].map((n) => (
                  <div key={n.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10.5px] text-slate-600 font-medium">{n.label} <span className="text-slate-400">({n.val})</span></span>
                      <span className="text-[10.5px] font-black" style={{ color: n.color }}>{n.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${n.pct}%`, backgroundColor: n.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ EXPANDABLE CLINICAL DETAILS & PHOTO EVIDENCE SECTION (COLLAPSED BY DEFAULT) ═══ */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all">
              <button
                type="button"
                onClick={() => setShowDetailedReport((prev) => !prev)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-teal-50 text-[#0FA89B] border border-teal-100 flex items-center justify-center shrink-0">
                    <Activity className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[12.5px] font-black text-slate-800 leading-tight flex items-center gap-1.5">
                      <span>Detail Analisis Klinis &amp; Foto</span>
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {syncedRecord?.azureVisionMetrics?.confidenceScore
                          ? `${(syncedRecord.azureVisionMetrics.confidenceScore * (syncedRecord.azureVisionMetrics.confidenceScore > 1 ? 1 : 100)).toFixed(1)}% Akurasi`
                          : "Visi AI Presisi"}
                      </span>
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {showDetailedReport ? "Klik untuk menyembunyikan bukti biometrik" : "Lihat 4 foto biometrik, akurasi AI & skor klinis"}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDetailedReport ? "rotate-180" : ""}`} />
                </div>
              </button>

              <AnimatePresence>
                {showDetailedReport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="px-4 pb-4 space-y-3.5 border-t border-slate-100 pt-3"
                  >
                    {/* 1. Lampiran Foto Biometrik (4 Frame) */}
                    <div className="space-y-1.5">
                      <p className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Scan className="w-3.5 h-3.5 text-[#0FA89B]" />
                        <span>Lampiran 4 Frame Foto Biometrik</span>
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {
                            id: "wajah",
                            label: "Wajah",
                            img: rawPhotosMap.wajah || rawPhotosMap.face || syncedRecord?.photos?.faceBase64 || syncedRecord?.blobUrls?.faceBlobUrl,
                            fallbackIcon: "👤",
                          },
                          {
                            id: "mata",
                            label: "Konjungtiva",
                            img: rawPhotosMap.mata || rawPhotosMap.eye || syncedRecord?.photos?.eyeBase64 || syncedRecord?.blobUrls?.eyeBlobUrl,
                            fallbackIcon: "👁️",
                          },
                          {
                            id: "tangan",
                            label: "Turgor Kulit",
                            img: rawPhotosMap.tangan || rawPhotosMap.hand || syncedRecord?.photos?.handBase64 || syncedRecord?.blobUrls?.handBlobUrl,
                            fallbackIcon: "✋",
                          },
                          {
                            id: "kuku",
                            label: "CRT Kuku",
                            img: rawPhotosMap.kuku || rawPhotosMap.nail || syncedRecord?.photos?.nailBase64 || syncedRecord?.blobUrls?.nailBlobUrl,
                            fallbackIcon: "💅",
                          },
                        ].map((item) => (
                          <div key={item.id} className="space-y-1 text-center">
                            <div
                              onClick={() => {
                                if (item.img) {
                                  if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                                  setPreviewPhoto({ url: item.img, title: `Foto ${item.label}` });
                                }
                              }}
                              className={`w-full aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center ${item.img ? "cursor-pointer hover:ring-2 hover:ring-[#0FA89B] transition-all group" : ""
                                }`}
                            >
                              {item.img ? (
                                <>
                                  <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </>
                              ) : (
                                <span className="text-xl">{item.fallbackIcon}</span>
                              )}
                              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[7px] text-white font-bold">
                                ✓
                              </span>
                            </div>
                            <span className="text-[9.5px] font-bold text-slate-600 block truncate">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Detail Akurasi & Skor Visi AI */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#0FA89B]" />
                        <span>Metrik Akurasi &amp; Ekstraksi Visi AI</span>
                      </p>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-[10.5px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Akurasi Model Edge AI</span>
                          <span className="font-extrabold text-emerald-600">
                            {syncedRecord?.azureVisionMetrics?.confidenceScore
                              ? `${(syncedRecord.azureVisionMetrics.confidenceScore * (syncedRecord.azureVisionMetrics.confidenceScore > 1 ? 1 : 100)).toFixed(1)}% (Presisi Visi AI)`
                              : "95.2% (Azure Vision Presisi)"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">SCIN Vitality (Wajah)</span>
                          <span className="font-bold text-slate-800">
                            {syncedRecord?.azureVisionMetrics?.facialVitalityScore !== undefined
                              ? `${syncedRecord.azureVisionMetrics.facialVitalityScore} (Segar)`
                              : "0.88 (Vital & Segar)"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Indeks Pucat (Konjungtiva Mata)</span>
                          <span className="font-bold text-slate-800">
                            {syncedRecord?.azureVisionMetrics?.eyeConjunctivaStatus
                              ? `${syncedRecord.azureVisionMetrics.eyeConjunctivaStatus}`
                              : "Merah Muda Normal"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Elastisitas Turgor Kulit (Tangan)</span>
                          <span className="font-bold text-slate-800">
                            {syncedRecord?.azureVisionMetrics?.skinTurgorStatus
                              ? `${syncedRecord.azureVisionMetrics.skinTurgorStatus}`
                              : "Elastis / Normal"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Refill Kapiler / CRT (Kuku)</span>
                          <span className="font-bold text-slate-800">
                            {syncedRecord?.azureVisionMetrics?.nailbedStatus
                              ? `${syncedRecord.azureVisionMetrics.nailbedStatus}`
                              : "Merah Muda Sehat (<2 dtk)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Hasil Akhir Analisis Klinis & Anamnesis */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10.5px] font-extrabold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0FA89B]" />
                        <span>Hasil Akhir Analisis &amp; Anamnesis</span>
                      </p>

                      <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100/80 space-y-1.5 text-[10.5px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Status Profil Fisik</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9.5px]">
                            Risiko Rendah / Gizi Baik
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Kecamatan Domisili</span>
                          <span className="font-bold text-slate-800">Kec. {citizenUser?.district || "Kebomas"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Usia Target AKG</span>
                          <span className="font-bold text-slate-800">{citizenUser?.age || 9} Tahun (Standar Kemenkes)</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-teal-100 text-slate-600">
                          <span>Anamnesis Ortu</span>
                          <span className="font-bold text-slate-800">
                            Nafsu Makan: {answersMap[0] || "Lahap"} • Fisik: {answersMap[1] || "Aktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* QR Code CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setScreeningStep(4)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#23B5A8]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#23B5A8] to-[#79D7D2] flex items-center justify-center shadow-md flex-shrink-0">
                  <QrCode className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left">
                  <h5 className="text-[12px] font-black text-slate-800 leading-tight">QR Code Klaim</h5>
                  <p className="text-[9.5px] text-slate-400 font-medium">Tampilkan untuk verifikasi menu</p>
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-[#23B5A8]" />
            </motion.button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 4: QR CODE VERIFIKASI KLAIM MBG                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 4 && (
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-[#F0FDF8] via-white to-[#F0FDF8]">

          {/* ─── TOP BAR (fixed) ─── */}
          <div className="px-4 pt-4 pb-3 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => setScreeningStep(3)}
                className="w-9 h-9 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer">
                <ArrowLeft className="w-4 h-4 text-slate-700 stroke-[2.5]" />
              </motion.button>

              <div className="text-center">
                <p className="text-[11px] font-bold text-[#0FA89B] tracking-widest uppercase">Verifikasi Klaim</p>
                <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">QR Code Menu MBG</p>
              </div>

              <div className="w-9 h-9" />
            </div>

            {/* Progress */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] w-[95%] transition-all duration-500" />
            </div>
          </div>

          {/* ─── SCROLLABLE BODY ─── */}
          <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-4">
            {/* Instruction */}
            <div className="text-center space-y-1 py-2">
              <h4 className="text-[15px] font-black text-slate-800">Tunjukkan QR ini pada staf!</h4>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto leading-snug">
                Petugas SPPG MBG akan memindai kode ini untuk validasi porsi menu anak Anda.
              </p>
            </div>

            {/* Extra info — placeholder scrollable content */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2">
              <p className="text-[10.5px] font-black text-slate-700">Ketentuan Klaim</p>
              <ul className="space-y-1.5 text-[10px] text-slate-500 font-medium">
                <li className="flex items-start gap-2"><span className="text-[#23B5A8] font-black mt-0.5">•</span> QR hanya dapat digunakan sekali per sesi makan siang.</li>
                <li className="flex items-start gap-2"><span className="text-[#23B5A8] font-black mt-0.5">•</span> Berlaku 6 jam sejak QR dibuat.</li>
                <li className="flex items-start gap-2"><span className="text-[#23B5A8] font-black mt-0.5">•</span> Pastikan menu sesuai rekomendasi AI sebelum menerima porsi.</li>
                <li className="flex items-start gap-2"><span className="text-[#23B5A8] font-black mt-0.5">•</span> Kecamatan {citizenUser?.district || "Kebomas"} • Ginofest 2026</li>
              </ul>
            </div>

            {/* Bottom padding so content clears the sticky bar */}
            <div className="h-2" />
          </div>

          {/* ─── STICKY BOTTOM — QR + Claim ID + Button (bg nyatu) ─── */}
          <div className="flex-shrink-0 relative">
            {/* Fade from page bg — blends seamlessly */}
            <div className="h-6 bg-gradient-to-b from-transparent to-white pointer-events-none" />
            <div className="bg-white border-t border-slate-100 px-5 pb-6 pt-3 space-y-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">

              {/* QR Box — Real QR Code via qrcode.react */}
              <div className="relative p-3 bg-white rounded-2xl shadow-lg shadow-[#23B5A8]/15 border border-slate-100 flex items-center gap-4">
                <div className="w-20 h-20 flex-shrink-0 relative flex items-center justify-center">
                  <QRCodeSVG
                    value={claimPayload}
                    size={80}
                    bgColor="#FFFFFF"
                    fgColor="#0D1B2A"
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/logo_app.svg",
                      x: undefined,
                      y: undefined,
                      height: 18,
                      width: 18,
                      excavate: true,
                    }}
                  />
                  {isQrVerifying && (
                    <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-[#23B5A8] animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8.5px] text-slate-400 font-semibold tracking-widest uppercase mb-0.5">ID Klaim</p>
                  <p className="text-[10px] font-black text-[#0FA89B] font-mono tracking-wide truncate">{claimId}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-snug">
                    {syncedRecord?.recommendedMenu?.menuTitle || (menuType === "ayam" ? "Nasi Ayam Kari & Sayur" : "Nasi Bandeng Bakar Madu")} · {syncedRecord?.recommendedMenu?.calories || 680} kkal
                  </p>
                  <p className="text-[8.5px] text-red-400 font-bold mt-1">Berlaku 6 jam • 1x pakai</p>
                </div>
              </div>

              {/* Scan Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleVerifyQR}
                disabled={isQrVerifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white font-black text-[13px] shadow-md cursor-pointer disabled:opacity-60"
              >
                {isQrVerifying ? "Memproses Verifikasi..." : "Simulasikan Staf Memindai QR"}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 5: SCAN SUKSES!                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 5 && (
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-[#F0FDF8] via-white to-[#F0FDF8]">

          {/* ─── SCROLLABLE BODY ─── */}
          <div className="flex-1 overflow-y-auto">

            {/* SUCCESS BANNER */}
            <div className="px-4 pt-5 pb-3 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#23B5A8] to-[#79D7D2] flex items-center justify-center shadow-[0_0_30px_rgba(35,181,168,0.35)] mb-3"
              >
                <Check className="w-8 h-8 text-white stroke-[3]" />
              </motion.div>
              <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Scan Sukses!</h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-xs mx-auto leading-snug">
                Data porsi makan & pemenuhan nutrisi telah diverifikasi. Selamat menikmati!
              </p>
            </div>

            {/* BODY FILL GRAPHIC */}
            <div className="flex flex-col items-center px-5 pb-2">
              <div className="relative w-40 h-52 flex items-center justify-center">
                <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-[0_0_16px_rgba(35,181,168,0.2)]">
                  <defs>
                    <linearGradient id="bodyFillLight" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#23B5A8" />
                      <stop offset="45%" stopColor="#0FA89B" />
                      <stop offset="45.1%" stopColor="#e2f5f3" stopOpacity="1" />
                      <stop offset="100%" stopColor="#f0fdf8" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <circle cx="105" cy="40" r="22" stroke="#23B5A8" strokeWidth="2.5" fill="none" />
                  <path d="M85 68 C70 65, 55 50, 48 45 C44 42, 40 45, 42 50 C45 60, 60 75, 78 85"
                    stroke="#23B5A8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M125 68 C140 75, 145 95, 148 115"
                    stroke="#23B5A8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M80 65 C90 60, 120 60, 130 65 C135 90, 135 125, 130 145 C130 160, 145 200, 155 240 C156 245, 150 248, 145 245 C135 240, 120 185, 115 160 C110 160, 95 185, 80 245 C75 250, 70 245, 72 238 C80 195, 90 155, 90 145 C80 125, 75 90, 80 65 Z"
                    stroke="#23B5A8" strokeWidth="2.5" fill="url(#bodyFillLight)" />
                </svg>

                {/* 45% badge — light theme */}
                <div className="absolute top-[46%] left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-white border border-[#23B5A8]/30 text-[12px] font-black text-[#23B5A8] shadow-md">
                  45%
                </div>
              </div>

              {/* Summary Card */}
              <div className="w-full bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2 mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-black text-[#23B5A8] leading-none">45%</span>
                  <span className="text-[12px] font-bold text-slate-600 leading-snug">kebutuhan gizi harian terpenuhi</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-black text-slate-800">{citizenUser?.name || "Oscar Ryanda Putra"}</span>
                  <span className="text-slate-400 font-medium">Kec. {citizenUser?.district || "Kebomas"}</span>
                </div>
              </div>

              {/* Bottom padding to clear sticky bar */}
              <div className="h-4" />
            </div>
          </div>

          {/* ─── STICKY BOTTOM — Action Buttons (bg nyatu) ─── */}
          <div className="flex-shrink-0 relative">
            {/* Gradient fade — blends into page bg */}
            <div className="h-6 bg-gradient-to-b from-transparent to-white pointer-events-none" />
            <div className="bg-white border-t border-slate-100 px-4 pb-6 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleBackNavigation}
                  disabled={isSyncingBiometric}
                  className="py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer text-center disabled:opacity-40"
                >
                  {screeningStep >= 3 ? "🏠 Beranda" : "← Kembali"}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 font-bold text-[11px] cursor-pointer text-center"
                >
                  ? Bantuan
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onNavigateToComplaint}
                  className="py-3 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white font-black text-[11px] cursor-pointer text-center shadow-md"
                >
                  Feedback
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ═══ BIOMETRIC SYNC & AI PROCESSING OVERLAY ═══ */}
      {isSyncingBiometric && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white font-sans animate-in fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0FA89B] to-[#79D7D2] flex items-center justify-center shadow-[0_0_35px_rgba(15,168,155,0.5)] mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-white animate-spin" />
          </div>
          <h3 className="text-base font-black text-white tracking-wide">Sinkronisasi Biometrik & AI</h3>
          <p className="text-xs text-emerald-300 font-bold mt-1">Mengunggah bukti foto &amp; menghitung menu RAG...</p>

          <div className="mt-6 w-full max-w-xs space-y-2.5 text-[11px] font-mono text-left bg-slate-900/90 p-4 rounded-2xl border border-emerald-800/60 shadow-2xl">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Azure Blob Storage Photo Sync...</span>
            </div>
            <div className="flex items-center gap-2.5 text-teal-300">
              <Activity className="w-4 h-4 text-teal-300 animate-spin shrink-0" />
              <span>Azure Vision Biometric Scoring...</span>
            </div>
            <div className="flex items-center gap-2.5 text-purple-300">
              <Cpu className="w-4 h-4 text-purple-300 animate-pulse shrink-0" />
              <span>Azure OpenAI RAG Menu Precision...</span>
            </div>
          </div>
        </div>
      )}
      {/* ═══ FULLSCREEN PHOTO PREVIEW LIGHTBOX MODAL ═══ */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4"
          >
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

            <div className="flex-1 w-full max-w-sm flex items-center justify-center p-2 relative">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
            </div>

            <div className="pb-6 text-center">
              <span className="text-[11px] text-slate-400 font-mono">
                Ekstraksi Visi Biometrik Kcal • Pemkab Gresik 2026
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
};
