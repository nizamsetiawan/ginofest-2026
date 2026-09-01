"use client";

import React from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MobileRegisterScreenProps {
  regFullName: string;
  setRegFullName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPhone: string;
  setRegPhone: (val: string) => void;
  regDistrict: string;
  setRegDistrict: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regConfirmPassword: string;
  setRegConfirmPassword: (val: string) => void;
  showRegPassword: boolean;
  setShowRegPassword: (val: boolean) => void;
  showRegConfirmPassword: boolean;
  setShowRegConfirmPassword: (val: boolean) => void;
  agreeRegPrivacy?: boolean;
  setAgreeRegPrivacy?: (val: boolean) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  authError: string;
  setAuthError: (val: string) => void;
  isSubmittingAuth: boolean;
  onRegister: (e: React.FormEvent) => void;
  onOpenPrivacyModal?: () => void;
  onNavigateToLogin: () => void;
}

export const MobileRegisterScreen: React.FC<MobileRegisterScreenProps> = ({
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regPhone,
  setRegPhone,
  regDistrict,
  setRegDistrict,
  regPassword,
  setRegPassword,
  regConfirmPassword,
  setRegConfirmPassword,
  showRegPassword,
  setShowRegPassword,
  showRegConfirmPassword,
  setShowRegConfirmPassword,
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
    <Page className="bg-[#F8FAFC] flex flex-col px-5 py-4 overflow-y-auto overscroll-contain font-sans min-h-full">
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

      {/* Main Elevated Card */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100/90 space-y-3.5"
      >
        {/* Brand Logo Header */}
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
          <h2 className="text-[15px] font-black text-ford-blue">Daftar Akun Keluarga</h2>
          <p className="text-[11.5px] text-slate-500 font-medium leading-snug px-1">
            Pantau pemenuhan nutrisi anak &amp; analisis biometrik stunting
          </p>
        </div>

        {/* Global Error Banner if any */}
        <AnimatePresence>
          {authError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 rounded-2xl bg-red-50 border border-brand-red/25 text-brand-red text-[11px] font-medium flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-brand-red" />
              <span>{authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={(e) => { triggerHaptic(); onRegister(e); }} className="space-y-3">
          {/* 1. Nama Lengkap */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Nama Lengkap <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Contoh: Siti Rahmawati"
                value={regFullName}
                onChange={(e) => {
                  setRegFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                }}
                className={`w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.fullName ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* 2. Alamat Email */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Alamat Email <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                className={`w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.email ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          {/* 3. Nomor WhatsApp / Telp */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Nomor WhatsApp / HP <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="081234567890"
                value={regPhone}
                onChange={(e) => {
                  setRegPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                }}
                className={`w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.phone ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.phone}</p>
            )}
          </div>

          {/* 4. Kecamatan Domisili */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kecamatan Domisili <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={regDistrict}
                onChange={(e) => {
                  setRegDistrict(e.target.value);
                  if (fieldErrors.district) setFieldErrors((p) => ({ ...p, district: "" }));
                }}
                className={`w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border text-[12.5px] font-medium transition-all cursor-pointer appearance-none ${
                  fieldErrors.district
                    ? "border-brand-red bg-red-50/40 text-brand-red focus:border-brand-red"
                    : !regDistrict
                    ? "border-slate-200 text-slate-400"
                    : "border-slate-200 text-ford-blue font-bold focus:border-[#23B5A8]"
                }`}
              >
                <option value="" disabled>-- Pilih Kecamatan di Gresik --</option>
                {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                  <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {fieldErrors.district && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.district}</p>
            )}
          </div>

          {/* 5. Kata Sandi */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kata Sandi <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                }}
                className={`w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.password ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                }`}
              />
              <button
                type="button"
                onClick={() => { triggerHaptic(); setShowRegPassword(!showRegPassword); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer transition-colors"
              >
                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          {/* 6. Konfirmasi Kata Sandi */}
          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Konfirmasi Kata Sandi <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showRegConfirmPassword ? "text" : "password"}
                placeholder="Ulangi kata sandi"
                value={regConfirmPassword}
                onChange={(e) => {
                  setRegConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                className={`w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.confirmPassword ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-200 focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                }`}
              />
              <button
                type="button"
                onClick={() => { triggerHaptic(); setShowRegConfirmPassword(!showRegConfirmPassword); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer transition-colors"
              >
                {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.confirmPassword}</p>
            )}
          </div>

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
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <span>Daftarkan Akun Keluarga</span>
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
