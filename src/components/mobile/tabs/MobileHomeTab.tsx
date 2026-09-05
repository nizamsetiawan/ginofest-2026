"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Sparkles,
  QrCode,
  History,
  Bot,
  MessageSquare,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Star,
  Clock,
  Utensils,
  Send,
  X,
  ShieldCheck,
  HeartPulse,
  Flame,
  User,
  ThumbsUp,
  AlertCircle,
  Trash2,
  CheckCheck,
  ArrowLeft
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { CitizenUser, AtmosphereState, MobileTab } from "../types";
import { AuthSpectrumBackground } from "../auth/AuthSpectrumBackground";
import {
  subscribeUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  seedInitialUserNotifications,
  addNotification,
  FirestoreNotification,
} from "@/services/firebase-service";

interface MobileHomeTabProps {
  citizenUser: CitizenUser | null;
  atmosphere?: AtmosphereState;
  setActiveTab: (tab: MobileTab) => void;
}

// ─── DUMMY DATA: RIWAYAT KLAIM ───
const CLAIM_HISTORY = [
  {
    id: "MBG-2026-0901-8A1",
    menu: "Nasi Ayam Kari & Sayur",
    kalori: "680 kkal",
    waktu: "Hari Ini, 11.45 WIB",
    lokasi: "Dapur SPPG Kecamatan",
    status: "Sukses",
    petugas: "Petugas Distribusi SPPG",
  },
  {
    id: "MBG-2026-0831-4F2",
    menu: "Nasi Bandeng Bakar Madu",
    kalori: "650 kkal",
    waktu: "Kemarin, 12.10 WIB",
    lokasi: "Dapur SPPG Kecamatan",
    status: "Sukses",
    petugas: "Petugas Distribusi SPPG",
  },
  {
    id: "MBG-2026-0829-9C3",
    menu: "Nasi Daging Semur & Bayam",
    kalori: "690 kkal",
    waktu: "29 Agu 2026, 11.50 WIB",
    lokasi: "Dapur SPPG Kecamatan",
    status: "Sukses",
    petugas: "Petugas Distribusi SPPG",
  },
];

// ─── DUMMY DATA: EDUKASI GIZI ───
const NUTRITION_ARTICLES = [
  {
    id: 1,
    category: "Pencegahan Stunting",
    title: "Pentingnya Protein Hewani pada Porsi Makan Bergizi Gratis",
    readTime: "2 mnt baca",
    tag: "Kemenkes RI",
    icon: ThumbsUp,
    summary:
      "Asupan asam amino esensial dari daging ayam, telur, dan ikan lokal sangat krusial dalam memicu hormon pertumbuhan tinggi badan anak.",
    content:
      "Berdasarkan standar BGN 2026 dan Kemenkes RI, satu porsi MBG wajib mengandung minimal 25-30 gram protein hewani murni untuk menunjang tumbuh kembang optimal anak di usia sekolah dasar.",
  },
  {
    id: 2,
    category: "Deteksi Dini AI",
    title: "Mengenali Tanda Anemia dari Konjungtiva & Bantalan Kuku",
    readTime: "3 mnt baca",
    tag: "AI Biometrik",
    icon: HeartPulse,
    summary:
      "Kelopak mata pucat dan waktu pengisian kapiler kuku lebih dari 2 detik adalah indikasi awal kekurangan zat besi yang perlu penanganan cepat.",
    content:
      "Fitur pemindaian biometrik Kcal menganalisis spektrum warna konjungtiva dan capillary refill time kuku untuk merekomendasikan tambahan zat besi pada menu MBG anak Anda.",
  },
  {
    id: 3,
    category: "Pedoman Nutrisi",
    title: "Prinsip 'Isi Piringku' untuk Anak Usia Sekolah",
    readTime: "2 mnt baca",
    tag: "Gizi Seimbang",
    icon: Utensils,
    summary:
      "Proporsi 1/3 makanan pokok, 1/3 sayuran, 1/6 lauk pauk, dan 1/6 buah-buahan untuk menjaga imunitas dan konsentrasi belajar.",
    content:
      "Setiap bento tray MBG dirancang mengikuti kaidah gizi seimbang dengan gramatur yang telah ditimbang tepat oleh ahli gizi SPPG.",
  },
];

// ─── INITIAL CHAT BOT MESSAGES ───
const BOT_INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "bot",
    text: "Halo! Selamat datang di Pusat Bantuan & FAQ Layanan Kcal. Ada yang ingin Anda tanyakan mengenai layanan nutrisi, panduan skrining, atau penggunaan aplikasi?",
  },
];

const BOT_QUICK_PROMPTS = [
  "Berapa kebutuhan kalori anak 9 tahun?",
  "Apa menu MBG hari ini?",
  "Bagaimana cara cegah anemia pada anak?",
  "Anak saya alergi seafood, solusinya?",
];

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  citizenUser,
  setActiveTab,
}) => {
  const userName = citizenUser?.name || "Muhammad Nizam Setiawan";
  const userDistrict = citizenUser?.district || "Kebomas";
  const userInitial = userName.charAt(0).toUpperCase();

  // ─── MODAL STATES ───
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<(typeof NUTRITION_ARTICLES)[0] | null>(null);

  // ─── CHATBOT STATE ───
  const [chatMessages, setChatMessages] = useState(BOT_INITIAL_MESSAGES);
  const [inputChat, setInputChat] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // ─── FEEDBACK FORM STATE ───
  const [feedbackCategory, setFeedbackCategory] = useState<"Rasa" | "Porsi" | "Kebersihan" | "Ketepatan Waktu">("Rasa");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // ─── FIRESTORE REALTIME NOTIFICATIONS ───
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true);
  const [activeNotifFilter, setActiveNotifFilter] = useState<"semua" | "mbg" | "screening" | "system">("semua");
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<FirestoreNotification | null>(null);

  useEffect(() => {
    const email = citizenUser?.email || "nizam@gmail.com";
    const district = citizenUser?.district || "Kebomas";

    // Seed default welcome notifications if new user / empty DB
    seedInitialUserNotifications(email, district);

    // Subscribe to Firestore notifications stream
    const unsubscribe = subscribeUserNotifications(email, (data) => {
      setNotifications(data);
      setIsLoadingNotifs(false);
    });

    return () => unsubscribe();
  }, [citizenUser?.email, citizenUser?.district]);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const mbgCount = notifications.filter((n) => n.category === "mbg").length;
  const screeningCount = notifications.filter((n) => n.category === "screening").length;
  const systemCount = notifications.filter((n) => n.category === "system" || n.category === "user" || !n.category).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeNotifFilter === "semua") return true;
    if (activeNotifFilter === "mbg") return n.category === "mbg";
    if (activeNotifFilter === "screening") return n.category === "screening";
    if (activeNotifFilter === "system") return n.category === "system" || n.category === "user" || !n.category;
    return true;
  });

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };

  // ─── CHAT BOT HANDLER ───
  const handleSendChat = (customText?: string) => {
    const msgToSend = customText || inputChat;
    if (!msgToSend.trim()) return;

    triggerHaptic();
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: msgToSend,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputChat("");
    setIsBotTyping(true);

    // AI Simulated Reply
    setTimeout(() => {
      let botReply = "Terima kasih atas pertanyaannya! Berdasarkan panduan klinis Kemenkes RI & BGN 2026, nutrisi anak dioptimalkan melalui variasi menu bergizi MBG.";
      
      const lower = msgToSend.toLowerCase();
      if (lower.includes("kalori") || lower.includes("9 tahun")) {
        botReply = "Untuk anak usia 7-9 tahun, rata-rata kebutuhan energi harian berkisar antara 1.650 - 1.800 kkal. Porsi Makan Bergizi Gratis (MBG) siang ini memenuhi sekitar 650-680 kkal (40-45% kebutuhan harian).";
      } else if (lower.includes("menu") || lower.includes("hari ini")) {
        botReply = "Menu MBG hari ini adalah Nasi Ayam Kari & Sayur (680 kkal) dengan kandungan Protein 31g, Serat 7g, dan Zat Besi 6mg untuk mendukung fokus belajar.";
      } else if (lower.includes("anemia") || lower.includes("besi") || lower.includes("kurang darah")) {
        botReply = "Untuk mencegah anemia, berikan kombinasi protein hewani tinggi zat besi (daging, hati ayam, telur) serta sayuran hijau bersama sumber vitamin C agar penyerapan zat besi maksimal.";
      } else if (lower.includes("alergi") || lower.includes("seafood")) {
        botReply = "Jika anak memiliki alergi seafood/ikan, pastikan Anda mengisi kuesioner skrining AI agar sistem SPPG otomatis merekomendasikan opsi non-alergen seperti Nasi Ayam atau Telur Semur.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botReply,
        },
      ]);
      setIsBotTyping(false);
    }, 900);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    setFeedbackSubmitted(true);

    // Save notification for citizen user in Firestore
    await addNotification({
      title: `Masukan (${feedbackCategory}) Terkirim`,
      description: `Aduan Anda tentang ${feedbackCategory.toLowerCase()} menu MBG telah diterima Posko SPPG Kec. ${userDistrict}.`,
      category: "system",
      userEmail: citizenUser?.email || "nizam@gmail.com",
    });

    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedbackText("");
    }, 1800);
  };

  return (
    <Page className="p-4 space-y-3.5 font-sans select-none bg-[#F8FAFC] min-h-full pb-28 relative overflow-hidden">
      {/* Dynamic Animated Spectrum & Glow Background */}
      <AuthSpectrumBackground />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. TOP APPBAR (SIMPLE & CLEAN)                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between pt-0.5 px-0.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0FA89B] to-[#24E0D1] text-[#050D18] flex items-center justify-center font-black text-sm shadow-xs border border-white">
            {userInitial}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 leading-none">
              {getTimeGreeting()},
            </p>
            <h1 className="text-[14.5px] font-black text-slate-800 tracking-tight leading-tight mt-0.5">
              {userName}
            </h1>
            <p className="text-[10.5px] text-[#0FA89B] font-bold">
              Kecamatan {userDistrict}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setShowNotificationModal(true);
          }}
          className="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all cursor-pointer relative"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4 text-slate-600 stroke-[1.8]" />
          {unreadNotifCount > 0 && (
            <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center absolute -top-1 -right-1 border-2 border-white shadow-xs animate-pulse">
              {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* ⚠️ SAFETY NET BANNER: MISSING DISTRICT */}
      {!citizenUser?.district && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-amber-900 leading-tight">
                Lengkapi Domisili Anda
              </p>
              <p className="text-[10.5px] text-amber-700/90 truncate mt-0.5">
                Pilih kecamatan untuk menu berbasis pangan lokal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setActiveTab("profile");
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shrink-0 transition-all shadow-xs cursor-pointer"
          >
            Lengkapi
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. LAYANAN & FITUR UTAMA (3 CARDS LAYOUT)                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3 pt-1 relative z-10">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-wider">
            Layanan &amp; Fitur Utama
          </h2>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            3 Menu Pilihan
          </span>
        </div>

        <div className="space-y-3">
          {/* Menu 1 (Card Panjang / Full Width): Riwayat Analisis */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setShowHistoryModal(true);
            }}
            className="w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-4.5 text-left shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer space-y-3 group relative overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0FA89B] border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <History className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14.5px] font-black text-slate-800 tracking-tight leading-tight">
                  Riwayat Analisis
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">
                  Rekam Skrining Biometrik &amp; Rekomendasi RAG
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/90 text-[11px] font-bold text-[#0FA89B]">
              <span>Lihat Rekam Skrining &amp; Rekomendasi RAG</span>
              <ChevronRight className="w-4 h-4 text-[#0FA89B] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Underneath Menu 1: Grid 2 Kolom (Menu 2 & Menu 3) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Menu 2: Bantuan & FAQ Layanan */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setShowChatModal(true);
              }}
              className="bg-white border border-slate-200/90 rounded-3xl p-4 text-left shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-black text-slate-800 tracking-tight leading-tight">
                  Bantuan &amp; FAQ
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium leading-normal mt-1">
                  Panduan penggunaan &amp; FAQ layanan Kcal
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px] font-bold text-[#0284C7]">
                <span>Buka Bantuan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Menu 3: Artikel & Edukasi Gizi */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                if (NUTRITION_ARTICLES.length > 0) {
                  setSelectedArticle(NUTRITION_ARTICLES[0]);
                }
              }}
              className="bg-white border border-slate-200/90 rounded-3xl p-4 text-left shadow-xs hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-black text-slate-800 tracking-tight leading-tight">
                  Artikel &amp; Edukasi
                </h3>
                <p className="text-[10.5px] text-slate-500 font-medium leading-normal mt-1">
                  Edukasi gizi seimbang &amp; pangan lokal
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px] font-bold text-[#059669]">
                <span>Baca Artikel</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL 1: RIWAYAT KLAIM LENGKAP ═══                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0FA89B]/10 flex items-center justify-center text-[#0FA89B]">
                    <History className="w-4 h-4" />
                  </div>
                  <h3 className="text-[14px] font-black text-slate-800">Semua Riwayat Klaim MBG</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {CLAIM_HISTORY.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#0FA89B]">{item.id}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">{item.menu}</h4>
                      <p className="text-[10.5px] text-slate-500">{item.lokasi} • Petugas: {item.petugas}</p>
                    </div>
                    <div className="pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{item.waktu}</span>
                      <span className="font-bold text-slate-700">{item.kalori}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL 2: CHAT BOT ASISTEN GIZI AI ═══                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showChatModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Chat Header */}
              <div className="px-4 py-3.5 bg-gradient-to-r from-[#0D1B2A] to-[#1E293B] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-black leading-tight">Bantuan &amp; FAQ Layanan</h3>
                    <p className="text-[10px] text-[#79D7D2] font-semibold">Panduan &amp; Informasi Aplikasi Kcal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-white/80 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] p-3 rounded-2xl text-[12px] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white font-bold rounded-tr-xs"
                          : "bg-white border border-slate-200/80 text-slate-800 font-medium rounded-tl-xs shadow-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isBotTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium italic">
                    <Bot className="w-4 h-4 text-[#0284C7] animate-bounce" />
                    <span>Menyiapkan informasi bantuan...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {BOT_QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendChat(prompt)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik pertanyaan gizi anak..."
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-[12px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8B5CF6]"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => handleSendChat()}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center cursor-pointer shadow-md flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL 3: FORM LAPOR FEEDBACK MBG ═══                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-[14px] font-black text-slate-800">Lapor Kualitas MBG</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              {feedbackSubmitted ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h4 className="text-[15px] font-black text-slate-800">Laporan Terkirim!</h4>
                  <p className="text-[11.5px] text-slate-500">
                    Terima kasih atas masukannya. Tim SPPG Kecamatan {userDistrict} akan segera menindaklanjuti.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="p-5 space-y-4 overflow-y-auto">
                  {/* Category selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Kategori Masukan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Rasa", "Porsi", "Kebersihan", "Ketepatan Waktu"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackCategory(cat)}
                          className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                            feedbackCategory === cat
                              ? "bg-[#0FA89B]/10 border-[#0FA89B] text-[#0FA89B]"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Kepuasan Menu Hari Ini</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= feedbackRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Detail Catatan / Masukan</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Sayur brokoli agak terlalu layu, atau porsi nasi pas..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11.5px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0FA89B] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white text-[12.5px] font-black cursor-pointer shadow-md"
                  >
                    Kirim Laporan ke SPPG
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL 4: DETAIL ARTIKEL EDUKASI GIZI ═══                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0FA89B]/10 text-[#0FA89B] text-[9.5px] font-bold">
                  {selectedArticle.tag}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Article Content */}
              <div className="p-5 overflow-y-auto space-y-3">
                <h3 className="text-[16px] font-black text-slate-800 leading-snug">
                  {selectedArticle.title}
                </h3>
                <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-medium">
                  <span>Kategori: {selectedArticle.category}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  {selectedArticle.summary}
                </p>
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  {selectedArticle.content}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ FULL SCREEN PAGE: NOTIFIKASI APP (CLEAN & MINIMALIST) ═══  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed inset-0 z-50 bg-white flex flex-col h-full w-full overflow-hidden"
          >
            {/* 1. TOP NAVBAR / HEADER (ICON ONLY BACK BUTTON) */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setShowNotificationModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Kembali"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-slate-700 stroke-[2.5]" />
              </button>

              <h2 className="text-[15px] font-black text-slate-800 tracking-tight">
                Pemberitahuan
              </h2>

              <div className="flex items-center justify-end min-w-[70px]">
                {unreadNotifCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      markAllNotificationsRead(citizenUser?.email || "nizam@gmail.com");
                    }}
                    className="text-[11px] font-extrabold text-[#0FA89B] hover:underline flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/80"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Dibaca</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. CATEGORY PILL FILTER TABS */}
            <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: "semua", label: "Semua", count: notifications.length },
                { id: "mbg", label: "MBG", count: mbgCount },
                { id: "screening", label: "Skrining", count: screeningCount },
                { id: "system", label: "Sistem", count: systemCount },
              ].map((tab) => {
                const isActive = activeNotifFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setActiveNotifFilter(tab.id as any);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#0FA89B] text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>

            {/* 3. ULTRA-CLEAN COMPACT NOTIFICATION LIST */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2 max-w-md mx-auto w-full pb-24 bg-white">
              {isLoadingNotifs ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium space-y-2">
                  <div className="w-5 h-5 border-2 border-[#0FA89B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Memuat pemberitahuan...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-16 text-center space-y-2 bg-slate-50/60 rounded-2xl p-6 border border-slate-100">
                  <Bell className="w-7 h-7 text-slate-300 mx-auto stroke-[1.8]" />
                  <p className="text-xs font-black text-slate-700">
                    Tidak ada notifikasi {activeNotifFilter !== "semua" ? `kategori ${activeNotifFilter.toUpperCase()}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Pemberitahuan baru akan tampil di sini secara otomatis.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      triggerHaptic();
                      if (!notif.isRead) {
                        markNotificationRead(notif.id, citizenUser?.email || "nizam@gmail.com");
                      }
                      setSelectedNotifDetail(notif);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative space-y-1 ${
                      notif.isRead
                        ? "bg-white border-slate-150 opacity-75 hover:bg-slate-50/60"
                        : "bg-teal-50/20 border-[#0FA89B]/30 shadow-2xs hover:border-[#0FA89B]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#0FA89B] shrink-0" />
                        )}
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            notif.category === "mbg"
                              ? "bg-amber-100/70 text-amber-800"
                              : notif.category === "screening"
                              ? "bg-teal-100/70 text-teal-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {notif.category || "sistem"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9.5px] text-slate-400 font-bold">
                          {notif.createdAtIso
                            ? new Date(notif.createdAtIso).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) + " WIB"
                            : "Baru saja"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Hapus Notifikasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-[12.5px] font-extrabold text-slate-800 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {notif.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ SUB-PAGE: DETAIL PEMBERITAHUAN (CLEAN & MINIMALIST) ═══    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedNotifDetail && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed inset-0 z-50 bg-white flex flex-col h-full w-full overflow-hidden"
          >
            {/* 1. TOP HEADER (ICON ONLY BACK BUTTON) */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setSelectedNotifDetail(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Kembali"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-slate-700 stroke-[2.5]" />
              </button>

              <h2 className="text-[15px] font-black text-slate-800 tracking-tight">
                Detail Pemberitahuan
              </h2>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  deleteNotification(selectedNotifDetail.id);
                  setSelectedNotifDetail(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                title="Hapus Notifikasi"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* 2. DETAIL CONTENT CARD */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full pb-24 bg-white">
              <div className="p-4 rounded-3xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      selectedNotifDetail.category === "mbg"
                        ? "bg-amber-100 text-amber-800"
                        : selectedNotifDetail.category === "screening"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {selectedNotifDetail.category || "sistem"}
                  </span>

                  <span className="text-[10px] text-slate-400 font-bold">
                    {selectedNotifDetail.createdAtIso
                      ? new Date(selectedNotifDetail.createdAtIso).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "Baru saja"}
                  </span>
                </div>

                <h3 className="text-[15px] font-black text-slate-800 leading-snug">
                  {selectedNotifDetail.title}
                </h3>

                <div className="h-px bg-slate-200/80 w-full" />

                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  {selectedNotifDetail.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-200/60">
                  <span>ID: {selectedNotifDetail.id}</span>
                  <span className="text-[#0FA89B] font-bold">● Terverifikasi Firestore Cloud</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
};
