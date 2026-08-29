"use client";

import React, { useState, useRef } from "react";
import { KeyRound, ShieldCheck, Check, AlertCircle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SetupPinModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const SetupPinModal: React.FC<SetupPinModalProps> = ({ isOpen, onClose }) => {
  const { user, updatePin } = useAuth();
  const [pinDigits, setPinDigits] = useState<string[]>(Array(8).fill(""));
  const [confirmDigits, setConfirmDigits] = useState<string[]>(Array(8).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen || !user) return null;

  const handleDigitChange = (
    index: number,
    value: string,
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    setErrorMsg("");
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 8).split("");
      const next = [...digits];
      pasted.forEach((char, i) => {
        if (i < 8) next[i] = char;
      });
      setDigits(next);
      const nextFocus = Math.min(pasted.length, 7);
      refs.current[nextFocus]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 7) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    digits: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const pin1 = pinDigits.join("");
    const pin2 = confirmDigits.join("");

    if (pin1.length < 8) {
      setErrorMsg("PIN harus terdiri dari tepat 8 karakter.");
      return;
    }

    if (pin1 !== pin2) {
      setErrorMsg("Konfirmasi PIN tidak cocok dengan PIN yang dibuat.");
      return;
    }

    setIsSubmitting(true);
    const res = await updatePin(pin1, newPassword.trim() || undefined);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } else {
      setErrorMsg(res.error || "Gagal menyimpan PIN baru.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#1a73e8] border border-blue-200 flex items-center justify-center shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1a73e8] border border-blue-200 uppercase tracking-wider mb-1.5">
            Aktivasi Pertama Kali
          </span>
          <h2 className="text-[18px] font-black text-[#071e49] tracking-tight">
            Setup Kode PIN Otorisasi 8 Digit
          </h2>
          <p className="text-[12px] text-[#64748b] mt-1">
            Selamat datang, <strong className="text-[#071e49]">{user.name}</strong> ({user.regionLabel}). Buat PIN 8 digit untuk mengamankan akses data wilayah Anda.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-6 space-y-2 animate-in zoom-in-90 duration-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <p className="text-[13px] font-bold text-emerald-700">
              PIN & Akun Berhasil Diaktivasi!
            </p>
            <p className="text-[11px] text-slate-500">Mengarahkan ke dashboard sistem...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* PIN INPUT */}
            <div>
              <label className="block text-[11px] font-bold text-[#071e49] mb-1.5">
                Buat PIN 8 Digit Baru:
              </label>
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { pinRefs.current[idx] = el; }}
                    type="password"
                    maxLength={8}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value, pinDigits, setPinDigits, pinRefs)}
                    onKeyDown={(e) => handleKeyDown(idx, e, pinDigits, pinRefs)}
                    className="w-10 h-11 text-center font-mono font-black text-[16px] text-[#071e49] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] transition-all"
                  />
                ))}
              </div>
            </div>

            {/* CONFIRM PIN INPUT */}
            <div>
              <label className="block text-[11px] font-bold text-[#071e49] mb-1.5">
                Ulangi Konfirmasi PIN:
              </label>
              <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                {confirmDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { confirmRefs.current[idx] = el; }}
                    type="password"
                    maxLength={8}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value, confirmDigits, setConfirmDigits, confirmRefs)}
                    onKeyDown={(e) => handleKeyDown(idx, e, confirmDigits, confirmRefs)}
                    className="w-10 h-11 text-center font-mono font-black text-[16px] text-[#071e49] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8] transition-all"
                  />
                ))}
              </div>
            </div>

            {/* OPTIONAL NEW PASSWORD */}
            <div>
              <label className="block text-[11px] font-bold text-[#071e49] mb-1">
                Kata Sandi Baru (Opsional):
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Ganti kata sandi login (opsional)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-[12px] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-[#071e49] focus:outline-none focus:border-[#1a73e8]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* ERROR ALERT */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white font-bold text-[13px] shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan PIN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simpan & Masuk Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
