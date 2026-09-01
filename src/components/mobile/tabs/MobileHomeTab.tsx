"use client";

import React from "react";
import { Search, Bell, Sparkles } from "lucide-react";
import { Page } from "konsta/react";
import { motion } from "framer-motion";
import { CitizenUser, AtmosphereState, MobileTab } from "../types";

interface MobileHomeTabProps {
  citizenUser: CitizenUser | null;
  atmosphere: AtmosphereState;
  setActiveTab: (tab: MobileTab) => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  citizenUser,
}) => {
  const userName = citizenUser?.name || "Muhammad Nizam Setiawan";
  const userEmail = citizenUser?.email || "nizamsetiawan@email.com";
  const userInitial = userName.charAt(0).toUpperCase();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <Page className="p-4 space-y-4 font-sans select-none bg-[#F8FAFC] min-h-full">
      {/* ═══ MODERN DIRECT USER APPBAR ═══ */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center justify-between pt-1 pb-1 px-1"
      >
        {/* User Avatar + Greeting & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] text-ford-blue flex items-center justify-center font-black text-base shadow-[0_4px_12px_rgba(35,181,168,0.25)] border-2 border-white">
              {userInitial}
            </div>
            {/* Live active dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="text-[11.5px] font-bold text-slate-500 leading-none">
              {getTimeGreeting()}, 👋
            </p>
            <h1 className="text-[15px] font-black text-ford-blue truncate leading-tight tracking-tight pt-0.5">
              {userName}
            </h1>
            <p className="text-[11px] text-slate-400 truncate font-medium">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Action Buttons: Search & Bell */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              triggerHaptic();
              alert("Fitur Pencarian: Cari menu bergizi dan data gizi...");
            }}
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-ford-blue hover:bg-slate-50 transition-all cursor-pointer"
            title="Pencarian"
          >
            <Search className="w-4 h-4 text-slate-600 stroke-[1.75]" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              triggerHaptic();
              alert("Pemberitahuan: Anda memiliki update menu MBG terbaru.");
            }}
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-ford-blue hover:bg-slate-50 transition-all cursor-pointer relative"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4 text-slate-600 stroke-[1.75]" />
            <span className="w-2 h-2 rounded-full bg-brand-orange absolute top-2 right-2 border border-white" />
          </motion.button>
        </div>
      </motion.div>
    </Page>
  );
};

