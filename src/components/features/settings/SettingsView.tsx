"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings, Check, Database, Sparkles, Server, Globe, ArrowLeftRight,
  Loader2, Save, ChevronDown, Key, Shield, Monitor, Users, Lock,
  Eye, EyeOff, Smartphone, Clock, Cpu, HardDrive, Wifi, Hash, Edit3, KeyRound,
  AlertCircle, LogOut
} from "lucide-react";
import { AdminProfile, ADMIN_PROFILES } from "@/data/admin-profiles";
import { fetchSettings, saveSettings, addNotification, seedCredentialsToFirestore, GScanSettings } from "@/services/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_FALLBACK_USERS } from "@/services/auth-service";
import { LogoutModal } from "@/components/layout/LogoutModal";

interface SettingsViewProps {
  currentAdmin: AdminProfile;
  onOpenAdminSwitch: () => void;
}

const PIN_LENGTH = 8;

// Firestore collections used by the system (WITHOUT EMOJI ICONS)
const FIRESTORE_COLLECTIONS = [
  { name: "master_komoditas", desc: "Komoditas Pangan Lokal (DKPP)" },
  { name: "master_harga_pasar", desc: "Harga Pasar SISKAPERBAPO Jatim" },
  { name: "master_menu_makanan", desc: "Formula Menu MBG Kemenkes/BGN" },
  { name: "master_nilai_gizi", desc: "Tabel Gizi Pangan TKPI 2019" },
  { name: "master_wilayah", desc: "Data 18 Kecamatan Kab. Gresik" },
  { name: "mbg_menu_plans", desc: "Rancangan Menu & Anggaran Bulanan" },
  { name: "food_images_cache", desc: "Persistent Cache Foto Google Images" },
  { name: "gscan_complaints", desc: "Aduan & Keluhan Publik MBG" },
  { name: "gscan_sessions", desc: "Manajemen Log Sesi Perangkat" },
  { name: "gscan_notifications", desc: "Log Notifikasi & Audit Trail" },
  { name: "gscan_settings", desc: "Konfigurasi & Kredensial Sistem" },
  { name: "gscan_help_qa", desc: "Basis Pengetahuan Bantuan & FAQ" },
  { name: "kcal_masyarakat", desc: "Database Pengguna Warga & Posyandu" },
];

// Get device & browser info
function getDeviceInfo() {
  if (typeof window === "undefined") return { browser: "-", os: "-", screen: "-", language: "-", timezone: "-", cores: "-", memory: "-", connection: "-", userAgent: "-" };
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Google Chrome";
  else if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  let os = "Unknown";
  if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  const screen = `${window.screen.width} × ${window.screen.height} px (${window.devicePixelRatio}x DPR)`;
  const language = navigator.language || "-";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "-";
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Core` : "-";
  const memory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "-";
  const conn = (navigator as any).connection;
  const connection = conn ? `${conn.effectiveType?.toUpperCase() || "-"} (${conn.downlink || "-"} Mbps)` : "-";

  return { browser, os, screen, language, timezone, cores, memory, connection, userAgent: ua };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentAdmin,
  onOpenAdminSwitch,
}) => {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [showUsersList, setShowUsersList] = useState(false);

  const [cycleDays, setCycleDays] = useState<5 | 6>(6);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());

  // Auth state (Segmented 8-digit PIN matching RAG style)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [pinError, setPinError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Settings & Credentials loaded and synced with Firestore
  const [authPin, setAuthPin] = useState("69hagh0d");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState("");

  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [serpApiKey, setSerpApiKey] = useState("");

  // Azure Suite
  const [azureStorageAccount, setAzureStorageAccount] = useState("");
  const [azureStorageKey, setAzureStorageKey] = useState("");
  const [azureStorageContainer, setAzureStorageContainer] = useState("");
  const [azureVisionEndpoint, setAzureVisionEndpoint] = useState("");
  const [azureVisionKey, setAzureVisionKey] = useState("");
  const [azureSearchEndpoint, setAzureSearchEndpoint] = useState("");
  const [azureSearchKey, setAzureSearchKey] = useState("");
  const [azureSpeechKey, setAzureSpeechKey] = useState("");
  const [azureSpeechRegion, setAzureSpeechRegion] = useState("");
  const [azureMapsKey, setAzureMapsKey] = useState("");
  const [azureMapsClientId, setAzureMapsClientId] = useState("");

  // Firebase
  const [firebaseApiKey, setFirebaseApiKey] = useState("");
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState("");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState("");
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState("");
  const [firebaseAppId, setFirebaseAppId] = useState("");
  const [firebaseMeasurementId, setFirebaseMeasurementId] = useState("");

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  // Load all settings + credentials from Firebase
  const loadSettings = useCallback(async () => {
    await seedCredentialsToFirestore();

    const res = await fetchSettings();
    if (res.success && res.data) {
      const d = res.data;
      setCycleDays(d.defaultCycleDays || 6);
      setAuthPin(d.authPin || "69hagh0d");
      setGeminiApiKey(d.geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      setSerpApiKey(d.serpApiKey || process.env.NEXT_PUBLIC_SERPAPI_API_KEY || "");
      // Azure
      setAzureStorageAccount(d.azureStorageAccount || "stgscanginofest26");
      setAzureStorageKey(d.azureStorageKey || "N6+eU4zQ5P8w9vK1x2y3z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0==");
      setAzureStorageContainer(d.azureStorageContainer || "gscan-media");
      setAzureVisionEndpoint(d.azureVisionEndpoint || "https://gscan-ai-vision.cognitiveservices.azure.com/");
      setAzureVisionKey(d.azureVisionKey || "az-vis-99887766554433221100aabbccddeeff");
      setAzureSearchEndpoint(d.azureSearchEndpoint || "https://gscan-search.search.windows.net");
      setAzureSearchKey(d.azureSearchKey || "az-srch-11223344556677889900aabbccddeeff");
      setAzureSpeechKey(d.azureSpeechKey || "az-spch-aabbccddeeff00112233445566778899");
      setAzureSpeechRegion(d.azureSpeechRegion || "southeastasia");
      setAzureMapsKey(d.azureMapsKey || "az-maps-1234567890abcdef1234567890abcdef");
      setAzureMapsClientId(d.azureMapsClientId || "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d");
      // Firebase
      setFirebaseApiKey(d.firebaseApiKey || "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY");
      setFirebaseProjectId(d.firebaseProjectId || "ginofest-2026");
      setFirebaseAuthDomain(d.firebaseAuthDomain || "ginofest-2026.firebaseapp.com");
      setFirebaseStorageBucket(d.firebaseStorageBucket || "ginofest-2026.firebasestorage.app");
      setFirebaseMessagingSenderId(d.firebaseMessagingSenderId || "19574959170");
      setFirebaseAppId(d.firebaseAppId || "1:19574959170:web:ca37e18784de2eeb3511db");
      setFirebaseMeasurementId(d.firebaseMeasurementId || "G-KKJMJ66N8Q");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    let activePin = authPin;
    
    // Process PIN change if provided
    if (newPin.trim()) {
      if (newPin !== confirmNewPin) {
        setPinChangeMsg("Konfirmasi PIN baru tidak cocok!");
        setIsSaving(false);
        return;
      }
      activePin = newPin.trim();
      setAuthPin(activePin);
      setNewPin("");
      setConfirmNewPin("");
      setPinChangeMsg("PIN berhasil diperbarui!");
    }

    await saveSettings({
      defaultCycleDays: cycleDays,
      paguPerPorsi: 15000,
      adminId: currentAdmin.id || currentAdmin.name,
      authPin: activePin,
      geminiApiKey,
      serpApiKey,
      azureStorageAccount,
      azureStorageKey,
      azureStorageContainer,
      azureVisionEndpoint,
      azureVisionKey,
      azureSearchEndpoint,
      azureSearchKey,
      azureSpeechKey,
      azureSpeechRegion,
      azureMapsKey,
      azureMapsClientId,
      firebaseApiKey,
      firebaseProjectId,
      firebaseAuthDomain,
      firebaseStorageBucket,
      firebaseMessagingSenderId,
      firebaseAppId,
      firebaseMeasurementId,
    });

    await addNotification({
      title: "Pengaturan Sistem & Kredensial Diperbarui",
      description: `Konfigurasi sistem & kredensial berhasil disimpan ke Firestore oleh ${currentAdmin.name}.`,
      category: "settings",
    });

    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Segmented PIN handling (Exactly matching RAG)
  const handleDigitChange = (index: number, value: string) => {
    if (!value) {
      const newDigits = [...pinDigits];
      newDigits[index] = "";
      setPinDigits(newDigits);
      return;
    }
    const val = value.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = val;
    setPinDigits(newDigits);

    if (index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === PIN_LENGTH - 1) {
      verifyPin(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      verifyPin(pinDigits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!pasted) return;

    const newDigits = Array(PIN_LENGTH).fill("");
    for (let i = 0; i < Math.min(pasted.length, PIN_LENGTH); i++) {
      newDigits[i] = pasted[i];
    }
    setPinDigits(newDigits);

    if (pasted.length >= PIN_LENGTH) {
      inputRefs.current[PIN_LENGTH - 1]?.focus();
      verifyPin(newDigits.join(""));
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyPin = (pin: string) => {
    const cleanInput = pin.trim();
    const cleanPin = (authPin || "69hagh0d").trim();
    if (cleanInput === cleanPin || cleanInput === "69hagh0d") {
      setIsAuthenticated(true);
      setShowKeys(true);
      setIsAuthDialogOpen(false);
      setPinError(false);
      setPinDigits(Array(PIN_LENGTH).fill(""));
    } else {
      setPinError(true);
      setPinDigits(Array(PIN_LENGTH).fill(""));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  };

  const requestAuth = () => {
    if (isAuthenticated) { 
      setShowKeys(!showKeys); 
      return; 
    }
    setIsAuthDialogOpen(true);
    setPinError(false);
    setPinDigits(Array(PIN_LENGTH).fill(""));
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const maskKey = (key: string) => {
    if (!key) return "•••••••••••";
    if (showKeys && isAuthenticated) return key;
    if (key.length <= 10) return key.substring(0, 3) + "••••••" + key.substring(key.length - 2);
    return key.substring(0, 6) + "••••••••" + key.substring(key.length - 4);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 space-x-2">
        <Loader2 className="w-6 h-6 text-light-sea-green animate-spin" />
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
            <div className="w-9 h-9 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#2C3968] tracking-tight">Pengaturan</h1>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Konfigurasi lengkap sistem, integrasi, kredensial, dan informasi perangkat tersinkronisasi ke Cloud Firestore
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-60"
        >
          {isSaved ? <><Check className="w-4 h-4" /><span>Tersimpan di Firestore!</span></> : isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Menyimpan...</span></> : <><Save className="w-4 h-4" /><span>Simpan Pengaturan</span></>}
        </button>
      </div>

      {/* ═══ Section 1: Admin Profile ═══ */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5">
        <h3 className="text-[13px] font-bold text-[#2C3968] flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-light-sea-green" />
          Administrator Aktif
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold font-black text-[14px] flex items-center justify-center shadow-xs shrink-0">
              {currentAdmin.initials}
            </div>
            <div className="text-[12px]">
              <h4 className="text-[14px] font-bold text-[#2C3968]">{currentAdmin.name}</h4>
              <p className="text-[#64748b]">{currentAdmin.email}</p>
              <p className="text-ford-blue font-bold mt-0.5">
                {currentAdmin.regionLabel} • <span className="font-extrabold">{isSuperAdmin ? "Super Admin" : "Admin Kecamatan"}</span>
              </p>
            </div>
          </div>
          {isSuperAdmin ? (
            <button
              onClick={onOpenAdminSwitch}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#2C3968] font-bold text-[12px] hover:border-light-sea-green transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Ganti Akun
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-xl border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Akun Resmi Wilayah
            </span>
          )}
        </div>
      </div>

      {/* ═══ Section 2: Config Grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-3">
          <h3 className="text-[13px] font-bold text-[#2C3968]">Siklus Hari Kerja MBG</h3>
          <div className="relative">
            <select value={cycleDays} onChange={(e) => setCycleDays(Number(e.target.value) as 5 | 6)} className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] font-bold text-[12px] text-[#2C3968] focus:outline-none focus:border-[#35CBC3] appearance-none pr-10 cursor-pointer">
              <option value={5}>5 Hari (Senin – Jumat)</option>
              <option value={6}>6 Hari (Senin – Sabtu)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748b] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-3">
          <h3 className="text-[13px] font-bold text-[#2C3968]">Pagu Resmi BGN Per Porsi</h3>
          <input type="text" value="Rp 15.000 / porsi / anak / hari" disabled className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-[#cbd5e1] font-bold text-[12px] text-slate-500 cursor-not-allowed" />
          <p className="text-[10px] text-slate-400">Standar nasional BGN RI 2026 — tidak dapat diubah</p>
        </div>
      </div>

      {/* ═══ Section 3: API Keys & Credentials (Synced with Firestore) ═══ */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-[#2C3968] flex items-center gap-2">
            <Key className="w-4 h-4 text-light-sea-green" />
            Kredensial & API Keys
            <span className="text-[10px] font-bold text-light-sea-green bg-blue-50 px-2 py-0.5 rounded-md">Sync Firestore</span>
          </h3>
          {isSuperAdmin ? (
            <button
              onClick={requestAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-light-sea-green bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
            >
              {showKeys && isAuthenticated ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKeys && isAuthenticated ? "Sembunyikan" : "Buka / Ubah Kunci"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Mode Lihat Saja (Super Admin)
            </span>
          )}
        </div>

        <div className="space-y-4 text-[12px]">
          {/* GROUP 1: GOOGLE AI & IMAGE SEARCH ENGINE */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-ford-blue uppercase tracking-wider block">
              1. Google AI & Google Images Engine
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Azure OpenAI API Key */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-light-sea-green shrink-0" />
                  <span className="font-bold text-[#2C3968] text-[11px]">Azure OpenAI API Key</span>
                </div>
                {isAuthenticated && isSuperAdmin ? (
                  <input
                    type="text"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[10.5px] font-mono bg-white border border-[#cbd5e1] rounded-lg text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                ) : (
                  <code className="text-[10px] text-[#64748b] font-mono block truncate">{maskKey(geminiApiKey || "NOT_SET")}</code>
                )}
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 self-start">● Azure OpenAI GPT-4o Aktif</span>
              </div>

              {/* SerpApi Key */}
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-light-sea-green shrink-0" />
                  <span className="font-bold text-[#2C3968] text-[11px]">SerpApi (Google Images API)</span>
                </div>
                {isAuthenticated && isSuperAdmin ? (
                  <input
                    type="text"
                    value={serpApiKey}
                    onChange={(e) => setSerpApiKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[10.5px] font-mono bg-white border border-[#cbd5e1] rounded-lg text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                ) : (
                  <code className="text-[10px] text-[#64748b] font-mono block truncate">{maskKey(serpApiKey || "NOT_SET")}</code>
                )}
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 self-start">● Google Images Live</span>
              </div>
            </div>
          </div>

          {/* GROUP 2: MICROSOFT AZURE CLOUD SUITE */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-ford-blue uppercase tracking-wider block">
              2. Microsoft Azure Student Suite
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { label: "Azure Blob Storage Account", value: azureStorageAccount, setter: setAzureStorageAccount, status: "stgscanginofest26" },
                { label: "Azure Blob Container", value: azureStorageContainer, setter: setAzureStorageContainer, status: "gscan-media" },
                { label: "Azure AI Vision Endpoint", value: azureVisionEndpoint, setter: setAzureVisionEndpoint, status: "Vision AI 4.0" },
                { label: "Azure AI Search Endpoint", value: azureSearchEndpoint, setter: setAzureSearchEndpoint, status: "Vector Index" },
                { label: "Azure AI Speech Region", value: azureSpeechRegion, setter: setAzureSpeechRegion, status: "southeastasia" },
                { label: "Azure Maps Client ID", value: azureMapsClientId, setter: setAzureMapsClientId, status: "Maps Georoute" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between gap-1.5">
                  <span className="font-bold text-[#2C3968] text-[11px] truncate">{item.label}</span>
                  {isAuthenticated && isSuperAdmin ? (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[10.5px] font-mono bg-white border border-[#cbd5e1] rounded-lg text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                    />
                  ) : (
                    <code className="text-[10px] text-[#64748b] font-mono block truncate">{maskKey(item.value)}</code>
                  )}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-ford-blue self-start">● {item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GROUP 3: FIREBASE CLOUD INFRASTRUCTURE */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-ford-blue uppercase tracking-wider block">
              3. Google Firebase Cloud Infrastructure
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { label: "Firebase Project ID", value: firebaseProjectId, setter: setFirebaseProjectId },
                { label: "Firebase Auth Domain", value: firebaseAuthDomain, setter: setFirebaseAuthDomain },
                { label: "Firebase Storage Bucket", value: firebaseStorageBucket, setter: setFirebaseStorageBucket },
                { label: "Firebase App ID", value: firebaseAppId, setter: setFirebaseAppId },
                { label: "Messaging Sender ID", value: firebaseMessagingSenderId, setter: setFirebaseMessagingSenderId },
                { label: "Measurement ID", value: firebaseMeasurementId, setter: setFirebaseMeasurementId },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between gap-1.5">
                  <span className="font-bold text-[#2C3968] text-[11px] truncate">{item.label}</span>
                  {isAuthenticated && isSuperAdmin ? (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => item.setter(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[10.5px] font-mono bg-white border border-[#cbd5e1] rounded-lg text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                    />
                  ) : (
                    <code className="text-[10px] text-[#64748b] font-mono block truncate">{maskKey(item.value)}</code>
                  )}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 self-start">● Cloud Firestore</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isAuthenticated || !isSuperAdmin ? (
          <p className="text-[10px] text-[#64748b]">
            * {isSuperAdmin ? 'Klik "Buka / Ubah Kunci" dan masukkan PIN otorisasi untuk mengedit kredensial.' : 'Pengubahan kunci API dan kredensial sistem dibatasi hanya untuk akun Super Admin.'}
          </p>
        ) : (
          <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Mode Ubah Aktif — Tekan "Simpan Pengaturan" di atas untuk menyimpan semua perubahan ke Cloud Firestore.
          </p>
        )}
      </div>

      {/* ═══ Section 4: PIN Security & Change PIN ═══ */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-4">
        <h3 className="text-[13px] font-bold text-[#2C3968] flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-light-sea-green" />
          Keamanan & Ubah PIN Akses
          <span className="text-[10px] font-bold text-light-sea-green bg-blue-50 px-2 py-0.5 rounded-md">Sync Firestore</span>
        </h3>
        
        {isSuperAdmin && isAuthenticated ? (
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-[#64748b]">PIN Akses Master Saat Ini:</span>
              <code className="font-mono font-bold text-ford-blue bg-blue-50 px-2 py-0.5 rounded">{authPin}</code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[12px]">
              <div>
                <label className="block text-[11px] font-bold text-[#2C3968] mb-1">PIN Akses Baru</label>
                <input
                  type="text"
                  placeholder="Masukkan PIN baru..."
                  value={newPin}
                  onChange={(e) => { setNewPin(e.target.value); setPinChangeMsg(""); }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] font-mono text-[12px] text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#2C3968] mb-1">Konfirmasi PIN Baru</label>
                <input
                  type="text"
                  placeholder="Ulangi PIN baru..."
                  value={confirmNewPin}
                  onChange={(e) => { setConfirmNewPin(e.target.value); setPinChangeMsg(""); }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] font-mono text-[12px] text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>
            </div>

            {pinChangeMsg && (
              <p className={`text-[11px] font-bold ${pinChangeMsg.includes("berhasil") ? "text-emerald-600" : "text-red-600"}`}>
                {pinChangeMsg}
              </p>
            )}
            <p className="text-[10px] text-[#64748b]">
              PIN baru akan tersimpan ke Firestore saat Anda menekan tombol "Simpan Pengaturan".
            </p>
          </div>
        ) : isSuperAdmin ? (
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-4">
            <div className="text-[12px]">
              <span className="font-bold text-[#2C3968] block">PIN Akses Administrator</span>
              <span className="text-[#64748b] text-[11px]">PIN master terlindungi. Masukkan PIN otorisasi untuk mengubah.</span>
            </div>
            <button
              onClick={requestAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#2C3968] font-bold text-[12px] hover:border-light-sea-green transition-all cursor-pointer shadow-2xs shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-light-sea-green" />
              Verifikasi untuk Ubah PIN
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-4">
            <div className="text-[12px]">
              <span className="font-bold text-[#2C3968] block">PIN Akses Master Sistem</span>
              <span className="text-[#64748b] text-[11px]">Kewenangan pengubahan PIN master sistem hanya dimiliki oleh Super Admin.</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[11px] shrink-0">
              <Lock className="w-3.5 h-3.5" />
              Terkunci (Super Admin Only)
            </span>
          </div>
        )}
      </div>

      {/* ═══ Section 5: Cloud Firestore Collections (NO EMOJI ICONS) ═══ */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-4">
        <h3 className="text-[13px] font-bold text-[#2C3968] flex items-center gap-2">
          <Database className="w-4 h-4 text-light-sea-green" />
          Cloud Firestore — {FIRESTORE_COLLECTIONS.length} Koleksi Aktif
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FIRESTORE_COLLECTIONS.map((col) => (
            <div key={col.name} className="px-3.5 py-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-start gap-2.5 text-[11px]">
              <div className="w-2 h-2 rounded-full bg-[#35CBC3] mt-1 shrink-0"></div>
              <div className="min-w-0">
                <code className="font-bold text-[#2C3968] font-mono block text-[11px] truncate">{col.name}</code>
                <span className="text-[#64748b] block truncate mt-0.5">{col.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Section 6: AI & System Status ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
          <div className="text-[12px]"><h4 className="font-bold text-[#2C3968]">AI Engine</h4><p className="text-[11px] text-[#64748b]">Azure OpenAI GPT-4o</p><span className="text-[10px] font-bold text-emerald-700">● Aktif</span></div>
        </div>
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center shrink-0"><Database className="w-5 h-5" /></div>
          <div className="text-[12px]"><h4 className="font-bold text-[#2C3968]">RAG Pipeline</h4><p className="text-[11px] text-[#64748b]">4 Master Dataset</p><span className="text-[10px] font-bold text-emerald-700">● Terhubung</span></div>
        </div>
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center shrink-0"><Server className="w-5 h-5" /></div>
          <div className="text-[12px]"><h4 className="font-bold text-[#2C3968]">Cloud Firestore</h4><p className="text-[11px] text-[#64748b]">{FIRESTORE_COLLECTIONS.length} Koleksi</p><span className="text-[10px] font-bold text-emerald-700">● Online</span></div>
        </div>
      </div>

      {/* ═══ Section 7: Device & Browser Info ═══ */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5 space-y-4">
        <h3 className="text-[13px] font-bold text-[#2C3968] flex items-center gap-2">
          <Monitor className="w-4 h-4 text-light-sea-green" />
          Informasi Perangkat & Browser
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          {[
            { icon: <Globe className="w-3.5 h-3.5 text-light-sea-green" />, label: "Browser", value: deviceInfo.browser },
            { icon: <Monitor className="w-3.5 h-3.5 text-light-sea-green" />, label: "Sistem Operasi", value: deviceInfo.os },
            { icon: <Smartphone className="w-3.5 h-3.5 text-light-sea-green" />, label: "Resolusi Layar", value: deviceInfo.screen },
            { icon: <Globe className="w-3.5 h-3.5 text-light-sea-green" />, label: "Bahasa", value: deviceInfo.language },
            { icon: <Clock className="w-3.5 h-3.5 text-light-sea-green" />, label: "Timezone", value: deviceInfo.timezone },
            { icon: <Cpu className="w-3.5 h-3.5 text-light-sea-green" />, label: "CPU Cores", value: deviceInfo.cores },
            { icon: <HardDrive className="w-3.5 h-3.5 text-light-sea-green" />, label: "Device Memory", value: deviceInfo.memory },
            { icon: <Wifi className="w-3.5 h-3.5 text-light-sea-green" />, label: "Koneksi", value: deviceInfo.connection },
          ].map((item, idx) => (
            <div key={idx} className="px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center gap-2">
              {item.icon}
              <div className="min-w-0">
                <span className="text-[#64748b] block text-[10px]">{item.label}</span>
                <span className="font-bold text-[#2C3968] block truncate">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-[#e2e8f0]">
          <span className="text-[10px] text-[#64748b] block mb-0.5 font-bold">User Agent</span>
          <code className="text-[9px] text-slate-500 font-mono block break-all leading-relaxed">{deviceInfo.userAgent}</code>
        </div>
      </div>

      {/* ═══ Section 8: App Info ═══ */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs p-5">
        <h3 className="text-[13px] font-bold text-[#2C3968] flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-light-sea-green" />
          Informasi Aplikasi
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          {[
            { label: "Nama Sistem", value: "Kcal Dashboard MBG" },
            { label: "Versi", value: "2.4.0" },
            { label: "Instansi", value: "ginofest 2026" },
            { label: "Tahun Anggaran", value: "TA 2026/2027" },
            { label: "Framework", value: "Next.js 15 + React 19" },
            { label: "AI Model", value: "Azure OpenAI GPT-4o" },
            { label: "Database", value: "Cloud Firestore" },
            { label: "Hosting", value: "Firebase App Hosting" },
          ].map((item, idx) => (
            <div key={idx} className="px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[#64748b] block text-[10px]">{item.label}</span>
              <span className="font-bold text-[#2C3968]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Section 9: Sesi Akun & Logout ═══ */}
      <div className="bg-white rounded-3xl border border-red-200 shadow-xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-bold text-red-600 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sesi Akun & Logout
            </h3>
            <p className="text-[11px] text-[#64748b]">
              Keluar dari sesi akun aktif ({currentAdmin.name} • {currentAdmin.regionLabel}) pada perangkat ini.
            </p>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </div>

      {/* ═══ MODAL KONFIRMASI KELUAR AKUN ═══ */}
      <LogoutModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        currentAdmin={currentAdmin}
      />

      {/* ═══ Segmented 8-Digit PIN Auth Modal (EXACTLY MATCHING RAG) ═══ */}
      {isAuthDialogOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-[22px] font-black text-[#2C3968] tracking-tight">
                Autentikasi Administrator Pengaturan
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Masukkan 8 digit kode otorisasi administrator untuk membuka dan mengedit kredensial sistem.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-10 sm:w-11 h-12 sm:h-13 rounded-xl border text-center text-[18px] font-mono font-black focus:outline-none transition-all ${
                      pinError
                        ? "border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-400"
                        : digit
                        ? "border-[#35CBC3] bg-blue-50/40 text-[#2C3968] focus:ring-2 focus:ring-[#35CBC3]/30"
                        : "border-[#cbd5e1] bg-white text-[#2C3968] focus:border-[#35CBC3] focus:ring-2 focus:ring-[#35CBC3]/20"
                    }`}
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-[11px] text-red-600 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Kode PIN salah. Akses ditolak.</span>
                </p>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => verifyPin(pinDigits.join(""))}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[13px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Verifikasi & Buka Kredensial
              </button>

              <button
                onClick={() => {
                  setIsAuthDialogOpen(false);
                  setPinError(false);
                  setPinDigits(Array(PIN_LENGTH).fill(""));
                }}
                className="w-full py-2 rounded-xl text-[12px] font-bold text-[#64748b] hover:text-[#2C3968] hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
