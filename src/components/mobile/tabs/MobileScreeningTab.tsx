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
  CheckCircle2,
  Scan,
  User,
  FlipHorizontal,
  Zap,
  ZapOff
} from "lucide-react";
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

  // Initialize and cleanup live camera stream on Step 1
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

  // Handle Scanning Animation
  const handleStartScan = () => {
    setIsScanningActive(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanningActive(false);
            setScreeningStep(2); // Move to Questionnaire
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 250);
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
    }, 400);
  };

  const handleVerifyQR = () => {
    setIsQrVerifying(true);
    setTimeout(() => {
      setIsQrVerifying(false);
      setScreeningStep(5); // Move to Success screen
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-[#D4EC9E] via-[#E2F5B8] to-[#BFE491] text-ford-blue select-none font-sans relative overflow-hidden animate-in fade-in duration-300">
      {/* ═══ HELP DIALOG MODAL ═══ */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 text-left shadow-2xl animate-in zoom-in-95">
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
      {/* SCREEN 1: FULLSCREEN CAMERA WITH framebody.svg OVERLAY GUIDE   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 1 && (
        <div className="flex-1 flex flex-col justify-between p-4 relative h-full w-full overflow-hidden">
          {/* Background: Live Camera Stream or Simulated Camera Canvas */}
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
              <div className="absolute inset-0 bg-gradient-to-b from-[#8C8B85] via-[#A3A29B] to-[#73726C]" />
            )}
            {/* Vignette shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />
          </div>

          {/* Top Bar Header (Z-20) */}
          <div className="flex items-center justify-between pt-1 px-0.5 z-20">
            {/* Left: Back Button */}
            <button
              type="button"
              onClick={onBackToHome}
              className="w-10 h-10 rounded-full bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-90 border border-white/60 backdrop-blur-sm"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5 text-ford-blue stroke-[2.5]" />
            </button>

            {/* Right Actions: Flash, Flip/Rotate Camera, Help */}
            <div className="flex items-center gap-2">
              {/* Flash Toggle Button */}
              <button
                type="button"
                onClick={handleToggleFlash}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all active:scale-90 border border-white/60 backdrop-blur-sm ${
                  isFlashOn ? "bg-amber-300 text-ford-blue ring-2 ring-amber-400" : "bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue"
                }`}
                title={isFlashOn ? "Matikan Flash" : "Nyalakan Flash"}
              >
                {isFlashOn ? <Zap className="w-4 h-4 fill-current text-ford-blue" /> : <ZapOff className="w-4 h-4 text-ford-blue" />}
              </button>

              {/* Camera Flip / Rotate Button */}
              <button
                type="button"
                onClick={handleFlipCamera}
                className="w-10 h-10 rounded-full bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue flex items-center justify-center shadow-lg cursor-pointer transition-all active:scale-90 border border-white/60 backdrop-blur-sm"
                title="Putar / Balik Kamera"
              >
                <FlipHorizontal className="w-4 h-4 text-ford-blue stroke-[2.5]" />
              </button>

              {/* Help Button */}
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-10 h-10 rounded-full bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue flex items-center justify-center shadow-lg cursor-pointer transition-all active:scale-90 border border-white/60 backdrop-blur-sm"
                title="Bantuan"
              >
                <HelpCircle className="w-5 h-5 text-ford-blue stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Center: Large Official framebody.svg Overlay from public/ */}
          <div className="my-auto flex-1 flex flex-col items-center justify-center relative py-1 z-10 w-full overflow-hidden">
            {/* Fullscreen Laser Scanning Animation */}
            {isScanningActive && (
              <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                {/* Shutter White Flash */}
                <div className="absolute inset-0 bg-white/70 animate-in fade-in duration-150 pointer-events-none" />
                {/* Full-width laser beam sweeping */}
                <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-green-02 to-transparent shadow-[0_0_30px_#22B5AC] animate-bounce [animation-duration:1s]" />
                {/* Biometric Telemetry overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-black/70 border border-green-02 text-green-02 font-mono font-bold text-[11px] backdrop-blur-md shadow-lg flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>MEMINDAI BIOMETRIK: {scanProgress}%</span>
                </div>
              </div>
            )}

            {/* Prominent Large framebody.svg */}
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[52vh] max-h-[460px] flex items-center justify-center px-1">
              <img
                src="/framebody.svg"
                alt="Garis Panduan Tubuh"
                className={`w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] transition-all duration-300 ${
                  isScanningActive ? "scale-105 filter drop-shadow-[0_0_20px_rgba(34,181,172,0.8)]" : ""
                }`}
              />
            </div>
          </div>

          {/* Bottom Card & Capture Trigger Button (Z-20) */}
          <div className="space-y-3 z-20 pb-3 px-0.5">
            {/* Clean Glassmorphism Scanning Card */}
            <div className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 text-white space-y-1 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-02/25 border border-green-02/40 flex items-center justify-center">
                  <Scan className="w-3.5 h-3.5 text-green-02" />
                </div>
                <h3 className="text-[13px] font-black tracking-wide text-white">Scanning</h3>
              </div>
              <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                Posisikan Wajah, Tangan, Kuku, Rambut, dan Mata Anda sesuai petunjuk garis putih di atas.
              </p>
            </div>

            {/* Circular Mascot Capture Button with Blinking Rings */}
            <div className="flex items-center justify-center pb-1">
              <button
                type="button"
                onClick={handleStartScan}
                disabled={isScanningActive}
                className="w-18 h-18 rounded-full bg-white shadow-[0_0_35px_rgba(34,181,172,0.65)] border-4 border-[#78A98A] flex items-center justify-center relative cursor-pointer active:scale-90 hover:scale-105 transition-all group"
                title="Ambil Foto & Mulai Pindaian AI"
              >
                {/* Blinking Aura Pulse Rings */}
                <div className="absolute -inset-2.5 rounded-full bg-green-02/40 animate-ping [animation-duration:2s] pointer-events-none" />
                <div className="absolute -inset-1.5 rounded-full bg-light-sea-green/30 animate-pulse pointer-events-none" />
                <img
                  src="/logo_app.svg"
                  alt="Capture"
                  className="w-11 h-11 object-contain group-hover:scale-110 transition-transform relative z-10"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 2: KUESIONER INTERAKTIF AI (QUESTIONNAIRE)              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 2 && (
        <div className="flex-1 flex flex-col justify-between p-4 relative">
          {/* Top Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setScreeningStep(1)}
                className="w-9 h-9 rounded-full bg-[#E5F7A3] text-ford-blue flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-ford-blue" />
              </button>

              <div className="text-center">
                <h3 className="text-[15px] font-black text-ford-blue">Kuesioner</h3>
                <p className="text-[10px] text-ford-blue/80 font-medium">
                  Pertanyaan {currentQuestionIdx + 1} dari {questions.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-full bg-[#E5F7A3] text-ford-blue flex items-center justify-center font-bold shadow-xs cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-ford-blue" />
              </button>
            </div>

            {/* Slider / Step Indicator Bar */}
            <div className="w-full h-1.5 bg-white/40 rounded-full relative my-2 overflow-visible">
              <div
                className="h-full bg-brand-orange rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
              <div
                className="w-3.5 h-3.5 rounded-full bg-brand-orange border-2 border-white shadow-xs absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ left: `calc(${((currentQuestionIdx + 1) / questions.length) * 100}% - 7px)` }}
              />
            </div>
          </div>

          {/* Center Mascot & Question */}
          <div className="my-auto space-y-4 text-center px-2">
            {/* Mascot Avatar in Circle */}
            <div className="w-20 h-20 mx-auto rounded-full bg-white/80 p-2 shadow-lg border-2 border-white flex items-center justify-center">
              <img
                src="/logo_app.svg"
                alt="Kcal Mascot"
                className="w-14 h-14 object-contain animate-bounce [animation-duration:3s]"
              />
            </div>

            {/* Current Question */}
            <div className="space-y-1.5">
              <h2 className="text-[16px] font-black text-ford-blue leading-snug">
                {questions[currentQuestionIdx].title}
              </h2>
              <p className="text-[11px] text-ford-blue/80 font-medium leading-relaxed">
                {questions[currentQuestionIdx].subtitle}
              </p>
            </div>

            {/* Multiple Choice Answers */}
            <div className="space-y-2 pt-2">
              {questions[currentQuestionIdx].options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAnswer(opt)}
                  className={`w-full py-3 px-4 rounded-2xl border text-[13px] font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center ${
                    selectedAnswer === opt
                      ? "bg-ford-blue text-white border-ford-blue scale-[0.98]"
                      : "bg-white/80 hover:bg-white text-ford-blue border-white/60 hover:scale-[1.01]"
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
                  className="inline-flex items-center gap-1 text-[11.5px] font-bold text-ford-blue/80 hover:text-ford-blue pt-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ketik penjelasan lebih lanjut</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows={2}
                    placeholder="Tuliskan keluhan atau kondisi anak..."
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    className="w-full p-2.5 bg-white/95 rounded-xl border border-white text-[12px] font-medium text-ford-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer(customAnswer || "Penjelasan khusus tersimpan")}
                    className="w-full py-2 bg-ford-blue text-white font-bold rounded-xl text-[12px]"
                  >
                    Simpan &amp; Lanjut
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 text-center text-[10px] text-ford-blue/60 font-semibold">
            Didukung Analisis Klinis Kemenkes RI &amp; BGN 2026
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 3: MENU UNTUK ANDA (PERSONALIZED MENU RECOMMENDATION)   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 3 && (
        <div className="flex-1 flex flex-col justify-between p-4 relative">
          {/* Top Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setScreeningStep(2)}
                className="w-9 h-9 rounded-full bg-[#E5F7A3] text-ford-blue flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-ford-blue" />
              </button>

              <h3 className="text-[15px] font-black text-ford-blue">Menu untuk Anda</h3>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-full bg-[#E5F7A3] text-ford-blue flex items-center justify-center font-bold shadow-xs cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-ford-blue" />
              </button>
            </div>

            {/* Slider / Step Indicator Bar */}
            <div className="w-full h-1.5 bg-white/40 rounded-full relative my-1 overflow-visible">
              <div className="h-full bg-brand-orange rounded-full w-[80%]" />
              <div className="w-3.5 h-3.5 rounded-full bg-brand-orange border-2 border-white shadow-xs absolute top-1/2 -translate-y-1/2 left-[calc(80%-7px)]" />
            </div>
          </div>

          {/* Main Card: Bento Image + Portion Details */}
          <div className="space-y-2.5 my-auto">
            {/* Bento Image Box */}
            <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
              <img
                src={menuType === "ayam" ? "/assets/mbg_tray_ayam.jpg" : "/assets/mbg_tray_bandeng.jpg"}
                alt="Menu MBG"
                className="w-full h-36 object-cover"
              />
              <div className="p-3 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-black text-ford-blue">
                    {menuType === "ayam" ? "Nasi Ayam Kari & Sayur" : "Nasi Bandeng Bakar Madu"}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-green-tint text-ford-blue text-[10px] font-bold border border-green-02/40">
                    680 kkal
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-snug">
                  Nasi: 200 gr, Ayam dada: 150 gr, Brokoli: 50 gr, Kentang: 100 gr
                </p>
              </div>
            </div>

            {/* Nutrition Breakdown Table */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-white space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-black text-ford-blue border-b border-slate-100 pb-1">
                <span>Nutrisi</span>
                <span>% AKG</span>
              </div>
              <div className="space-y-1 text-slate-600 font-medium">
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
            className="w-full bg-white rounded-2xl p-3 shadow-md border-2 border-white flex items-center justify-between text-ford-blue hover:bg-slate-50 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E5F7A3] text-ford-blue flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h5 className="text-[12px] font-black leading-tight">QR Code Klaim</h5>
                <p className="text-[9.5px] text-slate-500">Klik untuk menampilkan verifikasi klaim makanan</p>
              </div>
            </div>
            <ChevronUp className="w-4 h-4 text-ford-blue" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 4: QR CODE VERIFIKASI KLAIM MBG                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 4 && (
        <div className="flex-1 flex flex-col justify-between p-4 relative">
          {/* Top Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setScreeningStep(3)}
                className="w-9 h-9 rounded-full bg-[#E5F7A3] text-ford-blue flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-ford-blue" />
              </button>

              <h3 className="text-[15px] font-black text-ford-blue">Menu untuk Anda</h3>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="w-9 h-9 rounded-full bg-[#E5F7A3] text-ford-blue flex items-center justify-center font-bold shadow-xs cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-ford-blue" />
              </button>
            </div>

            {/* QR Card Drawer Header */}
            <div className="bg-white rounded-2xl p-2.5 flex items-center justify-between border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E5F7A3] text-ford-blue flex items-center justify-center">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11.5px] font-bold text-ford-blue">QR Code Verifikasi</h4>
                  <p className="text-[9px] text-slate-500">Klik untuk menyembunyikan</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setScreeningStep(3)} />
            </div>
          </div>

          {/* Large High-Contrast QR Code Card */}
          <div className="my-auto bg-white rounded-3xl p-5 text-center shadow-lg border-2 border-white space-y-3">
            <div className="space-y-1">
              <h4 className="text-[13.5px] font-black text-ford-blue">Tunjukkan QR ini pada staf!</h4>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Petugas SPPG Makan Bergizi Gratis akan memindai QR untuk validasi porsi menu anak Anda.
              </p>
            </div>

            {/* Generated Interactive QR Code SVG Box */}
            <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-900/80 shadow-inner flex items-center justify-center relative">
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
                  <RefreshCw className="w-8 h-8 text-light-sea-green animate-spin" />
                  <span className="text-[11px] font-black text-ford-blue mt-1">Memverifikasi Klaim...</span>
                </div>
              )}
            </div>

            {/* Note alert */}
            <p className="text-[10px] text-brand-red font-bold leading-tight">
              Note: Pastikan menu yang Anda terima sesuai dengan yang diberikan oleh aplikasi.
            </p>

            {/* Action Simulator Button */}
            <button
              type="button"
              onClick={handleVerifyQR}
              disabled={isQrVerifying}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-black text-[12px] shadow-sm hover:opacity-95 cursor-pointer"
            >
              {isQrVerifying ? "Memproses Verifikasi..." : "Simulasikan Staf Memindai QR"}
            </button>
          </div>

          <div className="text-center text-[10px] text-ford-blue/70 font-semibold pb-1">
            Kecamatan {citizenUser?.district || "Kebomas"} • Ginofest 2026
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 5: SCAN SUKSES! & PROFIL NUTRISI TUBUH                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {screeningStep === 5 && (
        <div className="flex-1 flex flex-col justify-between p-4 relative">
          {/* Top Banner: Scan Sukses */}
          <div className="space-y-1 pt-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white text-green-02 flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4 stroke-[3] text-green-02" />
              </div>
              <h2 className="text-[17px] font-black text-ford-blue">Scan Sukses!</h2>
            </div>
            <p className="text-[10.5px] text-ford-blue/80 font-medium max-w-xs mx-auto leading-tight">
              Data porsi makan &amp; pemenuhan nutrisi telah diverifikasi. Selamat menikmati makanan Anda!
            </p>
          </div>

          {/* Center Graphic: Full Body Silhouette with Animated Fill Height */}
          <div className="my-auto flex flex-col items-center justify-center relative py-2">
            <div className="relative w-56 h-72 flex items-center justify-center">
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
                {/* Head */}
                <circle cx="105" cy="40" r="22" stroke="#FF7A00" strokeWidth="2.5" fill="none" />
                {/* Raised Waving Arm */}
                <path
                  d="M85 68 C70 65, 55 50, 48 45 C44 42, 40 45, 42 50 C45 60, 60 75, 78 85"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Right Arm */}
                <path
                  d="M125 68 C140 75, 145 95, 148 115"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Body Torso & Legs with 45% Orange Fill */}
                <path
                  d="M80 65 C90 60, 120 60, 130 65 C135 90, 135 125, 130 145 C130 160, 145 200, 155 240 C156 245, 150 248, 145 245 C135 240, 120 185, 115 160 C110 160, 95 185, 80 245 C75 250, 70 245, 72 238 C80 195, 90 155, 90 145 C80 125, 75 90, 80 65 Z"
                  stroke="#FF7A00"
                  strokeWidth="2.5"
                  fill="url(#bodyFill)"
                />
              </svg>

              {/* 45% Badge overlay at torso level */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white/90 shadow-sm border border-brand-orange text-[12px] font-black text-brand-orange">
                45%
              </div>
            </div>
          </div>

          {/* Bottom Card Summary & Action Buttons */}
          <div className="space-y-2.5">
            {/* Info Summary Card */}
            <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-white space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[18px] font-black text-brand-orange">45%</span>
                <span className="text-[11.5px] font-bold text-ford-blue">
                  kebutuhan gizi harian Anda terpenuhi
                </span>
              </div>
              <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[10.5px]">
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
                className="py-2.5 rounded-xl bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue font-bold text-[11.5px] shadow-xs cursor-pointer text-center transition-all active:scale-95"
              >
                ← Kembali
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="py-2.5 rounded-xl bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue font-bold text-[11.5px] shadow-xs cursor-pointer text-center transition-all active:scale-95"
              >
                ? Bantuan
              </button>

              <button
                type="button"
                onClick={onNavigateToComplaint}
                className="py-2.5 rounded-xl bg-[#E5F7A3] hover:bg-[#D5EB8E] text-ford-blue font-bold text-[11.5px] shadow-xs cursor-pointer text-center transition-all active:scale-95"
              >
                📝 Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
