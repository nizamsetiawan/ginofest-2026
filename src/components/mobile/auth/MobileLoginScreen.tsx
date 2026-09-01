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
  return (
    <Page className="bg-[#F8FAFC] flex flex-col px-5 py-4 overflow-y-auto overscroll-contain font-sans min-h-full">
      {/* Top Bar: Install APK Button & Country Flag */}
      <div className="flex items-center justify-between pb-2">
        {!isStandalone ? (
          <button
            type="button"
            onClick={onInstallPWA}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-ford-blue text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#23B5A8]" />
            <span>Pasang Aplikasi</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-600 ml-auto shadow-2xs">
          <span>🇮🇩</span>
          <span>ID</span>
        </div>
      </div>

      {/* Main Elevated Card */}
      <div className="my-auto bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100/90 space-y-4">
        {/* Centered Brand Logo & Subtitle */}
        <div className="text-center space-y-1.5 pt-1 pb-1">
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-2xl bg-[#79D7D2]/25 blur-sm" />
              <img src="/logo_app.svg" alt="Kcal" className="w-12 h-12 rounded-2xl shadow-xs relative z-10" />
            </div>
            <span className="text-[28px] font-black text-ford-blue tracking-tight">
              Kcal<span className="text-[#23B5A8]">.</span>
            </span>
          </div>
          <p className="text-[12px] text-slate-500 font-medium leading-relaxed px-1">
            Masuk untuk pantau gizi &amp; analisis biometrik AI anak Anda
          </p>
        </div>

        {/* Success Snackbar */}
        {authSuccessSnackbar && (
          <div className="p-3 rounded-2xl bg-[#79D7D2]/15 border border-[#79D7D2]/40 text-ford-blue text-[11.5px] font-medium flex items-start gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#23B5A8] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-ford-blue">Pendaftaran Berhasil!</p>
              <p className="text-[10.5px] text-slate-500 leading-snug">{authSuccessSnackbar}</p>
            </div>
          </div>
        )}

        {/* Error Message if any */}
        {authError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-brand-red/25 text-brand-red text-[11.5px] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-brand-red" />
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={onLogin} className="space-y-3.5">
          {/* Alamat Email */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Alamat Email <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full h-11.5 pl-10 pr-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[13px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Kata Sandi */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kata Sandi <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full h-11.5 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-[13px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Kecamatan Domisili */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-bold text-ford-blue block">
              Kecamatan Domisili <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={loginDistrict}
                onChange={(e) => setLoginDistrict(e.target.value)}
                className={`w-full h-11.5 pl-10 pr-10 rounded-2xl bg-[#F8FAFC] border text-[13px] font-medium focus:bg-white focus:outline-none focus:border-[#23B5A8] focus:ring-2 focus:ring-[#79D7D2]/25 transition-all cursor-pointer appearance-none ${
                  !loginDistrict ? "text-slate-400 border-slate-200" : "text-ford-blue font-bold border-slate-200"
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

          {/* Row 1: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-[11.5px] pt-1">
            <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#23B5A8] focus:ring-0 cursor-pointer accent-[#23B5A8]"
              />
              <span>Ingat saya</span>
            </label>

            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-[#23B5A8] hover:underline font-bold transition-colors cursor-pointer"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          {/* Row 2: Privacy Policy Checkbox */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="w-4 h-4 rounded text-[#23B5A8] focus:ring-0 cursor-pointer accent-[#23B5A8] shrink-0"
            />
            <span className="leading-tight">
              Saya menyetujui{" "}
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                className="text-[#23B5A8] font-bold hover:underline cursor-pointer inline"
              >
                Kebijakan Privasi
              </button>
            </span>
          </div>

          {/* Action Button: Login */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmittingAuth || !agreePrivacy}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue text-[14.5px] font-black tracking-wide shadow-[0_4px_15px_rgba(35,181,168,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmittingAuth ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </div>
        </form>

        {/* Link: Register Switcher */}
        <div className="pt-2 text-center text-[12px] text-slate-500">
          <span>Belum punya akun? </span>
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-[#23B5A8] font-black hover:underline cursor-pointer ml-1"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>

      {/* Version Footer */}
      <div className="pt-4 pb-2 text-center">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 • ginofest 2026
        </span>
      </div>
    </Page>
  );
};
