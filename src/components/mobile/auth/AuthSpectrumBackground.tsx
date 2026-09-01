"use client";

import React from "react";
import { motion } from "framer-motion";

export const AuthSpectrumBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Ambient Glowing Halos */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [-8, 10, -8],
          y: [-8, 8, -8],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#79D7D2]/35 to-[#23B5A8]/20 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.38, 0.2],
          x: [10, -10, 10],
          y: [8, -10, 8],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-gradient-to-bl from-[#23B5A8]/25 via-[#79D7D2]/20 to-transparent blur-3xl"
      />
      <motion.div
        animate={{
          scale: [0.95, 1.1, 0.95],
          opacity: [0.18, 0.35, 0.18],
          x: [-6, 8, -6],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-[#79D7D2]/20 blur-3xl"
      />

      {/* 2. Simplified Graceful Spectrum Wave Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 400 800"
      >
        <defs>
          <linearGradient id="auth-spec-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#79D7D2" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#23B5A8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#79D7D2" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="auth-spec-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#23B5A8" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#79D7D2" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#23B5A8" stopOpacity="0.05" />
          </linearGradient>
          <filter id="auth-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wave 1: Gentle sine drift */}
        <motion.path
          d="M-20,120 Q80,80 180,140 T380,110 T440,160"
          fill="none"
          stroke="url(#auth-spec-grad-1)"
          strokeWidth="1.75"
          strokeDasharray="8 6"
          filter="url(#auth-glow)"
          animate={{
            d: [
              "M-20,120 Q80,80 180,140 T380,110 T440,160",
              "M-20,140 Q90,160 190,100 T390,140 T440,120",
              "M-20,120 Q80,80 180,140 T380,110 T440,160",
            ],
            strokeDashoffset: [0, -60, -120],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Wave 2: Mid-screen wave */}
        <motion.path
          d="M-20,420 Q100,370 200,430 T400,390 T450,440"
          fill="none"
          stroke="url(#auth-spec-grad-2)"
          strokeWidth="2"
          strokeDasharray="6 4"
          filter="url(#auth-glow)"
          animate={{
            d: [
              "M-20,420 Q100,370 200,430 T400,390 T450,440",
              "M-20,440 Q110,460 210,380 T410,430 T450,400",
              "M-20,420 Q100,370 200,430 T400,390 T450,440",
            ],
            strokeDashoffset: [0, 50, 100],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Wave 3: Bottom wave */}
        <motion.path
          d="M-20,680 Q90,640 190,700 T390,660 T440,710"
          fill="none"
          stroke="url(#auth-spec-grad-1)"
          strokeWidth="1.5"
          strokeDasharray="10 8"
          animate={{
            d: [
              "M-20,680 Q90,640 190,700 T390,660 T440,710",
              "M-20,700 Q100,720 200,650 T400,690 T440,670",
              "M-20,680 Q90,640 190,700 T390,660 T440,710",
            ],
            strokeDashoffset: [0, -70, -140],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* 3. Subtle Floating Bio Particles */}
      {[
        { x: "18%", y: "22%", size: 4, dur: 6, delay: 0 },
        { x: "82%", y: "35%", size: 5, dur: 7, delay: 1 },
        { x: "28%", y: "68%", size: 4.5, dur: 8, delay: 2 },
        { x: "75%", y: "80%", size: 3.5, dur: 6.5, delay: 1.5 },
      ].map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full bg-gradient-to-tr from-[#79D7D2] to-[#23B5A8] shadow-[0_0_8px_rgba(35,181,168,0.5)]"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [-6, 6, -6],
            x: [-4, 4, -4],
            opacity: [0.3, 0.75, 0.3],
            scale: [0.9, 1.25, 0.9],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
