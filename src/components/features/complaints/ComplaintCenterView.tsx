"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  RefreshCw,
  Loader2,
  Search,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  CircleDot,
  Filter,
  Sparkles,
  Lock,
  Mail,
  ChevronDown
} from "lucide-react";
import {
  fetchComplaintsFromFirestore,
  updateComplaintStatusInFirestore,
  ComplaintRecord,
} from "@/services/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { CardListSkeleton } from "@/components/ui/Skeleton";

type StatusFilter = "all" | "baru" | "proses" | "selesai";

const STATUS_CONFIG = {
  baru: { label: "Baru", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", icon: CircleDot },
  proses: { label: "Ditindaklanjuti", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", icon: AlertTriangle },
  selesai: { label: "Selesai", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
};

export const ComplaintCenterView: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [responseNotesMap, setResponseNotesMap] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchComplaintsFromFirestore();
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (e) {
      console.error("Failed to load complaints:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Filtered complaints
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "all" && (c.status || "baru") !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.senderName.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.senderContact || "").toLowerCase().includes(q)
    );
  });

  // Stats
  const totalBaru = complaints.filter((c) => !c.status || c.status === "baru").length;
  const totalProses = complaints.filter((c) => c.status === "proses").length;
  const totalSelesai = complaints.filter((c) => c.status === "selesai").length;

  const handleUpdateStatus = async (id: string, status: "baru" | "proses" | "selesai") => {
    const notes = responseNotesMap[id] || "";
    await updateComplaintStatusInFirestore(id, status, notes || undefined);
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, responseNotes: notes || c.responseNotes } : c))
    );
    const statusLabel = STATUS_CONFIG[status].label;
    showToast(`✓ Status tiket diperbarui menjadi: ${statusLabel}`);
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm space-y-3">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-[18px] font-bold text-[#071e49]">Akses Khusus Super Admin</h2>
        <p className="text-[12px] text-[#64748b]">
          Pusat Aduan & Masukan hanya dapat diakses oleh Administrator Utama Kabupaten Gresik.
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
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Pusat Aduan & Masukan
            </h1>
            {totalBaru > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                {totalBaru} Baru
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#64748b]">
            Kelola seluruh pengaduan, saran, dan masukan masyarakat terkait program MBG terhubung ke Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadComplaints}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#071e49] text-[12px] font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#1a73e8]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Toolbar in 1 Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: `Semua (${complaints.length})` },
            { id: "baru", label: `Baru (${totalBaru})` },
            { id: "proses", label: `Ditindaklanjuti (${totalProses})` },
            { id: "selesai", label: `Selesai (${totalSelesai})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as StatusFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === tab.id
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "bg-white border border-[#cbd5e1] text-slate-600 hover:text-[#071e49]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Compact Search Bar */}
        <div className="relative sm:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pengirim, pesan, kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#1a73e8] shadow-2xs font-medium"
          />
        </div>
      </div>

      {/* Complaint List */}
      <div className="space-y-3">
        {isLoading ? (
          <CardListSkeleton count={3} />
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#e2e8f0] space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-[#071e49] text-[13px]">Belum ada tiket pengaduan yang sesuai filter</p>
            <p className="text-[11px] text-[#64748b]">Laporan pengaduan baru dari masyarakat akan otomatis tercatat di sini.</p>
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const status = c.status || "baru";
            const cfg = STATUS_CONFIG[status];
            const StatusIcon = cfg.icon;

            return (
              <div key={c.id} className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2.5 hover:border-slate-300 transition-colors">
                {/* Top: Sender info & status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-7 h-7 rounded-lg bg-[#1a73e8] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                      {c.senderName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-[12px] text-[#071e49]">{c.senderName}</span>
                    {c.senderContact && (
                      <span className="text-[11px] font-mono text-[#1a73e8] flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {c.senderContact}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1a73e8] text-[10px] font-bold border border-blue-100">
                      {c.category}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start sm:self-auto ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                {/* Message */}
                <p className="p-3 bg-[#f8fafc] rounded-xl border border-slate-200 text-[12px] text-slate-700 leading-relaxed font-medium">
                  &ldquo;{c.message}&rdquo;
                </p>

                {/* Response Notes */}
                {c.responseNotes && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                    <span className="font-bold text-[10px] uppercase text-emerald-600">Catatan Tindak Lanjut: </span>
                    {c.responseNotes}
                  </div>
                )}

                {/* Bottom: Time + Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
                    <Clock className="w-3 h-3" />
                    <span>{c.createdAtIso ? new Date(c.createdAtIso).toLocaleString("id-ID") : "Baru saja"}</span>
                    <span>•</span>
                    <span>Tujuan: takathasan82@gmail.com</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Response Note Input */}
                    <input
                      type="text"
                      placeholder="Tulis tanggapan / catatan admin..."
                      value={responseNotesMap[c.id!] || ""}
                      onChange={(e) => setResponseNotesMap((prev) => ({ ...prev, [c.id!]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateStatus(c.id!, status);
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 border border-[#cbd5e1] text-[11px] text-[#071e49] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1a73e8] w-full sm:w-56 font-medium"
                    />

                    {/* Status Dropdown Selector */}
                    <div className="relative shrink-0">
                      <select
                        value={status}
                        onChange={(e) => handleUpdateStatus(c.id!, e.target.value as "baru" | "proses" | "selesai")}
                        className="appearance-none pl-3 pr-7 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-[#cbd5e1] text-[11px] font-bold text-[#071e49] focus:bg-white focus:outline-none focus:border-[#1a73e8] cursor-pointer shadow-2xs transition-all"
                        title="Ubah Status Tiket Aduan"
                      >
                        <option value="baru">Baru</option>
                        <option value="proses">Ditindaklanjuti</option>
                        <option value="selesai">Selesai</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
