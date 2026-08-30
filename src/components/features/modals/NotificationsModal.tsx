"use client";

import React, { useState } from "react";
import { Bell, Check, X, Sparkles, AlertCircle, Database, CheckCheck } from "lucide-react";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "ai" | "price" | "screening" | "system";
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "AI Perencana Menu MBG Siap Digunakan",
    description: "Model Gemini RAG telah disinkronkan dengan 4 master dataset Kabupaten Gresik (104 bahan pangan TKPI & data pasar SISKAPERBAPO).",
    time: "10 menit yang lalu",
    type: "ai",
    isRead: false,
  },
  {
    id: "2",
    title: "Pembaruan Harga Pasar SISKAPERBAPO",
    description: "Data harga komoditas pasar harian Kabupaten Gresik telah diperbarui ke sistem basis data RAG.",
    time: "1 jam yang lalu",
    type: "price",
    isRead: false,
  },
  {
    id: "3",
    title: "Sinkronisasi Master Wilayah 18 Kecamatan",
    description: "Data sasaran siswa MBG dan prevalensi stunting per kecamatan telah tersimpan di Cloud Firestore.",
    time: "3 jam yang lalu",
    type: "system",
    isRead: false,
  },
  {
    id: "4",
    title: "Skrining Balita Posyandu Terkini",
    description: "12 data skrining antropometri balita baru telah diverifikasi oleh Puskesmas Kebomas dan Puskesmas Dukun.",
    time: "1 hari yang lalu",
    type: "screening",
    isRead: true,
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
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
            <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-black text-[#2C3968]">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[10px] font-black">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748b]">
                Pembaruan sistem, integrasi RAG, dan surveilans stunting
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

        {/* Action: Mark All Read */}
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-light-sea-green hover:text-[#22B5AC] flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Sudah Dibaca</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleToggleRead(n.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                !n.isRead
                  ? "bg-blue-50/60 border-blue-200"
                  : "bg-[#f8fafc] border-[#e2e8f0] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-light-sea-green">
                {n.type === "ai" && <Sparkles className="w-4 h-4 text-light-sea-green" />}
                {n.type === "price" && <Database className="w-4 h-4 text-emerald-600" />}
                {n.type === "system" && <Check className="w-4 h-4 text-blue-600" />}
                {n.type === "screening" && <AlertCircle className="w-4 h-4 text-amber-600" />}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[12px] font-bold text-[#2C3968] leading-snug">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                </div>
                <p className="text-[11px] text-[#64748b] leading-relaxed">
                  {n.description}
                </p>
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#35CBC3] shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
