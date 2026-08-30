"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, CheckCheck, Sparkles, Database, AlertCircle, Check,
  Loader2, RefreshCw, X, Trash2, Calendar, Clock, Tag
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  FirestoreNotification,
} from "@/services/firebase-service";
import { NotificationListSkeleton } from "@/components/ui/Skeleton";

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<FirestoreNotification[] | FirestoreNotification | null>(null);

  const loadNotifications = useCallback(async () => {
    const res = await fetchNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    setIsSyncing(true);
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setIsSyncing(false);
  };

  const handleItemClick = async (notif: FirestoreNotification) => {
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    setSelectedNotif(notif);
  };

  const handleDeleteNotif = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedNotif(null);
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    await loadNotifications();
    setIsSyncing(false);
  };

  const filteredNotifications = notifications.filter((n) =>
    activeCategory === "all" ? true : n.category === activeCategory
  );

  const formatTime = (isoStr?: string) => {
    if (!isoStr) return "";
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  const formatFullDate = (isoStr?: string) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "master": return <Database className="w-5 h-5 text-light-sea-green" />;
      case "generate": return <Sparkles className="w-5 h-5 text-light-sea-green" />;
      case "screening": return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "settings": return <Check className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-light-sea-green" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "master": return "Master Data";
      case "generate": return "Generate Menu";
      case "screening": return "Skrining Gizi";
      case "settings": return "Pengaturan Sistem";
      default: return "Sistem";
    }
  };

  const activeModalNotif = selectedNotif && !Array.isArray(selectedNotif) ? selectedNotif : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#2C3968] tracking-tight">
              Pusat Notifikasi
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[11px] font-black shadow-xs">
                {unreadCount} Baru
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#64748b]">
            Log aktivitas sistem tersinkronisasi langsung dengan Cloud Firestore. Klik notifikasi untuk melihat detail.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#2C3968] text-[12px] font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Semua" },
          { id: "master", label: "Master Data" },
          { id: "generate", label: "Generate Menu" },
          { id: "screening", label: "Skrining" },
          { id: "settings", label: "Pengaturan" },
          { id: "system", label: "Sistem" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
              activeCategory === tab.id
                ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                : "bg-white border border-[#cbd5e1] text-slate-600 hover:text-[#2C3968]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <NotificationListSkeleton count={6} />
      ) : filteredNotifications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#e2e8f0] space-y-3">
          <Bell className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-[14px] font-bold text-slate-400">Belum ada notifikasi</p>
          <p className="text-[12px] text-slate-400">
            Aktivitas sistem akan otomatis tercatat di sini
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`py-2.5 px-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                !n.isRead
                  ? "bg-blue-50/50 border-blue-200 hover:border-blue-300 shadow-2xs"
                  : "bg-white border-[#e2e8f0] hover:bg-slate-50/80 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {!n.isRead ? (
                  <span className="w-2 h-2 rounded-full bg-[#35CBC3] shrink-0"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                )}

                <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-[#2C3968] truncate group-hover:text-light-sea-green transition-colors">
                        {n.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase shrink-0">
                        {getCategoryLabel(n.category)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate leading-tight mt-0.5">
                      {n.description}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0 sm:pl-3">
                    {formatTime(n.createdAtIso)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ DETAIL NOTIFICATION MODAL DIALOG ═══ */}
      {activeModalNotif && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#e8f0fe] flex items-center justify-center shadow-xs shrink-0">
                  {getCategoryIcon(activeModalNotif.category)}
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-tint text-ford-blue mb-1">
                    {getCategoryLabel(activeModalNotif.category)}
                  </span>
                  <h2 className="text-[16px] font-black text-[#2C3968] tracking-tight leading-tight">
                    {activeModalNotif.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#2C3968] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#64748b] bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-light-sea-green" />
                <span>{formatFullDate(activeModalNotif.createdAtIso)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-light-sea-green" />
                <span>{formatTime(activeModalNotif.createdAtIso)}</span>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#64748b] block">Rincian Aktivitas:</span>
              <div className="p-4 rounded-2xl bg-white border border-[#cbd5e1] text-[13px] text-[#2C3968] leading-relaxed">
                {activeModalNotif.description}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleDeleteNotif(activeModalNotif.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>

              <button
                onClick={() => setSelectedNotif(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
