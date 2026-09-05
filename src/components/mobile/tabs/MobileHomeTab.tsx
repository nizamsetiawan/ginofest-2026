"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  ArrowLeft,
  SlidersHorizontal,
  Scan,
  Maximize2,
  Activity,
  Cpu,
  RefreshCw,
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
  fetchArticlesFromFirestore,
  fetchUserScansAndClaimsFromFirestore,
  ArticleRecord,
  FirestoreNotification,
} from "@/services/firebase-service";
import { CitizenHelpModal } from "../CitizenHelpModal";

interface MobileHomeTabProps {
  citizenUser: CitizenUser | null;
  atmosphere?: AtmosphereState;
  setActiveTab: (tab: MobileTab) => void;
}

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "Pencegahan Stunting": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "Deteksi Dini AI": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
  "Pedoman Nutrisi": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  "Pangan Lokal": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  "Kesehatan Ibu & Anak": "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  "Edukasi Nutrisi": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
  "default": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
};

const getArticleImage = (article: ArticleRecord): string => {
  if (article.imageUrl && article.imageUrl.trim().length > 0) {
    return article.imageUrl;
  }
  return CATEGORY_FALLBACK_IMAGES[article.category] || CATEGORY_FALLBACK_IMAGES["default"];
};

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
  const [userScansHistory, setUserScansHistory] = useState<any[]>([]);
  const [isLoadingUserScans, setIsLoadingUserScans] = useState(false);
  const [selectedDetailScan, setSelectedDetailScan] = useState<any | null>(null);
  const [previewHistoryPhoto, setPreviewHistoryPhoto] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    setIsLoadingUserScans(true);
    fetchUserScansAndClaimsFromFirestore(citizenUser?.email, citizenUser?.name).then((res) => {
      if (res.success) {
        setUserScansHistory(res.data);
      }
      setIsLoadingUserScans(false);
    });
  }, [showHistoryModal, citizenUser?.email, citizenUser?.name]);

  const unclaimedCount = userScansHistory.filter(
    (item) => item.status === "VALID" || item.status === "SCANNING_IN_PROGRESS" || (item.status !== "CLAIMED" && item.status !== "EXPIRED")
  ).length;
  const [showChatModal, setShowChatModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showArticleListModal, setShowArticleListModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>("Semua");
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>("");
  const [showArticleFilterMenu, setShowArticleFilterMenu] = useState(false);

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
  const [showDeleteAllConfirmModal, setShowDeleteAllConfirmModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  // Fetch 15 Articles from Firestore (with automatic seeding)
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoadingArticles(true);
        const res = await fetchArticlesFromFirestore();
        if (res.success && res.data) {
          setArticles(res.data);
        }
      } catch (err) {
        console.error("Error loading articles from Firestore:", err);
      } finally {
        setIsLoadingArticles(false);
      }
    };
    loadArticles();
  }, []);

  const articleCategories = React.useMemo(() => {
    const defaultCats = [
      "Semua",
      "Pencegahan Stunting",
      "Deteksi Dini AI",
      "Pedoman Nutrisi",
      "Pangan Lokal",
      "Kesehatan Ibu & Anak",
      "Edukasi Nutrisi",
    ];
    const loadedCats = Array.from(new Set(articles.map((a) => a.category))).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...loadedCats]));
  }, [articles]);

  const articleCategoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { Semua: articles.length };
    articles.forEach((a) => {
      if (a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return counts;
  }, [articles]);

  const filteredArticles = articles.filter((art) => {
    const matchCategory =
      articleCategoryFilter === "Semua" || art.category === articleCategoryFilter;
    const matchQuery =
      !articleSearchQuery.trim() ||
      art.title.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
      art.tag.toLowerCase().includes(articleSearchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

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
          {citizenUser?.photoURL ? (
            <img
              src={citizenUser.photoURL}
              alt={userName}
              className="w-10 h-10 rounded-2xl object-cover shadow-xs border border-white select-none"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-[#0FA89B] bg-gradient-to-tr from-[#0FA89B] to-[#24E0D1] text-[#050D18] flex items-center justify-center font-black text-sm shadow-xs border border-white">
              {userInitial}
            </div>
          )}
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
            {/* Top Right Unclaimed Count Badge */}
            {unclaimedCount > 0 ? (
              <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{unclaimedCount} Tersedia</span>
              </div>
            ) : (
              <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/70 text-slate-500 text-[10px] font-bold">
                <span>0 Tersedia</span>
              </div>
            )}

            <div className="flex items-center gap-3 min-w-0 pr-20">
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
                setShowArticleListModal(true);
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
      {/* ═══ MODAL 1: RIWAYAT ANALISIS & KLAIM WARGA (REALTIME) ═══     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0FA89B]/10 flex items-center justify-center text-[#0FA89B] shrink-0">
                    <History className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 leading-tight">Riwayat Skrining &amp; Klaim</h3>
                    <p className="text-[9.5px] text-slate-400 font-medium">{userName} • Kec. {userDistrict}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingUserScans ? (
                  <div className="py-12 text-center space-y-2">
                    <RefreshCw className="w-7 h-7 text-[#0FA89B] animate-spin mx-auto" />
                    <p className="text-[12px] font-bold text-slate-700">Mengambil Riwayat Analisis...</p>
                  </div>
                ) : userScansHistory.length === 0 ? (
                  <div className="py-10 px-4 text-center space-y-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <Activity className="w-9 h-9 text-slate-300 mx-auto" />
                    <h4 className="text-[13px] font-extrabold text-slate-700">Belum Ada Rekam Skrining</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                      Lakukan analisis biometrik AI &amp; kuesioner pertama Anda untuk melihat riwayat nutrisi di sini!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHistoryModal(false);
                        setActiveTab("screening");
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white font-black text-[11px] shadow-sm cursor-pointer"
                    >
                      Mulai Skrining AI Sekarang
                    </button>
                  </div>
                ) : (
                  userScansHistory.map((item) => {
                    const isClaimed = item.status === "CLAIMED";
                    const isValid = item.status === "VALID" || item.status === "SCANNING_IN_PROGRESS";
                    const claimCode = item.claimId || item.scanId || item.id;
                    const menuTitle = item.recommendedMenu?.menuTitle || "Nasi Ayam Kari & Sayur Bening";

                    const qrPayloadStr = JSON.stringify({
                      claimId: claimCode,
                      beneficiary: { name: userName, email: citizenUser?.email || "-", district: userDistrict },
                      menu: { name: menuTitle }
                    });

                    return (
                      <div
                        key={item.id || item.scanId}
                        onClick={() => setSelectedDetailScan(item)}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#0FA89B]/60 transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
                      >
                        {/* Left Content Column (Article Style) */}
                        <div className="min-w-0 flex-1 space-y-1 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isValid && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9.5px] font-black border border-emerald-200">
                                Tersedia
                              </span>
                            )}
                            {isClaimed && (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9.5px] font-black border border-blue-200">
                                Sudah Diambil
                              </span>
                            )}
                            <span className="text-[9.5px] font-mono font-bold text-slate-400 truncate">
                              ID: {claimCode}
                            </span>
                          </div>

                          <h4 className="text-[13px] font-extrabold text-slate-800 leading-snug group-hover:text-[#0FA89B] transition-colors line-clamp-1">
                            {menuTitle}
                          </h4>

                          <p className="text-[10.5px] text-slate-500 font-medium">
                            {item.recommendedMenu?.calories || 680} kkal • {item.recommendedMenu?.akgPercentage || 50}% AKG
                          </p>

                          <div className="pt-0.5 flex items-center justify-between text-[9.5px] text-slate-400 font-medium">
                            <span>🕒 {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "Terbaru"}</span>
                            <span className="text-[#0FA89B] font-extrabold">Lihat Detail &amp; Barcode →</span>
                          </div>
                        </div>

                        {/* Right Column: Barcode / QR Code Preview Thumbnail (Article Style) */}
                        <div className="shrink-0 flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/80 group-hover:scale-105 transition-transform">
                          <div className="w-12 h-12 bg-white rounded-lg p-1 border border-teal-200 shadow-2xs flex items-center justify-center">
                            <QRCodeSVG
                              value={qrPayloadStr}
                              size={40}
                              level="L"
                            />
                          </div>
                          <span className="text-[8.5px] font-black text-[#0FA89B] mt-1 tracking-tight">QR KLAIM</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ FULL DETAIL & BARCODE MODAL ON CLICK ═══ */}
      <AnimatePresence>
        {selectedDetailScan && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[14.5px] font-black text-slate-800 leading-tight">Detail Skrining &amp; Barcode Klaim</h3>
                  <p className="text-[10px] font-mono text-[#0FA89B] font-bold">
                    ID: {selectedDetailScan.claimId || selectedDetailScan.scanId || selectedDetailScan.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDetailScan(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Status Banner */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600">Status Penyerahan MBG:</span>
                  {selectedDetailScan.status === "CLAIMED" ? (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-black border border-blue-300">
                      Sudah Diambil
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-black border border-emerald-300">
                      Tersedia (Belum Diambil)
                    </span>
                  )}
                </div>

                {/* Hero Scannable Barcode / QR Code Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-teal-500/10 border border-teal-200 text-center space-y-3 relative overflow-hidden">
                  <span className="text-[11px] font-extrabold text-[#0FA89B] uppercase tracking-wider block">
                    Kode Barcode / QR Code Klaim MBG
                  </span>
                  
                  <div className="inline-block p-3.5 bg-white rounded-2xl border border-teal-200 shadow-md">
                    <QRCodeSVG
                      value={JSON.stringify({
                        claimId: selectedDetailScan.claimId || selectedDetailScan.scanId || selectedDetailScan.id,
                        beneficiary: { name: userName, email: citizenUser?.email || "-", district: userDistrict },
                        menu: { name: selectedDetailScan.recommendedMenu?.menuTitle || "Nasi Bergizi Kcal" }
                      })}
                      size={175}
                      level="M"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Tunjukkan kode QR ini kepada Petugas SPPG Kec. {userDistrict} untuk validasi penyerahan porsi makanan.
                  </p>
                </div>

                {/* Recommended Menu & Nutrition */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Rekomendasi Menu Gizi AI
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0FA89B] text-[10px] font-bold border border-teal-200">
                      {selectedDetailScan.recommendedMenu?.akgPercentage || 50}% AKG
                    </span>
                  </div>
                  <h4 className="text-[14px] font-black text-slate-800">
                    {selectedDetailScan.recommendedMenu?.menuTitle || "Nasi Ayam Kari & Sayur Bening"}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                      <span className="text-[9px] font-bold text-slate-400 block">KALORI</span>
                      <span className="text-[12px] font-black text-slate-700">{selectedDetailScan.recommendedMenu?.calories || 680} kkal</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                      <span className="text-[9px] font-bold text-slate-400 block">PROTEIN</span>
                      <span className="text-[12px] font-black text-slate-700">{selectedDetailScan.recommendedMenu?.proteinGram || 31} g</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                      <span className="text-[9px] font-bold text-slate-400 block">ZAT BESI</span>
                      <span className="text-[12px] font-black text-slate-700">{selectedDetailScan.recommendedMenu?.ironMg || 6} mg</span>
                    </div>
                  </div>
                </div>

                {/* 4 Biometric Azure Photo Thumbnails */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-600 block">Bukti Foto Biometrik Azure</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Wajah", url: selectedDetailScan.photos?.faceBase64 || selectedDetailScan.blobUrls?.faceBlobUrl, icon: "👤" },
                      { label: "Mata", url: selectedDetailScan.photos?.eyeBase64 || selectedDetailScan.blobUrls?.eyeBlobUrl, icon: "👁️" },
                      { label: "Tangan", url: selectedDetailScan.photos?.handBase64 || selectedDetailScan.blobUrls?.handBlobUrl, icon: "✋" },
                      { label: "Kuku", url: selectedDetailScan.photos?.nailBase64 || selectedDetailScan.blobUrls?.nailBlobUrl, icon: "💅" },
                    ].map((p, i) => (
                      <div key={i} className="space-y-1 text-center">
                        <div
                          onClick={() => {
                            if (p.url) {
                              setPreviewHistoryPhoto({ url: p.url, title: `Foto ${p.label} Biometrik` });
                            }
                          }}
                          className={`w-full aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center ${p.url ? "cursor-pointer hover:ring-2 hover:ring-[#0FA89B] transition-all group" : ""}`}
                        >
                          {p.url ? (
                            <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <span className="text-base">{p.icon}</span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 block">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Action */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDetailScan(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#0FA89B] text-white font-bold text-[12px] shadow-sm hover:bg-[#0c877c] cursor-pointer transition-colors"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ LIGHTBOX PHOTO PREVIEW MODAL IN MOBILE HOME ═══ */}
      <AnimatePresence>
        {previewHistoryPhoto && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 font-sans animate-in fade-in duration-200">
            <div className="w-full flex items-center justify-between pt-2 px-2 text-white">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-[#79D7D2]" />
                <h4 className="text-[13.5px] font-bold tracking-tight">{previewHistoryPhoto.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewHistoryPhoto(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 w-full max-w-xs flex items-center justify-center p-2 relative">
              <img
                src={previewHistoryPhoto.url}
                alt={previewHistoryPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
            </div>

            <div className="pb-4 text-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Bukti Biometrik Kcal • Pemkab Gresik 2026
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL 2: CHAT BOT ASISTEN GIZI AI & PUSAT BANTUAN WARGA ══ */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <CitizenHelpModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        citizenUser={citizenUser}
        triggerHaptic={triggerHaptic}
      />

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
                          className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${feedbackCategory === cat
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
                            className={`w-7 h-7 ${star <= feedbackRating
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
      {/* ═══ FULL SCREEN PAGE: LIST ARTIKEL EDUKASI GIZI (15 ARTIKEL)  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showArticleListModal && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed inset-0 z-[105] bg-slate-50 h-screen w-screen flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shrink-0 relative">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setShowArticleListModal(false);
                    setShowArticleFilterMenu(false);
                  }}
                  className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Kembali"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-black text-slate-800 tracking-tight leading-tight truncate">
                    Artikel &amp; Edukasi Gizi
                  </h2>
                  <p className="text-[10.5px] text-slate-500 font-medium truncate">
                    Panduan Nutrisi &amp; Pencegahan Stunting (BGN 2026)
                  </p>
                </div>
              </div>

              {/* FILTER ICON BUTTON (MATCHING NOTIFICATION FILTER STYLE) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setShowArticleFilterMenu(!showArticleFilterMenu);
                  }}
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 relative ${articleCategoryFilter !== "Semua"
                      ? "bg-[#0FA89B]/10 text-[#0FA89B] border border-[#0FA89B]/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  title="Filter Kategori"
                >
                  <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
                  {articleCategoryFilter !== "Semua" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0FA89B] absolute -top-0.5 -right-0.5 border-2 border-white" />
                  )}
                </button>
              </div>

              {/* FILTER POPOVER DROPDOWN MENU */}
              <AnimatePresence>
                {showArticleFilterMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xl absolute top-14 right-4 z-30 w-60 space-y-1 max-h-80 overflow-y-auto"
                  >
                    <p className="text-[10px] font-black text-slate-400 px-3 py-1 uppercase tracking-wider">
                      Pilih Kategori Artikel
                    </p>
                    {articleCategories.map((cat) => {
                      const isActive = articleCategoryFilter === cat;
                      const count = articleCategoryCounts[cat] || 0;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            triggerHaptic();
                            setArticleCategoryFilter(cat);
                            setShowArticleFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-between cursor-pointer ${isActive
                              ? "bg-[#0FA89B]/10 text-[#0FA89B]"
                              : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <span className="truncate pr-2">{cat}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Input & Active Filter Status */}
            <div className="bg-white p-3.5 border-b border-slate-200/60 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari judul artikel, kata kunci (misal: stunting, anemia)..."
                  value={articleSearchQuery}
                  onChange={(e) => setArticleSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 text-slate-800 text-[12px] font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0FA89B]/40 transition-all"
                />
                {articleSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setArticleSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Active Filter Chips Status Bar */}
              {(articleCategoryFilter !== "Semua" || articleSearchQuery) && (
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5 px-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10.5px] text-slate-400 font-medium">Filter:</span>
                    {articleCategoryFilter !== "Semua" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0FA89B]/10 text-[#0FA89B] font-bold text-[10.5px] truncate flex items-center gap-1">
                        {articleCategoryFilter}
                        <button
                          type="button"
                          onClick={() => setArticleCategoryFilter("Semua")}
                          className="hover:text-rose-600 cursor-pointer font-extrabold"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setArticleCategoryFilter("Semua");
                      setArticleSearchQuery("");
                    }}
                    className="text-[10.5px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer shrink-0"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-md mx-auto w-full pb-24">
              {isLoadingArticles ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium space-y-2">
                  <div className="w-6 h-6 border-2 border-[#0FA89B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Memuat artikel dari Firestore...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="py-16 text-center space-y-2 bg-white rounded-2xl p-6 border border-slate-200/80">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-black text-slate-700">Tidak ada artikel ditemukan</p>
                  <p className="text-[11px] text-slate-400">Coba ubah kata kunci atau kategori filter.</p>
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedArticle(article);
                    }}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0FA89B]/10 text-[#0FA89B] text-[9.5px] font-bold truncate">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 my-1 border border-slate-100">
                      <img
                        src={getArticleImage(article)}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = CATEGORY_FALLBACK_IMAGES[article.category] || CATEGORY_FALLBACK_IMAGES["default"];
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                    </div>

                    <h3 className="text-[13.5px] font-black text-slate-800 leading-snug group-hover:text-[#0FA89B] transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      <span>{article.author || "BGN RI & Kemenkes"}</span>
                      <span className="font-bold text-[#0FA89B] flex items-center gap-0.5">
                        Baca Selengkapnya
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL 4: DETAIL ARTIKEL EDUKASI GIZI ═══                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[115] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0FA89B]/10 text-[#0FA89B] text-[10px] font-bold">
                    {selectedArticle.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9.5px] font-semibold">
                    {selectedArticle.tag}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Article Content */}
              <div className="p-5 overflow-y-auto space-y-3.5">
                <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-2xs">
                  <img
                    src={getArticleImage(selectedArticle)}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const fallback = CATEGORY_FALLBACK_IMAGES[selectedArticle.category] || CATEGORY_FALLBACK_IMAGES["default"];
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </div>

                <h3 className="text-[16px] font-black text-slate-800 leading-snug">
                  {selectedArticle.title}
                </h3>
                <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium pb-2 border-b border-slate-100">
                  <span>Oleh: {selectedArticle.author || "BGN RI & Kemenkes"}</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
                <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3.5 text-[11.5px] text-teal-900 leading-relaxed font-medium">
                  <span className="font-bold text-[#0FA89B]">Ringkasan Eksekutif: </span>
                  {selectedArticle.summary}
                </div>
                <div className="text-[12px] text-slate-700 leading-relaxed font-medium space-y-3 pt-1 whitespace-pre-line">
                  {selectedArticle.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ FULL SCREEN PAGE: NOTIFIKASI APP (FULL 100% COVERAGE) ═══  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="fixed inset-0 z-[100] bg-white h-screen w-screen flex flex-col overflow-hidden"
          >
            {/* 1. TOP NAVBAR / HEADER (BACK ICON & TITLE SIDE BY SIDE + ACTION ICONS) */}
            <div className="bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shrink-0 relative">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setShowNotificationModal(false);
                    setShowFilterMenu(false);
                  }}
                  className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Kembali"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                </button>

                <div className="min-w-0">
                  <h2 className="text-[16px] font-black text-slate-800 tracking-tight leading-tight truncate">
                    Pemberitahuan
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3.5 shrink-0">
                {/* FILTER ICON BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setShowFilterMenu(!showFilterMenu);
                  }}
                  className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Filter Kategori"
                >
                  <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
                </button>

                {/* MARK ALL READ ICON BUTTON */}
                {unreadNotifCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      markAllNotificationsRead(citizenUser?.email || "nizam@gmail.com");
                    }}
                    className="w-8.5 h-8.5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#0FA89B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Tandai Semua Dibaca"
                  >
                    <CheckCheck className="w-4 h-4 stroke-[2.2]" />
                  </button>
                )}

                {/* DELETE ALL ICON BUTTON */}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setShowDeleteAllConfirmModal(true);
                    }}
                    className="w-8.5 h-8.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Hapus Semua Notifikasi"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                  </button>
                )}
              </div>

              {/* FILTER POPOVER DROPDOWN MENU */}
              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xl absolute top-14 right-4 z-30 w-52 space-y-1"
                  >
                    <p className="text-[10px] font-black text-slate-400 px-3 py-1 uppercase tracking-wider">
                      Pilih Kategori Filter
                    </p>
                    {[
                      { id: "semua", label: "Semua Notifikasi", count: notifications.length },
                      { id: "mbg", label: "MBG (Makan Bergizi)", count: mbgCount },
                      { id: "screening", label: "Skrining Biometrik", count: screeningCount },
                      { id: "system", label: "Sistem & Warga", count: systemCount },
                    ].map((tab) => {
                      const isActive = activeNotifFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic();
                            setActiveNotifFilter(tab.id as any);
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-between cursor-pointer ${isActive
                              ? "bg-[#0FA89B]/10 text-[#0FA89B]"
                              : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <span>{tab.label}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. ULTRA-CLEAN COMPACT NOTIFICATION LIST (SWIPE TO DELETE) */}
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
                  <motion.div
                    key={notif.id}
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    dragElastic={0.05}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60) {
                        triggerHaptic();
                        deleteNotification(notif.id);
                      }
                    }}
                    onClick={() => {
                      triggerHaptic();
                      if (!notif.isRead) {
                        markNotificationRead(notif.id, citizenUser?.email || "nizam@gmail.com");
                      }
                      setSelectedNotifDetail(notif);
                    }}
                    className={`p-3 rounded-2xl border transition-colors cursor-pointer relative space-y-1 select-none touch-pan-y ${notif.isRead
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
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${notif.category === "mbg"
                              ? "bg-amber-100/70 text-amber-800"
                              : notif.category === "screening"
                                ? "bg-teal-100/70 text-teal-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {notif.category || "sistem"}
                        </span>
                      </div>

                      <span className="text-[9.5px] text-slate-400 font-bold shrink-0">
                        {notif.createdAtIso
                          ? new Date(notif.createdAtIso).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) + " WIB"
                          : "Baru saja"}
                      </span>
                    </div>

                    <h4 className="text-[12.5px] font-extrabold text-slate-800 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {notif.description}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ SUB-PAGE: DETAIL PEMBERITAHUAN (FULL SCREEN z-[110]) ═══   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: DETAIL PEMBERITAHUAN (BOTTOM SHEET MODAL) ═══        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedNotifDetail && (
          <div className="fixed inset-0 z-[115] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${selectedNotifDetail.category === "mbg"
                        ? "bg-amber-100 text-amber-800"
                        : selectedNotifDetail.category === "screening"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                  >
                    {selectedNotifDetail.category || "sistem"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold truncate">
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

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      deleteNotification(selectedNotifDetail.id);
                      setSelectedNotifDetail(null);
                    }}
                    className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    title="Hapus Notifikasi"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedNotifDetail(null)}
                    className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-5 overflow-y-auto space-y-3.5">
                <h3 className="text-[16px] font-black text-slate-800 leading-snug">
                  {selectedNotifDetail.title}
                </h3>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-[12.5px] text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                  {selectedNotifDetail.description}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedNotifDetail(null)}
                    className="px-4 py-2 rounded-xl bg-[#0FA89B] text-white font-bold text-xs hover:bg-[#0E978C] cursor-pointer transition-all shadow-2xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: KONFIRMASI HAPUS SEMUA NOTIFIKASI ═══              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteAllConfirmModal && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-2xl space-y-4 border border-slate-100 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Hapus Semua Notifikasi?</h3>
                <p className="text-[11.5px] text-slate-500 font-medium mt-1">
                  Seluruh pemberitahuan di kotak masuk Anda akan dihapus secara permanen dari database.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirmModal(false)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 text-slate-700 text-[11.5px] font-extrabold hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    triggerHaptic();
                    setShowDeleteAllConfirmModal(false);
                    await Promise.all(notifications.map((n) => deleteNotification(n.id)));
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-rose-600 text-white text-[11.5px] font-extrabold hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  Hapus Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Page>
  );
};
