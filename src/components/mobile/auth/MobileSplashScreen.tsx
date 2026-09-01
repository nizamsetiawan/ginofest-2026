"use client";

import React from "react";
import { Page, Preloader } from "konsta/react";

interface MobileSplashScreenProps {
  onContinue: () => void;
}

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({ onContinue }) => {
  // Auto-transition to next screen after 1.2s
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <Page 
      onClick={onContinue}
      className="bg-gradient-to-b from-[#FFFFFF] via-green-tint/40 to-[#F8FAFC] flex flex-col items-center justify-center p-5 text-center cursor-pointer select-none font-sans relative overflow-hidden"
    >
      <div className="space-y-4 flex flex-col items-center my-auto relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* App Logo with Vitality Pulse Ring */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-green-02/30 blur-lg animate-pulse" />
          <img
            src="/logo_app.svg"
            alt="Kcal Logo"
            className="w-18 h-18 rounded-3xl shadow-xl relative z-10 animate-in zoom-in-75 duration-500 border-2 border-white"
          />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5 relative z-10 max-w-[270px]">
          <h1 className="text-[26px] font-black text-ford-blue tracking-tight">
            Kcal
          </h1>
          <p className="text-[12px] font-medium text-blue-gray leading-relaxed">
            &ldquo;Smart screening awal indikasi malnutrisi anak melalui analisis visual pertumbuhan &amp; kuesioner interaktif AI&rdquo;
          </p>
          <div className="pt-1">
            <span className="inline-block px-3.5 py-0.5 rounded-full bg-green-tint text-ford-blue text-[10px] font-bold border border-green-02/40 tracking-wide shadow-2xs">
              Ginofest 2026
            </span>
          </div>
        </div>

        {/* Konsta UI Native Adaptive Preloader */}
        <div className="pt-4 flex flex-col items-center gap-2">
          <Preloader className="w-6 h-6 text-light-sea-green" />
          <span className="text-[10px] font-bold text-blue-gray/60 tracking-wider">
            v 2.4.0
          </span>
        </div>
      </div>
    </Page>
  );
};

