"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileOnboardingScreenProps {
  onSkip: () => void;
  onFinish: () => void;
}

interface OnboardingSlide {
  badge: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  title: string;
  description: string;
  image: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    badge: "Masyarakat",
    badgeBg: "bg-[#79D7D2]/15",
    badgeText: "text-ford-blue",
    badgeBorder: "border-[#79D7D2]/40",
    title: "Wujudkan Keluarga & Lingkungan Sehat",
    description:
      "Mulai langkah awal Anda untuk kesehatan yang lebih baik. Pantau kondisi gizi diri sendiri, keluarga tercinta, hingga komunitas di sekitar Anda dengan mudah dalam satu aplikasi.",
    image: "/onboard1.svg",
  },
  {
    badge: "Deteksi Defisiensi Nutrisi",
    badgeBg: "bg-blue-50",
    badgeText: "text-ford-blue",
    badgeBorder: "border-blue-200/70",
    title: "Deteksi Cerdas Kebutuhan Gizi",
    description:
      "Tidak perlu menebak-nebak. Analisis defisiensi nutrisi tubuh Anda secara akurat melalui teknologi pindaian cerdas (Computer Vision) dan kuesioner interaktif berbasis Generative AI.",
    image: "/onboard2.svg",
  },
  {
    badge: "Rekomendasi Menu Bergizi",
    badgeBg: "bg-amber-50",
    badgeText: "text-ford-blue",
    badgeBorder: "border-amber-200/80",
    title: "Menu Bergizi Khusus Untuk Anda",
    description:
      "Dapatkan rekomendasi Makan Bergizi Gratis yang dipersonalisasi. Sistem AI kami akan merancang menu lezat yang disesuaikan persis dengan kebutuhan gizi unik harian Anda.",
    image: "/onboard3.svg",
  },
];

export const MobileOnboardingScreen: React.FC<MobileOnboardingScreenProps> = ({ onSkip, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goToNext = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const goToPrev = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <Page className="bg-[#F8FAFC] flex flex-col justify-between px-5 py-4 text-center select-none font-sans relative overflow-hidden min-h-full">
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#79D7D2]/15 blur-3xl pointer-events-none" />

      {/* Top Bar: Skip Button */}
      <div className="relative z-10 flex items-center justify-end pb-2">
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
            onSkip();
          }}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-ford-blue font-bold text-[11px] border border-slate-200/90 shadow-2xs transition-all cursor-pointer active:scale-95"
        >
          Lewati
        </button>
      </div>

      {/* Central Content Card with Motion Animation */}
      <div className="my-auto bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100/90 relative z-10 overflow-hidden min-h-[380px] flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            {/* Illustration */}
            <div className="w-full max-w-[190px] h-[165px] flex items-center justify-center">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>

            {/* Texts */}
            <div className="space-y-2 max-w-[310px] mx-auto px-1 text-center">
              <div>
                <span
                  className={`inline-block px-3.5 py-0.5 rounded-full ${currentSlide.badgeBg} ${currentSlide.badgeText} text-[10.5px] font-bold border ${currentSlide.badgeBorder} tracking-wide shadow-2xs`}
                >
                  {currentSlide.badge}
                </span>
              </div>

              <h1 className="text-[20px] font-black text-ford-blue tracking-tight leading-snug">
                {currentSlide.title}
              </h1>

              <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                {currentSlide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Stepper Dots & Action Buttons */}
      <div className="pt-3 pb-1 z-10 space-y-3">
        {/* Stepper Dots Indicator */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 shadow-2xs cursor-pointer ${
                currentIndex === idx
                  ? "w-6 h-2 rounded-full bg-gradient-to-r from-[#23B5A8] to-[#79D7D2]"
                  : "w-2 h-2 rounded-full bg-slate-200 hover:bg-slate-300"
              }`}
              title={`Halaman ${idx + 1}`}
              aria-label={`Halaman ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Actions Row */}
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={goToPrev}
              className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 text-ford-blue font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Kembali"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-11 h-11" />
          )}

          {/* Right: Next or Start Button */}
          {currentIndex < ONBOARDING_SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Page>
  );
};
