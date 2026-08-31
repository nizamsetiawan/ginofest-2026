"use client";

import React from "react";
import { Camera, Navigation, Bell, Check, RefreshCw } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-white rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-300 text-left">
        {/* Header with App Logo */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
          <img src="/logo_app.svg" alt="Kcal" className="w-9 h-9 rounded-2xl shadow-xs shrink-0" />
          <div>
            <h3 className="text-[14px] font-bold text-ford-blue leading-tight">
              Izin Akses Aplikasi Kcal
            </h3>
            <p className="text-[10px] text-blue-gray">
              Ginofest 2026 • Pemkab Gresik
            </p>
          </div>
        </div>

        <p className="text-[11px] text-blue-gray leading-relaxed">
          Untuk pengalaman optimal layaknya aplikasi mobile native, Kcal memerlukan izin perangkat berikut:
        </p>

        {/* Permission List */}
        <div className="space-y-2">
          {/* 1. Kamera & Galeri */}
          <div className="flex items-start gap-2 p-2 rounded-2xl bg-green-tint/60 border border-green-02/30">
            <div className="w-6 h-6 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-ford-blue">Kamera &amp; Galeri Foto</h4>
              <p className="text-[9.5px] text-blue-gray leading-tight">
                Diperlukan untuk skrining visual stunting &amp; upload foto aduan.
              </p>
            </div>
          </div>

          {/* 2. Lokasi GPS */}
          <div className="flex items-start gap-2 p-2 rounded-2xl bg-green-tint/60 border border-green-02/30">
            <div className="w-6 h-6 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-ford-blue">Lokasi GPS Presisi</h4>
              <p className="text-[9.5px] text-blue-gray leading-tight">
                Sinkronisasi otomatis ketersediaan menu MBG di kecamatan domisili.
              </p>
            </div>
          </div>

          {/* 3. Notifikasi Pengingat */}
          <div className="flex items-start gap-2 p-2 rounded-2xl bg-green-tint/60 border border-green-02/30">
            <div className="w-6 h-6 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11.5px] font-bold text-ford-blue">Notifikasi Terjadwal</h4>
              <p className="text-[9.5px] text-blue-gray leading-tight">
                Pengingat menu MBG harian anak &amp; jadwal posyandu wilayah.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            onClick={onGrantAll}
            disabled={isRequesting}
            className="w-full py-2.5 bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold rounded-xl text-[12px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isRequesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses Izin...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Izinkan Akses Perangkat</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-1.5 text-blue-gray hover:text-ford-blue font-semibold text-[10.5px] cursor-pointer text-center"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
