"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Sparkles, Database, AlertCircle, Check, Loader2, RefreshCw } from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  FirestoreNotification,
} from "@/services/firebase-service";

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleToggleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "master": return <Database className="w-5 h-5 text-[#1a73e8]" />;
      case "generate": return <Sparkles className="w-5 h-5 text-[#1a73e8]" />;
      case "screening": return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "settings": return <Check className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-[#1a73e8]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Pusat Notifikasi
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#1a73e8] text-white text-[11px] font-black shadow-xs">
                {unreadCount} Baru
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#64748b]">
            Log aktivitas sistem tersinkronisasi langsung dengan Cloud Firestore
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#071e49] text-[12px] font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
          { id: "system", label: "Sistem" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
              activeCategory === tab.id
                ? "bg-[#1a73e8] text-white shadow-xs"
                : "bg-white border border-[#cbd5e1] text-slate-600 hover:text-[#071e49]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 mx-auto text-[#1a73e8] animate-spin" />
          <p className="text-[13px] text-[#64748b] font-medium">Memuat notifikasi dari Firestore...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#e2e8f0] space-y-3">
          <Bell className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-[14px] font-bold text-slate-400">Belum ada notifikasi</p>
          <p className="text-[12px] text-slate-400">
            Aktivitas sistem akan otomatis tercatat di sini
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleToggleRead(n.id)}
              className={`p-4 rounded-3xl border transition-all flex items-start gap-4 ${
                !n.isRead
                  ? "bg-blue-50/40 border-blue-200 hover:border-blue-300 shadow-2xs cursor-pointer"
                  : "bg-white border-[#e2e8f0] opacity-75"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {getCategoryIcon(n.category)}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="text-[13px] font-bold text-[#071e49]">{n.title}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{formatTime(n.createdAtIso)}</span>
                </div>
                <p className="text-[12px] text-[#64748b] leading-relaxed">{n.description}</p>
              </div>

              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
