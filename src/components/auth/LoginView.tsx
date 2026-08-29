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
import { DEFAULT_FALLBACK_USERS } from "@/services/auth-service";

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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

  const handleSelectQuickAccount = (accEmail: string, accSecret: string) => {
    setEmail(accEmail);
    setSecret(accSecret);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 select-none selection:bg-[#dbeafe] selection:text-[#1a73e8]">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#e2e8f0] shadow-xl p-6 sm:p-8 space-y-6">
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
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Kcal <span className="text-[#1a73e8]">Dashboard MBG</span>
            </h1>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Pemerintah Kabupaten Gresik • GinoFest 2026
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#071e49] mb-1.5">
              Alamat Email Resmi
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="nama.kecamatan@ginofest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#071e49] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#071e49] mb-1.5">
              Kata Sandi / PIN 8 Digit
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Masukkan kata sandi atau PIN..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#071e49] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            
            {/* Clean Simple Hint Text Bar */}
            <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-1.5 px-0.5">
              <span>PIN: <code className="text-[#1a73e8] font-bold font-mono">69hagh0d</code></span>
              <span className="text-slate-300">•</span>
              <span>Password: <code className="text-[#1a73e8] font-bold font-mono">password123</code></span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[13px] shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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
            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[12px] font-bold text-[#1a73e8] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Login Cepat</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#1a73e8] transition-transform duration-200 ${showQuickSelect ? "rotate-180" : ""}`} />
          </button>

          {showQuickSelect && (
            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-1">
              <p className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                    <span className="font-bold text-[#071e49] block truncate group-hover:text-[#1a73e8]">
                      {acc.name}
                    </span>
                    <span className="text-[10px] text-[#64748b] block font-mono">
                      {acc.email}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    acc.role === "super_admin"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {acc.role === "super_admin" ? "Super Admin" : "Kecamatan"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-[#94a3b8] space-y-0.5">
          <p>Sistem Terproteksi Otorisasi 8 Digit Cloud Firestore</p>
          <p>© 2026 Kcal AI • Proposal GinoFest 2026</p>
        </div>
      </div>
    </div>
  );
};
