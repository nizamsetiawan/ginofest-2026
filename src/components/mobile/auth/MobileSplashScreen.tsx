"use client";

import React from "react";
import { AppScreen } from "../types";

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
    <div 
      onClick={onContinue}
      className="flex-1 bg-gradient-to-b from-[#FFFFFF] via-green-tint/40 to-[#F8FAFC] flex flex-col items-center justify-center p-5 text-center animate-in fade-in duration-300 cursor-pointer select-none font-sans"
    >
      <div className="space-y-4 flex flex-col items-center">
        {/* App Logo with Pulse Ring */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-green-02/25 blur-lg animate-pulse"></div>
          <img
            src="/logo_app.svg"
            alt="Kcal Logo"
            className="w-16 h-16 rounded-2xl shadow-lg relative z-10 animate-in zoom-in-75 duration-500"
          />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5 relative z-10 max-w-[260px]">
          <h1 className="text-[24px] font-bold text-ford-blue tracking-tight">
            Kcal
          </h1>
          <p className="text-[11.5px] font-medium text-blue-gray leading-relaxed">
            &ldquo;Smart screening awal indikasi malnutrisi anak melalui analisis visual pertumbuhan &amp; kuesioner interaktif AI&rdquo;
          </p>
          <div className="pt-0.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-green-tint text-ford-blue text-[9.5px] font-bold border border-green-02/40 tracking-wide">
              Ginofest 2026
            </span>
          </div>
        </div>

        {/* Subtle Loading Dots */}
        <div className="flex items-center gap-1.5 pt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-02 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-light-sea-green animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-ford-blue animate-bounce"></div>
        </div>

        {/* Version Text below Loading Dots */}
        <div className="pt-1.5">
          <span className="text-[10px] font-bold text-blue-gray/60 tracking-wider">
            v 2.4.0
          </span>
        </div>
      </div>
    </div>
  );
};
