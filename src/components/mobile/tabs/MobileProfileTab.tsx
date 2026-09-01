"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Activity,
  MessageSquare,
  Sparkles,
  ChevronRight,
  LogOut,
  Building2,
  HelpCircle,
  FileText
} from "lucide-react";
import { Page, Card, List, ListItem, Button, Badge } from "konsta/react";
import { CitizenUser, MobileTab } from "../types";

interface MobileProfileTabProps {
  citizenUser: CitizenUser | null;
  setActiveTab: (tab: MobileTab) => void;
  onLogout: () => void;
}

export const MobileProfileTab: React.FC<MobileProfileTabProps> = ({
  citizenUser,
  setActiveTab,
  onLogout,
}) => {
  return (
    <Page className="space-y-4 font-sans pb-6 animate-in fade-in duration-200 select-none w-full max-w-full overflow-x-hidden touch-pan-y bg-transparent">
      {/* ═══ 1. CLEAN PROFILE HEADER CARD (KONSTA CARD) ═══ */}
      <Card className="!m-0 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-green-02 to-light-sea-green text-ford-blue flex items-center justify-center text-lg font-black shadow-xs shrink-0">
            {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-black text-ford-blue truncate">
                {citizenUser?.name || "Muhammad Nizam Setiawan"}
              </h3>
              <ShieldCheck className="w-4 h-4 text-light-sea-green shrink-0" />
            </div>
            <p className="text-[11px] text-blue-gray truncate font-medium">
              {citizenUser?.email || "nizam@gresik.go.id"}
            </p>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-tint text-[10px] font-bold text-ford-blue border border-green-02/30">
                <MapPin className="w-2.5 h-2.5 text-light-sea-green" />
                <span>Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ═══ 2. KARTU ANAK MBG (KONSTA CARD) ═══ */}
      <Card className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">👧</span>
            <div>
              <h4 className="text-[12.5px] font-black text-ford-blue">Aisyah Putri Ramadhani</h4>
              <p className="text-[10px] text-blue-gray">SD Negeri 1 Kebomas • Kelas 4B</p>
            </div>
          </div>
          <Badge colors={{ bg: "bg-green-tint", text: "text-ford-blue" }} className="px-2.5 py-0.5 rounded-full font-black border border-green-02/30">
            22/22 Porsi
          </Badge>
        </div>
      </Card>

      {/* ═══ 3. GROUPED LIST MENU (KONSTA LIST & LISTITEM) ═══ */}
      <List strong inset className="!m-0 rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden bg-white">
        {/* Menu 1: Skrining Gizi */}
        <ListItem
          link
          onClick={() => setActiveTab("screening")}
          title={<span className="text-[12px] font-bold text-ford-blue">Riwayat Skrining AI</span>}
          subtitle={<span className="text-[10px] text-blue-gray">Status gizi &amp; biometrik anak</span>}
          media={
            <div className="w-8 h-8 rounded-xl bg-green-tint flex items-center justify-center text-light-sea-green">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
          }
        />

        {/* Menu 2: Pengaduan MBG */}
        <ListItem
          link
          onClick={() => setActiveTab("complaint")}
          title={<span className="text-[12px] font-bold text-ford-blue">Pusat Aduan MBG</span>}
          subtitle={<span className="text-[10px] text-blue-gray">Laporkan porsi / kualitas menu</span>}
          media={
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-brand-orange">
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
          }
        />

        {/* Menu 3: K-Bot AI */}
        <ListItem
          link
          onClick={() => setActiveTab("ai_chat")}
          title={<span className="text-[12px] font-bold text-ford-blue">Konsultasi Nutrisi AI</span>}
          subtitle={<span className="text-[10px] text-blue-gray">Tanya K-Bot seputar menu sehat</span>}
          media={
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
          }
        />

        {/* Menu 4: Puskesmas Pembina */}
        <ListItem
          title={<span className="text-[12px] font-bold text-ford-blue">Puskesmas Kebomas</span>}
          subtitle={<span className="text-[10px] text-blue-gray">dr. Fitri Nuraini, Sp.GK (Posyandu Tgl 15)</span>}
          media={
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-ford-blue">
              <Building2 className="w-4 h-4" />
            </div>
          }
          after={
            <Badge colors={{ bg: "bg-green-tint", text: "text-light-sea-green" }} className="px-2 py-0.5 rounded-md text-[9.5px] font-bold">
              Pembina
            </Badge>
          }
        />
      </List>

      {/* ═══ 4. CLEAN LOGOUT BUTTON (KONSTA BUTTON) ═══ */}
      <div className="pt-2">
        <Button
          large
          rounded
          onClick={onLogout}
          className="w-full py-3 bg-red-50 hover:bg-red-100 border border-brand-red/20 text-brand-red text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </Button>
      </div>
    </Page>
  );
};
