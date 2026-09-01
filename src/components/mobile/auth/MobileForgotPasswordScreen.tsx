"use client";

import React from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Send
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";

interface MobileForgotPasswordScreenProps {
  forgotStep: 1 | 2 | 3;
  setForgotStep: (step: 1 | 2 | 3) => void;
  forgotEmail: string;
  setForgotEmail: (val: string) => void;
  forgotDistrict: string;
  setForgotDistrict: (val: string) => void;
  inputOtp: string;
  setInputOtp: (val: string) => void;
  otpResendCountdown: number;
  forgotNewPassword: string;
  setForgotNewPassword: (val: string) => void;
  forgotConfirmPassword: string;
  setForgotConfirmPassword: (val: string) => void;
  showForgotPass: boolean;
  setShowForgotPass: (val: boolean) => void;
  showForgotConfirmPass: boolean;
  setShowForgotConfirmPass: (val: boolean) => void;
  isResettingPassword: boolean;
  resetSuccessMsg: string;
  setResetSuccessMsg: (val: string) => void;
  resetErrorMsg: string;
  setResetErrorMsg: (val: string) => void;
  simulatedEmailNotification: string | null;
  setSimulatedEmailNotification: (val: string | null) => void;
  onSendOtp: (e: React.FormEvent) => void;
  onVerifyOtp: (e: React.FormEvent) => void;
  onSaveNewPassword: (e: React.FormEvent) => void;
  onNavigateToLogin: () => void;
}

export const MobileForgotPasswordScreen: React.FC<MobileForgotPasswordScreenProps> = ({
  forgotStep,
  setForgotStep,
  forgotEmail,
  setForgotEmail,
  forgotDistrict,
  setForgotDistrict,
  inputOtp,
  setInputOtp,
  otpResendCountdown,
  forgotNewPassword,
  setForgotNewPassword,
  forgotConfirmPassword,
  setForgotConfirmPassword,
  showForgotPass,
  setShowForgotPass,
  showForgotConfirmPass,
  setShowForgotConfirmPass,
  isResettingPassword,
  resetSuccessMsg,
  setResetSuccessMsg,
  resetErrorMsg,
  setResetErrorMsg,
  simulatedEmailNotification,
  setSimulatedEmailNotification,
  onSendOtp,
  onVerifyOtp,
  onSaveNewPassword,
  onNavigateToLogin,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <Page className="bg-[#F8FAFC] flex flex-col px-5 py-4 overflow-y-auto relative font-sans overscroll-contain min-h-full">
      {/* Simulated Email Pop-up Notification */}
      <AnimatePresence>
        {simulatedEmailNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mb-3 p-3 rounded-2xl bg-[#79D7D2]/15 border border-[#79D7D2]/40 shadow-md text-ford-blue text-[11.5px] flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📩</span>
              <div>
                <p className="font-bold text-ford-blue text-[11px]">Email Masuk (Simulasi):</p>
                <p className="text-[11px] text-slate-500">Kode OTP Anda: <span className="font-mono font-bold text-[#23B5A8] tracking-widest text-[13px]">{simulatedEmailNotification}</span></p>
              </div>
            </div>
            {forgotStep === 2 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setInputOtp(simulatedEmailNotification);
                  setSimulatedEmailNotification(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#23B5A8] hover:bg-[#79D7D2] text-ford-blue font-black text-[10.5px] cursor-pointer shadow-2xs"
              >
                Gunakan
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation & Flag */}
      <div className="flex items-center justify-between pb-2 mb-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            triggerHaptic();
            if (forgotStep === 1) {
              setResetErrorMsg("");
              setResetSuccessMsg("");
              setSimulatedEmailNotification(null);
              onNavigateToLogin();
            } else if (forgotStep === 2) {
              setForgotStep(1);
            } else if (forgotStep === 3) {
              setForgotStep(2);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[11.5px] font-bold text-ford-blue transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-ford-blue" />
          <span>{forgotStep === 1 ? "Kembali ke Login" : "Sebelumnya"}</span>
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
          <h2 className="text-[15px] font-black text-ford-blue">Atur Ulang Kata Sandi</h2>
          <p className="text-[11.5px] text-slate-500 font-medium leading-snug px-1">
            Pulihkan akses akun Anda untuk kembali ke portal gizi
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[11px] font-bold">
          <div className={`flex items-center gap-1.5 ${forgotStep >= 1 ? "text-[#23B5A8]" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${forgotStep >= 1 ? "bg-[#23B5A8] text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
            <span>Email</span>
          </div>
          <div className="w-4 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${forgotStep >= 2 ? "text-[#23B5A8]" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${forgotStep >= 2 ? "bg-[#23B5A8] text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
            <span>OTP</span>
          </div>
          <div className="w-4 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${forgotStep === 3 ? "text-[#23B5A8]" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${forgotStep === 3 ? "bg-[#23B5A8] text-white" : "bg-slate-200 text-slate-500"}`}>3</span>
            <span>Sandi Baru</span>
          </div>
        </div>

        {/* Error & Success Feedback Alerts */}
        <AnimatePresence>
          {resetErrorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 rounded-2xl bg-red-50 border border-brand-red/25 text-brand-red text-[11px] font-medium flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-brand-red" />
              <span>{resetErrorMsg}</span>
            </motion.div>
          )}
          {resetSuccessMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 rounded-2xl bg-[#79D7D2]/15 border border-[#79D7D2]/40 text-ford-blue text-[11px] font-medium flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#23B5A8]" />
              <span>{resetSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ TAHAP 1: INPUT EMAIL & KECAMATAN ═══ */}
        {forgotStep === 1 && (
          <form onSubmit={(e) => { triggerHaptic(); onSendOtp(e); }} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-ford-blue block">
                Alamat Email Terdaftar <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-ford-blue block">
                Kecamatan Domisili <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={forgotDistrict}
                  onChange={(e) => setForgotDistrict(e.target.value)}
                  required
                  className={`w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium transition-all cursor-pointer appearance-none ${
                    !forgotDistrict ? "text-slate-400 border-slate-200" : "text-ford-blue font-bold border-slate-200 focus:border-[#23B5A8]"
                  }`}
                >
                  <option value="" disabled>-- Pilih Kecamatan di Gresik --</option>
                  {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                    <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
              Kami akan mengirimkan 6 digit kode OTP ke email di atas untuk memvalidasi kepemilikan akun keluarga Anda.
            </p>

            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isResettingPassword}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[14px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isResettingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Wilayah &amp; Mengirim OTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Kode OTP</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}

        {/* ═══ TAHAP 2: INPUT KODE VERIFIKASI (OTP) ═══ */}
        {forgotStep === 2 && (
          <form onSubmit={(e) => { triggerHaptic(); onVerifyOtp(e); }} className="space-y-4">
            <div className="p-3 rounded-2xl bg-[#79D7D2]/15 border border-[#79D7D2]/30 text-[11px] text-ford-blue leading-relaxed">
              Kode verifikasi 6 digit telah dikirimkan ke <span className="font-bold">{forgotEmail}</span>.
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-ford-blue block text-center">
                Masukkan 6 Digit Kode OTP <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                className="w-full h-13 px-4 rounded-2xl bg-[#F8FAFC] border-2 border-[#79D7D2]/40 focus:border-[#23B5A8] text-center font-mono text-[22px] tracking-[0.5em] font-black text-ford-blue focus:bg-white focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300"
              />
            </div>

            {/* Resend OTP button & timer */}
            <div className="text-center text-[11px] text-slate-500">
              {otpResendCountdown > 0 ? (
                <span>Kirim ulang kode dalam <strong className="text-[#23B5A8]">{otpResendCountdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { triggerHaptic(); onSendOtp(e); }}
                  className="text-[#23B5A8] font-black hover:underline cursor-pointer"
                >
                  Kirim Ulang Kode OTP
                </button>
              )}
            </div>

            <div className="pt-1 flex items-center gap-2.5">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => { triggerHaptic(); setForgotStep(1); }}
                className="flex-1 h-11.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[12.5px] transition-colors cursor-pointer text-center"
              >
                Ubah Email
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={inputOtp.length < 6}
                className="flex-1 h-11.5 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Verifikasi</span>
              </motion.button>
            </div>
          </form>
        )}

        {/* ═══ TAHAP 3: BUAT KATA SANDI BARU ═══ */}
        {forgotStep === 3 && (
          <form onSubmit={(e) => { triggerHaptic(); onSaveNewPassword(e); }} className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-[#79D7D2]/15 border border-[#79D7D2]/40 text-[11px] text-ford-blue leading-relaxed">
              ✅ Email terverifikasi. Masukkan kata sandi baru untuk akun Anda.
            </div>

            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-ford-blue block">
                Kata Sandi Baru <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showForgotPass ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                />
                <button
                  type="button"
                  onClick={() => { triggerHaptic(); setShowForgotPass(!showForgotPass); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer transition-colors"
                >
                  {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11.5px] font-bold text-ford-blue block">
                Konfirmasi Kata Sandi Baru <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showForgotConfirmPass ? "text" : "password"}
                  placeholder="Ulangi kata sandi baru"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25"
                />
                <button
                  type="button"
                  onClick={() => { triggerHaptic(); setShowForgotConfirmPass(!showForgotConfirmPass); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer transition-colors"
                >
                  {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setResetErrorMsg("");
                  setResetSuccessMsg("");
                  setForgotStep(1);
                  onNavigateToLogin();
                }}
                className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[12.5px] transition-colors cursor-pointer text-center"
              >
                Batal
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isResettingPassword}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13.5px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isResettingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Kata Sandi</span>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Version Footer */}
      <div className="pt-4 pb-2 text-center">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 • ginofest 2026
        </span>
      </div>
    </Page>
  );
};
