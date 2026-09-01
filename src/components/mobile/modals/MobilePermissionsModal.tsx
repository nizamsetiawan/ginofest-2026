"use client";

import React from "react";
import { Camera, Navigation, Bell, Check, RefreshCw } from "lucide-react";
import { Sheet, Button } from "konsta/react";

interface MobilePermissionsModalProps {
  isOpen: boolean;
  isRequesting: boolean;
  permissionStates: {
    camera: "granted" | "prompt" | "denied";
    location: "granted" | "prompt" | "denied";
    notification: "granted" | "prompt" | "denied";
  };
  onGrantAll: () => void;
  onDismiss: () => void;
}

export const MobilePermissionsModal: React.FC<MobilePermissionsModalProps> = ({
  isOpen,
  isRequesting,
  permissionStates,
  onGrantAll,
  onDismiss,
}) => {
  return (
    <Sheet
      opened={isOpen}
      onBackdropClick={onDismiss}
      className="rounded-t-3xl bg-white p-5 max-w-[420px] mx-auto space-y-4 shadow-2xl border-t border-slate-200 font-sans text-left"
    >
      {/* Header with App Logo */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <img src="/logo_app.svg" alt="Kcal" className="w-10 h-10 rounded-2xl shadow-xs shrink-0" />
        <div>
          <h3 className="text-[15px] font-black text-ford-blue leading-tight">
            Izin Akses Aplikasi Kcal
          </h3>
          <p className="text-[10.5px] text-blue-gray font-medium">
            Ginofest 2026 • Pemkab Gresik
          </p>
        </div>
      </div>

      <p className="text-[11.5px] text-blue-gray leading-relaxed">
        Untuk pengalaman optimal layaknya aplikasi mobile native, Kcal memerlukan izin perangkat berikut:
      </p>

      {/* Permission List */}
      <div className="space-y-2.5">
        {/* 1. Kamera & Galeri */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-green-tint/50 border border-green-02/30">
          <div className="w-7 h-7 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-ford-blue">Kamera &amp; Galeri Foto</h4>
            <p className="text-[10px] text-blue-gray leading-tight">
              Diperlukan untuk skrining visual stunting &amp; upload foto aduan.
            </p>
          </div>
        </div>

        {/* 2. Lokasi GPS */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-green-tint/50 border border-green-02/30">
          <div className="w-7 h-7 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-ford-blue">Lokasi GPS Presisi</h4>
            <p className="text-[10px] text-blue-gray leading-tight">
              Sinkronisasi otomatis ketersediaan menu MBG di kecamatan domisili.
            </p>
          </div>
        </div>

        {/* 3. Notifikasi Pengingat */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-green-tint/50 border border-green-02/30">
          <div className="w-7 h-7 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-ford-blue">Notifikasi Terjadwal</h4>
            <p className="text-[10px] text-blue-gray leading-tight">
              Pengingat menu MBG harian anak &amp; jadwal posyandu wilayah.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons with Konsta Button */}
      <div className="space-y-2 pt-2 pb-2">
        <Button
          large
          rounded
          onClick={onGrantAll}
          disabled={isRequesting}
          className="w-full py-3 bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 text-ford-blue font-black text-[12px] shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isRequesting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Memproses Izin...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Izinkan Semua Akses</span>
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2 text-center text-blue-gray hover:text-ford-blue text-[11px] font-bold transition-colors cursor-pointer block"
        >
          Nanti Saja (Lanjutkan)
        </button>
      </div>
    </Sheet>
  );
};
