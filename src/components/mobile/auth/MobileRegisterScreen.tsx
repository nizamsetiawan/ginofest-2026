"use client";

import React from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthSpectrumBackground } from "./AuthSpectrumBackground";

import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MobileRegisterScreenProps {
  regFullName: string;
  setRegFullName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regDistrict: string;
  setRegDistrict: (val: string) => void;
  regAge: string;
  setRegAge: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  showRegPassword: boolean;
  setShowRegPassword: (val: boolean) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  authError: string;
  setAuthError: (val: string) => void;
  isSubmittingAuth: boolean;
  onRegister: (e: React.FormEvent) => void;
  onNavigateToLogin: () => void;
}

export const MobileRegisterScreen: React.FC<MobileRegisterScreenProps> = ({
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regDistrict,
  setRegDistrict,
  regAge,
  setRegAge,
  regPassword,
  setRegPassword,
  showRegPassword,
  setShowRegPassword,
  fieldErrors,
  setFieldErrors,
  authError,
  setAuthError,
  isSubmittingAuth,
  onRegister,
  onNavigateToLogin,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <Page className="bg-[#F8FAFC] flex flex-col px-5 py-4 overflow-y-auto overscroll-contain font-sans min-h-full relative">
      {/* Dynamic Animated Spectrum & Glow Background */}
      <AuthSpectrumBackground />

      {/* Top Navigation & Flag */}
      <div className="flex items-center justify-between pb-2 mb-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            triggerHaptic();
            setAuthError("");
            setFieldErrors({});
            onNavigateToLogin();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[11.5px] font-bold text-ford-blue transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-ford-blue" />
          <span>Kembali</span>
        </motion.button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-600 shadow-2xs">
          <span>🇮🇩</span>
          <span>ID</span>
        </div>
      </div>

      {/* Main Elevated Card Container with Natural Upper-Center Position */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-2 sm:mt-4 mb-auto bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100/90 space-y-3.5 relative z-10"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-1 pt-1 pb-1">
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-[#79D7D2]/25 blur-sm" />
              <img src="/logo_app.svg" alt="Kcal" className="w-10 h-10 rounded-2xl shadow-xs relative z-10" />
            </div>
            <span className="text-[24px] font-black text-ford-blue tracking-tight">
              Kcal<span className="text-[#23B5A8]">.</span>
            </span>
          </div>
          <h2 className="text-[15px] font-black text-ford-blue">Daftar Akun Baru</h2>
          <p className="text-[11.5px] text-slate-500 font-medium leading-snug px-1">
            Lengkapi data untuk memulai pemantauan gizi keluarga
          </p>
        </div>

        <form onSubmit={(e) => { triggerHaptic(); onRegister(e); }} className="space-y-3">
          {/* 1. Nama Lengkap */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Nama Lengkap <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Siti Rahmawati"
              value={regFullName}
              onChange={(e) => {
                setRegFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
              }}
              className={`w-full h-12 px-4 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                fieldErrors.fullName ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
              }`}
            />
            {fieldErrors.fullName && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* 2. Alamat Email */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Alamat Email <span className="text-brand-red">*</span>
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={regEmail}
              onChange={(e) => {
                setRegEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              className={`w-full h-12 px-4 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                fieldErrors.email ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          {/* 3. Kecamatan Domisili */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kecamatan Domisili <span className="text-brand-red">*</span>
            </label>
            <select
              value={regDistrict}
              onChange={(e) => {
                setRegDistrict(e.target.value);
                if (fieldErrors.district) setFieldErrors((p) => ({ ...p, district: "" }));
              }}
              className={`w-full h-12 px-4 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer ${
                fieldErrors.district ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
              }`}
            >
              <option value="">-- Pilih Kecamatan Domisili --</option>
              {GRESIK_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  Kec. {d.name}
                </option>
              ))}
            </select>
            {fieldErrors.district && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.district}</p>
            )}
          </div>

          {/* 4. Usia Anak (Tahun) */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Usia Anak (Tahun) <span className="text-brand-red">*</span>
            </label>
            <select
              value={regAge}
              onChange={(e) => {
                setRegAge(e.target.value);
                if (fieldErrors.age) setFieldErrors((p) => ({ ...p, age: "" }));
              }}
              className={`w-full h-12 px-4 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer ${
                fieldErrors.age ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
              }`}
            >
              <option value="">-- Pilih Usia Anak (1-17 Tahun) --</option>
              {Array.from({ length: 17 }, (_, i) => i + 1).map((ageNum) => (
                <option key={ageNum} value={ageNum}>
                  {ageNum} Tahun (Standar AKG &amp; DermNet)
                </option>
              ))}
            </select>
            {fieldErrors.age && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.age}</p>
            )}
          </div>

          {/* 3. Kata Sandi */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kata Sandi <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                }}
                className={`w-full h-12 pl-4 pr-10 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.password ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                }`}
              />
              <button
                type="button"
                onClick={() => { triggerHaptic(); setShowRegPassword(!showRegPassword); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer transition-colors"
                aria-label={showRegPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showRegPassword ? <EyeOff className="w-3.5 h-3.5 stroke-[1.75]" /> : <Eye className="w-3.5 h-3.5 stroke-[1.75]" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          {/* Global Auth Error Inline Message */}
          <AnimatePresence>
            {authError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[11px] text-brand-red font-semibold flex items-center gap-1.5 pt-0.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue text-[14px] font-black tracking-wide shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmittingAuth ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <span>Daftar Sekarang</span>
              )}
            </motion.button>
          </div>
        </form>

        {/* Bottom: Login Link */}
        <div className="pt-1.5 text-center text-[12px] text-slate-500">
          <span>Sudah memiliki akun? </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setAuthError("");
              setFieldErrors({});
              onNavigateToLogin();
            }}
            className="text-[#23B5A8] font-black hover:underline cursor-pointer ml-1"
          >
            Masuk di Sini
          </button>
        </div>
      </motion.div>

      {/* Version Footer (Compact) */}
      <div className="pt-2.5 pb-1 text-center">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 • ginofest 2026
        </span>
      </div>
    </Page>
  );
};
