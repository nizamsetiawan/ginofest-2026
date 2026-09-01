"use client";

import React, { useState, useEffect } from "react";
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
  Focus
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { CitizenUser } from "../types";

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
              videoRef.current.play().catch(() => {});
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
  const [customAnswer, setCustomAnswer] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const questions = [
    {
      id: 1,
      title: "Apakah anak Anda sering merasa lelah atau lemah tanpa alasan yang jelas?",
      subtitle: "Indikasi awal potensi defisiensi zat besi (anemia) & mikronutrien.",
      options: ["Ya, sangat sering", "Kadang-kadang", "Tidak Pernah"],
    },
    {
      id: 2,
      title: "Bagaimana nafsu makan dan ketertarikan anak terhadap sayur & protein hewani?",
      subtitle: "Membantu AI menyesuaikan tekstur & variasi rasa menu MBG.",
      options: ["Sangat lahap", "Pilih-pilih makanan (Picky Eater)", "Sering tidak habis"],
    },
    {
      id: 3,
      title: "Apakah ada riwayat alergi makanan tertentu (seafood, kacang, telur)?",
      subtitle: "Penting untuk memastikan keamanan menu MBG bebas alergen.",
      options: ["Tidak ada alergi", "Alergi Seafood / Ikan", "Alergi Telur / Susu"],
    },
  ];

  // Step 3: Menu State
  const [menuType, setMenuType] = useState<"ayam" | "bandeng">("ayam");

  // Step 4: QR Code Scanner Timer / Verification Simulation
  const [isQrVerifying, setIsQrVerifying] = useState(false);

  // Help Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Scanning Guide Dialog (auto-shows when entering Step 1)
  const [showScanGuide, setShowScanGuide] = useState(true);

  // Handle Scanning Animation for 4-Step Biometric Flow
  const handleStartScan = () => {
    setIsScanningActive(true);
    setScanProgress(0);

    const currentFlowId = biometricFlow[captureStepIdx].id;

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
            }
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 220);
  };

  const handleSelectAnswer = (ans: string) => {
    setSelectedAnswer(ans);
    setTimeout(() => {
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setScreeningStep(3); // Move to Menu recommendation
      }
    }, 350);
  };

  const handleVerifyQR = () => {
    setIsQrVerifying(true);
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
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950 z-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "transform -scale-x-100" : ""}`}
            />
            {/* Fallback ambient camera gradient if permission pending */}
            {!isCameraActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 backdrop-blur-md">
                  <Scan className="w-8 h-8 text-[#79D7D2] animate-pulse" />
                </div>
                <p className="text-white/80 text-xs font-bold">Mengakses Sensor Kamera...</p>
                <p className="text-white/40 text-[11px] mt-1 max-w-xs">Izinkan akses kamera di peramban Anda untuk memulai analisis biometrik</p>
              </div>
            )}
            {/* Subtle Vignette shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75 pointer-events-none" />
          </div>

          {/* ═══ PETUNJUK SCANNING GUIDE DIALOG (AUTO-SHOWS BEFORE PHOTOS BEGIN) ═══ */}
          {showScanGuide && (
            <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-sm bg-[#0D1B2A]/95 border border-[#79D7D2]/30 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0FA89B]/30 to-[#79D7D2]/20 px-5 pt-5 pb-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#23B5A8] to-[#79D7D2] flex items-center justify-center shadow-lg flex-shrink-0">
                    <Scan className="w-6 h-6 text-ford-blue" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-black text-white tracking-tight">Petunjuk Analisis AI</h2>
                    <p className="text-[11px] text-[#79D7D2] font-semibold">4 Foto Biometrik Berurutan</p>
                  </div>
                </div>

                {/* Steps Guide */}
                <div className="px-5 py-4 space-y-3">
                  {biometricFlow.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#23B5A8]/30 to-[#79D7D2]/20 border border-[#79D7D2]/40 flex items-center justify-center flex-shrink-0 text-[#79D7D2] font-black text-[13px]">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-black text-white">
                          Foto {idx + 1}: {step.label}
                        </p>
                        <p className="text-[10.5px] text-slate-400 font-medium leading-snug">{step.desc}</p>
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
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-ford-blue text-[13px] font-black tracking-wide shadow-lg cursor-pointer active:scale-95 transition-transform"
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
                onClick={onBackToHome}
                className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-lg cursor-pointer transition-all border border-white/20 backdrop-blur-md"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-white stroke-[2.5]" />
              </motion.button>

              {/* Right Action Controls: Flash + Flip only */}
              <div className="flex items-center gap-1.5">
                {/* Flash Toggle Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleToggleFlash}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-all border border-white/20 backdrop-blur-md ${
                    isFlashOn
                      ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50"
                      : "bg-black/40 hover:bg-black/60 text-white"
                  }`}
                  title={isFlashOn ? "Matikan Flash" : "Nyalakan Flash"}
                >
                  {isFlashOn ? <Zap className="w-4 h-4 fill-current text-slate-950" /> : <ZapOff className="w-4 h-4 text-white" />}
                </motion.button>

                {/* Camera Flip / Rotate Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleFlipCamera}
                  className="w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow-lg cursor-pointer transition-all border border-white/20 backdrop-blur-md"
                  title="Putar / Balik Kamera"
                >
                  <RotateCw className="w-4 h-4 text-white stroke-[2.2]" />
                </motion.button>
              </div>
            </div>

            {/* ═══ 4-STEP SEQUENTIAL PROGRESS FLOW BAR — NO SKIP, TEXT ONLY ═══ */}
            <div className="flex items-center justify-between gap-1.5 bg-black/45 backdrop-blur-md p-1 rounded-2xl border border-white/15 max-w-sm mx-auto shadow-xl">
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
                      if (isCompleted && !isActive) setCaptureStepIdx(idx);
                    }}
                    className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10.5px] font-bold transition-all flex items-center justify-center gap-1 select-none ${
                      isActive
                        ? "bg-gradient-to-r from-[#23B5A8] to-[#79D7D2] text-ford-blue shadow-md font-black cursor-default"
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                        : "text-white/35 cursor-not-allowed"
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
                <div className="px-5 py-2.5 rounded-full bg-black/85 border border-[#79D7D2] text-[#79D7D2] font-mono font-black text-xs backdrop-blur-xl shadow-2xl flex items-center gap-2.5 relative z-40 animate-in zoom-in-95">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#79D7D2]" />
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
                  <ellipse cx="150" cy="162" rx="87" ry="117" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeDasharray="6 6" />
                  <ellipse cx="150" cy="162" rx="92" ry="122" fill="none" stroke="#23B5A8" strokeWidth="1.5" opacity="0.55" />
                  {/* Eye Level Crosshairs */}
                  <line x1="72" y1="142" x2="228" y2="142" stroke="#79D7D2" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.75" />
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
                    <rect x="0" y="0" width="108" height="98" rx="18" fill="rgba(35,181,168,0.08)" stroke="#79D7D2" strokeWidth="2.5" strokeDasharray="6 4" />
                    <circle cx="54" cy="49" r="27" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
                    <circle cx="54" cy="49" r="8" fill="#23B5A8" opacity="0.8" />
                    {/* Conjunctiva arc — visual only, no text */}
                    <path d="M 22,72 Q 54,88 86,72" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  </g>
                  {/* Right Eye Reticle */}
                  <g transform="translate(164, 100)">
                    <rect x="0" y="0" width="108" height="98" rx="18" fill="rgba(35,181,168,0.08)" stroke="#79D7D2" strokeWidth="2.5" strokeDasharray="6 4" />
                    <circle cx="54" cy="49" r="27" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
                    <circle cx="54" cy="49" r="8" fill="#23B5A8" opacity="0.8" />
                    <path d="M 22,72 Q 54,88 86,72" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                  </g>
                  {/* Bridge */}
                  <line x1="136" y1="149" x2="164" y2="149" stroke="#79D7D2" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
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
                    fill="rgba(35,181,168,0.06)"
                    stroke="rgba(255,255,255,0.8)"
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
                      <rect x="0" y="0" width="48" height="90" rx="14" fill="rgba(35,181,168,0.08)" stroke="#79D7D2" strokeWidth="2" strokeDasharray="4 3" />
                      {/* Nail Arc */}
                      <path d="M 8,24 Q 24,8 40,24 L 40,50 Q 24,54 8,50 Z" fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="24" cy="34" r="3" fill="#23B5A8" />
                      {/* Minimal finger label under each box */}
                      <text x="24" y="108" fill="rgba(121,215,210,0.75)" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">{nail.label}</text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* ═══ FIXED FLOATING CAPTURE BAR — raised slightly higher ═══ */}
          <div className="fixed bottom-0 left-0 w-full z-30 pb-4 pt-3 px-4 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none select-none">
            <div className="max-w-sm mx-auto flex flex-col items-center space-y-3 pointer-events-auto">
              {/* Dynamic Target Instruction Glass Card */}
              <div className="w-full bg-slate-950/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 text-white space-y-1 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-[#23B5A8]/25 border border-[#23B5A8]/50 flex items-center justify-center">
                      <Scan className="w-3 h-3 text-[#79D7D2]" />
                    </div>
                    <h3 className="text-[12.5px] font-black tracking-wide text-white">
                      Foto {captureStepIdx + 1}/4: Pindai {biometricFlow[captureStepIdx].label}
                    </h3>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#79D7D2]/20 text-[#79D7D2] font-bold border border-[#79D7D2]/30">
                    Langkah {captureStepIdx + 1} dari 4
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-snug">
                  {biometricFlow[captureStepIdx].desc}
                </p>
              </div>

              {/* Mega Shutter Capture Button with Aura Rings */}
              <div className="flex items-center justify-center pb-1">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
                    handleStartScan();
                  }}
                  disabled={isScanningActive}
                  className="w-18 h-18 rounded-full bg-white shadow-[0_0_35px_rgba(35,181,168,0.7)] border-4 border-[#23B5A8] flex items-center justify-center relative cursor-pointer active:scale-90 transition-all group"
                  title={`Ambil Foto ${biometricFlow[captureStepIdx].label}`}
                >
                  {/* Blinking Aura Pulse Rings */}
                  <div className="absolute -inset-2.5 rounded-full bg-[#79D7D2]/40 animate-ping [animation-duration:2s] pointer-events-none" />
                  <div className="absolute -inset-1.5 rounded-full bg-[#23B5A8]/30 animate-pulse pointer-events-none" />
                  <img
                    src="/logo_app.svg"
                    alt="Capture"
                    className="w-11 h-11 object-contain group-hover:scale-110 transition-transform relative z-10 drop-shadow-sm"
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
        <div className="flex-1 flex flex-col justify-between p-3.5 relative h-full w-full overflow-hidden">
          {/* Top Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setScreeningStep(1)}
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-ford-blue flex items-center justify-center shadow-md cursor-pointer border border-white/60 backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>

              <div className="text-center">
                <h3 className="text-[14px] font-black text-ford-blue leading-tight">Kuesioner</h3>
                <p className="text-[9.5px] text-ford-blue/80 font-medium">
                  Pertanyaan {currentQuestionIdx + 1} dari {questions.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-ford-blue flex items-center justify-center shadow-md cursor-pointer border border-white/60 backdrop-blur-md"
              >
                <HelpCircle className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>
            </div>

            {/* Slider / Step Indicator Bar */}
            <div className="w-full h-1.5 bg-white/50 rounded-full relative my-1 overflow-visible">
              <div
                className="h-full bg-brand-orange rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
              <div
                className="w-3.5 h-3.5 rounded-full bg-brand-orange border-2 border-white shadow-md absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ left: `calc(${((currentQuestionIdx + 1) / questions.length) * 100}% - 7px)` }}
              />
            </div>
          </div>

          {/* Center Mascot & Question */}
          <div className="my-auto space-y-3 text-center px-1">
            {/* Mascot Avatar in Circle */}
            <div className="w-16 h-16 mx-auto rounded-full bg-white/90 p-2 shadow-md border-2 border-white flex items-center justify-center">
              <img
                src="/logo_app.svg"
                alt="Kcal Mascot"
                className="w-11 h-11 object-contain animate-bounce [animation-duration:3s]"
              />
            </div>

            {/* Current Question */}
            <div className="space-y-1">
              <h2 className="text-[14.5px] font-black text-ford-blue leading-snug">
                {questions[currentQuestionIdx].title}
              </h2>
              <p className="text-[10.5px] text-ford-blue/80 font-medium leading-tight">
                {questions[currentQuestionIdx].subtitle}
              </p>
            </div>

            {/* Multiple Choice Answers */}
            <div className="space-y-1.5 pt-1">
              {questions[currentQuestionIdx].options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAnswer(opt)}
                  className={`w-full py-2.5 px-3.5 rounded-xl border text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center ${
                    selectedAnswer === opt
                      ? "bg-ford-blue text-white border-ford-blue scale-[0.98]"
                      : "bg-white/90 hover:bg-white text-ford-blue border-white/60 hover:scale-[1.01]"
                  }`}
                >
                  <span>{opt}</span>
                </button>
              ))}

              {/* Custom Text Write-in Button */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="inline-flex items-center gap-1 text-[10.5px] font-bold text-ford-blue/80 hover:text-ford-blue pt-0.5 cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Ketik penjelasan lebih lanjut</span>
                </button>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <textarea
                    rows={2}
                    placeholder="Tuliskan keluhan atau kondisi anak..."
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    className="w-full p-2 bg-white rounded-xl border border-white text-[11px] font-medium text-ford-blue focus:outline-none shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer(customAnswer || "Penjelasan khusus tersimpan")}
                    className="w-full py-1.5 bg-ford-blue text-white font-bold rounded-xl text-[11px] cursor-pointer"
                  >
                    Simpan &amp; Lanjut
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-1 text-center text-[9.5px] text-ford-blue/70 font-semibold">
            Didukung Analisis Klinis Kemenkes RI &amp; BGN 2026
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: MENU UNTUK ANDA (FIT VIEWPORT)                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 3 && (
        <div className="flex-1 flex flex-col justify-between p-3.5 relative h-full w-full overflow-hidden">
          {/* Top Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setScreeningStep(2)}
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-ford-blue flex items-center justify-center shadow-md cursor-pointer border border-white/60 backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>

              <h3 className="text-[14px] font-black text-ford-blue">Menu untuk Anda</h3>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-ford-blue flex items-center justify-center shadow-md cursor-pointer border border-white/60 backdrop-blur-md"
              >
                <HelpCircle className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>
            </div>

            {/* Slider / Step Indicator Bar */}
            <div className="w-full h-1.5 bg-white/50 rounded-full relative my-0.5 overflow-visible">
              <div className="h-full bg-brand-orange rounded-full w-[80%]" />
              <div className="w-3.5 h-3.5 rounded-full bg-brand-orange border-2 border-white shadow-md absolute top-1/2 -translate-y-1/2 left-[calc(80%-7px)]" />
            </div>
          </div>

          {/* Main Card: Bento Image + Portion Details */}
          <div className="space-y-2 my-auto">
            {/* Bento Image Box */}
            <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
              <img
                src={menuType === "ayam" ? "/assets/mbg_tray_ayam.jpg" : "/assets/mbg_tray_bandeng.jpg"}
                alt="Menu MBG"
                className="w-full h-28 sm:h-32 object-cover"
              />
              <div className="p-2.5 bg-white space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-black text-ford-blue">
                    {menuType === "ayam" ? "Nasi Ayam Kari & Sayur" : "Nasi Bandeng Bakar Madu"}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-green-tint text-ford-blue text-[9.5px] font-bold border border-green-02/40">
                    680 kkal
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">
                  Nasi: 200 gr, Ayam: 150 gr, Brokoli: 50 gr, Kentang: 100 gr
                </p>
              </div>
            </div>

            {/* Nutrition Breakdown Table */}
            <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-white space-y-1 text-[10.5px]">
              <div className="flex items-center justify-between font-black text-ford-blue border-b border-slate-100 pb-0.5">
                <span>Nutrisi</span>
                <span>% AKG</span>
              </div>
              <div className="space-y-0.5 text-slate-600 font-medium">
                <div className="flex items-center justify-between">
                  <span>Lemak Total (10 g)</span>
                  <span className="font-bold text-ford-blue">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Karbohidrat Total (50 g)</span>
                  <span className="font-bold text-ford-blue">17%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Serat (7 g)</span>
                  <span className="font-bold text-ford-blue">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Protein (31 g)</span>
                  <span className="font-bold text-green-02">50%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vitamin D (0.4 mg)</span>
                  <span className="font-bold text-ford-blue">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Zat Besi / Fe (6 mg)</span>
                  <span className="font-bold text-brand-orange">45%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Drawer Button: QR Code Trigger */}
          <button
            type="button"
            onClick={() => setScreeningStep(4)}
            className="w-full bg-white rounded-2xl p-2.5 shadow-md border-2 border-white flex items-center justify-between text-ford-blue hover:bg-slate-50 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center">
                <QrCode className="w-3.5 h-3.5 text-light-sea-green" />
              </div>
              <div className="text-left">
                <h5 className="text-[11.5px] font-black leading-tight">QR Code Klaim</h5>
                <p className="text-[9px] text-slate-500">Klik untuk menampilkan verifikasi klaim makanan</p>
              </div>
            </div>
            <ChevronUp className="w-4 h-4 text-ford-blue" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 4: QR CODE VERIFIKASI KLAIM MBG (FIT VIEWPORT)          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 4 && (
        <div className="flex-1 flex flex-col justify-between p-3.5 relative h-full w-full overflow-hidden">
          {/* Top Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setScreeningStep(3)}
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-ford-blue flex items-center justify-center shadow-md cursor-pointer border border-white/60 backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>

              <h3 className="text-[14px] font-black text-ford-blue">Menu untuk Anda</h3>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-ford-blue flex items-center justify-center shadow-md cursor-pointer border border-white/60 backdrop-blur-md"
              >
                <HelpCircle className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>
            </div>

            {/* QR Card Drawer Header */}
            <div className="bg-white rounded-2xl p-2 flex items-center justify-between border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                  <QrCode className="w-3 h-3 text-light-sea-green" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-ford-blue">QR Code Verifikasi</h4>
                  <p className="text-[8.5px] text-slate-500">Klik panah untuk kembali</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setScreeningStep(3)} />
            </div>
          </div>

          {/* Large High-Contrast QR Code Card */}
          <div className="my-auto bg-white rounded-3xl p-4 text-center shadow-lg border-2 border-white space-y-2.5">
            <div className="space-y-0.5">
              <h4 className="text-[13px] font-black text-ford-blue">Tunjukkan QR ini pada staf!</h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Petugas SPPG MBG akan memindai QR untuk validasi porsi menu anak Anda.
              </p>
            </div>

            {/* Generated Interactive QR Code SVG Box */}
            <div className="w-40 h-40 mx-auto p-2.5 bg-white rounded-2xl border-2 border-slate-900 shadow-inner flex items-center justify-center relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* SVG QR Code Pattern */}
                <rect x="0" y="0" width="30" height="30" fill="#131C38" rx="4" />
                <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="9" y="9" width="12" height="12" fill="#131C38" />

                <rect x="70" y="0" width="30" height="30" fill="#131C38" rx="4" />
                <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="79" y="9" width="12" height="12" fill="#131C38" />

                <rect x="0" y="70" width="30" height="30" fill="#131C38" rx="4" />
                <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                <rect x="9" y="79" width="12" height="12" fill="#131C38" />

                {/* Random Pattern Dots */}
                <rect x="36" y="8" width="8" height="8" fill="#131C38" />
                <rect x="48" y="14" width="10" height="6" fill="#131C38" />
                <rect x="36" y="24" width="6" height="10" fill="#131C38" />
                <rect x="46" y="36" width="16" height="16" fill="#131C38" rx="3" />
                <rect x="10" y="42" width="18" height="6" fill="#131C38" />
                <rect x="72" y="40" width="8" height="18" fill="#131C38" />
                <rect x="36" y="60" width="12" height="8" fill="#131C38" />
                <rect x="54" y="62" width="8" height="16" fill="#131C38" />
                <rect x="72" y="70" width="16" height="8" fill="#131C38" />
                <rect x="80" y="84" width="12" height="10" fill="#131C38" />
              </svg>

              {isQrVerifying && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center">
                  <RefreshCw className="w-7 h-7 text-light-sea-green animate-spin" />
                  <span className="text-[10.5px] font-black text-ford-blue mt-1">Memverifikasi Klaim...</span>
                </div>
              )}
            </div>

            {/* Note alert */}
            <p className="text-[9.5px] text-brand-red font-bold leading-tight">
              Note: Pastikan menu yang Anda terima sesuai dengan yang diberikan oleh aplikasi.
            </p>

            {/* Action Simulator Button */}
            <button
              type="button"
              onClick={handleVerifyQR}
              disabled={isQrVerifying}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-black text-[11.5px] shadow-sm hover:opacity-95 cursor-pointer"
            >
              {isQrVerifying ? "Memproses Verifikasi..." : "Simulasikan Staf Memindai QR"}
            </button>
          </div>

          <div className="text-center text-[9.5px] text-ford-blue/70 font-semibold">
            Kecamatan {citizenUser?.district || "Kebomas"} • Ginofest 2026
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 5: SCAN SUKSES! & PROFIL NUTRISI TUBUH (FIT VIEWPORT)   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 5 && (
        <div className="flex-1 flex flex-col justify-between p-3.5 relative h-full w-full overflow-hidden">
          {/* Top Banner: Scan Sukses */}
          <div className="space-y-0.5 pt-0.5 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white text-green-02 flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3] text-green-02" />
              </div>
              <h2 className="text-[16px] font-black text-ford-blue">Scan Sukses!</h2>
            </div>
            <p className="text-[10px] text-ford-blue/80 font-medium max-w-xs mx-auto leading-tight">
              Data porsi makan &amp; pemenuhan nutrisi telah diverifikasi. Selamat menikmati makanan Anda!
            </p>
          </div>

          {/* Center Graphic: Full Body Silhouette with Animated Fill Height */}
          <div className="my-auto flex flex-col items-center justify-center relative py-1">
            <div className="relative w-48 h-60 flex items-center justify-center">
              <svg viewBox="0 0 200 300" className="w-full h-full">
                <defs>
                  {/* Linear gradient fill for human body */}
                  <linearGradient id="bodyFill" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FF7A00" />
                    <stop offset="45%" stopColor="#FF8C00" />
                    <stop offset="45.1%" stopColor="#FFFFFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Human Silhouette Path (Walking / Waving child pose) */}
                <circle cx="105" cy="40" r="22" stroke="#FF7A00" strokeWidth="2.5" fill="none" />
                <path
                  d="M85 68 C70 65, 55 50, 48 45 C44 42, 40 45, 42 50 C45 60, 60 75, 78 85"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M125 68 C140 75, 145 95, 148 115"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M80 65 C90 60, 120 60, 130 65 C135 90, 135 125, 130 145 C130 160, 145 200, 155 240 C156 245, 150 248, 145 245 C135 240, 120 185, 115 160 C110 160, 95 185, 80 245 C75 250, 70 245, 72 238 C80 195, 90 155, 90 145 C80 125, 75 90, 80 65 Z"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  fill="url(#bodyFill)"
                />
              </svg>

              {/* 45% Badge overlay at torso level */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white/95 shadow-sm border border-brand-orange text-[11px] font-black text-brand-orange">
                45%
              </div>
            </div>
          </div>

          {/* Bottom Card Summary & Action Buttons */}
          <div className="space-y-2">
            {/* Info Summary Card */}
            <div className="bg-white rounded-2xl p-2.5 shadow-md border-2 border-white space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[16px] font-black text-brand-orange">45%</span>
                <span className="text-[11px] font-bold text-ford-blue">
                  kebutuhan gizi harian Anda terpenuhi
                </span>
              </div>
              <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[10px]">
                <span className="font-bold text-ford-blue">
                  {citizenUser?.name || "Oscar Ryanda Putra"}
                </span>
                <span className="text-slate-500 font-medium">
                  9 Tahun • Kec. {citizenUser?.district || "Kebomas"}
                </span>
              </div>
            </div>

            {/* 3 Action Buttons in a Row: Kembali | Bantuan | Feedback */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScreeningStep(1)}
                className="py-2 rounded-xl bg-white/90 hover:bg-white text-ford-blue font-bold text-[11px] shadow-sm border border-white/60 cursor-pointer text-center transition-all active:scale-95"
              >
                ← Kembali
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="py-2 rounded-xl bg-white/90 hover:bg-white text-ford-blue font-bold text-[11px] shadow-sm border border-white/60 cursor-pointer text-center transition-all active:scale-95"
              >
                ? Bantuan
              </button>

              <button
                type="button"
                onClick={onNavigateToComplaint}
                className="py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[11px] shadow-sm cursor-pointer text-center transition-all active:scale-95"
              >
                📝 Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};
