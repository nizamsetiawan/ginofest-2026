"use client";

import React, { useState } from "react";
import { Settings, X, Check, Database, Sparkles, Shield, Cpu, Layers } from "lucide-react";
import { AdminProfile } from "@/data/admin-profiles";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: AdminProfile;
  onOpenAdminSwitch: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onOpenAdminSwitch,
}) => {
  const [defaultPlafon, setDefaultPlafon] = useState<number>(15000);
  const [autoSyncFirestore, setAutoSyncFirestore] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#071e49]">Pengaturan Sistem</h3>
              <p className="text-[11px] text-[#64748b]">
                Konfigurasi aplikasi, integrasi AI, dan basis data MBG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-[12px]">
          {/* Admin Profile Section */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Akun Administrator Aktif:
              </span>
              <h4 className="font-bold text-[#071e49] text-[13px] mt-0.5">
                {currentAdmin.name} ({currentAdmin.regionLabel})
              </h4>
              <p className="text-[11px] text-[#64748b]">{currentAdmin.email}</p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAdminSwitch();
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold text-[11px] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              Ganti Akun
            </button>
          </div>

          {/* Configuration Settings */}
          <div className="space-y-3">
            {/* Pagu BGN */}
            <div>
              <label className="font-bold text-[#071e49] block mb-1">
                Standar Pagu Resmi MBG (per Porsi):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="Rp 15.000 (Standar Nasional BGN)"
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-[#cbd5e1] font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                *Mengikuti pagu resmi Badan Gizi Nasional (BGN) RI Tahun 2026.
              </span>
            </div>

            {/* AI Engine Status */}
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#071e49] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                  <span>AI Engine & RAG Pipeline</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Aktif & Terhubung
                </span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Menggunakan <strong>Google Gemini 1.5 Flash</strong> dengan teknik Retrieval-Augmented Generation (RAG) 4 master dataset Kabupaten Gresik.
              </p>
            </div>

            {/* Cloud Firestore Status */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#071e49] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Cloud Firestore Persistence</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Koleksi aktif: <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">master_komoditas</code>, <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">master_harga_pasar</code>, <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">master_menu_makanan</code>, <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">master_nilai_gizi</code>, <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">master_wilayah</code>, <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">mbg_menu_plans</code>.
              </p>
            </div>

            {/* App Info */}
            <div className="text-center pt-2 text-[11px] text-slate-400">
              G-Scan Dashboard MBG • Versi 2.4.0 • Pemerintah Kabupaten Gresik
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071e49] text-[12px] font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <span>Simpan Pengaturan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
