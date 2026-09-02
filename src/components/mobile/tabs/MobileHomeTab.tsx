"use client";

import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { Page } from "konsta/react";
import { motion, AnimatePresence } from "framer-motion";
import { CitizenUser, AtmosphereState, MobileTab } from "../types";

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
    lokasi: "SPPG SDN 1 Kebomas",
    status: "Sukses",
    petugas: "Ibu Rahmawati (SPPG)",
  },
  {
    id: "MBG-2026-0831-4F2",
    menu: "Nasi Bandeng Bakar Madu",
    kalori: "650 kkal",
    waktu: "Kemarin, 12.10 WIB",
    lokasi: "SPPG SDN 1 Kebomas",
    status: "Sukses",
    petugas: "Pak Sugeng (SPPG)",
  },
  {
    id: "MBG-2026-0829-9C3",
    menu: "Nasi Daging Semur & Bayam",
    kalori: "690 kkal",
    waktu: "29 Agu 2026, 11.50 WIB",
    lokasi: "SPPG SDN 1 Kebomas",
    status: "Sukses",
    petugas: "Ibu Rahmawati (SPPG)",
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
      "Fitur pemindaian biometrik G-SCAN menganalisis spektrum warna konjungtiva dan capillary refill time kuku untuk merekomendasikan tambahan zat besi pada menu MBG anak Anda.",
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
    text: "Halo! Saya dr. Gizi AI 🤖. Ada yang ingin Anda tanyakan mengenai kebutuhan nutrisi anak, menu MBG hari ini, atau alergi makanan?",
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

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedbackText("");
    }, 1800);
  };

  return (
    <Page className="p-4 space-y-3.5 font-sans select-none bg-[#F8FAFC] min-h-full pb-28">

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. TOP APPBAR (SIMPLE & CLEAN)                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between pt-0.5 px-0.5">
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
            <p className="text-[10px] text-slate-500 font-medium">
              SDN 1 {userDistrict} • Kec. {userDistrict}
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
          <span className="w-2 h-2 rounded-full bg-[#0FA89B] absolute top-2 right-2 border border-white" />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. CARD UTAMA: MENU MBG HARI INI                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4.5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Makan Siang Hari Ini
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
            ● Porsi Tersedia
          </span>
        </div>

        <div>
          <h2 className="text-[17px] font-black text-slate-800 tracking-tight leading-tight">
            Nasi Ayam Kari &amp; Sayur
          </h2>
          <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
            Dilengkapi sayur segar &amp; buah pisang untuk energi belajar.
          </p>
        </div>

        {/* 3 Badges Gizi Ringkas */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-1 text-center">
            <p className="text-[13px] font-black text-slate-800">680</p>
            <p className="text-[9.5px] text-slate-400 font-bold">Kalori (kkal)</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-1 text-center">
            <p className="text-[13px] font-black text-emerald-600">31g</p>
            <p className="text-[9.5px] text-slate-400 font-bold">Protein</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-1 text-center">
            <p className="text-[13px] font-black text-amber-600">6mg</p>
            <p className="text-[9.5px] text-slate-400 font-bold">Zat Besi</p>
          </div>
        </div>

        {/* Tombol Klaim */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            setActiveTab("screening");
          }}
          className="w-full py-3 rounded-2xl bg-[#0FA89B] hover:bg-[#0D8B80] active:scale-[0.98] text-white text-[12.5px] font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span>Ambil Porsi Makan Siang (QR)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. TIGA KARTU MENU UTAMA (QUICK ACTION CARDS)                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          {
            label: "Klaim Porsi",
            desc: "Kode QR",
            icon: QrCode,
            color: "text-[#0FA89B]",
            bg: "bg-[#0FA89B]/10",
            border: "border-[#0FA89B]/20",
            action: () => {
              triggerHaptic();
              setActiveTab("screening");
            },
          },
          {
            label: "Riwayat",
            desc: "Porsi MBG",
            icon: History,
            color: "text-[#0284C7]",
            bg: "bg-[#0284C7]/10",
            border: "border-[#0284C7]/20",
            action: () => {
              triggerHaptic();
              setShowHistoryModal(true);
            },
          },
          {
            label: "Lapor Menu",
            desc: "Evaluasi",
            icon: MessageSquare,
            color: "text-[#F59E0B]",
            bg: "bg-[#F59E0B]/10",
            border: "border-[#F59E0B]/20",
            action: () => {
              triggerHaptic();
              setShowFeedbackModal(true);
            },
          },
        ].map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-2xs hover:shadow-xs active:scale-[0.96] transition-all cursor-pointer text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${btn.bg} ${btn.border} border flex items-center justify-center ${btn.color}`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <p className="text-[11.5px] font-black text-slate-800 leading-tight mt-0.5">
                {btn.label}
              </p>
              <p className="text-[9.5px] font-semibold text-slate-400 leading-none">
                {btn.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4. KARTU STATUS KESEHATAN ANAK                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#0FA89B]" />
            <h3 className="text-[12.5px] font-black text-slate-800">Status Kesehatan Anak</h3>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9.5px] font-bold border border-emerald-200">
            Normal &amp; Sehat
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
            <p className="text-[9.5px] text-slate-400 font-bold">Mata (Hb)</p>
            <p className="text-[11.5px] font-black text-slate-700 mt-0.5">Segar</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
            <p className="text-[9.5px] text-slate-400 font-bold">Kuku (Fe)</p>
            <p className="text-[11.5px] font-black text-slate-700 mt-0.5">Merah Muda</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
            <p className="text-[9.5px] text-slate-400 font-bold">Turgor</p>
            <p className="text-[11.5px] font-black text-slate-700 mt-0.5">Elastis</p>
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
                    <h3 className="text-[13.5px] font-black leading-tight">dr. Gizi AI</h3>
                    <p className="text-[10px] text-[#79D7D2] font-semibold">Konsultasi Nutrisi &amp; Menu MBG</p>
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
                    <Bot className="w-4 h-4 text-[#8B5CF6] animate-bounce" />
                    <span>dr. Gizi AI sedang mengetik...</span>
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
      {/* ═══ MODAL 5: NOTIFIKASI APP ═══                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[14px] font-black text-slate-800">Pemberitahuan</h3>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-2.5 overflow-y-auto">
                <div className="p-3 rounded-2xl bg-[#0FA89B]/5 border border-[#0FA89B]/15 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0FA89B]">Menu MBG Hari Ini</span>
                    <span className="text-[9px] text-slate-400">10.00 WIB</span>
                  </div>
                  <p className="text-[11.5px] font-black text-slate-800">Nasi Ayam Kari &amp; Sayur Siap Didistribusikan</p>
                  <p className="text-[10.5px] text-slate-500">Porsi MBG telah diverifikasi oleh SPPG SDN 1 Kebomas.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Page>
  );
};
