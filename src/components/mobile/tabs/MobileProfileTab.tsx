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
  User,
  Heart,
  QrCode,
  CheckCircle2,
  Calendar,
  Building2
} from "lucide-react";
import { Page } from "konsta/react";
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
    <div className="space-y-3.5 animate-in fade-in duration-200 font-sans pb-4">
      {/* Citizen Profile Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-ford-blue via-[#1E2950] to-light-sea-green text-white space-y-3.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-[20px] font-black text-white shadow-inner">
            {citizenUser?.name ? citizenUser.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15.5px] font-black leading-tight truncate">
                {citizenUser?.name || "Muhammad Nizam Setiawan"}
              </h3>
              <ShieldCheck className="w-4 h-4 text-green-02 shrink-0" />
            </div>
            <p className="text-[11px] text-blue-100 truncate mt-0.5 font-medium">
              {citizenUser?.email || "nizam@gresik.go.id"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-blue-100 border border-white/20 shadow-2xs">
                <MapPin className="w-2.5 h-2.5 text-brand-orange" />
                <span>Kec. {citizenUser?.district || "Kebomas"}, Gresik</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center border-t border-white/10">
          <div className="p-2 rounded-2xl bg-white/10">
            <span className="block text-[14px] font-black text-white">1 Anak</span>
            <span className="text-[9.5px] text-blue-100">Dipantau MBG</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/10">
            <span className="block text-[14px] font-black text-green-02">Optimal</span>
            <span className="text-[9.5px] text-blue-100">Status Gizi AI</span>
          </div>
          <div className="p-2 rounded-2xl bg-white/10">
            <span className="block text-[14px] font-black text-brand-orange">100%</span>
            <span className="text-[9.5px] text-blue-100">Klaim MBG</span>
          </div>
        </div>
      </div>

      {/* Kartu Profil Anak Terdaftar MBG */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold text-sm">
              👧
            </div>
            <div>
              <h4 className="text-[12.5px] font-bold text-ford-blue">Data Anak Terdaftar MBG</h4>
              <p className="text-[10px] text-blue-gray">Tersinkronisasi Dapodik Kemendikbud</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-green-tint text-ford-blue text-[9.5px] font-bold">
            Aktif Penerima
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-blue-gray">Nama Lengkap:</span>
            <span className="font-bold text-ford-blue">Aisyah Putri Ramadhani</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-gray">Sekolah:</span>
            <span className="font-bold text-ford-blue">SD Negeri 1 Kebomas (Kelas 4B)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-gray">NISN:</span>
            <span className="font-mono font-bold text-ford-blue">0148291048</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-gray">Riwayat Porsi Bulan Ini:</span>
            <span className="font-bold text-light-sea-green">22 dari 22 Porsi Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Puskesmas & Fasilitas Pembina */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-light-sea-green" />
          <h4 className="text-[12px] font-bold text-ford-blue">Puskesmas Pembina Wilayah</h4>
        </div>
        <div className="p-2.5 rounded-xl bg-green-tint/50 border border-green-02/30 space-y-1 text-[11px]">
          <p className="font-bold text-ford-blue">Puskesmas Kebomas Gresik</p>
          <p className="text-[10px] text-blue-gray">Dokter Penanggung Jawab: dr. Fitri Nuraini, Sp.GK</p>
          <p className="text-[10px] text-light-sea-green font-medium">Jadwal Posyandu Rutin: Setiap Tanggal 15</p>
        </div>
      </div>

      {/* Menu & Layanan Warga */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
        <h4 className="text-[11px] font-bold text-blue-gray uppercase tracking-wider px-1">
          Layanan &amp; Pengaturan
        </h4>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("screening")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-light-sea-green" />
              </div>
              <span>Riwayat Skrining Gizi AI</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-gray" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("complaint")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-brand-orange flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span>Pusat Pengaduan Menu MBG</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-gray" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_chat")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-ford-blue font-bold text-[11.5px] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Konsultasi Nutrisi K-Bot AI</span>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-gray" />
          </button>
        </div>
      </div>

      {/* Tombol Keluar Sesi */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-brand-red/30 text-brand-red text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
};
