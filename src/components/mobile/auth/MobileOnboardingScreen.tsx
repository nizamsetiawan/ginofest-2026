"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Page } from "konsta/react";

interface MobileOnboardingScreenProps {
  onSkip: () => void;
  onFinish: () => void;
}

export const MobileOnboardingScreen: React.FC<MobileOnboardingScreenProps> = ({ onSkip, onFinish }) => {
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Dynamic Time-of-Day Vitality Theme Indicator
  const getOnboardingGlowClasses = () => {
    return {
      primary: "from-green-02/20 to-light-sea-green/20",
      secondary: "from-teal-300/25 to-green-100/30",
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe && onboardingIndex < 2) {
      setOnboardingIndex((prev) => prev + 1);
    }
    if (isRightSwipe && onboardingIndex > 0) {
      setOnboardingIndex((prev) => prev - 1);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <Page className="bg-gradient-to-b from-[#FFFFFF] via-[#F4FDF9] to-[#FFFFFF] flex flex-col justify-between p-6 text-center select-none font-sans relative overflow-hidden">
      {/* Dynamic Time-of-Day Ambient Vitality Glow & Micro-Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className={`absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr ${getOnboardingGlowClasses().primary} blur-3xl animate-pulse`} 
        />
        <div 
          className={`absolute top-[36%] left-[32%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br ${getOnboardingGlowClasses().secondary} blur-2xl animate-bounce [animation-duration:8s] opacity-75`} 
        />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-green-02/15 animate-spin [animation-duration:45s]" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-light-sea-green/15 animate-spin [animation-duration:60s] [animation-direction:reverse]" />

        <div className="absolute top-[18%] left-[18%] text-green-02/40 text-[13px] font-mono animate-pulse [animation-duration:3s]">✦</div>
        <div className="absolute top-[22%] right-[16%] text-light-sea-green/50 text-[15px] font-bold animate-bounce [animation-duration:4.5s]">+</div>
        <div className="absolute top-[42%] left-[14%] w-2 h-2 rounded-full bg-amber-400/30 animate-pulse [animation-duration:2.5s]" />
        <div className="absolute top-[44%] right-[15%] text-ford-blue/25 text-[11px] font-mono animate-bounce [animation-duration:5.5s]">✦</div>
        <div className="absolute top-[12%] right-[35%] w-1.5 h-1.5 rounded-full bg-green-02/35 animate-ping [animation-duration:4s]" />
      </div>

      {/* Top Bar: Only Skip Button (Right-Aligned) */}
      <div className="relative z-10 flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-white text-ford-blue font-bold text-[11px] border border-slate-200/80 shadow-2xs backdrop-blur-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          Lewati
        </button>
      </div>

      {/* Central Swipeable Carousel Slider */}
      <div
        className="my-auto py-2 w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out w-full"
          style={{ transform: `translateX(-${onboardingIndex * 100}%)` }}
        >
          {/* Slide 1: Masyarakat */}
          <div className="w-full shrink-0 flex flex-col items-center justify-center space-y-4 px-2">
            <div className="w-full max-w-[200px] sm:max-w-[220px] max-h-[190px] aspect-[914/885] flex items-center justify-center">
              <img
                src="/onboard1.svg"
                alt="Onboarding 1 - Masyarakat"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>

            <div className="space-y-2 max-w-[320px] mx-auto px-1 text-center">
              <div>
                <span className="inline-block px-3.5 py-0.5 rounded-full bg-green-tint text-ford-blue text-[10.5px] font-bold border border-green-02/40 tracking-wide shadow-2xs">
                  Masyarakat
                </span>
              </div>

              <h1 className="text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                Wujudkan Keluarga &amp; Lingkungan Sehat
              </h1>

              <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed">
                Mulai langkah awal Anda untuk kesehatan yang lebih baik. Pantau kondisi gizi diri sendiri, keluarga tercinta, hingga komunitas di sekitar Anda dengan mudah dalam satu aplikasi.
              </p>
            </div>
          </div>

          {/* Slide 2: Deteksi Defisiensi Nutrisi */}
          <div className="w-full shrink-0 flex flex-col items-center justify-center space-y-4 px-2">
            <div className="w-full max-w-[200px] sm:max-w-[220px] max-h-[190px] aspect-[914/885] flex items-center justify-center">
              <img
                src="/onboard2.svg"
                alt="Onboarding 2 - Deteksi Defisiensi Nutrisi"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>

            <div className="space-y-2 max-w-[320px] mx-auto px-1 text-center">
              <div>
                <span className="inline-block px-3.5 py-0.5 rounded-full bg-blue-50 text-ford-blue text-[10.5px] font-bold border border-blue-200/70 tracking-wide shadow-2xs">
                  Deteksi Defisiensi Nutrisi
                </span>
              </div>

              <h1 className="text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                Deteksi Cerdas Kebutuhan Gizi
              </h1>

              <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed">
                Tidak perlu menebak-nebak. Analisis defisiensi nutrisi tubuh Anda secara akurat melalui teknologi pindaian cerdas (Computer Vision) dan kuesioner interaktif berbasis Generative AI.
              </p>
            </div>
          </div>

          {/* Slide 3: Rekomendasi Menu Bergizi */}
          <div className="w-full shrink-0 flex flex-col items-center justify-center space-y-4 px-2">
            <div className="w-full max-w-[200px] sm:max-w-[220px] max-h-[190px] aspect-[914/885] flex items-center justify-center">
              <img
                src="/onboard3.svg"
                alt="Onboarding 3 - Rekomendasi Menu Bergizi"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>

            <div className="space-y-2 max-w-[320px] mx-auto px-1 text-center">
              <div>
                <span className="inline-block px-3.5 py-0.5 rounded-full bg-amber-50 text-ford-blue text-[10.5px] font-bold border border-amber-200/80 tracking-wide shadow-2xs">
                  Rekomendasi Menu Bergizi
                </span>
              </div>

              <h1 className="text-[21px] font-black text-ford-blue tracking-tight leading-snug">
                Menu Bergizi Khusus Untuk Anda
              </h1>

              <p className="text-[12.5px] font-medium text-blue-gray leading-relaxed">
                Dapatkan rekomendasi Makan Bergizi Gratis yang dipersonalisasi. Sistem AI kami akan merancang menu lezat yang disesuaikan persis dengan kebutuhan gizi unik harian Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Centered Stepper Dots Top, Back Arrow Left, Next/Start Right */}
      <div className="pt-3 pb-2 border-t border-slate-100 z-10 space-y-3">
        {/* Stepper Dots Indicator (Centered Top) */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setOnboardingIndex(idx)}
              className={`transition-all duration-300 shadow-2xs cursor-pointer ${
                onboardingIndex === idx
                  ? "w-6 h-2.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green"
                  : "w-2.5 h-2.5 rounded-full bg-slate-200 hover:bg-slate-300"
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
            <button
              type="button"
              onClick={() => setOnboardingIndex((prev) => Math.max(prev - 1, 0))}
              className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Kembali ke halaman sebelumnya"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          {/* Right: Next or Start Button */}
          {onboardingIndex < 2 ? (
            <button
              type="button"
              onClick={() => setOnboardingIndex((prev) => Math.min(prev + 1, 2))}
              className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12.5px] shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex items-center justify-center gap-1.5 px-5 h-10 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12.5px] shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 animate-in zoom-in-90 duration-200"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Page>
  );
};
