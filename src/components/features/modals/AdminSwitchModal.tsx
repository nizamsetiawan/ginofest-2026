"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeftRight,
  Search,
  Check,
  X,
  Shield,
  Building2,
  Users,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { KcalUser } from "@/types/auth";
import {
  fetchAllUsersFromFirestore,
  DEFAULT_FALLBACK_USERS,
} from "@/services/auth-service";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";

interface AdminSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUserManagement?: () => void;
}

export const AdminSwitchModal: React.FC<AdminSwitchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToUserManagement,
}) => {
  const { user: activeUser, switchUser } = useAuth();
  const [users, setUsers] = useState<KcalUser[]>(DEFAULT_FALLBACK_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "super_admin" | "admin_kecamatan">("all");

  // Load latest users directly from Firestore on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadUsers() {
      setIsLoading(true);
      try {
        const firestoreUsers = await fetchAllUsersFromFirestore();
        if (isMounted && firestoreUsers && firestoreUsers.length > 0) {
          setUsers(firestoreUsers);
        }
      } catch (err) {
        console.warn("Gagal memuat pengguna dari Firestore:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filter users by search & role
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole =
        roleFilter === "all" ||
        (roleFilter === "super_admin" && u.role === "super_admin") ||
        (roleFilter === "admin_kecamatan" && u.role === "admin_kecamatan");

      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.regionLabel && u.regionLabel.toLowerCase().includes(q)) ||
        (u.districtId && u.districtId.toLowerCase().includes(q));

      return matchRole && matchQuery;
    });
  }, [users, searchQuery, roleFilter]);

  const superAdminCount = useMemo(() => users.filter((u) => u.role === "super_admin").length, [users]);
  const kecamatanCount = useMemo(() => users.filter((u) => u.role === "admin_kecamatan").length, [users]);

  if (!isOpen) return null;

  const handleSelectUser = (targetUser: KcalUser) => {
    switchUser(targetUser);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-200 cursor-default flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center shadow-2xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#2C3968] tracking-tight">
                Ganti Akun Pengguna
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Pilih akun resmi tersinkron Cloud Firestore untuk beralih sesi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-[#2C3968] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search + Filter Tabs */}
        <div className="space-y-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, email, atau kecamatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-[#cbd5e1] text-[12px] text-[#2C3968] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#35CBC3] transition-all font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === "all"
                  ? "bg-[#2C3968] text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("super_admin")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                roleFilter === "super_admin"
                  ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Super Admin ({superAdminCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin_kecamatan")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                roleFilter === "admin_kecamatan"
                  ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Kecamatan ({kecamatanCount})</span>
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 animate-pulse"
                >
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-[13px] font-bold text-[#2C3968]">
                Tidak ada akun yang sesuai pencarian
              </p>
              <p className="text-[11px] text-[#64748b]">
                Coba gunakan kata kunci pencarian atau filter yang berbeda
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isCurrent = activeUser?.id === u.id || activeUser?.email === u.email;
              const isSuper = u.role === "super_admin";

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    isCurrent
                      ? "bg-blue-50/70 border-[#35CBC3] shadow-xs ring-1 ring-[#35CBC3]/20"
                      : "bg-white border-[#e2e8f0] hover:border-light-sea-green hover:bg-slate-50/80"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl text-white font-black text-[12px] flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: u.avatarBg || (isSuper ? "#2C3968" : "#35CBC3") }}
                  >
                    {u.initials || u.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Account Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[13px] font-bold text-[#2C3968] truncate">
                        {u.name}
                      </h4>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-green-tint text-ford-blue text-[9px] font-extrabold uppercase shrink-0">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate">
                      {u.email}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <span>{u.regionLabel || "Kabupaten Gresik"}</span>
                      {u.districtId && u.districtId !== "all" && (
                        <span className="font-mono text-[9px] text-light-sea-green bg-blue-50 px-1 rounded">
                          {u.districtId}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Role Badge & Checkmark */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isSuper
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {isSuper ? <Shield className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      <span>{isSuper ? "Super Admin" : "Kecamatan"}</span>
                    </span>

                    {isCurrent && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 shrink-0">
          {onNavigateToUserManagement ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToUserManagement();
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-light-sea-green hover:underline cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Buka Kelola Pengguna</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium">
              Total {users.length} akun terdaftar di Firestore
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
