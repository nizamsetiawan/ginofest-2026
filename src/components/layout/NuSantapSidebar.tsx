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
  LogOut,
  Users,
  MessageSquare,
  HardDrive
} from "lucide-react";
import { AdminProfile } from "@/data/admin-profiles";
import { useAuth } from "@/contexts/AuthContext";

export type NavKey = "scan" | "generate" | "rag_db" | "map" | "qrcode" | "notifications" | "help" | "users" | "complaints" | "backup" | "settings";

interface NavItemDef {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  section: "main" | "bottom";
  badgeCount?: number;
  superAdminOnly?: boolean;
}

import { LogoutModal } from "./LogoutModal";

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
      },
    ];

    // Super Admin only menus
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
          key: "complaints",
          label: "Pusat Aduan",
          icon: MessageSquare,
          keywords: ["aduan", "komplain", "pengaduan", "masukan", "feedback", "keluhan", "tiket", "masyarakat"],
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

  // Filter items based on search term (label or keywords)
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
    setActiveNav(key);
    if (searchTerm) {
      setSearchTerm("");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] h-screen flex flex-col justify-between p-4 select-none shrink-0 sticky top-0">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 px-2 py-1">
          <img
            src="/logo_app.svg"
            alt="Kcal Logo"
            className="w-8 h-8 rounded-lg shadow-xs"
          />
          <span className="text-[18px] font-black text-[#071e49] tracking-tight">
            Kcal
          </span>
        </div>

        {/* Search Input with Functional Filtering & Clear Button */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari menu & fitur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-[13px] bg-white border border-[#e2e8f0] rounded-xl placeholder:text-[#94a3b8] text-[#071e49] focus:outline-none focus:border-[#1a73e8] transition-all"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#94a3b8] hover:text-[#071e49] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-[#94a3b8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* Main Navigation List */}
        <nav className="space-y-1 pt-1">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectNav(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${isActive
                    ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                    : "text-[#475569] hover:bg-slate-50 hover:text-[#1a73e8]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {searchTerm && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] opacity-60" />
                )}
              </button>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-6 px-3 text-center text-[12px] text-[#94a3b8] bg-slate-50 rounded-xl border border-dashed border-[#e2e8f0]">
              Menu "{searchTerm}" tidak ditemukan
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
        <div className="space-y-1 text-[13px] text-[#475569]">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectNav(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all font-medium cursor-pointer ${isActive
                    ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                    : "hover:bg-slate-50 hover:text-[#1a73e8]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#1a73e8]" : "text-[#64748b]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
                ) : null}
              </button>
            );
          })}

          {/* Logout Button directly under Pengaturan */}
          <button
            onClick={() => {
              if (onLogoutClick) {
                onLogoutClick();
              } else {
                setIsLogoutConfirmOpen(true);
              }
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
            title="Keluar dari sesi akun saat ini"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* User Info Card */}
        <button
          onClick={() => setActiveNav("settings")}
          className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/30 transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="shrink-0">
            <div
              className="w-9 h-9 rounded-full text-white font-black text-[11px] flex items-center justify-center shadow-xs"
              style={{ backgroundColor: currentAdmin.avatarBg || "#1a73e8" }}
            >
              {currentAdmin.initials}
            </div>
          </div>

          <div className="flex-1 overflow-hidden truncate">
            <h4 className="text-[11px] font-bold text-[#071e49] truncate group-hover:text-[#1a73e8] transition-colors">
              {currentAdmin.name}
            </h4>
            <p className="text-[10px] text-[#64748b] truncate">
              {currentAdmin.regionLabel} • <span className="font-semibold text-[#1a73e8]">{currentAdmin.role === "Kabupaten" ? "Super Admin" : "Kecamatan"}</span>
            </p>
          </div>
        </button>
      </div>

      {/* ═══ MODAL KONFIRMASI KELUAR AKUN ═══ */}
      <LogoutModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        currentAdmin={currentAdmin}
      />
    </aside>
  );
};
