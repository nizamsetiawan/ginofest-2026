"use client";

import React from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Send
} from "lucide-react";
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
  return (
    <div className="flex-1 bg-white flex flex-col px-6 py-4 overflow-y-auto animate-in fade-in duration-200 relative font-sans">
      {/* Simulated Email Pop-up Notification */}
      {simulatedEmailNotification && (
        <div className="mb-3 p-3 rounded-2xl bg-green-tint border border-green-02/40 shadow-md text-ford-blue text-[11.5px] flex items-center justify-between gap-2 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <span className="text-base">📩</span>
            <div>
              <p className="font-bold text-ford-blue text-[11px]">Email Masuk (Simulasi):</p>
              <p className="text-[11px] text-blue-gray">Kode OTP Anda: <span className="font-mono font-bold text-light-sea-green tracking-widest text-[13px]">{simulatedEmailNotification}</span></p>
            </div>
          </div>
          {forgotStep === 2 && (
            <button
              type="button"
              onClick={() => {
                setInputOtp(simulatedEmailNotification);
                setSimulatedEmailNotification(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-light-sea-green hover:bg-green-02 text-ford-blue font-black text-[10.5px] cursor-pointer shadow-2xs"
            >
              Gunakan
            </button>
          )}
        </div>
      )}

      {/* Top Navigation & Flag */}
      <div className="flex items-center justify-between pb-2 mb-1">
        <button
          type="button"
          onClick={() => {
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11.5px] font-bold text-ford-blue transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-ford-blue" />
          <span>{forgotStep === 1 ? "Kembali ke Login" : "Sebelumnya"}</span>
        </button>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] font-bold text-blue-gray">
          <span>🇮🇩</span>
          <span>ID</span>
        </div>
      </div>

      {/* Brand Logo Header */}
      <div className="text-center space-y-1 pt-1 pb-3">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo_app.svg" alt="Kcal" className="w-9 h-9 rounded-xl shadow-xs" />
          <span className="text-[22px] font-black text-ford-blue tracking-tight">
            Kcal<span className="text-green-02">.</span>
          </span>
        </div>
        <h2 className="text-[15px] font-black text-ford-blue">Atur Ulang Kata Sandi</h2>
        <p className="text-[11.5px] text-blue-gray font-medium leading-snug px-1">
          Pulihkan akses akun Anda untuk kembali memantau menu MBG &amp; skrining nutrisi keluarga
        </p>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="flex items-center justify-between px-3 py-2 mb-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[11px] font-bold">
        <div className={`flex items-center gap-1.5 ${forgotStep >= 1 ? "text-light-sea-green" : "text-blue-gray/60"}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${forgotStep >= 1 ? "bg-light-sea-green text-ford-blue" : "bg-slate-200 text-slate-500"}`}>1</span>
          <span>Email</span>
        </div>
        <div className="w-4 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center gap-1.5 ${forgotStep >= 2 ? "text-light-sea-green" : "text-blue-gray/60"}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${forgotStep >= 2 ? "bg-light-sea-green text-ford-blue" : "bg-slate-200 text-slate-500"}`}>2</span>
          <span>OTP</span>
        </div>
        <div className="w-4 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center gap-1.5 ${forgotStep === 3 ? "text-light-sea-green" : "text-blue-gray/60"}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${forgotStep === 3 ? "bg-light-sea-green text-ford-blue" : "bg-slate-200 text-slate-500"}`}>3</span>
          <span>Sandi Baru</span>
        </div>
      </div>

      {/* Error & Success Feedback Alerts */}
      {resetErrorMsg && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[11px] font-medium flex items-center gap-1.5 animate-in shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-brand-red" />
          <span>{resetErrorMsg}</span>
        </div>
      )}
      {resetSuccessMsg && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-green-tint border border-green-02/40 text-ford-blue text-[11px] font-medium flex items-center gap-1.5 animate-in zoom-in-95">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-02" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* ═══ TAHAP 1: INPUT EMAIL & KECAMATAN ═══ */}
      {forgotStep === 1 && (
        <form onSubmit={onSendOtp} className="space-y-3.5 animate-in fade-in duration-200">
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-ford-blue block">
              Alamat Email Terdaftar <span className="text-brand-red">*</span>
            </label>
            <input
              type="email"
              placeholder="Masukkan alamat email akun"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-300 text-[13px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20 shadow-2xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-ford-blue block">
              Kecamatan Domisili <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <select
                value={forgotDistrict}
                onChange={(e) => setForgotDistrict(e.target.value)}
                required
                className={`w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border text-[13px] font-medium transition-all cursor-pointer shadow-2xs appearance-none ${
                  !forgotDistrict ? "text-slate-400 border-slate-300" : "text-ford-blue font-bold border-slate-300 focus:border-light-sea-green"
                }`}
              >
                <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
                {GRESIK_DISTRICTS.slice(0, 18).map((d) => (
                  <option key={d.id} value={d.name} className="text-ford-blue font-medium">Kecamatan {d.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <p className="text-[11px] text-blue-gray leading-relaxed pt-0.5">
            Kami akan mengirimkan 6 digit kode OTP ke email di atas untuk memvalidasi kepemilikan akun keluarga Anda.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isResettingPassword}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 hover:opacity-95 text-ford-blue font-black text-[14px] shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isResettingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Wilayah &amp; Mengirim OTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Kode Verifikasi OTP</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ═══ TAHAP 2: INPUT KODE VERIFIKASI (OTP) ═══ */}
      {forgotStep === 2 && (
        <form onSubmit={onVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 rounded-2xl bg-green-tint/80 border border-green-02/30 text-[11px] text-ford-blue leading-relaxed">
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
              className="w-full h-13 px-4 rounded-2xl bg-[#F8FAFC] border-2 border-green-02/40 focus:border-light-sea-green text-center font-mono text-[22px] tracking-[0.5em] font-black text-ford-blue focus:bg-white focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-300 shadow-2xs"
            />
          </div>

          {/* Resend OTP button & timer */}
          <div className="text-center text-[11px] text-blue-gray">
            {otpResendCountdown > 0 ? (
              <span>Kirim ulang kode dalam <strong className="text-light-sea-green">{otpResendCountdown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={(e) => onSendOtp(e)}
                className="text-light-sea-green font-black hover:underline cursor-pointer"
              >
                Kirim Ulang Kode OTP
              </button>
            )}
          </div>

          <div className="pt-1 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setForgotStep(1)}
              className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[12.5px] transition-colors cursor-pointer text-center"
            >
              Ubah Email
            </button>
            <button
              type="submit"
              disabled={inputOtp.length < 6}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 hover:opacity-95 text-ford-blue font-black text-[13px] shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>Verifikasi</span>
            </button>
          </div>
        </form>
      )}

      {/* ═══ TAHAP 3: BUAT KATA SANDI BARU ═══ */}
      {forgotStep === 3 && (
        <form onSubmit={onSaveNewPassword} className="space-y-3.5 animate-in fade-in duration-200">
          <div className="p-3 rounded-2xl bg-green-tint border border-green-02/40 text-[11px] text-ford-blue leading-relaxed">
            ✅ Email terverifikasi. Masukkan kata sandi baru untuk akun Anda.
          </div>

          <div className="space-y-1">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kata Sandi Baru <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type={showForgotPass ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                required
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border border-slate-300 text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowForgotPass(!showForgotPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer"
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
              <input
                type={showForgotConfirmPass ? "text" : "password"}
                placeholder="Ulangi kata sandi baru"
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                required
                className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border border-slate-300 text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer"
              >
                {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setResetErrorMsg("");
                setResetSuccessMsg("");
                setForgotStep(1);
                onNavigateToLogin();
              }}
              className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue font-bold text-[12.5px] transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 hover:opacity-95 text-ford-blue font-black text-[13.5px] shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isResettingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Sandi Baru...</span>
                </>
              ) : (
                <span>Simpan Kata Sandi Baru</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Version Footer */}
      <div className="mt-auto pt-4 text-center">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 - ginofest 2026
        </span>
      </div>
    </div>
  );
};
