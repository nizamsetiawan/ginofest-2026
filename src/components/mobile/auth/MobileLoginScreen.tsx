"use client";

import React from "react";
import {
  Eye,
  EyeOff,
  ChevronDown,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
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
    <div className="flex-1 bg-white flex flex-col px-6 py-4 overflow-y-auto animate-in fade-in duration-200 overscroll-contain font-sans">
      {/* Top Bar: Install APK Button & Country Flag */}
      <div className="flex items-center justify-between pb-1">
        {!isStandalone ? (
          <button
            type="button"
            onClick={onInstallPWA}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-tint hover:bg-green-02/20 border border-green-02/40 text-ford-blue text-[10.5px] font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3 h-3 text-light-sea-green" />
            <span>Pasang Aplikasi (.APK)</span>
          </button>
        ) : (
          <div></div>
        )}

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] font-bold text-blue-gray ml-auto">
          <span>🇮🇩</span>
          <span>ID</span>
        </div>
      </div>

      {/* Centered Brand Logo & Subtitle */}
      <div className="text-center space-y-1.5 pt-2 pb-4">
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-green-02/20 blur-sm"></div>
            <img src="/logo_app.svg" alt="Kcal" className="w-11 h-11 rounded-2xl shadow-xs relative z-10" />
          </div>
          <span className="text-[28px] font-black text-ford-blue tracking-tight">
            Kcal<span className="text-green-02">.</span>
          </span>
        </div>
        <p className="text-[12px] text-blue-gray font-medium leading-relaxed px-2">
          Masuk untuk pantau menu Makan Bergizi Gratis (MBG), deteksi cerdas nutrisi, &amp; kesehatan anak Anda
        </p>
      </div>

      {/* Success Snackbar */}
      {authSuccessSnackbar && (
        <div className="mb-3 p-3 rounded-2xl bg-green-tint border border-green-02/40 text-ford-blue text-[11.5px] font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-green-02 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-ford-blue">Pendaftaran Berhasil!</p>
            <p className="text-[10.5px] text-blue-gray leading-snug">{authSuccessSnackbar}</p>
          </div>
        </div>
      )}

      {/* Error Message if any */}
      {authError && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[11px] font-medium flex items-center gap-2 animate-in shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-brand-red" />
          <span>{authError}</span>
        </div>
      )}

      {/* Login Form (Spacious Inputs) */}
      <form onSubmit={onLogin} className="space-y-3.5">
        {/* Alamat Email */}
        <div className="space-y-1">
          <label className="text-[12px] font-bold text-ford-blue block">
            Alamat Email <span className="text-brand-red">*</span>
          </label>
          <input
            type="email"
            placeholder="Masukkan alamat email terdaftar"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border border-slate-300 text-[13px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20 transition-all placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        {/* Kata Sandi */}
        <div className="space-y-1">
          <label className="text-[12px] font-bold text-ford-blue block">
            Kata Sandi <span className="text-brand-red">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi akun"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border border-slate-300 text-[13px] text-ford-blue font-medium focus:bg-white focus:outline-none focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20 transition-all placeholder:text-slate-400 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Kecamatan Domisili */}
        <div className="space-y-1">
          <label className="text-[12px] font-bold text-ford-blue block">
            Kecamatan Domisili <span className="text-brand-red">*</span>
          </label>
          <div className="relative">
            <select
              value={loginDistrict}
              onChange={(e) => setLoginDistrict(e.target.value)}
              className={`w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border text-[13px] font-medium focus:bg-white focus:outline-none transition-all cursor-pointer shadow-2xs appearance-none ${
                !loginDistrict ? "text-slate-400 border-slate-300" : "text-ford-blue font-bold border-slate-300 focus:border-light-sea-green"
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

        {/* Row 1: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-[11.5px] pt-0.5">
          <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-light-sea-green focus:ring-0 cursor-pointer accent-light-sea-green"
            />
            <span>Biarkan saya tetap masuk</span>
          </label>

          <button
            type="button"
            onClick={onNavigateToForgotPassword}
            className="text-slate-600 hover:text-light-sea-green font-bold transition-colors cursor-pointer"
          >
            Lupa Kata Sandi?
          </button>
        </div>

        {/* Row 2: Privacy Policy Checkbox (GreatDay Style) */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="w-4 h-4 rounded text-light-sea-green focus:ring-0 cursor-pointer accent-light-sea-green shrink-0"
          />
          <span className="leading-tight">
            Saya menyetujui dan menerima{" "}
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="text-light-sea-green font-bold hover:underline cursor-pointer inline"
            >
              Kebijakan Privasi &amp; Pemantauan Nutrisi MBG
            </button>
          </span>
        </div>

        {/* Action Button: Login (Prominent & Spacious) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmittingAuth || !agreePrivacy}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 hover:opacity-95 text-ford-blue text-[14.5px] font-black tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmittingAuth ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <span>Masuk ke Portal Gizi</span>
            )}
          </button>
        </div>
      </form>

      {/* Link: Register Switcher */}
      <div className="pt-5 pb-2 text-center text-[12px] text-slate-500">
        <span>Belum punya akun? </span>
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="text-light-sea-green font-black hover:underline cursor-pointer ml-1"
        >
          Daftar Sekarang
        </button>
      </div>

      {/* Version Footer */}
      <div className="mt-auto pt-4 text-center">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 - ginofest 2026
        </span>
      </div>
    </div>
  );
};
