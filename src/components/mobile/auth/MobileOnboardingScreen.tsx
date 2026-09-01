"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileOnboardingScreenProps {
  onFinish: () => void;
  onSkip: () => void;
}

export const MobileOnboardingScreen: React.FC<MobileOnboardingScreenProps> = ({
  onFinish,
  onSkip,
}) => {
  const [onboardingIndex, setOnboardingIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.touches[0].clientX;
    if (diff > 50) {
      triggerHaptic();
      setOnboardingIndex((prev) => Math.min(prev + 1, 2));
      setTouchStartX(null);
    } else if (diff < -50) {
      triggerHaptic();
      setOnboardingIndex((prev) => Math.max(prev - 1, 0));
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  const slides = [
    {
      badge: "Masyarakat",
      badgeBg: "bg-[#79D7D2]/20 text-ford-blue border-[#79D7D2]/40",
      title: "Wujudkan Keluarga & Lingkungan Sehat",
      desc: "Mulai langkah awal Anda untuk kesehatan yang lebih baik. Pantau kondisi gizi diri sendiri, keluarga tercinta, hingga komunitas di sekitar Anda dengan mudah dalam satu aplikasi.",
      img: "/onboard1.svg",
    },
    {
      badge: "Deteksi Defisiensi Nutrisi",
      badgeBg: "bg-blue-50 text-ford-blue border-blue-200/70",
      title: "Deteksi Cerdas Kebutuhan Gizi",
      desc: "Tidak perlu menebak-nebak. Analisis defisiensi nutrisi tubuh Anda secara akurat melalui teknologi pindaian cerdas (Computer Vision) dan kuesioner interaktif berbasis Generative AI.",
      img: "/onboard2.svg",
    },
    {
      badge: "Rekomendasi Menu Bergizi",
      badgeBg: "bg-amber-50 text-ford-blue border-amber-200/80",
      title: "Menu Bergizi Khusus Untuk Anda",
      desc: "Dapatkan rekomendasi Makan Bergizi Gratis yang dipersonalisasi. Sistem AI kami akan merancang menu lezat yang disesuaikan persis dengan kebutuhan gizi unik harian Anda.",
      img: "/onboard3.svg",
    },
  ];

  return (
    <Page className="bg-[#F8FAFC] flex flex-col justify-between px-5 pt-16 pb-28 h-full h-dvh max-h-screen relative overflow-hidden font-sans select-none overscroll-none touch-pan-x">
      {/* ═══ DYNAMIC ANIMATED SPECTRUM & GLOWING BACKGROUND ═══ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated Glowing Teal & Green Background Halos */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.35, 0.65, 0.35],
            x: [-10, 15, -10],
            y: [-10, 10, -10],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#79D7D2]/40 to-[#23B5A8]/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.5, 0.25],
            x: [15, -15, 15],
            y: [10, -15, 10],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 -right-24 w-88 h-88 rounded-full bg-gradient-to-bl from-[#23B5A8]/30 via-[#79D7D2]/25 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [0.9, 1.15, 0.9],
            opacity: [0.2, 0.4, 0.2],
            x: [-5, 10, -5],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-[#79D7D2]/25 blur-3xl"
        />

        {/* Dynamic Animated Spectrum Wave Lines (G-Scan Bio-Nutrition Spectrum) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 400 800"
        >
          <defs>
            <linearGradient id="spectrum-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#79D7D2" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#23B5A8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#79D7D2" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="spectrum-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#23B5A8" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#79D7D2" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#23B5A8" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="spectrum-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#79D7D2" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#23B5A8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#79D7D2" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow-wave" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flowing Wave Line 1 */}
          <motion.path
            d="M-50,160 C50,110 150,220 250,150 C350,80 420,180 500,140"
            fill="none"
            stroke="url(#spectrum-grad-1)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            filter="url(#glow-wave)"
            animate={{
              d: [
                "M-50,160 C50,110 150,220 250,150 C350,80 420,180 500,140",
                "M-50,140 C50,200 150,120 250,190 C350,130 420,90 500,160",
                "M-50,160 C50,110 150,220 250,150 C350,80 420,180 500,140",
              ],
              strokeDashoffset: [0, -100],
            }}
            transition={{
              d: { duration: 10, repeat: Infinity, ease: "easeInOut" },
              strokeDashoffset: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
          />

          {/* Flowing Wave Line 2 (Harmonic Pulse) */}
          <motion.path
            d="M-50,260 C80,310 180,210 280,280 C360,330 420,250 500,290"
            fill="none"
            stroke="url(#spectrum-grad-2)"
            strokeWidth="3"
            filter="url(#glow-wave)"
            animate={{
              d: [
                "M-50,260 C80,310 180,210 280,280 C360,330 420,250 500,290",
                "M-50,290 C80,230 180,320 280,240 C360,270 420,330 500,260",
                "M-50,260 C80,310 180,210 280,280 C360,330 420,250 500,290",
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Flowing Wave Line 3 (Lower Spectrum Frequency) */}
          <motion.path
            d="M-50,480 C70,420 170,540 270,460 C370,390 430,510 500,470"
            fill="none"
            stroke="url(#spectrum-grad-3)"
            strokeWidth="2"
            strokeDasharray="4 6"
            animate={{
              d: [
                "M-50,480 C70,420 170,540 270,460 C370,390 430,510 500,470",
                "M-50,450 C70,510 170,440 270,520 C370,460 430,420 500,490",
                "M-50,480 C70,420 170,540 270,460 C370,390 430,510 500,470",
              ],
              strokeDashoffset: [0, 80],
            }}
            transition={{
              d: { duration: 11, repeat: Infinity, ease: "easeInOut" },
              strokeDashoffset: { duration: 16, repeat: Infinity, ease: "linear" },
            }}
          />

          {/* Flowing Wave Line 4 (Subtle Grid Horizon) */}
          <motion.path
            d="M-50,600 C100,560 200,630 300,570 C400,520 450,610 500,580"
            fill="none"
            stroke="url(#spectrum-grad-1)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            animate={{
              d: [
                "M-50,600 C100,560 200,630 300,570 C400,520 450,610 500,580",
                "M-50,570 C100,620 200,550 300,610 C400,570 450,540 500,600",
                "M-50,600 C100,560 200,630 300,570 C400,520 450,610 500,580",
              ],
            }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </svg>

        {/* Floating Glowing Bio-Spectrum Particle Sparkles */}
        {[
          { x: "18%", y: "22%", size: 6, dur: 4.5, delay: 0 },
          { x: "82%", y: "18%", size: 8, dur: 5.2, delay: 1.2 },
          { x: "75%", y: "45%", size: 5, dur: 4.8, delay: 2.1 },
          { x: "22%", y: "58%", size: 7, dur: 5.6, delay: 0.8 },
          { x: "85%", y: "68%", size: 6, dur: 4.2, delay: 1.7 },
          { x: "32%", y: "78%", size: 5, dur: 5.0, delay: 2.5 },
        ].map((pt, i) => (
          <motion.div
            key={i}
            style={{ left: pt.x, top: pt.y, width: pt.size, height: pt.size }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: pt.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: pt.delay,
            }}
            className="absolute rounded-full bg-gradient-to-tr from-[#79D7D2] to-[#23B5A8] shadow-[0_0_10px_rgba(121,215,210,0.8)]"
          />
        ))}
      </div>

      {/* Fixed Top Bar: Skip Button (Always strictly pinned to top) */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-end pointer-events-auto">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            triggerHaptic();
            onSkip();
          }}
          className="px-4 py-1.5 rounded-full bg-white/90 hover:bg-white text-ford-blue font-bold text-[12px] border border-slate-200/80 shadow-2xs backdrop-blur-xs transition-all cursor-pointer"
        >
          Lewati
        </motion.button>
      </div>

      {/* Central Swipeable Carousel Slider (Strictly non-overflowing) */}
      <div
        className="my-auto py-1 w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-x select-none relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingIndex}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col items-center justify-center space-y-3 px-2"
          >
            {/* Illustration with Soft Glow */}
            <div className="w-full max-w-[175px] sm:max-w-[200px] max-h-[160px] sm:max-h-[180px] aspect-[914/885] flex items-center justify-center relative">
              <div className="absolute inset-2 rounded-full bg-white/60 blur-md pointer-events-none" />
              <img
                src={slides[onboardingIndex].img}
                alt={slides[onboardingIndex].title}
                className="w-full h-full object-contain pointer-events-none select-none relative z-10"
              />
            </div>

            {/* Texts */}
            <div className="space-y-1.5 max-w-[320px] mx-auto px-1 text-center">
              <div>
                <span className={`inline-block px-3 py-0.5 rounded-full text-[10.5px] font-bold border tracking-wide shadow-2xs ${slides[onboardingIndex].badgeBg}`}>
                  {slides[onboardingIndex].badge}
                </span>
              </div>

              <h1 className="text-[19px] sm:text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                {slides[onboardingIndex].title}
              </h1>

              <p className="text-[11.5px] sm:text-[12px] font-medium text-slate-500 leading-relaxed">
                {slides[onboardingIndex].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Navigation Controls: Seamlessly blended with main screen bg, perfectly balanced margins */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-[#F8FAFC]/0 px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 pointer-events-auto">
        {/* Stepper Dots Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                triggerHaptic();
                setOnboardingIndex(idx);
              }}
              className={`transition-all duration-300 cursor-pointer ${
                onboardingIndex === idx
                  ? "w-6 h-2 rounded-full bg-gradient-to-r from-[#23B5A8] to-[#79D7D2] shadow-2xs"
                  : "w-2 h-2 rounded-full bg-slate-300/80 hover:bg-slate-400"
              }`}
              title={`Halaman ${idx + 1}`}
              aria-label={`Halaman ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Actions Row - Symmetrically Balanced */}
        <div className="flex items-center gap-3 w-full">
          {/* Left: Back Arrow Button (Only on slide 1 & 2) */}
          {onboardingIndex > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                triggerHaptic();
                setOnboardingIndex((prev) => Math.max(prev - 1, 0));
              }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 text-ford-blue font-bold shadow-2xs border border-slate-200/80 transition-all cursor-pointer shrink-0"
              title="Kembali ke halaman sebelumnya"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-ford-blue" />
            </motion.button>
          )}

          {/* Right/Full: Next or Start Button */}
          {onboardingIndex < 2 ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                triggerHaptic();
                setOnboardingIndex((prev) => Math.min(prev + 1, 2));
              }}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[14px] shadow-[0_4px_15px_rgba(35,181,168,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-4 h-4 text-ford-blue" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                triggerHaptic();
                onFinish();
              }}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[14px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4 text-ford-blue" />
            </motion.button>
          )}
        </div>
      </div>
    </Page>
  );
};
