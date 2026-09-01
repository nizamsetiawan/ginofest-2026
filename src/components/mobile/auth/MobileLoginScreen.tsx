"use client";

import React from "react";
import {
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MobileLoginScreenProps {
  loginIdentifier: string;
  setLoginIdentifier: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginDistrict: string;
  setLoginDistrict: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  agreePrivacy: boolean;
  setAgreePrivacy: (val: boolean) => void;
  isSubmittingAuth: boolean;
  authError: string;
  authSuccessSnackbar: string | null;
  isStandalone: boolean;
  onInstallPWA: () => void;
  onOpenPrivacyModal: () => void;
  onLogin: (e: React.FormEvent) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const MobileLoginScreen: React.FC<MobileLoginScreenProps> = ({
  loginIdentifier,
  setLoginIdentifier,
  loginPassword,
  setLoginPassword,
  loginDistrict,
  setLoginDistrict,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  agreePrivacy,
  setAgreePrivacy,
  isSubmittingAuth,
  authError,
  authSuccessSnackbar,
  isStandalone,
  onInstallPWA,
  onOpenPrivacyModal,
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <Page className="bg-white flex flex-col px-6 py-5 overflow-y-auto overscroll-contain font-sans min-h-full">
      {/* Top Bar: Install APK Button & Country Flag */}
      <div className="flex items-center justify-between pb-3">
        {!isStandalone ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              triggerHaptic();
              onInstallPWA();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-ford-blue text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#23B5A8]" />
            <span>Pasang Aplikasi</span>
          </motion.button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-600 ml-auto shadow-2xs">
          <span>🇮🇩</span>
          <span>ID</span>
        </div>
      </div>

      {/* Main Spacious Content */}
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full pt-2">
        <div className="space-y-5">
          {/* Brand Logo & Headline */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-[#79D7D2]/30 blur-sm" />
                <img src="/logo_app.svg" alt="Kcal" className="w-12 h-12 rounded-2xl shadow-xs relative z-10" />
              </div>
              <span className="text-[28px] font-black text-ford-blue tracking-tight">
                Kcal<span className="text-[#23B5A8]">.</span>
              </span>
            </div>
            <div>
              <h1 className="text-[22px] font-black text-ford-blue tracking-tight">Selamat Datang</h1>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                Masuk untuk pantau gizi &amp; analisis biometrik AI keluarga Anda
              </p>
            </div>
          </div>

          {/* Success Snackbar */}
          <AnimatePresence>
            {authSuccessSnackbar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-[#79D7D2]/15 border border-[#79D7D2]/40 text-ford-blue text-[12px] font-medium flex items-start gap-2.5 shadow-2xs overflow-hidden"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-[#23B5A8] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-ford-blue">Pendaftaran Berhasil!</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{authSuccessSnackbar}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message if any */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-2xl bg-red-50 border border-brand-red/25 text-brand-red text-[12px] font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-brand-red" />
                <span>{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={(e) => { triggerHaptic(); onLogin(e); }} className="space-y-4">
            {/* Alamat Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-ford-blue block">
                Alamat Email <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[13.5px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Kata Sandi */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-ford-blue block">
                Kata Sandi <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[13.5px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => { triggerHaptic(); setShowPassword(!showPassword); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1.5 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Kecamatan Domisili */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-ford-blue block">
                Kecamatan Domisili <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <MapPin className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={loginDistrict}
                  onChange={(e) => setLoginDistrict(e.target.value)}
                  className={`w-full h-12 pl-11 pr-10 rounded-2xl bg-[#F8FAFC] border text-[13.5px] font-medium transition-all cursor-pointer appearance-none ${
                    !loginDistrict ? "text-slate-400 border-slate-200" : "text-ford-blue font-bold border-slate-200 focus:border-[#23B5A8]"
                  }`}
                >
                  <option value="">-- Semua Kecamatan di Gresik --</option>
                  {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                    <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4.5 h-4.5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-[12px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-md text-[#23B5A8] focus:ring-0 cursor-pointer accent-[#23B5A8]"
                />
                <span>Ingat Saya</span>
              </label>

              <button
                type="button"
                onClick={() => { triggerHaptic(); onNavigateToForgotPassword(); }}
                className="text-[#23B5A8] font-bold hover:underline cursor-pointer transition-colors"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            {/* Privacy Policy Checkbox (Login) */}
            <div className="flex items-center gap-2 text-[11.5px] text-slate-600 pt-0.5">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md text-[#23B5A8] focus:ring-0 cursor-pointer accent-[#23B5A8] shrink-0"
              />
              <span className="leading-tight">
                Saya menyetujui{" "}
                <button
                  type="button"
                  onClick={() => { triggerHaptic(); onOpenPrivacyModal(); }}
                  className="text-[#23B5A8] font-bold hover:underline cursor-pointer inline"
                >
                  Kebijakan Privasi
                </button>
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmittingAuth || !agreePrivacy}
                className="w-full h-12.5 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[14.5px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingAuth ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Portal</span>
                    <Sparkles className="w-4.5 h-4.5 text-ford-blue" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-2 pb-1">
            <div className="border-t border-slate-100 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              atau
            </span>
          </div>

          {/* Register Account Navigation Button */}
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => { triggerHaptic(); onNavigateToRegister(); }}
              className="w-full h-12 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200/80 text-ford-blue font-bold text-[13.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Belum punya akun?</span>
              <strong className="text-[#23B5A8]">Daftar di Sini</strong>
            </motion.button>
          </div>
        </div>

        {/* Version Footer */}
        <div className="pt-6 pb-2 text-center">
          <span className="text-[10.5px] font-mono text-slate-400 tracking-wider">
            v 2.4.0 • ginofest 2026
          </span>
        </div>
      </div>
    </Page>
  );
};
