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
    <Page className="bg-[#F8FAFC] flex flex-col justify-between px-5 py-5 min-h-full relative overflow-hidden font-sans select-none overscroll-contain">
      {/* Animated Glowing Teal & Green Background Halos */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#79D7D2]/30 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -15, 0],
          y: [0, 10, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#23B5A8]/25 blur-3xl pointer-events-none"
      />

      {/* Top Bar: Skip Button */}
      <div className="relative z-10 flex items-center justify-end pt-1">
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

      {/* Central Swipeable Carousel Slider */}
      <div
        className="my-auto py-2 w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y relative z-10"
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
            className="w-full flex flex-col items-center justify-center space-y-4 px-2"
          >
            {/* Illustration with Soft Glow */}
            <div className="w-full max-w-[210px] sm:max-w-[230px] max-h-[200px] aspect-[914/885] flex items-center justify-center relative">
              <div className="absolute inset-2 rounded-full bg-white/60 blur-md pointer-events-none" />
              <img
                src={slides[onboardingIndex].img}
                alt={slides[onboardingIndex].title}
                className="w-full h-full object-contain pointer-events-none select-none relative z-10"
              />
            </div>

            {/* Texts */}
            <div className="space-y-2.5 max-w-[320px] mx-auto px-1 text-center">
              <div>
                <span className={`inline-block px-3.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide shadow-2xs ${slides[onboardingIndex].badgeBg}`}>
                  {slides[onboardingIndex].badge}
                </span>
              </div>

              <h1 className="text-[22px] font-black text-ford-blue tracking-tight leading-snug">
                {slides[onboardingIndex].title}
              </h1>

              <p className="text-[12.5px] font-medium text-slate-500 leading-relaxed">
                {slides[onboardingIndex].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Centered Stepper Dots & Navigation Buttons */}
      <div className="pt-3 pb-2 border-t border-slate-200/60 relative z-10 space-y-3">
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

        {/* Navigation Actions Row */}
        <div className="flex items-center justify-between">
          {/* Left: Back Arrow Button */}
          {onboardingIndex > 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                triggerHaptic();
                setOnboardingIndex((prev) => Math.max(prev - 1, 0));
              }}
              className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 text-ford-blue font-bold shadow-2xs border border-slate-200/80 transition-all cursor-pointer"
              title="Kembali ke halaman sebelumnya"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          ) : (
            <div className="w-11 h-11" />
          )}

          {/* Right: Next or Start Button */}
          {onboardingIndex < 2 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                triggerHaptic();
                setOnboardingIndex((prev) => Math.min(prev + 1, 2));
              }}
              className="inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13px] shadow-[0_4px_15px_rgba(35,181,168,0.25)] transition-all cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                triggerHaptic();
                onFinish();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13.5px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </Page>
  );
};
