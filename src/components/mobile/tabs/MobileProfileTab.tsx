"use client";

import React, { useState } from "react";
import { ShieldCheck, LogOut, User, Mail, MapPin, Check, Edit3, AlertCircle } from "lucide-react";
import { Page, Button } from "konsta/react";
import { motion } from "framer-motion";
import { CitizenUser, MobileTab } from "../types";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MobileProfileTabProps {
  citizenUser: CitizenUser | null;
  setActiveTab: (tab: MobileTab) => void;
  onLogout: () => void;
  onUpdateDistrict?: (district: string) => Promise<void>;
}

export const MobileProfileTab: React.FC<MobileProfileTabProps> = ({
  citizenUser,
  onLogout,
  onUpdateDistrict,
}) => {
  const userName = citizenUser?.name || "Muhammad Nizam Setiawan";
  const userEmail = citizenUser?.email || "nizamsetiawan@email.com";
  const currentDistrict = citizenUser?.district || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const [isEditingDistrict, setIsEditingDistrict] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(currentDistrict || "Kebomas");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleSaveDistrict = async () => {
    if (!selectedDistrict || !onUpdateDistrict) return;
    triggerHaptic();
    setIsSaving(true);
    await onUpdateDistrict(selectedDistrict);
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditingDistrict(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <Page className="p-4 space-y-4 font-sans select-none bg-[#F8FAFC] min-h-full pb-28">
      {/* ═══ 1. APPBAR HEADER: TITLE ═══ */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center justify-between pt-1 px-1"
      >
        <div>
          <h1 className="text-[17px] font-black text-ford-blue tracking-tight">
            Profil Pengguna
          </h1>
          <p className="text-[11.5px] text-slate-500 font-medium">
            Kelola data akun &amp; domisili Anda
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 text-[11px] font-bold text-slate-600 shadow-2xs">
          <span>🇮🇩</span>
          <span>ID</span>
        </div>
      </motion.div>

      {/* ═══ 2. HERO USER PROFILE CARD ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-4"
      >
        {/* User Avatar + Full Name & Email */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] text-ford-blue flex items-center justify-center font-black text-xl shadow-[0_6px_16px_rgba(35,181,168,0.3)] border-2 border-white">
              {userInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
          </div>

          <div className="min-w-0 space-y-0.5 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            </div>
            <h2 className="text-[16px] font-black text-ford-blue truncate leading-tight tracking-tight pt-0.5">
              {userName}
            </h2>
            <p className="text-[12px] text-slate-500 truncate font-medium">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 space-y-3 text-[12px]">
          {/* Peran Akun */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Peran Akun</span>
            </span>
            <span className="font-bold text-ford-blue">Masyarakat (Warga)</span>
          </div>

          <div className="h-px bg-slate-200/60" />

          {/* Status Login */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Status Login</span>
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Aktif</span>
            </span>
          </div>

          <div className="h-px bg-slate-200/60" />

          {/* Kecamatan Domisili */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#23B5A8]" />
                <span>Kecamatan Domisili</span>
              </span>
              
              {!isEditingDistrict && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setIsEditingDistrict(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0FA89B] hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{currentDistrict ? "Ubah" : "Pilih Kecamatan"}</span>
                </button>
              )}
            </div>

            {isEditingDistrict ? (
              <div className="pt-1 space-y-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-[12.5px] font-medium text-ford-blue focus:outline-none focus:ring-2 focus:ring-[#79D7D2]/40"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {GRESIK_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      Kec. {d.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingDistrict(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isSaving || !selectedDistrict}
                    onClick={handleSaveDistrict}
                    className="px-4 py-1.5 rounded-lg bg-[#23B5A8] hover:bg-[#1fa195] text-white font-bold text-[11px] cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80">
                {currentDistrict ? (
                  <span className="font-bold text-ford-blue flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Kecamatan {currentDistrict}
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600 flex items-center gap-1.5 text-[11.5px]">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Belum diisi (Default Kebomas)
                  </span>
                )}
                
                {saveSuccess && (
                  <span className="text-[10.5px] font-bold text-emerald-600 animate-pulse">
                    ✓ Tersimpan!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══ 3. CLEAN LOGOUT ACTION ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="pt-2"
      >
        <Button
          large
          rounded
          onClick={() => {
            triggerHaptic();
            onLogout();
          }}
          className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-brand-red/20 text-brand-red text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </Button>
      </motion.div>

      {/* Version Footer */}
      <div className="pt-3 text-center">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 • ginofest 2026
        </span>
      </div>
    </Page>
  );
};
