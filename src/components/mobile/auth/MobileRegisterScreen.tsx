"use client";

import React from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle,
  RefreshCw
} from "lucide-react";
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
  agreeRegPrivacy: boolean;
  setAgreeRegPrivacy: (val: boolean) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  authError: string;
  setAuthError: (val: string) => void;
  isSubmittingAuth: boolean;
  onRegister: (e: React.FormEvent) => void;
  onOpenPrivacyModal: () => void;
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
  agreeRegPrivacy,
  setAgreeRegPrivacy,
  fieldErrors,
  setFieldErrors,
  authError,
  setAuthError,
  isSubmittingAuth,
  onRegister,
  onOpenPrivacyModal,
  onNavigateToLogin,
}) => {
  return (
    <div className="flex-1 bg-white flex flex-col px-6 py-4 overflow-y-auto animate-in fade-in duration-200 font-sans">
      {/* Top Navigation & Flag */}
      <div className="flex items-center justify-between pb-2 mb-1">
        <button
          type="button"
          onClick={() => {
            setAuthError("");
            setFieldErrors({});
            onNavigateToLogin();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11.5px] font-bold text-ford-blue transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-ford-blue" />
          <span>Kembali</span>
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
        <h2 className="text-[15px] font-black text-ford-blue">Daftar Akun Keluarga</h2>
        <p className="text-[11.5px] text-blue-gray font-medium leading-snug px-1">
          Wujudkan keluarga sehat &amp; pantau pemenuhan nutrisi anak di program Makan Bergizi Gratis
        </p>
      </div>

      {/* Global Error Banner if any */}
      {authError && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[11px] font-medium flex items-center gap-1.5 animate-in shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-brand-red" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={onRegister} className="space-y-3">
        {/* 1. Nama Lengkap */}
        <div className="space-y-1">
          <label className="text-[11.5px] font-bold text-ford-blue block">
            Nama Lengkap (Orang Tua / Wali) <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Ibu Siti Rahmawati"
            value={regFullName}
            onChange={(e) => {
              setRegFullName(e.target.value);
              if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
            }}
            className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all shadow-2xs ${
              fieldErrors.fullName ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-300 focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20"
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
            placeholder="Masukkan alamat email"
            value={regEmail}
            onChange={(e) => {
              setRegEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
            }}
            className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all shadow-2xs ${
              fieldErrors.email ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-300 focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20"
            }`}
          />
          {fieldErrors.email && (
            <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.email}</p>
          )}
        </div>

        {/* 3. Nomor WhatsApp / Telp */}
        <div className="space-y-1">
          <label className="text-[11.5px] font-bold text-ford-blue block">
            Nomor WhatsApp / HP <span className="text-brand-red">*</span>
          </label>
          <input
            type="tel"
            placeholder="Contoh: 081234567890"
            value={regPhone}
            onChange={(e) => {
              setRegPhone(e.target.value);
              if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
            }}
            className={`w-full h-11 px-3.5 rounded-xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all shadow-2xs ${
              fieldErrors.phone ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-300 focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20"
            }`}
          />
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
            <select
              value={regDistrict}
              onChange={(e) => {
                setRegDistrict(e.target.value);
                if (fieldErrors.district) setFieldErrors((p) => ({ ...p, district: "" }));
              }}
              className={`w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border text-[12.5px] font-medium transition-all cursor-pointer shadow-2xs appearance-none ${
                fieldErrors.district
                  ? "border-brand-red bg-red-50/40 text-brand-red focus:border-brand-red"
                  : !regDistrict
                  ? "border-slate-300 text-slate-400"
                  : "border-slate-300 text-ford-blue font-bold focus:border-light-sea-green"
              }`}
            >
              <option value="" disabled>-- Pilih Kecamatan Domisili --</option>
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
            <input
              type={showRegPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={regPassword}
              onChange={(e) => {
                setRegPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
              }}
              className={`w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all shadow-2xs ${
                fieldErrors.password ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-300 focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowRegPassword(!showRegPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer"
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
            <input
              type={showRegConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              value={regConfirmPassword}
              onChange={(e) => {
                setRegConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              className={`w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#F8FAFC] border text-[12.5px] font-medium text-ford-blue focus:bg-white focus:outline-none transition-all shadow-2xs ${
                fieldErrors.confirmPassword ? "border-brand-red bg-red-50/40 focus:border-brand-red" : "border-slate-300 focus:border-light-sea-green focus:ring-2 focus:ring-green-02/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ford-blue p-1 cursor-pointer"
            >
              {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[10px] text-brand-red font-semibold">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Privacy Policy Checkbox (Register) */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
          <input
            type="checkbox"
            checked={agreeRegPrivacy}
            onChange={(e) => setAgreeRegPrivacy(e.target.checked)}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmittingAuth || !agreeRegPrivacy}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 hover:opacity-95 text-ford-blue text-[14px] font-black tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {isSubmittingAuth ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Mendaftarkan Akun Keluarga...</span>
            </>
          ) : (
            <span>Daftarkan Akun Keluarga</span>
          )}
        </button>
      </form>

      {/* Bottom: Login Link */}
      <div className="mt-auto pt-4 pb-2 text-center text-[12px] text-slate-500">
        <span>Sudah memiliki akun? </span>
        <button
          type="button"
          onClick={() => {
            setAuthError("");
            setFieldErrors({});
            onNavigateToLogin();
          }}
          className="text-light-sea-green font-black hover:underline cursor-pointer ml-1"
        >
          Masuk di Sini
        </button>
      </div>

      {/* Version Footer */}
      <div className="text-center pb-1">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider">
          v 2.4.0 - ginofest 2026
        </span>
      </div>
    </div>
  );
};
