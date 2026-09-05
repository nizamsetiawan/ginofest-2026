"use client";

import React, { useState, useMemo } from "react";
import {
  Scan,
  Sparkles,
  Database,
  MapPin,
  QrCode,
  Bell,
  HelpCircle,
  Settings,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Briefcase,
  LogOut,
  Users,
  MessageSquare,
  HardDrive,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminProfile } from "@/data/admin-profiles";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutModal } from "./LogoutModal";

export type NavKey = "scan" | "generate" | "rag_db" | "telemetry_logs" | "map" | "qrcode" | "notifications" | "help" | "users" | "complaints" | "backup" | "settings";

interface NavItemDef {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  section: "main" | "bottom";
  badgeCount?: number;
  superAdminOnly?: boolean;
}

interface NuSantapSidebarProps {
  activeNav: NavKey;
  setActiveNav: (key: NavKey) => void;
  onOpenChat?: () => void;
  onLogoutClick?: () => void;
  currentAdmin: AdminProfile;
  unreadNotifCount?: number;
}

export const NuSantapSidebar: React.FC<NuSantapSidebarProps> = ({
  activeNav,
  setActiveNav,
  onOpenChat,
  onLogoutClick,
  currentAdmin,
  unreadNotifCount = 0,
}) => {
  const { logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isManagementExpanded, setIsManagementExpanded] = useState(false);

  const isSuperAdmin = user?.role === "super_admin" || currentAdmin.role === "Kabupaten";

  const NAV_ITEMS: NavItemDef[] = useMemo(() => {
    const items: NavItemDef[] = [
      {
        key: "scan",
        label: "Hasil Scan",
        icon: Scan,
        keywords: ["hasil", "scan", "analisis", "stunting", "prevalensi", "target", "balita", "kecamatan", "dashboard"],
        section: "main",
      },
      {
        key: "generate",
        label: "Generate Menu",
        icon: Sparkles,
        keywords: ["generate", "menu", "mbg", "bom", "laporan", "excel", "bahan", "pokok", "kalender", "tahunan", "mingguan", "pagu", "siklus", "anggaran"],
        section: "main",
      },
      {
        key: "rag_db",
        label: "Basis Data RAG",
        icon: Database,
        keywords: ["basis", "data", "rag", "komoditas", "harga", "pasar", "siskaperbapo", "resep", "gizi", "tkpi", "wilayah", "upload", "excel", "kalibrasi", "grounding"],
        section: "main",
      },
      {
        key: "map",
        label: "Peta Prevalensi",
        icon: MapPin,
        keywords: ["peta", "prevalensi", "zonasi", "wilayah", "gresik", "geografis", "risiko", "merah", "kuning", "hijau", "koordinat"],
        section: "main",
      },
      {
        key: "qrcode",
        label: "Scan QR Code",
        icon: QrCode,
        keywords: ["scan", "qr", "code", "skrining", "tumbuh", "kembang", "balita", "posyandu", "zscore", "who", "antropometri", "tb", "bb"],
        section: "main",
      },
    ];

    if (isSuperAdmin) {
      items.push(
        {
          key: "complaints",
          label: "Pusat Aduan",
          icon: MessageSquare,
          keywords: ["aduan", "komplain", "pengaduan", "masukan", "feedback", "keluhan", "tiket", "masyarakat"],
          section: "main",
          superAdminOnly: true,
        }
      );
    }

    items.push(
      {
        key: "telemetry_logs",
        label: "Live AI Scan Logs",
        icon: Terminal,
        keywords: ["live", "scan", "log", "telemetry", "ai", "realtime", "akurasi", "recall", "scin", "medqa"],
        section: "bottom",
      },
      {
        key: "notifications",
        label: "Notifikasi",
        icon: Bell,
        keywords: ["notifikasi", "log", "aktivitas", "riwayat", "pesan", "peringatan", "firestore"],
        section: "bottom",
        badgeCount: unreadNotifCount,
      },
      {
        key: "help",
        label: "Bantuan",
        icon: HelpCircle,
        keywords: ["bantuan", "help", "k-bot", "panduan", "tanya", "faq", "perintah", "komplain", "pengaduan", "bot"],
        section: "bottom",
      }
    );

    if (isSuperAdmin) {
      items.push(
        {
          key: "users",
          label: "Kelola Pengguna",
          icon: Users,
          keywords: ["user", "pengguna", "management", "kelola", "admin", "kecamatan", "password", "pin", "role", "sesi", "log"],
          section: "bottom",
          superAdminOnly: true,
        },
        {
          key: "backup",
          label: "Brankas Backup",
          icon: HardDrive,
          keywords: ["brankas", "backup", "snapshot", "cadangkan", "arsip", "json", "csv", "restore", "firestore", "database"],
          section: "bottom",
          superAdminOnly: true,
        }
      );
    }

    items.push({
      key: "settings",
      label: "Pengaturan",
      icon: Settings,
      keywords: ["pengaturan", "settings", "pin", "otorisasi", "keamanan", "api", "key", "gemini", "firebase", "admin", "profil", "perangkat", "siklus"],
      section: "bottom",
    });

    return items;
  }, [unreadNotifCount, isSuperAdmin]);

  const filteredItems = useMemo(() => {
    const clean = searchTerm.trim().toLowerCase();
    if (!clean) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(clean) ||
      item.keywords.some((k) => k.toLowerCase().includes(clean))
    );
  }, [searchTerm, NAV_ITEMS]);

  const mainItems = filteredItems.filter((i) => i.section === "main");
  const bottomItems = filteredItems.filter((i) => i.section === "bottom");

  const handleSelectNav = (key: NavKey) => {
    if (key === "telemetry_logs") {
      if (typeof window !== "undefined") {
        window.open("/pemerintah/console", "_blank");
      }
    }
    setActiveNav(key);
    if (searchTerm) {
      setSearchTerm("");
    }
  };

  return (
    <aside className={`bg-white border-r border-[#e2e8f0] h-screen flex flex-col justify-between select-none shrink-0 sticky top-0 font-sans transition-all duration-300 ${isCollapsed ? "w-20 px-2 py-4" : "w-64 p-4"}`}>
      <div className="space-y-4">
        <div className={`flex items-center justify-between px-2 py-1 ${isCollapsed ? "flex-col gap-3" : ""}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src="/logo_app.svg"
              alt="Kcal Logo"
              className="w-8 h-8 rounded-xl shadow-xs shrink-0"
            />
            {!isCollapsed && (
              <span className="text-[20px] font-bold text-ford-blue tracking-tight truncate">
                Kcal
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-ford-blue transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 border border-slate-200/80"
            title={isCollapsed ? "Buka Sidebar" : "Sembunyikan Sidebar (<)"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-ford-blue" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-ford-blue" />
            )}
          </button>
        </div>

        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="w-full py-2 bg-[#F8FAFC] border border-[#e2e8f0] rounded-xl flex items-center justify-center text-blue-gray hover:text-ford-blue hover:bg-white transition-all cursor-pointer"
            title="Cari menu & fitur..."
          >
            <Search className="w-4 h-4" />
          </button>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Cari menu & fitur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-[13px] bg-[#F8FAFC] border border-[#e2e8f0] rounded-xl placeholder:text-blue-gray text-ford-blue focus:outline-none focus:border-light-sea-green focus:bg-white transition-all font-medium"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-blue-gray hover:text-ford-blue cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-blue-gray absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>
        )}

        <nav className="space-y-1 pt-1">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectNav(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5"} rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${isActive ? "bg-green-tint text-ford-blue font-bold shadow-2xs border border-green-02/30" : "text-blue-gray hover:bg-[#F8FAFC] hover:text-ford-blue"}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-light-sea-green" : "text-blue-gray"}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && searchTerm && (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-gray opacity-60 shrink-0" />
                )}
              </button>
            );
          })}

          {filteredItems.length === 0 && !isCollapsed && (
            <div className="py-6 px-3 text-center text-[12px] text-blue-gray bg-slate-50 rounded-xl border border-dashed border-[#e2e8f0]">
              Menu "{searchTerm}" tidak ditemukan
            </div>
          )}
        </nav>
      </div>

      <div className="space-y-3 pt-3 border-t border-[#f1f5f9]">
        <button
          type="button"
          onClick={() => setIsManagementExpanded((prev) => !prev)}
          className={`w-full flex items-center ${isCollapsed ? "justify-center p-2" : "justify-between px-3 py-1.5"} rounded-xl text-[11px] font-extrabold text-slate-500 uppercase tracking-wider hover:bg-slate-100/80 hover:text-ford-blue transition-all cursor-pointer border border-transparent hover:border-slate-200/60`}
          title={isCollapsed ? "Management" : undefined}
        >
          <div className="flex items-center gap-2 truncate">
            <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
            {!isCollapsed && <span>Management</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isManagementExpanded ? "rotate-180 text-ford-blue" : ""}`}
            />
          )}
        </button>

        <AnimatePresence initial={false}>
          {(isManagementExpanded || (searchTerm && bottomItems.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-1 text-[13px] text-blue-gray overflow-hidden pt-0.5"
            >
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelectNav(item.key)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-2" : "justify-between px-3.5 py-2"} rounded-xl transition-all font-medium cursor-pointer ${isActive ? "bg-green-tint text-ford-blue font-bold shadow-2xs border border-green-02/30" : "hover:bg-[#F8FAFC] hover:text-ford-blue"}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-light-sea-green" : "text-blue-gray"}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badgeCount && item.badgeCount > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-green-02 shrink-0"></span>
                    ) : null}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  if (onLogoutClick) {
                    onLogoutClick();
                  } else {
                    setIsLogoutConfirmOpen(true);
                  }
                }}
                title={isCollapsed ? "Keluar Akun" : "Keluar dari sesi akun saat ini"}
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-0 py-2" : "gap-3 px-3.5 py-2"} rounded-xl text-[13px] font-bold text-brand-red hover:bg-red-50 transition-all cursor-pointer`}
              >
                <LogOut className="w-4 h-4 text-brand-red shrink-0" />
                {!isCollapsed && <span className="truncate">Keluar Akun</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LogoutModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        currentAdmin={currentAdmin}
      />
    </aside>
  );
};
