"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  Download,
  Loader2,
  Lock,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Shield,
  Calendar,
  Package,
  Layers
} from "lucide-react";
import * as XLSX from "xlsx";
import { loadMasterDataFromFirestore } from "@/services/firebase-service";
import { GRESIK_DISTRICTS, DistrictData } from "@/data/gresik-districts";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAllUsersFromFirestore,
  fetchSessionLogs,
  UserSessionLog,
} from "@/services/auth-service";
import { KcalUser } from "@/types/auth";
import { Skeleton } from "@/components/ui/Skeleton";

interface BackupSummary {
  commodities: any[];
  prices: any[];
  recipes: any[];
  nutrition: any[];
  districts: DistrictData[];
  users: KcalUser[];
  sessionLogs: UserSessionLog[];
}

// Header label maps per collection for clean Excel headers
const HEADER_MAPS: Record<string, Record<string, string>> = {
  master_komoditas: {
    id: "ID", kecamatan: "Kecamatan", komoditasUnggulan: "Komoditas Unggulan", kategori: "Kategori",
    musimPanen: "Musim Panen", estimasiProduksi: "Estimasi Produksi (Ton)", hargaRataRata: "Harga Rata-Rata (Rp)",
    satuanHarga: "Satuan Harga", district: "Wilayah",
  },
  master_harga_pasar: {
    id: "ID", namaBahan: "Nama Bahan", kategori: "Kategori", harga: "Harga (Rp/Kg)",
    satuan: "Satuan", sumber: "Sumber Data", tanggalUpdate: "Tanggal Update", district: "Wilayah",
  },
  master_menu_makanan: {
    id: "ID", namaMenu: "Nama Menu", kategoriMenu: "Kategori", porsiUsia: "Porsi Usia",
    bahanUtama: "Bahan Utama", estimasiKalori: "Estimasi Kalori (Kcal)", estimasiBiaya: "Estimasi Biaya (Rp)",
    spikeNutrisi: "Spike Nutrisi", district: "Wilayah",
  },
  master_nilai_gizi: {
    id: "ID", namaPangan: "Nama Pangan", golongan: "Golongan", energi: "Energi (Kcal)",
    protein: "Protein (g)", lemak: "Lemak (g)", karbohidrat: "Karbohidrat (g)",
    serat: "Serat (g)", kalsium: "Kalsium (mg)", fosfor: "Fosfor (mg)", besi: "Besi (mg)",
    vitA: "Vitamin A (mcg)", vitB1: "Vit B1 (mg)", vitC: "Vit C (mg)", air: "Air (g)", district: "Wilayah",
  },
  master_wilayah: {
    id: "ID", name: "Nama Kecamatan", targetChildren: "Sasaran Siswa", riskLevel: "Tingkat Risiko",
    stuntingRate: "Angka Stunting (%)", coverageMBG: "Cakupan MBG (%)", localCommodity: "Komoditas Lokal",
    deficiencyFocus: "Fokus Defisiensi", schoolsCount: "Jumlah Sekolah", posyanduCount: "Jumlah Posyandu",
    monthlyBudget: "Anggaran Bulanan (Rp)", lat: "Latitude", lng: "Longitude",
  },
  kcal_users: {
    id: "ID", name: "Nama Lengkap", email: "Email Resmi", role: "Role Akun",
    districtId: "ID Wilayah", regionLabel: "Wilayah Tugas", isPinConfigured: "PIN Sudah Diatur",
    initials: "Inisial", avatarBg: "Warna Avatar", createdAt: "Tanggal Dibuat",
  },
  kcal_session_logs: {
    id: "ID", userId: "ID User", email: "Email", name: "Nama",
    role: "Role", districtLabel: "Wilayah", loginAt: "Waktu Login",
    userAgent: "User Agent", status: "Status Sesi",
  },
};

export const BackupSnapshotView: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [data, setData] = useState<BackupSummary>({
    commodities: [],
    prices: [],
    recipes: [],
    nutrition: [],
    districts: GRESIK_DISTRICTS,
    users: [],
    sessionLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ragRes, usersRes, logsRes] = await Promise.all([
        loadMasterDataFromFirestore(),
        fetchAllUsersFromFirestore(),
        fetchSessionLogs(),
      ]);

      setData({
        commodities: ragRes.success && ragRes.commodities ? ragRes.commodities : [],
        prices: ragRes.success && ragRes.prices ? ragRes.prices : [],
        recipes: ragRes.success && ragRes.recipes ? ragRes.recipes : [],
        nutrition: ragRes.success && ragRes.nutrition ? ragRes.nutrition : [],
        districts: GRESIK_DISTRICTS,
        users: usersRes,
        sessionLogs: logsRes,
      });
    } catch (e) {
      console.error("Error loading backup data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Collections summary
  const collections = [
    { name: "Master Komoditas Lokal", collection: "master_komoditas", count: data.commodities.length, icon: Package, color: "text-emerald-600 bg-emerald-50" },
    { name: "Harga Pasar SISKAPERBAPO", collection: "master_harga_pasar", count: data.prices.length, icon: FileSpreadsheet, color: "text-blue-600 bg-blue-50" },
    { name: "Standar Menu MBG (Resep)", collection: "master_menu_makanan", count: data.recipes.length, icon: Layers, color: "text-violet-600 bg-violet-50" },
    { name: "Nilai Gizi TKPI 2019", collection: "master_nilai_gizi", count: data.nutrition.length, icon: Shield, color: "text-amber-600 bg-amber-50" },
    { name: "Wilayah & Sasaran 18 Kecamatan", collection: "master_wilayah", count: data.districts.length, icon: Database, color: "text-indigo-600 bg-indigo-50" },
    { name: "Akun Pengguna Terdaftar", collection: "kcal_users", count: data.users.length, icon: HardDrive, color: "text-rose-600 bg-rose-50" },
    { name: "Log Sesi Login", collection: "kcal_session_logs", count: data.sessionLogs.length, icon: Calendar, color: "text-cyan-600 bg-cyan-50" },
  ];

  const totalRecords = collections.reduce((sum, c) => sum + c.count, 0);

  // Get rows for a collection
  const getCollectionRows = (collectionName: string): any[] => {
    switch (collectionName) {
      case "master_komoditas": return data.commodities;
      case "master_harga_pasar": return data.prices;
      case "master_menu_makanan": return data.recipes;
      case "master_nilai_gizi": return data.nutrition;
      case "master_wilayah": return data.districts;
      case "kcal_users": return data.users.map(({ password, pin, ...safe }) => safe);
      case "kcal_session_logs": return data.sessionLogs;
      default: return [];
    }
  };

  // Export single collection as .xlsx
  const handleExportExcel = (collectionName: string, sheetTitle: string) => {
    const rows = getCollectionRows(collectionName);
    if (rows.length === 0) {
      showToast("Data kosong untuk koleksi ini.");
      return;
    }

    const headerMap = HEADER_MAPS[collectionName] || {};
    const keys = Object.keys(rows[0]);
    const headers = keys.map((k) => headerMap[k] || k);

    const sheetData = [
      headers,
      ...rows.map((row) => keys.map((k) => {
        const val = row[k];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return JSON.stringify(val);
        return val;
      })),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle.substring(0, 31));
    XLSX.writeFile(wb, `KCAL_${collectionName.toUpperCase()}_${new Date().toISOString().split("T")[0]}.xlsx`);
    showToast(`✓ Excel ${sheetTitle} berhasil diunduh (.xlsx)!`);
  };

  // Full JSON Backup
  const handleFullJsonBackup = () => {
    const backupPayload = {
      _meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: user?.name || "Super Admin",
        instansi: "Pemerintah Kabupaten Gresik",
        program: "Kcal Dashboard MBG — Proposal GinoFest 2026",
        version: "1.0.0",
        totalRecords,
      },
      master_komoditas: data.commodities,
      master_harga_pasar: data.prices,
      master_menu_makanan: data.recipes,
      master_nilai_gizi: data.nutrition,
      master_wilayah: data.districts,
      kcal_users: data.users.map(({ password, pin, ...safe }) => ({ ...safe, _redacted: true })),
      kcal_session_logs: data.sessionLogs,
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KCAL_FULL_BACKUP_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastBackupDate(new Date().toLocaleString("id-ID"));
    showToast("✓ Brankas Snapshot lengkap berhasil diunduh (JSON)!");
  };

  // Full Excel Backup (all sheets in one workbook)
  const handleFullExcelBackup = () => {
    const wb = XLSX.utils.book_new();

    for (const col of collections) {
      const rows = getCollectionRows(col.collection);
      if (rows.length === 0) continue;

      const headerMap = HEADER_MAPS[col.collection] || {};
      const keys = Object.keys(rows[0]);
      const headers = keys.map((k) => headerMap[k] || k);

      const sheetData = [
        headers,
        ...rows.map((row) => keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return JSON.stringify(val);
          return val;
        })),
      ];

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, col.name.substring(0, 31));
    }

    XLSX.writeFile(wb, `KCAL_FULL_BACKUP_${new Date().toISOString().split("T")[0]}.xlsx`);
    setLastBackupDate(new Date().toLocaleString("id-ID"));
    showToast("✓ Brankas Excel lengkap berhasil diunduh (.xlsx) — semua tabel dalam 1 workbook!");
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm space-y-3">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-[18px] font-bold text-[#071e49]">Akses Khusus Super Admin</h2>
        <p className="text-[12px] text-[#64748b]">
          Brankas Backup & Snapshot hanya dapat diakses oleh Administrator Utama Kabupaten Gresik.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white font-bold text-[13px] shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header (Standardized with Notifications & Help) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Brankas Backup & Snapshot
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1a73e8] text-[11px] font-bold border border-blue-200">
              {totalRecords.toLocaleString("id-ID")} Data
            </span>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Cadangkan 7 koleksi master basis data Cloud Firestore ke arsip Excel (.xlsx) atau JSON resmi untuk proposal GinoFest 2026.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#071e49] text-[12px] font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#1a73e8]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Compact Full Backup CTA */}
      <div className="bg-gradient-to-r from-[#071e49] via-[#0b2b68] to-[#1a73e8] p-5 sm:p-6 rounded-2xl text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-[10px] font-bold border border-white/15">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Arsip Resmi Proposal GinoFest 2026</span>
            </div>
            <h3 className="text-[16px] font-black tracking-tight">Unduh Snapshot Lengkap Seluruh Database</h3>
            <p className="text-[11px] text-blue-100/90 leading-relaxed max-w-xl">
              Mengunduh {totalRecords.toLocaleString("id-ID")} rekaman dari 7 koleksi Firestore. Kredensial password & PIN otomatis di-redact.
            </p>
            {lastBackupDate && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                Backup terakhir: {lastBackupDate}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={handleFullExcelBackup}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#071e49] font-black text-[11px] shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
              <span>Full Backup (.xlsx)</span>
            </button>
            <button
              onClick={handleFullJsonBackup}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[11px] border border-white/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Full Backup (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SPREADSHEET TABLE MASTER KOLEKSI (RAG TABLE STYLE) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-[14px] font-bold text-[#071e49]">
              Daftar Tabel Master Basis Data Cloud Firestore
            </h3>
            <p className="text-[11px] text-[#64748b]">
              Ekspor dataset per tabel ke format spreadsheet Excel (.xlsx) dengan header kolom terstandarisasi.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#1a73e8] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 self-start sm:self-auto">
            7 Koleksi Aktif • {totalRecords.toLocaleString("id-ID")} Total Baris
          </span>
        </div>

        {/* Table Container in RAG Style */}
        <div className="overflow-x-auto rounded-xl border border-[#cbd5e1] shadow-xs">
          <table className="w-full text-left text-[12px] border-collapse bg-white">
            <thead className="sticky top-0 z-10 shadow-xs">
              <tr className="bg-[#1a73e8] text-white font-bold divide-x divide-blue-400">
                <th className="py-2.5 px-3 w-12 text-center border-blue-400">No</th>
                <th className="py-2.5 px-4 border-blue-400 font-bold">Nama Koleksi Dataset</th>
                <th className="py-2.5 px-4 border-blue-400 w-48 font-bold">Koleksi Firestore</th>
                <th className="py-2.5 px-4 border-blue-400 text-center w-36 font-bold">Total Rekaman</th>
                <th className="py-2.5 px-3 text-center border-blue-400 w-36 font-bold">Aksi Unduh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {isLoading ? (
                Array.from({ length: 7 }).map((_, rIdx) => (
                  <tr key={rIdx} className="divide-x divide-slate-100 animate-pulse">
                    <td className="py-2.5 px-3 text-center bg-slate-50/50">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-44" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <Skeleton className="h-4 w-32 rounded" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Skeleton className="h-5 w-20 rounded-full mx-auto" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Skeleton className="h-7 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : (
                collections.map((col, idx) => {
                const Icon = col.icon;
                return (
                  <tr key={col.collection} className="hover:bg-slate-50 divide-x divide-slate-100 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-500 bg-slate-50/50">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${col.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#071e49] text-[12px]">{col.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <code className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {col.collection}
                      </code>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1a73e8] border border-blue-200 tabular-nums">
                        {col.count.toLocaleString("id-ID")} baris
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleExportExcel(col.collection, col.name)}
                        disabled={col.count === 0 || isLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold cursor-pointer transition-all disabled:opacity-40 shadow-2xs w-full"
                        title={`Unduh ${col.name} (.xlsx)`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Unduh .xlsx</span>
                      </button>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2.5">
        <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <strong>Catatan Keamanan:</strong> File backup otomatis me-<em>redact</em> (menyembunyikan) kolom <code>password</code> dan <code>PIN</code> pada data akun pengguna.
          Pastikan file backup disimpan di media penyimpanan yang aman dan tidak dibagikan secara publik.
        </div>
      </div>
    </div>
  );
};
