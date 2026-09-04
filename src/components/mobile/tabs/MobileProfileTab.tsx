"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  LogOut,
  User,
  MapPin,
  Check,
  Edit3,
  Calendar,
  Sparkles,
  RefreshCw,
  ChevronRight,
  History,
  X
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { CitizenUser, MobileTab } from "../types";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MobileProfileTabProps {
  citizenUser: CitizenUser | null;
  setActiveTab: (tab: MobileTab) => void;
  onLogout: () => void;
  onUpdateDistrict?: (district: string) => Promise<void>;
  onUpdateProfile?: (updates: { district?: string; age?: number }) => Promise<void>;
}

export const MobileProfileTab: React.FC<MobileProfileTabProps> = ({
  citizenUser,
  setActiveTab,
  onLogout,
  onUpdateDistrict,
  onUpdateProfile,
}) => {
  const userName = citizenUser?.name || "Muhammad Nizam Setiawan";
  const userEmail = citizenUser?.email || "nizamsetiawan@email.com";
  const currentDistrict = citizenUser?.district || "Kebomas";
  const currentAge = citizenUser?.age || 9;
  const userInitial = userName.charAt(0).toUpperCase();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(currentDistrict);
  const [selectedAge, setSelectedAge] = useState<number>(currentAge);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleSaveProfile = async () => {
    triggerHaptic();
    setIsSaving(true);
    if (onUpdateProfile) {
      await onUpdateProfile({ district: selectedDistrict, age: selectedAge });
    } else if (onUpdateDistrict) {
      await onUpdateDistrict(selectedDistrict);
    }
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <Page className="p-4 space-y-4 font-sans select-none bg-[#F8FAFC] min-h-full pb-28">
      {/* ═══ 1. APPBAR HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between pt-1 px-1"
      >
        <div>
          <h1 className="text-[19px] font-black text-ford-blue tracking-tight">
            Profil Saya
          </h1>
          <p className="text-[11.5px] text-slate-500 font-medium">
            Akun Warga &amp; Kebutuhan Gizi Anak
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-[10.5px] font-bold text-emerald-700 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Terverifikasi</span>
        </div>
      </motion.div>

      {/* ═══ 2. HERO PROFILE CARD ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#79D7D2]/15 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative shrink-0">
            <div className="w-15 h-15 rounded-2xl bg-gradient-to-tr from-[#0FA89B] via-[#23B5A8] to-[#79D7D2] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white">
              {userInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <h2 className="text-[17px] font-black text-ford-blue truncate leading-snug">
              {userName}
            </h2>
            <p className="text-[12px] text-slate-400 truncate font-medium">
              {userEmail}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0FA89B]" />
                <span>Kec. {currentDistrict}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold inline-flex items-center gap-1 border border-teal-100">
                <Calendar className="w-3 h-3 text-teal-600" />
                <span>Anak {currentAge} Thn</span>
              </span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11.5px] font-bold flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Data profil berhasil diperbarui!</span>
          </motion.div>
        )}
      </motion.div>

      {/* ═══ 3. DATA & CONFIGURATION SECTION ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-3.5"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[12.5px] font-extrabold text-ford-blue flex items-center gap-2">
            <User className="w-4 h-4 text-[#0FA89B]" />
            <span>Informasi &amp; Pengaturan</span>
          </span>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setSelectedDistrict(currentDistrict);
                setSelectedAge(currentAge);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0FA89B] hover:text-[#0b7e74] cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3.5 pt-1"
            >
              {/* Form Input 1: Kecamatan Domisili */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Kecamatan Domisili <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[12.5px] font-semibold text-ford-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#79D7D2]/40 cursor-pointer appearance-none pr-8"
                  >
                    {GRESIK_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        Kecamatan {d.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Form Input 2: Usia Anak Target */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Usia Anak (1 - 17 Tahun) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[12.5px] font-semibold text-ford-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#79D7D2]/40 cursor-pointer appearance-none pr-8"
                  >
                    {Array.from({ length: 17 }, (_, i) => i + 1).map((ageNum) => (
                      <option key={ageNum} value={ageNum}>
                        {ageNum} Tahun (Kebutuhan AKG MBG)
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11.5px] cursor-pointer transition-colors inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                  className="px-4 py-2.5 rounded-xl bg-[#0FA89B] hover:bg-[#0c877c] text-white font-bold text-[11.5px] cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {/* Row 1: Kecamatan */}
              <div
                onClick={() => {
                  triggerHaptic();
                  setSelectedDistrict(currentDistrict);
                  setSelectedAge(currentAge);
                  setIsEditing(true);
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100/90 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0FA89B] border border-teal-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-medium block">Kecamatan Domisili</span>
                    <span className="text-[13px] font-bold text-ford-blue">Kec. {currentDistrict}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-300 group-hover:text-slate-500 transition-colors">
                  <span className="text-[10.5px] font-bold text-[#0FA89B] opacity-0 group-hover:opacity-100 transition-opacity">Ubah</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Row 2: Usia Anak */}
              <div
                onClick={() => {
                  triggerHaptic();
                  setSelectedDistrict(currentDistrict);
                  setSelectedAge(currentAge);
                  setIsEditing(true);
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100/90 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-medium block">Usia Anak Target</span>
                    <span className="text-[13px] font-bold text-ford-blue">{currentAge} Tahun</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-300 group-hover:text-slate-500 transition-colors">
                  <span className="text-[10.5px] font-bold text-[#0FA89B] opacity-0 group-hover:opacity-100 transition-opacity">Ubah</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Row 3: Engine AI */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/90">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-medium block">Mesin Rekomendasi Gizi</span>
                    <span className="text-[12.5px] font-bold text-ford-blue">Azure OpenAI GPT-4o RAG</span>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  ● Aktif
                </span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ 4. QUICK ACTION MENU CARD ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="bg-white rounded-3xl p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-1"
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveTab("home");
          }}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-ford-blue block">Riwayat Screening Anak</span>
              <span className="text-[10.5px] text-slate-400 font-medium">Lihat catatan hasil pemeriksaan fisik</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>
      </motion.div>

      {/* ═══ 5. LOGOUT BUTTON ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="pt-1"
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onLogout();
          }}
          className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 text-rose-600 text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Keluar dari Akun</span>
        </button>
      </motion.div>

      {/* Footer Branding */}
      <div className="pt-2 text-center">
        <p className="text-[10.5px] font-mono text-slate-400 tracking-wider">
          v2.4.0 • Ginofest 2026 Pemkab Gresik
        </p>
      </div>
    </Page>
  );
};

