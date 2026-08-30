"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Building2, 
  CheckCircle2,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_FALLBACK_USERS, sendAdminPasswordResetEmail } from "@/services/auth-service";

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !secret.trim()) {
      setErrorMsg("Harap masukkan email dan kata sandi / kode PIN Anda.");
      return;
    }

    setIsLoading(true);
    const res = await login(email, secret);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Autentikasi gagal.");
    }
  };

  const handleForgotPassword = async () => {
    setErrorMsg("");
    setResetSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Harap masukkan alamat email akun Anda di kolom atas terlebih dahulu.");
      return;
    }

    setIsResetting(true);
    const res = await sendAdminPasswordResetEmail(email.trim());
    setIsResetting(false);

    if (res.success) {
      setResetSuccessMsg(`Tautan reset kata sandi resmi telah dikirim ke "${email.trim()}". Silakan periksa kotak masuk atau folder spam email Anda.`);
    } else {
      setErrorMsg(res.error || "Gagal mengirimkan email reset kata sandi.");
    }
  };

  const handleSelectQuickAccount = (accEmail: string, accSecret: string) => {
    setEmail(accEmail);
    setSecret(accSecret);
    setErrorMsg("");
    setResetSuccessMsg("");
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 select-none selection:bg-green-02/30 selection:text-ford-blue font-sans">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-tint/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-light-sea-green/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-1.5 p-1 rounded-2xl">
            <img
              src="/logo_app.svg"
              alt="Kcal Logo"
              className="w-12 h-12 rounded-xl shadow-xs"
            />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-ford-blue tracking-tight">
              Kcal <span className="text-green-02">Dashboard MBG</span>
            </h1>
            <p className="text-[12px] text-blue-gray mt-0.5 font-medium">
              Pemerintah Kabupaten Gresik • GinoFest 2026
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-ford-blue mb-1.5">
              Alamat Email Resmi
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="nama.kecamatan@ginofest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-[#F8FAFC] border border-[#cbd5e1] rounded-xl text-ford-blue placeholder:text-blue-gray/60 focus:outline-none focus:ring-2 focus:ring-green-02/20 focus:border-light-sea-green transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-blue-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-ford-blue mb-1.5">
              Kata Sandi / PIN 8 Digit
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Masukkan kata sandi atau PIN..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-[#F8FAFC] border border-[#cbd5e1] rounded-xl text-ford-blue placeholder:text-blue-gray/60 focus:outline-none focus:ring-2 focus:ring-green-02/20 focus:border-light-sea-green transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-blue-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            
            {/* Clean Simple Hint Text Bar & Lupa Kata Sandi */}
            <div className="flex items-center justify-between text-[11px] text-blue-gray mt-1.5 px-0.5">
              <span>PIN: <code className="text-light-sea-green font-bold font-mono">69hagh0d</code></span>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-light-sea-green hover:underline font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isResetting ? "Mengirim Email..." : "Lupa Kata Sandi?"}
              </button>
            </div>
          </div>

          {/* Success Alert (Firebase Password Reset) */}
          {resetSuccessMsg && (
            <div className="p-3 rounded-xl bg-green-tint border border-green-02/40 text-ford-blue text-[11.5px] font-medium flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-02 shrink-0 mt-0.5" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-[11px] font-medium flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-red" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[13px] shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ford-blue" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Selector for 18 Districts & Super Admin */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-green-tint/50 border border-slate-200 text-[12px] font-bold text-ford-blue flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Login Cepat</span>
            <ChevronDown className={`w-3.5 h-3.5 text-light-sea-green transition-transform duration-200 ${showQuickSelect ? "rotate-180" : ""}`} />
          </button>

          {showQuickSelect && (
            <div className="mt-2 p-2 bg-[#F8FAFC] border border-slate-200 rounded-2xl max-h-48 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1">
              <p className="px-2 py-1 text-[10px] font-bold text-blue-gray uppercase tracking-wider">
                Pilih akun untuk login langsung:
              </p>
              {DEFAULT_FALLBACK_USERS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    handleSelectQuickAccount(acc.email, acc.pin || "69hagh0d");
                    setShowQuickSelect(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-[11px] flex items-center justify-between transition-all group"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-ford-blue block truncate group-hover:text-light-sea-green">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-blue-gray block font-mono">
                      {acc.email}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    acc.role === "super_admin"
                      ? "bg-green-tint text-ford-blue border border-green-02/40"
                      : "bg-blue-50 text-brand-blue border border-brand-blue/30"
                  }`}>
                    {acc.role === "super_admin" ? "Super Admin" : "Kecamatan"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[10.5px] text-blue-gray space-y-0.5">
          <p>Sistem Terproteksi Otorisasi 8 Digit Cloud Firestore</p>
          <p>© 2026 Kcal AI • Proposal GinoFest 2026</p>
        </div>
      </div>
    </div>
  );
};
