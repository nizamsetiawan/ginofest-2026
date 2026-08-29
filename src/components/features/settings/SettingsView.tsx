"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings, Check, Database, Sparkles, Server, Globe, ArrowLeftRight, Loader2, Save, ChevronDown } from "lucide-react";
import { AdminProfile } from "@/data/admin-profiles";
import { fetchSettings, saveSettings, addNotification } from "@/services/firebase-service";

interface SettingsViewProps {
  currentAdmin: AdminProfile;
  onOpenAdminSwitch: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentAdmin,
  onOpenAdminSwitch,
}) => {
  const [cycleDays, setCycleDays] = useState<5 | 6>(6);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    const res = await fetchSettings();
    if (res.success && res.data) {
      setCycleDays(res.data.defaultCycleDays || 6);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings({
      defaultCycleDays: cycleDays,
      paguPerPorsi: 15000,
      adminId: currentAdmin.id || currentAdmin.name,
    });
    await addNotification({
      title: "Pengaturan Sistem Diperbarui",
      description: `Siklus hari kerja MBG diatur ke ${cycleDays} hari oleh ${currentAdmin.name}.`,
      category: "settings",
    });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 space-x-2">
        <Loader2 className="w-6 h-6 text-[#1a73e8] animate-spin" />
        <span className="text-[13px] text-[#64748b]">Memuat pengaturan dari Firestore...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Pengaturan
            </h1>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Konfigurasi sistem tersinkronisasi dengan Cloud Firestore
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-60"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersimpan!</span>
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
      </div>

      {/* Admin Profile */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white font-black text-[14px] flex items-center justify-center shadow-xs shrink-0">
            {currentAdmin.initials}
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#071e49]">{currentAdmin.name}</h3>
            <p className="text-[12px] text-[#64748b]">{currentAdmin.email}</p>
            <p className="text-[11px] text-[#1a73e8] font-bold mt-0.5">{currentAdmin.regionLabel}</p>
          </div>
        </div>
        <button
          onClick={onOpenAdminSwitch}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#071e49] font-bold text-[12px] hover:bg-slate-50 hover:border-[#1a73e8] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Ganti Akun</span>
        </button>
      </div>

      {/* Config Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Siklus Hari Kerja */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-3">
          <h3 className="text-[13px] font-bold text-[#071e49]">Siklus Hari Kerja MBG</h3>
          <div className="relative">
            <select
              value={cycleDays}
              onChange={(e) => setCycleDays(Number(e.target.value) as 5 | 6)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] font-bold text-[12px] text-[#071e49] focus:outline-none focus:border-[#1a73e8] appearance-none pr-10 cursor-pointer"
            >
              <option value={5}>5 Hari (Senin – Jumat)</option>
              <option value={6}>6 Hari (Senin – Sabtu)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748b] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Pagu BGN */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-3">
          <h3 className="text-[13px] font-bold text-[#071e49]">Pagu Resmi BGN Per Porsi</h3>
          <input
            type="text"
            value="Rp 15.000 / porsi / anak / hari"
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-[#cbd5e1] font-bold text-[12px] text-slate-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-400">Standar nasional BGN RI 2026 — tidak dapat diubah</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-[#071e49]">AI Engine</h4>
            <p className="text-[11px] text-[#64748b]">Gemini 1.5 Flash</p>
            <span className="text-[10px] font-bold text-emerald-700">● Aktif</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-[#071e49]">RAG Pipeline</h4>
            <p className="text-[11px] text-[#64748b]">4 Master Dataset</p>
            <span className="text-[10px] font-bold text-emerald-700">● Terhubung</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-[#071e49]">Cloud Firestore</h4>
            <p className="text-[11px] text-[#64748b]">8 Koleksi Aktif</p>
            <span className="text-[10px] font-bold text-emerald-700">● Online</span>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-[11px] text-slate-400 pt-2">
        G-Scan Dashboard MBG • Versi 2.4.0 • Pemerintah Kabupaten Gresik • TA 2026/2027
      </div>
    </div>
  );
};
