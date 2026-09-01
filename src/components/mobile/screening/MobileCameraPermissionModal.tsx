"use client";

import React from "react";
import { Camera, X, ShieldCheck, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Drawer } from "vaul";
import { motion } from "framer-motion";

interface MobileCameraPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPermission: () => void;
  isRequesting: boolean;
  errorMessage: string | null;
}

export const MobileCameraPermissionModal: React.FC<MobileCameraPermissionModalProps> = ({
  isOpen,
  onClose,
  onRequestPermission,
  isRequesting,
  errorMessage,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[999] bg-slate-950/65 backdrop-blur-sm transition-opacity" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1000] max-h-[90vh] bg-white rounded-t-[32px] p-5 pb-safe-nav pb-6 shadow-2xl border-t border-slate-100 flex flex-col focus:outline-none font-sans">
          {/* Drag Handle */}
          <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-slate-300 mb-4 cursor-grab" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#23B5A8] to-[#79D7D2] text-ford-blue flex items-center justify-center font-bold shadow-md">
                <Camera className="w-5 h-5 text-ford-blue" />
              </div>
              <div>
                <Drawer.Title className="text-[15.5px] font-black text-ford-blue">
                  Izin Akses Kamera
                </Drawer.Title>
                <Drawer.Description className="text-[11.5px] text-slate-500 font-medium">
                  Kcal AI Vision • Biometrik Gizi
                </Drawer.Description>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer transition-all active:scale-95"
            >
              <X className="w-4 h-4 text-ford-blue" />
            </button>
          </div>

          {/* Content Body */}
          <div className="space-y-3.5 text-[12px] text-slate-600 leading-relaxed overflow-y-auto pr-1 flex-1">
            <p>
              Untuk menjalankan <strong>Analisis Biometrik Gizi AI</strong>, aplikasi memerlukan izin akses kamera pada perangkat Anda:
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-2.5 text-[11.5px]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#79D7D2]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                </div>
                <div>
                  <strong className="text-ford-blue">Pemindaian Biometrik Akurat</strong>
                  <p className="text-slate-500 text-[11px] leading-tight mt-0.5">
                    Memindai rona wajah, konjungtiva mata, telapak tangan, dan kuku untuk rekomendasi porsi MBG.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <strong className="text-ford-blue">Privasi &amp; Keamanan Terjamin</strong>
                  <p className="text-slate-500 text-[11px] leading-tight mt-0.5">
                    Proses analisis dilakukan langsung secara lokal. Foto tidak disimpan ke galeri publik Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Error message if permission was previously blocked/denied */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-brand-red text-[11.5px] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <p className="text-[11px] text-slate-400">
              Silakan ketuk tombol di bawah dan pilih <strong>&quot;Izinkan&quot; (Allow)</strong> pada dialog peramban Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2">
            <button
              type="button"
              disabled={isRequesting}
              onClick={() => {
                triggerHaptic();
                onRequestPermission();
              }}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#23B5A8] via-[#79D7D2] to-[#23B5A8] hover:opacity-95 text-ford-blue font-black text-[13.5px] shadow-[0_4px_15px_rgba(35,181,168,0.3)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-ford-blue" />
                  <span>Memeriksa Izin Kamera...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-ford-blue" />
                  <span>Izinkan &amp; Buka Kamera</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-slate-500 hover:text-ford-blue font-bold text-[12px] transition-colors cursor-pointer text-center"
            >
              Nanti Saja
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
