"use client";

import React, { useState } from "react";
import {
  MapPin,
  Bell,
  Sparkles,
  ChevronRight,
  Activity,
  Utensils,
  MessageSquare,
  CheckCircle2,
  Heart
} from "lucide-react";
import { Page, Card, Button, Badge, Progressbar, BlockTitle } from "konsta/react";
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
  const { greetingText, greetingEmoji, currentDateStr } = atmosphere;
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Page className="p-4 space-y-3.5 pb-36 font-sans animate-in fade-in duration-200 select-none bg-transparent">
      {/* ═══ 1. MINIMALIST CLEAN HEADER ═══ */}
      <div className="flex items-center justify-between pt-0.5 px-0.5">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-gray">
            <span className="truncate">{currentDateStr}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-light-sea-green">
              <MapPin className="w-2.5 h-2.5" />
              <span>Kec. {citizenUser?.district || "Kebomas"}</span>
            </span>
          </div>
          <h1 className="text-[17px] font-black text-ford-blue tracking-tight truncate flex items-center gap-1">
            <span>{greetingText},</span>
            <span className="text-light-sea-green truncate">
              {citizenUser?.name?.split(" ")[0] || "Warga"}
            </span>
            <span>{greetingEmoji}</span>
          </h1>
        </div>

        {/* Clean Bell Notification */}
        <button
          type="button"
          onClick={() => alert("Pemberitahuan: Porsi MBG Ikan Bandeng untuk SD Negeri 1 Kebomas telah terverifikasi!")}
          className="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-ford-blue hover:bg-slate-50 transition-all cursor-pointer relative shrink-0"
        >
          <Bell className="w-4 h-4 text-ford-blue" />
          <span className="w-2 h-2 rounded-full bg-brand-orange absolute top-2 right-2 border-2 border-white" />
        </button>
      </div>

      {/* ═══ 2. HERO CARD: STATUS GIZI & SKRINING ANAK (KONSTA CARD) ═══ */}
      <Card className="!m-0 p-4 rounded-3xl bg-gradient-to-br from-[#EAF6D8] via-[#F4FDF9] to-white border border-green-02/40 shadow-xs space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-green-02/30 flex items-center justify-center text-base font-bold">
              👧
            </div>
            <div>
              <h3 className="text-[13.5px] font-black text-ford-blue">Aisyah Putri Ramadhani</h3>
              <p className="text-[10.5px] text-blue-gray">SD Negeri 1 Kebomas • Kelas 4B</p>
            </div>
          </div>
          <Badge colors={{ bg: "bg-green-02/25", text: "text-ford-blue" }} className="px-2.5 py-1 text-[10px] font-black border border-green-02/50 rounded-full">
            Optimal
          </Badge>
        </div>

        {/* Simple Progress AKG & Vital Stats with Konsta Progressbar */}
        <div className="p-3 rounded-2xl bg-white/90 border border-slate-100 space-y-2 relative z-10 shadow-2xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-ford-blue">Kecukupan AKG Harian</span>
            <span className="font-black text-light-sea-green">95% Terpenuhi</span>
          </div>
          <Progressbar progress={0.95} className="h-2 rounded-full !bg-slate-100" />
          <div className="flex items-center justify-between text-[10px] text-blue-gray pt-0.5">
            <span>TB: <strong>138 cm</strong> • BB: <strong>32.4 kg</strong></span>
            <span>IMT: <strong>17.0 (Normal)</strong></span>
          </div>
        </div>

        {/* Konsta Button to Screening */}
        <Button
          large
          rounded
          onClick={() => setActiveTab("screening")}
          className="w-full py-2.5 bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 text-ford-blue font-black text-[12px] shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer relative z-10"
        >
          <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Mulai Analisis Biometrik AI</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Button>
      </Card>

      {/* ═══ 3. TODAY'S MBG BENTO MEAL (KONSTA CARD) ═══ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[12.5px] font-black text-ford-blue">Menu MBG Hari Ini</h4>
          <span className="text-[10px] font-bold text-light-sea-green flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-02" />
            <span>Terdistribusi</span>
          </span>
        </div>

        <Card className="!m-0 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <img
            src="/assets/mbg_tray_bandeng.jpg"
            alt="Bandeng MBG"
            className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-2xl object-cover shadow-2xs shrink-0"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <h5 className="text-[12.5px] font-black text-ford-blue truncate leading-tight">
              Ikan Bandeng Bakar Madu
            </h5>
            <p className="text-[10.5px] text-blue-gray leading-snug">
              Sayur Bayam Jagung • Nasi Putih • Buah Jeruk Manis
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-[10px]">
              <Badge colors={{ bg: "bg-slate-100", text: "text-ford-blue" }} className="px-2 py-0.5 rounded-md font-bold">
                450 kkal
              </Badge>
              <span className="text-light-sea-green font-bold">
                Protein 28g
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══ 4. CLEAN 3 ACTION SHORTCUTS (KONSTA BUTTONS) ═══ */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Shortcut 1: Menu MBG */}
        <button
          type="button"
          onClick={() => setActiveTab("menu")}
          className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-green-02/50 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center group"
        >
          <div className="w-9 h-9 rounded-xl bg-green-tint text-ford-blue group-hover:bg-green-02/20 flex items-center justify-center transition-colors">
            <Utensils className="w-4 h-4 text-light-sea-green" />
          </div>
          <span className="text-[11px] font-bold text-ford-blue">Menu MBG</span>
        </button>

        {/* Shortcut 2: Aduan MBG */}
        <button
          type="button"
          onClick={() => setActiveTab("complaint")}
          className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-brand-orange/50 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-brand-orange group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <MessageSquare className="w-4 h-4 text-brand-orange" />
          </div>
          <span className="text-[11px] font-bold text-ford-blue">Aduan MBG</span>
        </button>

        {/* Shortcut 3: Tanya K-Bot AI */}
        <button
          type="button"
          onClick={() => setActiveTab("ai_chat")}
          className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-brand-blue/50 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <Sparkles className="w-4 h-4 text-brand-blue" />
          </div>
          <span className="text-[11px] font-bold text-ford-blue">Tanya AI</span>
        </button>
      </div>

      {/* ═══ 5. SIMPLE DINKES GIZI TIP (KONSTA CARD) ═══ */}
      <Card className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
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
    </Page>
  );
};
