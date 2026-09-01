"use client";

import React, { useEffect } from "react";
import { Page, Preloader } from "konsta/react";
import { motion } from "framer-motion";

interface MobileSplashScreenProps {
  onContinue: () => void;
}

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({ onContinue }) => {
  // Auto-transition to next screen after 1.4s
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 1400);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <Page 
      onClick={onContinue}
      className="bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none font-sans relative overflow-hidden min-h-full"
    >
      {/* Background Soft Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#79D7D2]/20 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-5 flex flex-col items-center my-auto relative z-10 max-w-[290px]"
      >
        {/* App Logo with Radiant Glow Halo */}
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-3 rounded-3xl bg-[#79D7D2]/40 blur-md"
          />
          <img
            src="/logo_app.svg"
            alt="Kcal Logo"
            className="w-20 h-20 rounded-3xl shadow-xl relative z-10 border-2 border-white object-cover"
          />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 relative z-10">
          <h1 className="text-[28px] font-black text-ford-blue tracking-tight">
            Kcal<span className="text-[#23B5A8]">.</span>
          </h1>
          <p className="text-[12px] font-medium text-slate-500 leading-relaxed px-1">
            &ldquo;Smart screening awal indikasi malnutrisi anak melalui analisis visual pertumbuhan &amp; kuesioner interaktif AI&rdquo;
          </p>
          <div className="pt-1.5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white text-ford-blue text-[10.5px] font-bold border border-slate-200/80 tracking-wide shadow-2xs">
              Ginofest 2026
            </span>
          </div>
        </div>

        {/* Konsta UI Native Adaptive Preloader */}
        <div className="pt-4 flex flex-col items-center gap-2">
          <Preloader className="w-6 h-6 text-[#23B5A8]" />
          <span className="text-[10.5px] font-bold text-slate-400 tracking-wider font-mono">
            v 2.4.0
          </span>
        </div>
      </motion.div>
    </Page>
  );
};

