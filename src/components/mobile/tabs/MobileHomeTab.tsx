"use client";

import React, { useState } from "react";
import {
  Moon,
  Sunrise,
  Sun,
  Sunset,
  MapPin,
  Bell,
  Clock,
  Activity,
  Utensils,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Heart,
  Share2
} from "lucide-react";
import { Page } from "konsta/react";
import { CitizenUser, AtmosphereState, MobileTab } from "../types";

interface MobileHomeTabProps {
  citizenUser: CitizenUser | null;
  atmosphere: AtmosphereState;
  setActiveTab: (tab: MobileTab) => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  citizenUser,
  atmosphere,
  setActiveTab,
}) => {
  const { timeOfDay, greetingText, greetingEmoji, currentTimeStr, currentDateStr } = atmosphere;
  const [selectedSubTab, setSelectedSubTab] = useState<"edukasi" | "jadwal" | "anak">("edukasi");
  const [likedFeeds, setLikedFeeds] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    setLikedFeeds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="-m-3.5 space-y-3.5 animate-in fade-in duration-200 pb-4 font-sans">
      {/* ═══ TOP DYNAMIC ATMOSPHERE BANNER (Suasana Malam / Pagi / Siang / Sore) ═══ */}
      <div className={`px-4 pt-3.5 pb-4 space-y-3 rounded-b-[28px] shadow-lg relative overflow-hidden text-white transition-all duration-700 ${
        timeOfDay === "night"
          ? "bg-gradient-to-b from-[#131C38] via-[#1E2950] to-[#2C3968] border-b border-ford-blue/80"
          : timeOfDay === "morning"
          ? "bg-gradient-to-b from-ford-blue via-light-sea-green to-green-02 border-b border-green-02/40"
          : timeOfDay === "afternoon"
          ? "bg-gradient-to-b from-ford-blue via-[#22B5AC] to-brand-blue border-b border-brand-blue/40"
          : "bg-gradient-to-b from-ford-blue via-[#1E2950] to-brand-orange/40 border-b border-brand-orange/30"
      }`}>
        {/* Ambient Glows & Twinkling Stars (Night Theme) */}
        {timeOfDay === "night" && (
          <>
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-green-02/15 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-light-sea-green/10 blur-2xl pointer-events-none"></div>
            <div className="absolute top-3 left-1/4 w-1.5 h-1.5 rounded-full bg-green-02/70 animate-ping duration-1000"></div>
            <div className="absolute top-6 right-1/4 w-1 h-1 rounded-full bg-brand-orange/90 animate-pulse"></div>
            <div className="absolute bottom-4 right-1/3 w-1.5 h-1.5 rounded-full bg-brand-blue/60 animate-pulse"></div>
            <div className="absolute top-4 right-12 w-1 h-1 rounded-full bg-white/80 animate-pulse"></div>
          </>
        )}

        {/* Top Atmosphere Badges & Notification Button */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
            {/* Atmosphere Pill */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold shadow-inner ${
              timeOfDay === "night"
                ? "bg-white/10 border border-green-02/30 text-green-02"
                : "bg-white/20 border border-white/30 text-white backdrop-blur-sm"
            }`}>
              {timeOfDay === "night" ? (
                <>
                  <Moon className="w-3 h-3 text-green-02 animate-pulse" />
                  <span>Suasana Malam</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-02 animate-ping"></span>
                </>
              ) : timeOfDay === "morning" ? (
                <>
                  <Sunrise className="w-3 h-3 text-brand-orange" />
                  <span>Suasana Pagi</span>
                </>
              ) : timeOfDay === "afternoon" ? (
                <>
                  <Sun className="w-3 h-3 text-brand-orange" />
                  <span>Suasana Siang</span>
                </>
              ) : (
                <>
                  <Sunset className="w-3 h-3 text-brand-orange" />
                  <span>Suasana Sore</span>
                </>
              )}
            </span>

            {/* Location Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-bold text-blue-100 backdrop-blur-sm truncate">
              <MapPin className="w-3 h-3 text-green-02 shrink-0" />
              <span className="truncate">Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
            </span>
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => alert(`Pemberitahuan: Menu MBG Ikan Bandeng Bakar Madu untuk siswa SD ${citizenUser?.district || "Kebomas"} telah dijadwalkan hari ini!`)}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-2xs shrink-0"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {/* Greeting & User Name Row */}
        <div className="relative z-10 space-y-0.5 pt-1">
          <h1 className="text-[18px] font-bold tracking-tight text-white flex items-center gap-1.5 flex-wrap">
            <span>{greetingText},</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-02 via-light-sea-green to-brand-blue">
              {citizenUser?.name || "Muhammad Nizam Setiawan"}
            </span>
            <span className="inline-block animate-bounce">{greetingEmoji}</span>
          </h1>
          <p className="text-[11px] text-blue-100/80 leading-relaxed font-medium">
            Dashboard Pemantauan MBG &amp; Intervensi Gizi tetap aktif dan tersinkronisasi 24/7.
          </p>
        </div>

        {/* Hero Card: Today's Schedule & Real-time Clock */}
        <div className="relative z-10 bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-ford-blue space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-blue-gray font-medium">
                <span>Today</span>
                <span className="font-bold text-ford-blue text-[12px]">{currentDateStr}</span>
              </div>
              <p className="text-[10px] text-blue-gray mt-0.5">
                Shift: <span className="font-bold text-ford-blue">Menu MBG Siang Terdistribusi</span>
              </p>
            </div>

            {/* Real-time Clock Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-ford-blue text-white text-[11px] font-mono font-bold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-green-02 animate-pulse" />
              <span>{currentTimeStr}</span>
            </div>
          </div>

          {/* In / Out Nutritional Timing */}
          <div className="flex items-center justify-between pt-1.5 text-[11px] font-bold border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-light-sea-green">
              <Clock className="w-3.5 h-3.5 text-green-02" />
              <span className="text-ford-blue font-bold">07:30</span>
              <span className="text-blue-gray font-normal">In (Sarapan)</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-red">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-ford-blue font-bold">12:00</span>
              <span className="text-blue-gray font-normal">Out (MBG Siang)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BODY CONTENT SECTION ═══ */}
      <div className="px-4 space-y-3.5">
        {/* 4 Quick Actions Card with Center Dropdown Indicator */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs relative">
          <div className="grid grid-cols-4 gap-1 text-center">
            {/* 1. Cek Gizi AI */}
            <button
              type="button"
              onClick={() => setActiveTab("screening")}
              className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-green-02 group-hover:bg-green-tint flex items-center justify-center text-ford-blue group-hover:text-light-sea-green transition-all">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-ford-blue leading-tight">
                Skrining Gizi
              </span>
            </button>

            {/* 2. Menu MBG */}
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-green-02 group-hover:bg-green-tint flex items-center justify-center text-ford-blue group-hover:text-light-sea-green transition-all">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-ford-blue leading-tight">
                Menu MBG
              </span>
            </button>

            {/* 3. Aduan MBG */}
            <button
              type="button"
              onClick={() => setActiveTab("complaint")}
              className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-brand-orange group-hover:bg-amber-50 flex items-center justify-center text-ford-blue group-hover:text-brand-orange transition-all">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-ford-blue leading-tight">
                Aduan MBG
              </span>
            </button>

            {/* 4. Tanya AI */}
            <button
              type="button"
              onClick={() => setActiveTab("ai_chat")}
              className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl border border-slate-200 bg-[#F8FAFC] group-hover:border-brand-blue group-hover:bg-blue-50 flex items-center justify-center text-ford-blue group-hover:text-brand-blue transition-all">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-ford-blue leading-tight">
                Tanya AI
              </span>
            </button>
          </div>

          {/* Floating Chevron Center Divider */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-gray">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Dual Metric Cards (2 Cards Side-by-Side) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Card 1: Status Gizi Anak */}
          <div
            onClick={() => setActiveTab("screening")}
            className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:border-green-02/60 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] font-bold text-ford-blue">Status Gizi Anak</h4>
              <ChevronRight className="w-3.5 h-3.5 text-blue-gray" />
            </div>
            <p className="text-[9.5px] text-blue-gray">Pemeriksaan Terakhir</p>
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-02 h-full rounded-full w-full"></div>
              </div>
              <span className="text-[10px] font-bold text-light-sea-green block text-right">Optimal / Normal</span>
            </div>
          </div>

          {/* Card 2: Kebutuhan AKG */}
          <div
            onClick={() => setActiveTab("menu")}
            className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs hover:border-light-sea-green/60 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] font-bold text-ford-blue">Kecukupan AKG</h4>
              <ChevronRight className="w-3.5 h-3.5 text-blue-gray" />
            </div>
            <p className="text-[9.5px] text-blue-gray">Target Harian MBG</p>
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-light-sea-green h-full rounded-full w-[95%]"></div>
              </div>
              <span className="text-[10px] font-bold text-light-sea-green block text-right">95% Terpenuhi</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs: Edukasi Gizi | Jadwal MBG | Anak Terpantau */}
        <div className="border-b border-slate-200 flex items-center justify-around text-[12px] font-bold pt-1">
          <button
            type="button"
            onClick={() => setSelectedSubTab("edukasi")}
            className={`pb-2 flex-1 text-center cursor-pointer transition-all ${
              selectedSubTab === "edukasi"
                ? "border-b-2 border-green-02 text-ford-blue font-black"
                : "border-b-2 border-transparent text-blue-gray hover:text-ford-blue font-medium"
            }`}
          >
            Edukasi Gizi
          </button>
          <button
            type="button"
            onClick={() => setSelectedSubTab("jadwal")}
            className={`pb-2 flex-1 text-center cursor-pointer transition-all ${
              selectedSubTab === "jadwal"
                ? "border-b-2 border-green-02 text-ford-blue font-black"
                : "border-b-2 border-transparent text-blue-gray hover:text-ford-blue font-medium"
            }`}
          >
            Jadwal MBG
          </button>
          <button
            type="button"
            onClick={() => setSelectedSubTab("anak")}
            className={`pb-2 flex-1 text-center cursor-pointer transition-all ${
              selectedSubTab === "anak"
                ? "border-b-2 border-green-02 text-ford-blue font-black"
                : "border-b-2 border-transparent text-blue-gray hover:text-ford-blue font-medium"
            }`}
          >
            Anak Terpantau
          </button>
        </div>

        {/* ═══ TAB 1: EDUKASI GIZI & COMMUNITY FEEDS ═══ */}
        {selectedSubTab === "edukasi" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Community Story Input Bar */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-tint border border-green-02/30 flex items-center justify-center text-[12px] font-bold text-ford-blue shrink-0">
                {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
              </div>
              <div 
                onClick={() => setActiveTab("ai_chat")}
                className="flex-1 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-[11px] text-blue-gray shadow-2xs cursor-pointer hover:border-green-02/60 transition-colors"
              >
                Tanyakan menu gizi atau info posyandu ke K-Bot AI...
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("ai_chat")}
                className="p-2 rounded-xl bg-white border border-slate-200 text-light-sea-green hover:bg-green-tint shadow-2xs cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-light-sea-green" />
              </button>
            </div>

            {/* Feed Item 1: Tip Gizi Bandeng Dinkes Gresik */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold text-[12px]">
                    🏥
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-ford-blue">Dinas Kesehatan Kab. Gresik</h4>
                    <p className="text-[9.5px] text-blue-gray">Tim Nutrisi MBG • 2 jam lalu</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-green-tint text-ford-blue text-[9.5px] font-bold">
                  Resmi Dinkes
                </span>
              </div>
              <p className="text-[11.5px] text-ford-blue/90 leading-relaxed">
                Ikan Bandeng dan Kerapu lokal Gresik terbukti memiliki asam amino esensial dan Omega-3 setara ikan salmon, sangat efektif mendukung kecerdasan otak siswa sekolah dasar! 🐟✨
              </p>
              <div className="flex items-center justify-between text-[10.5px] text-blue-gray pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleLike(1)}
                  className={`flex items-center gap-1 cursor-pointer font-bold ${likedFeeds[1] ? "text-brand-red" : "text-blue-gray hover:text-ford-blue"}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedFeeds[1] ? "fill-current" : ""}`} />
                  <span>{likedFeeds[1] ? "143 Warga Suka" : "142 Warga Suka"}</span>
                </button>
                <span>💬 18 Komentar Posyandu</span>
              </div>
            </div>

            {/* Feed Item 2: Edukasi Sayur Daun Kelor */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-ford-blue flex items-center justify-center font-bold text-[12px]">
                    🥗
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-ford-blue">Puskesmas Kebomas</h4>
                    <p className="text-[9.5px] text-blue-gray">Edukasi Pangan Lokal • Kemarin</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-ford-blue text-[9.5px] font-bold">
                  Pangan Lokal
                </span>
              </div>
              <p className="text-[11.5px] text-ford-blue/90 leading-relaxed">
                Sayur bening kelor jagung manis kaya akan zat besi alami dan vitamin A. Menu ini masuk dalam rotasi MBG hari Rabu untuk mencegah anemia pada anak sekolah. 🌿🌽
              </p>
              <div className="flex items-center justify-between text-[10.5px] text-blue-gray pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleLike(2)}
                  className={`flex items-center gap-1 cursor-pointer font-bold ${likedFeeds[2] ? "text-brand-red" : "text-blue-gray hover:text-ford-blue"}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedFeeds[2] ? "fill-current" : ""}`} />
                  <span>{likedFeeds[2] ? "89 Warga Suka" : "88 Warga Suka"}</span>
                </button>
                <span>💬 9 Diskusi Guru &amp; Ortu</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: JADWAL MENU MBG HARI INI & BESOK ═══ */}
        {selectedSubTab === "jadwal" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Today Menu Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-light-sea-green" />
                  <h4 className="text-[12.5px] font-bold text-ford-blue">Menu MBG Hari Ini (Selasa)</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-green-tint text-ford-blue text-[10px] font-bold">
                  Terdistribusi
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src="/assets/mbg_tray_bandeng.jpg"
                  alt="Bandeng MBG"
                  className="w-16 h-16 rounded-xl object-cover shadow-2xs shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <h5 className="text-[12px] font-black text-ford-blue truncate">Ikan Bandeng Bakar Madu + Bening Bayam</h5>
                  <p className="text-[10px] text-blue-gray">Kalori: 450 kkal • Protein: 28g • Kalsium: 150mg</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-light-sea-green font-bold">
                    <CheckCircle2 className="w-3 h-3 text-green-02" />
                    <span>Diterima di SD Negeri 1 Kebomas (12:00 WIB)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tomorrow Preview Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-orange" />
                  <h4 className="text-[12.5px] font-bold text-ford-blue">Pratinjau Menu Besok (Rabu)</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-ford-blue text-[10px] font-bold">
                  Persiapan Dapur
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src="/assets/mbg_tray_ayam.jpg"
                  alt="Ayam Woku MBG"
                  className="w-16 h-16 rounded-xl object-cover shadow-2xs shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <h5 className="text-[12px] font-black text-ford-blue truncate">Ayam Bumbu Kuning + Tempe Mendoan + Pisang</h5>
                  <p className="text-[10px] text-blue-gray">Target: 480 kkal • Protein: 31g • Zat Besi: 4.2mg</p>
                  <span className="text-[10px] text-blue-gray block">Penyuplai: SPPG Mandiri Kebomas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: ANAK TERPANTAU ═══ */}
        {selectedSubTab === "anak" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center font-black text-sm shadow-2xs">
                    👧
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-ford-blue">Aisyah Putri Ramadhani</h4>
                    <p className="text-[10.5px] text-blue-gray">Usia 9 Tahun • SD Negeri 1 Kebomas (Kelas 4B)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-tint text-ford-blue text-[10px] font-bold border border-green-02/40">
                  Optimal
                </span>
              </div>

              {/* Growth Metrics Table */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-blue-gray block">Tinggi Badan</span>
                  <span className="text-[13px] font-black text-ford-blue">138 cm</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-blue-gray block">Berat Badan</span>
                  <span className="text-[13px] font-black text-ford-blue">32.4 kg</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-blue-gray block">Indeks IMT</span>
                  <span className="text-[13px] font-black text-green-02">17.0 (Normal)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("screening")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[11.5px] shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Mulai Pindai Gizi Anak Ini Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
