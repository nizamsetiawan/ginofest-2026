"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Search,
  Bell,
  FileText,
  CheckCircle2,
  Scan,
  Activity,
  Utensils,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { Page, Card, Button, Badge } from "konsta/react";
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
  const { currentDateStr } = atmosphere;
  const [showDetail, setShowDetail] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const userName = citizenUser?.name || "Muhammad Nizam Setiawan";
  const userDistrict = citizenUser?.district || "Menganti";

  return (
    <Page className="p-4 space-y-4 pb-36 font-sans select-none bg-[#F8FAFC]">
      {/* ═══ 1. TOP HEADER: ENTITY BARIS 1 ═══ */}
      <div className="flex items-center justify-between pt-1 px-0.5">
        <button
          type="button"
          onClick={() => alert("Wilayah Kerja: Dinas Kesehatan & Satgas MBG Kabupaten Gresik")}
          className="flex items-center gap-1.5 text-[13.5px] font-bold text-ford-blue hover:text-light-sea-green transition-colors cursor-pointer min-w-0"
        >
          <span className="truncate">Kabupaten Gresik • MBG Gizi</span>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => alert("Fitur Pencarian: Cari menu MBG, jadwal distribusi, dan data gizi anak...")}
          className="p-1.5 rounded-full hover:bg-slate-200/60 text-ford-blue transition-colors cursor-pointer"
          title="Pencarian"
        >
          <Search className="w-4.5 h-4.5 text-ford-blue" />
        </button>
      </div>

      {/* ═══ 2. USER PROFILE BARIS 2 ═══ */}
      <div className="flex items-center justify-between px-0.5 pt-0.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-green-02 to-light-sea-green text-ford-blue flex items-center justify-center font-black text-sm shadow-xs shrink-0 border border-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h2 className="text-[14px] font-black text-ford-blue truncate leading-tight">
              {userName}
            </h2>
            <p className="text-[11.5px] text-blue-gray truncate font-medium">
              Orang Tua Siswa • Kec. {userDistrict}
            </p>
          </div>
        </div>

        {/* Clean Bell Notification */}
        <button
          type="button"
          onClick={() => alert("Pemberitahuan: Porsi MBG Ikan Bandeng untuk SD Negeri 1 Kebomas telah terverifikasi!")}
          className="w-8.5 h-8.5 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-ford-blue hover:bg-slate-50 transition-all cursor-pointer relative shrink-0"
        >
          <Bell className="w-4 h-4 text-ford-blue" />
          <span className="w-2 h-2 rounded-full bg-brand-orange absolute top-1.5 right-1.5 border border-white" />
        </button>
      </div>

      {/* ═══ 3. MAIN HERO CARD (INSPIRED BY REFERENCE ATTENDANCE/STATUS CARD) ═══ */}
      <Card className="!m-0 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
        {/* Card Header: Schedule & Date */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10.5px] font-semibold text-blue-gray block">
              Hari ini ({currentDateStr})
            </span>
            <h3 className="text-[12.5px] font-black text-ford-blue leading-snug">
              Menu MBG: Ikan Bandeng Bakar Madu [Kec. {userDistrict}]
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className="p-1 rounded-lg text-blue-gray hover:text-ford-blue transition-colors cursor-pointer"
            title="Lihat Jadwal Lengkap"
          >
            <FileText className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="h-px bg-slate-100 w-full" />

        {/* 2-Column Status Box */}
        <div className="grid grid-cols-2 gap-3 divide-x divide-slate-100">
          {/* Status 1: Distribusi MBG */}
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-full bg-green-tint text-ford-blue flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-light-sea-green" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-blue-gray font-medium block">Porsi MBG</span>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-black text-emerald-600">11:30</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 shrink-0" />
              </div>
            </div>
          </div>

          {/* Status 2: Status Gizi & AKG */}
          <div className="flex items-center gap-2.5 pl-3">
            <div className="w-8.5 h-8.5 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-blue-gray font-medium block">Status Gizi</span>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-black text-emerald-600">95%</span>
                <Badge colors={{ bg: "bg-green-02/25", text: "text-ford-blue" }} className="px-1.5 py-0 text-[9px] font-black rounded-sm">
                  Optimal
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            large
            rounded
            onClick={() => setActiveTab("screening")}
            className="flex-1 py-3 bg-brand-orange hover:bg-orange-600 text-white font-black text-[13px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Activity className="w-4 h-4 stroke-[2.5]" />
            <span>Mulai Analisis Biometrik AI</span>
          </Button>

          <button
            type="button"
            onClick={() => setActiveTab("screening")}
            className="w-12 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-brand-orange shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Scan Cepat"
          >
            <Scan className="w-5 h-5 text-brand-orange" />
          </button>
        </div>

        {/* Collapsible Link: Lihat Detail */}
        <div className="pt-0.5 text-center">
          <button
            type="button"
            onClick={() => setShowDetail(!showDetail)}
            className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-orange hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>{showDetail ? "Tutup Detail Nutrisi" : "Lihat Detail Nutrisi"}</span>
            {showDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetail && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-2 text-[11px] animate-in fade-in">
              <div className="flex justify-between items-center text-ford-blue">
                <span className="font-bold">Nama Anak:</span>
                <span>Aisyah Putri Ramadhani (4B)</span>
              </div>
              <div className="flex justify-between items-center text-ford-blue">
                <span className="font-bold">Sekolah:</span>
                <span>SD Negeri 1 Kebomas</span>
              </div>
              <div className="flex justify-between items-center text-ford-blue">
                <span className="font-bold">Tinggi / Berat Badan:</span>
                <span>138 cm / 32.4 kg (IMT 17.0 Normal)</span>
              </div>
              <div className="flex justify-between items-center text-ford-blue">
                <span className="font-bold">Kandungan Kalori MBG:</span>
                <span className="font-black text-light-sea-green">450 kkal • Protein 28g</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ═══ 4. SECTION: INFORMASI & LAYANAN MBG (MATCHING REFERENCE SECTION HEADER) ═══ */}
      <div className="space-y-3 pt-1">
        <h4 className="text-[14px] font-black text-ford-blue px-0.5">
          Informasi &amp; Layanan MBG
        </h4>

        {/* Bento Meal Card (Clean Compact) */}
        <Card className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <img
            src="/assets/mbg_tray_bandeng.jpg"
            alt="Bandeng MBG"
            className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-2xl object-cover shadow-2xs shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <Badge colors={{ bg: "bg-slate-100", text: "text-ford-blue" }} className="px-2 py-0.5 rounded-md text-[9.5px] font-bold">
                Hari Ini
              </Badge>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Terdistribusi</span>
              </span>
            </div>
            <h5 className="text-[13px] font-black text-ford-blue truncate leading-tight">
              Ikan Bandeng Bakar Madu
            </h5>
            <p className="text-[10.5px] text-blue-gray leading-snug truncate">
              Sayur Bayam Jagung • Nasi Putih • Jeruk
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[10px]">
              <span className="font-bold text-ford-blue">450 kkal</span>
              <span>•</span>
              <span className="text-light-sea-green font-bold">Protein 28g</span>
            </div>
          </div>
        </Card>

        {/* 3 Action Shortcut Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. Jadwal Menu */}
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-light-sea-green/50 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-green-tint text-ford-blue group-hover:bg-green-02/20 flex items-center justify-center transition-colors">
              <Utensils className="w-4 h-4 text-light-sea-green" />
            </div>
            <span className="text-[11px] font-bold text-ford-blue">Menu MBG</span>
          </button>

          {/* 2. Aduan MBG */}
          <button
            type="button"
            onClick={() => setActiveTab("complaint")}
            className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-brand-orange/50 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-brand-orange group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <MessageSquare className="w-4 h-4 text-brand-orange" />
            </div>
            <span className="text-[11px] font-bold text-ford-blue">Aduan MBG</span>
          </button>

          {/* 3. Tanya K-Bot AI */}
          <button
            type="button"
            onClick={() => setActiveTab("ai_chat")}
            className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-brand-blue/50 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <Sparkles className="w-4 h-4 text-brand-blue" />
            </div>
            <span className="text-[11px] font-bold text-ford-blue">Tanya AI</span>
          </button>
        </div>

        {/* Tips Dinkes Gresik */}
        <Card className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🐟</span>
              <h5 className="text-[11.5px] font-black text-ford-blue">Tips Nutrisi • Dinkes Gresik</h5>
            </div>
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`cursor-pointer ${isLiked ? "text-brand-red" : "text-slate-400 hover:text-ford-blue"}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Ikan Bandeng lokal Gresik kaya Omega-3 dan protein hewani murni untuk menunjang daya konsentrasi belajar siswa sekolah dasar.
          </p>
        </Card>
      </div>
    </Page>
  );
};
