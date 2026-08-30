"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Shield,
  KeyRound,
  Trash2,
  Edit2,
  Plus,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Building2,
  Clock,
  Laptop,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  History,
  X,
  Sparkles,
  Smartphone,
  LogOut
} from "lucide-react";
import { KcalUser, UserRole } from "@/types/auth";
import {
  fetchAllUsersFromFirestore,
  createKcalUser,
  updateKcalUser,
  deleteKcalUser,
  fetchSessionLogs,
  clearAllSessionLogs,
  revokeSessionLog,
  UserSessionLog,
  DEFAULT_FALLBACK_USERS
} from "@/services/auth-service";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";

export const UserManagementView: React.FC = () => {
  const { user: activeAuthUser } = useAuth();
  const isSuperAdmin = activeAuthUser?.role === "super_admin";

  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [users, setUsers] = useState<KcalUser[]>(DEFAULT_FALLBACK_USERS);
  const [logs, setLogs] = useState<UserSessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logRoleFilter, setLogRoleFilter] = useState<string>("all");
  const [logStatusFilter, setLogStatusFilter] = useState<string>("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [editingUser, setEditingUser] = useState<KcalUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<KcalUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<KcalUser | null>(null);
  const [viewingLog, setViewingLog] = useState<UserSessionLog | null>(null);

  // Form states for Create User
  const [createForm, setCreateForm] = useState<Omit<KcalUser, "id" | "createdAt">>({
    name: "",
    email: "",
    password: "password123",
    pin: "69hagh0d",
    role: "admin_kecamatan" as UserRole,
    districtId: "kebomas",
    regionLabel: "Kec. Kebomas",
    initials: "AK",
    avatarBg: "#35CBC3",
    isPinConfigured: true,
  });

  // Form states for Change Password / PIN Modal
  const [newPassword, setNewPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        fetchAllUsersFromFirestore(),
        fetchSessionLogs(),
      ]);
      setUsers(usersData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to load user management data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.regionLabel.toLowerCase().includes(q)
      );
    });
  }, [users, roleFilter, searchQuery]);

  // Filtered Session Logs (Including Citizen / Masyarakat logs, Active, Closed, and Revoked)
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (logRoleFilter !== "all" && l.role !== logRoleFilter) return false;
      if (logStatusFilter !== "all") {
        if (logStatusFilter === "active" && l.status !== "active") return false;
        if (logStatusFilter === "closed" && l.status !== "closed") return false;
        if (logStatusFilter === "revoked" && l.status !== "revoked") return false;
      }
      if (!logSearchQuery.trim()) return true;
      const q = logSearchQuery.toLowerCase();
      return (
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.districtLabel && l.districtLabel.toLowerCase().includes(q)) ||
        (l.userAgent && l.userAgent.toLowerCase().includes(q))
      );
    });
  }, [logs, logRoleFilter, logStatusFilter, logSearchQuery]);

  // Statistics
  const totalUsers = users.length;
  const superAdminCount = users.filter((u) => u.role === "super_admin").length;
  const kecamatanCount = users.filter((u) => u.role === "admin_kecamatan").length;

  const totalLogs = logs.length;
  const activeLogsCount = logs.filter((l) => l.status === "active").length;
  const closedLogsCount = logs.filter((l) => l.status === "closed" || l.status === "revoked").length;
  const masyarakatLogsCount = logs.filter((l) => l.role === "masyarakat").length;
  const superAdminLogsCount = logs.filter((l) => l.role === "super_admin").length;
  const kecamatanLogsCount = logs.filter((l) => l.role === "admin_kecamatan").length;

  // Handle Create User Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) return;

    setIsSaving(true);
    const res = await createKcalUser(createForm);
    setIsSaving(false);

    if (res.success) {
      showToast(`✓ Akun "${createForm.name}" berhasil dibuat & disinkronkan ke Cloud Firestore!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        password: "password123",
        pin: "69hagh0d",
        role: "admin_kecamatan",
        districtId: "kebomas",
        regionLabel: "Kec. Kebomas",
        initials: "AK",
        avatarBg: "#35CBC3",
        isPinConfigured: true,
      });
      loadData();
    } else {
      showToast(res.error || "Gagal membuat akun.");
    }
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    const res = await updateKcalUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      districtId: editingUser.districtId,
      regionLabel: editingUser.regionLabel,
    });
    setIsSaving(false);

    if (res.success) {
      showToast(`✓ Data akun "${editingUser.name}" berhasil diperbarui!`);
      setEditingUser(null);
      loadData();
    } else {
      showToast(res.error || "Gagal memperbarui akun.");
    }
  };

  // Handle Change Password / PIN Bypass Submit
  const handlePasswordPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    const updates: Partial<KcalUser> = {};
    if (newPassword.trim()) updates.password = newPassword.trim();
    if (newPin.trim()) updates.pin = newPin.trim();

    if (Object.keys(updates).length === 0) {
      showToast("Harap isi Password baru atau PIN 8 Digit baru.");
      return;
    }

    setIsSaving(true);
    const res = await updateKcalUser(passwordModalUser.id, updates);
    setIsSaving(false);

    if (res.success) {
      showToast(`✓ Kredensial akun "${passwordModalUser.name}" berhasil diperbarui!`);
      setPasswordModalUser(null);
      setNewPassword("");
      setNewPin("");
      loadData();
    } else {
      showToast(res.error || "Gagal memperbarui kredensial.");
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsSaving(true);
    const res = await deleteKcalUser(deletingUser.id);
    setIsSaving(false);

    if (res.success) {
      showToast(`✓ Akun "${deletingUser.name}" telah dihapus dari basis data.`);
      setDeletingUser(null);
      loadData();
    } else {
      showToast(res.error || "Gagal menghapus akun.");
    }
  };

  // Handle Clear Session Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Apakah Anda yakin ingin membersihkan semua riwayat log sesi?")) return;
    setIsSaving(true);
    await clearAllSessionLogs();
    setIsSaving(false);
    setLogs([]);
    showToast("✓ Seluruh riwayat log sesi berhasil dibersihkan.");
  };

  // Handle Force Logout Session by Super Admin
  const handleForceLogout = async (log: UserSessionLog) => {
    const roleTitle =
      log.role === "masyarakat"
        ? "Warga Masyarakat"
        : log.role === "super_admin"
        ? "Super Admin"
        : "Admin Kecamatan";

    if (
      !window.confirm(
        `Apakah Anda yakin ingin MEMUTUS PAKSA sesi ${roleTitle} atas nama "${log.name}" (${log.email})?\n\nPengguna akan seketika dikeluarkan dari akun dan dialihkan kembali ke Splash Screen.`
      )
    ) {
      return;
    }

    setIsSaving(true);
    const res = await revokeSessionLog(log.id);
    setIsSaving(false);

    if (res.success) {
      showToast(`✓ Sesi ${roleTitle} "${log.name}" berhasil diputus paksa!`);
      setLogs((prev) =>
        prev.map((item) =>
          item.id === log.id
            ? { ...item, status: "revoked", revokedAt: new Date().toISOString(), revokedBy: "Super Admin" }
            : item
        )
      );
    } else {
      showToast("Gagal memutus sesi pengguna.");
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm space-y-3">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-[18px] font-bold text-[#2C3968]">Akses Dibatasi Khusus Super Admin</h2>
        <p className="text-[12px] text-[#64748b]">
          Menu Manajemen Pengguna hanya dapat diakses oleh akun Administrator Utama (Super Admin Kabupaten Gresik).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white font-bold text-[13px] shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header (Standardized with Notifications & Help) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#2C3968] tracking-tight">
              Manajemen Pengguna & Hak Akses
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-green-tint text-ford-blue text-[11px] font-bold border border-blue-200">
              {totalUsers} Akun Resmi
            </span>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Kelola {totalUsers} akun resmi ({superAdminCount} Super Admin & {kecamatanCount} Admin Kecamatan), ubah PIN bypass, reset password, dan pantau log sesi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#2C3968] text-[12px] font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-light-sea-green" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[12px] font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Compact Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "users"
                ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                : "bg-white border border-[#cbd5e1] text-slate-600 hover:text-[#2C3968]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Akun Pengguna ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "logs"
                ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold shadow-xs"
                : "bg-white border border-[#cbd5e1] text-slate-600 hover:text-[#2C3968]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log Sesi & Aktivitas ({logs.length})</span>
            {masyarakatLogsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                {masyarakatLogsCount} Warga
              </span>
            )}
          </button>
        </div>

        {/* Compact Stat Badge */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748b] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
          <span className="text-[#2C3968]">{superAdminCount} Super Admin</span>
          <span>•</span>
          <span className="text-[#2C3968]">{kecamatanCount} Admin Kecamatan</span>
          <span>•</span>
          <span className="text-emerald-700">{masyarakatLogsCount} Sesi Warga</span>
        </div>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {/* Compact Search and Role Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#f8fafc] p-2.5 rounded-2xl border border-[#e2e8f0]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, atau kecamatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#35CBC3] shadow-2xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-xl bg-white border border-[#cbd5e1] text-[#2C3968] text-[12px] font-bold focus:outline-none focus:border-[#35CBC3] shadow-2xs cursor-pointer"
              >
                <option value="all">Semua Role ({users.length})</option>
                <option value="super_admin">Super Admin ({superAdminCount})</option>
                <option value="admin_kecamatan">Admin Kecamatan ({kecamatanCount})</option>
              </select>
            </div>
          </div>

          {/* RAG-Styled Spreadsheet Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-[12px] border-collapse bg-white">
              <thead className="sticky top-0 z-10 shadow-xs">
                <tr className="bg-ford-blue text-white font-bold divide-x divide-white/10 select-none">
                  <th className="py-3 px-3 w-10 text-center text-white">No</th>
                  <th className="py-3 px-4 font-bold text-white">Nama Pengguna</th>
                  <th className="py-3 px-4 font-bold text-white">Email Akun</th>
                  <th className="py-3 px-3.5 font-bold text-center w-36 text-white">Role Akses</th>
                  <th className="py-3 px-4 font-bold text-white">Wilayah Tugas</th>
                  <th className="py-3 px-3.5 font-bold text-center w-28 text-white">PIN Bypass</th>
                  <th className="py-3 px-3 text-center w-28 font-bold text-white">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, rIdx) => (
                    <tr key={rIdx} className="divide-x divide-slate-100 animate-pulse">
                      <td className="py-2.5 px-3 text-center bg-slate-50/50">
                        <Skeleton className="h-4 w-4 mx-auto" />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <Skeleton className="h-3.5 w-40" />
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <Skeleton className="h-5 w-24 rounded-full mx-auto" />
                      </td>
                      <td className="py-2.5 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <Skeleton className="h-5 w-20 rounded mx-auto" />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Skeleton className="w-6 h-6 rounded-lg" />
                          <Skeleton className="w-6 h-6 rounded-lg" />
                          <Skeleton className="w-6 h-6 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748b]">
                      Tidak ditemukan pengguna yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-slate-50 divide-x divide-slate-100 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-blue-gray bg-slate-50/50">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg text-ford-blue font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: u.avatarBg || "#E6FAF2" }}
                          >
                            {u.initials || u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-ford-blue text-[12px]">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11.5px] text-ford-blue font-bold">
                        {u.email}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.role === "super_admin"
                              ? "bg-green-tint text-ford-blue border-green-02/40"
                              : "bg-blue-50 text-brand-blue border-brand-blue/30"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role === "super_admin" ? "Super Admin" : "Kecamatan"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-ford-blue font-medium text-[12px]">
                        {u.regionLabel}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <code className="px-2 py-0.5 bg-slate-100 rounded text-ford-blue font-mono text-[11px] font-bold border border-slate-200">
                          {u.pin || "69hagh0d"}
                        </code>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-sans">
                          {/* Change Password & PIN */}
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewPassword("");
                              setNewPin("");
                            }}
                            className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer hover:scale-105"
                            title="Ubah Password & PIN Bypass"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User Info */}
                          <button
                            onClick={() => setEditingUser(u)}
                            className="w-7 h-7 rounded-lg bg-green-tint hover:bg-green-02/30 text-ford-blue border border-green-02/30 flex items-center justify-center transition-all shadow-2xs cursor-pointer hover:scale-105"
                            title="Edit Data Pengguna"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-brand-red border border-brand-red/30 flex items-center justify-center transition-all shadow-2xs cursor-pointer hover:scale-105"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SESSION LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-bold text-[#2C3968]">Audit & Kontrol Sesi Pengguna Real-Time</h3>
                <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10.5px] font-bold rounded-full border border-emerald-200">
                  {activeLogsCount} Sesi Aktif
                </span>
                {closedLogsCount > 0 && (
                  <span className="px-2 py-0.2 bg-slate-200 text-slate-600 text-[10.5px] font-bold rounded-full">
                    {closedLogsCount} Logout/Diputus
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-[#64748b]">
                Pantau seluruh sesi masuk/keluar (Pemerintah & Masyarakat) serta gunakan tombol <strong>Paksa Logout</strong> untuk memutus sesi seketika.
              </p>
            </div>
            <button
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 shrink-0 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          </div>

          {/* Search, Role, and Status Filter for Logs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#f8fafc] p-2.5 rounded-2xl border border-[#e2e8f0]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, kecamatan, atau perangkat..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#cbd5e1] text-[12px] focus:outline-none focus:border-[#35CBC3] shadow-2xs font-medium"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={logRoleFilter}
                onChange={(e) => setLogRoleFilter(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-xl bg-white border border-[#cbd5e1] text-[#2C3968] text-[12px] font-bold focus:outline-none focus:border-[#35CBC3] shadow-2xs cursor-pointer"
              >
                <option value="all">Semua Role Sesi ({totalLogs})</option>
                <option value="masyarakat">Masyarakat / Warga ({masyarakatLogsCount})</option>
                <option value="super_admin">Super Admin ({superAdminLogsCount})</option>
                <option value="admin_kecamatan">Admin Kecamatan ({kecamatanLogsCount})</option>
              </select>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-xl bg-white border border-[#cbd5e1] text-[#2C3968] text-[12px] font-bold focus:outline-none focus:border-[#35CBC3] shadow-2xs cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">● Hanya Sesi Aktif ({activeLogsCount})</option>
                <option value="closed">○ Telah Logout / Selesai</option>
                <option value="revoked">⛔ Diputus Super Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-[12px] border-collapse bg-white">
              <thead className="sticky top-0 z-10 shadow-xs">
                <tr className="bg-ford-blue text-white font-bold divide-x divide-white/10 select-none">
                  <th className="py-3 px-3 w-10 text-center text-white">No</th>
                  <th className="py-3 px-4 font-bold w-44 text-white">Waktu Sesi</th>
                  <th className="py-3 px-4 font-bold text-white">Nama & Email Pengguna</th>
                  <th className="py-3 px-4 font-bold text-white">Role & Wilayah</th>
                  <th className="py-3 px-4 font-bold text-white">Perangkat / Client</th>
                  <th className="py-3 px-3.5 text-center w-36 font-bold text-white">Status Sesi</th>
                  <th className="py-3 px-3 text-center w-32 font-bold text-white">Aksi Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748b]">
                      Belum ada riwayat sesi login yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const isCitizen = log.role === "masyarakat";
                    const isSuper = log.role === "super_admin";
                    const userAgentLower = (log.userAgent || "").toLowerCase();
                    const isMobileDevice =
                      userAgentLower.includes("mobile") ||
                      userAgentLower.includes("android") ||
                      userAgentLower.includes("iphone") ||
                      userAgentLower.includes("pwa");

                    const isActive = log.status === "active";
                    const isRevoked = log.status === "revoked";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 divide-x divide-slate-100 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 bg-slate-50/50">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap text-ford-blue text-[11.5px] font-medium">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-light-sea-green shrink-0" />
                              <span className="font-bold">{new Date(log.loginAt).toLocaleTimeString("id-ID")} WIB</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block pl-5">
                              {new Date(log.loginAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-lg text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs ${
                                isCitizen
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isSuper
                                  ? "bg-green-tint text-ford-blue"
                                  : "bg-blue-100 text-brand-blue"
                              }`}
                            >
                              {isCitizen ? "📱" : isSuper ? "SA" : "AK"}
                            </div>
                            <div>
                              <span className="font-bold text-ford-blue block text-[12px]">{log.name}</span>
                              <span className="font-mono text-[10.5px] text-slate-500 font-bold block">{log.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-0.5 ${
                              isCitizen
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isSuper
                                ? "bg-green-tint text-ford-blue border-green-02/40"
                                : "bg-blue-50 text-brand-blue border-brand-blue/30"
                            }`}
                          >
                            {isCitizen ? (
                              <Smartphone className="w-3 h-3" />
                            ) : isSuper ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                            <span>{isCitizen ? "Masyarakat (Warga)" : isSuper ? "Super Admin" : "Admin Kecamatan"}</span>
                          </span>
                          <span className="text-[10.5px] text-blue-gray font-medium block">
                            {log.districtLabel || "Kabupaten Gresik"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 max-w-xs text-[10.5px] text-blue-gray font-mono">
                          <div className="flex items-center gap-1.5">
                            {isMobileDevice ? (
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-ford-blue shrink-0" />
                            )}
                            <span className="truncate" title={log.userAgent || "Web Browser"}>
                              {isMobileDevice ? "PWA Mobile App" : log.userAgent || "Browser Web"}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-green-tint text-ford-blue border border-green-02/40 shadow-2xs">
                              ● Sesi Aktif
                            </span>
                          ) : isRevoked ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-red-50 text-brand-red border border-brand-red/30">
                                ⛔ Diputus Super Admin
                              </span>
                              {log.revokedAt && (
                                <span className="text-[9px] text-slate-400 block">
                                  {new Date(log.revokedAt).toLocaleTimeString("id-ID")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                ○ Telah Logout
                              </span>
                              {log.logoutAt && (
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  {new Date(log.logoutAt).toLocaleTimeString("id-ID")}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Detail Button (Eye) */}
                            <button
                              type="button"
                              onClick={() => setViewingLog(log)}
                              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue border border-brand-blue/30 flex items-center justify-center transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                              title="Lihat Detail Log Sesi & Informasi Perangkat"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Force Logout Button */}
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleForceLogout(log)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-brand-red border border-brand-red/30 font-bold text-[11px] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                title="Putus sesi dan paksa pengguna keluar ke Splash Screen"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>Putus</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium px-1 italic">
                                Selesai
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Modal 1: Create New User ═══ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[16px] font-bold text-[#2C3968] flex items-center gap-2">
                <Plus className="w-5 h-5 text-light-sea-green" />
                Tambah Pengguna Baru
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-[12px]">
              <div>
                <label className="block font-bold text-[#2C3968] mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Admin Kec. Kebomas"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C3968] mb-1">Alamat Email Resmi:</label>
                <input
                  type="email"
                  required
                  placeholder="kebomas@ginofest.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-mono text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C3968] mb-1">Role Akun:</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] bg-white cursor-pointer"
                  >
                    <option value="admin_kecamatan">Admin Kecamatan</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2C3968] mb-1">Wilayah Kecamatan:</label>
                  <select
                    value={createForm.districtId}
                    onChange={(e) => {
                      const dist = GRESIK_DISTRICTS.find(d => d.id === e.target.value);
                      setCreateForm({
                        ...createForm,
                        districtId: e.target.value,
                        regionLabel: dist ? `Kec. ${dist.name}` : "Kabupaten Gresik",
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] bg-white cursor-pointer"
                  >
                    <option value="all">Semua Kabupaten Gresik</option>
                    {GRESIK_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        Kec. {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-[#2C3968] mb-1">Password Default:</label>
                  <input
                    type="text"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-mono text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2C3968] mb-1">PIN Bypass 8 Digit:</label>
                  <input
                    type="text"
                    required
                    value={createForm.pin}
                    onChange={(e) => setCreateForm({ ...createForm, pin: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-mono text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Simpan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Modal 2: Edit User Profile ═══ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[16px] font-bold text-[#2C3968] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-light-sea-green" />
                Edit Profil Akun: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-[12px]">
              <div>
                <label className="block font-bold text-[#2C3968] mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C3968] mb-1">Email Resmi:</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-mono text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C3968] mb-1">Role Akun:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] bg-white cursor-pointer"
                  >
                    <option value="admin_kecamatan">Admin Kecamatan</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2C3968] mb-1">Wilayah Kecamatan:</label>
                  <select
                    value={editingUser.districtId}
                    onChange={(e) => {
                      const dist = GRESIK_DISTRICTS.find(d => d.id === e.target.value);
                      setEditingUser({
                        ...editingUser,
                        districtId: e.target.value,
                        regionLabel: dist ? `Kec. ${dist.name}` : "Kabupaten Gresik",
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-bold text-[#2C3968] focus:outline-none focus:border-[#35CBC3] bg-white cursor-pointer"
                  >
                    <option value="all">Semua Kabupaten Gresik</option>
                    {GRESIK_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        Kec. {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Perbarui Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Modal 3: Change Password & PIN Bypass ═══ */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[16px] font-bold text-[#2C3968] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                Ubah Password & PIN Bypass
              </h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800">
              Mengubah kredensial untuk: <strong>{passwordModalUser.name}</strong> ({passwordModalUser.email})
            </div>

            <form onSubmit={handlePasswordPinSubmit} className="space-y-3.5 text-[12px]">
              <div>
                <label className="block font-bold text-[#2C3968] mb-1">Password Baru:</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder={`Saat ini: ${passwordModalUser.password || "password123"}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2 rounded-xl border border-[#cbd5e1] font-mono text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C3968] mb-1">Kode PIN 8 Digit Bypass:</label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder={`Saat ini: ${passwordModalUser.pin || "69hagh0d"}`}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#cbd5e1] font-mono text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Simpan Kredensial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Modal 4: Delete User Confirmation ═══ */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-red-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-[16px] font-bold text-[#2C3968]">Hapus Akun Pengguna?</h3>
              <p className="text-[12px] text-[#64748b]">
                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong> ({deletingUser.email}) dari basis data Cloud Firestore?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer text-[12px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Ya, Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══ Modal 5: View Session Detail Modal ═══ */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#e2e8f0] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#2C3968]">Detail Audit Log Sesi</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {viewingLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLog(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl text-[14px] font-black flex items-center justify-center shrink-0 shadow-xs ${
                    viewingLog.role === "masyarakat"
                      ? "bg-emerald-100 text-emerald-800"
                      : viewingLog.role === "super_admin"
                      ? "bg-green-tint text-ford-blue"
                      : "bg-blue-100 text-brand-blue"
                  }`}
                >
                  {viewingLog.role === "masyarakat" ? "📱" : viewingLog.role === "super_admin" ? "SA" : "AK"}
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-ford-blue">{viewingLog.name}</h4>
                  <p className="text-[11.5px] font-mono text-slate-500 font-bold">{viewingLog.email}</p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                    viewingLog.role === "masyarakat"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : viewingLog.role === "super_admin"
                      ? "bg-green-tint text-ford-blue border-green-02/40"
                      : "bg-blue-50 text-brand-blue border-brand-blue/30"
                  }`}
                >
                  {viewingLog.role === "masyarakat" ? (
                    <Smartphone className="w-3 h-3" />
                  ) : viewingLog.role === "super_admin" ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <Building2 className="w-3 h-3" />
                  )}
                  <span>
                    {viewingLog.role === "masyarakat"
                      ? "Masyarakat (Warga)"
                      : viewingLog.role === "super_admin"
                      ? "Super Admin"
                      : "Admin Kecamatan"}
                  </span>
                </span>
              </div>
            </div>

            {/* Session Metadata Grid */}
            <div className="space-y-3 text-[12px]">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Status Sesi:</span>
                  {viewingLog.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-emerald-600">
                      ● Sesi Sedang Aktif
                    </span>
                  ) : viewingLog.status === "revoked" ? (
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-red">
                      ⛔ Diputus Paksa Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-600">
                      ○ Selesai / Telah Logout
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Wilayah / Domisili:</span>
                  <span className="text-[12px] font-bold text-ford-blue block">
                    {viewingLog.districtLabel || "Kabupaten Gresik"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Waktu Mulai Masuk:</span>
                  <span className="text-[11.5px] font-bold text-ford-blue block">
                    {new Date(viewingLog.loginAt).toLocaleString("id-ID")} WIB
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 block mb-0.5">Waktu Berakhir:</span>
                  <span className="text-[11.5px] font-bold text-ford-blue block">
                    {viewingLog.logoutAt
                      ? `${new Date(viewingLog.logoutAt).toLocaleString("id-ID")} WIB`
                      : viewingLog.revokedAt
                      ? `${new Date(viewingLog.revokedAt).toLocaleString("id-ID")} WIB (Diputus)`
                      : "Masih Berlangsung"}
                  </span>
                </div>
              </div>

              {/* User Agent / Device Details */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-400">Informasi Klien / Perangkat:</span>
                  <span className="text-[10.5px] font-bold text-light-sea-green">
                    {(viewingLog.userAgent || "").toLowerCase().includes("mobile") ||
                    (viewingLog.userAgent || "").toLowerCase().includes("android") ||
                    (viewingLog.userAgent || "").toLowerCase().includes("iphone")
                      ? "📱 Mobile Device"
                      : "💻 Desktop / Web"}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10.5px] font-mono text-slate-600 break-all">
                  {viewingLog.userAgent || "Tidak ada metadata user agent."}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {viewingLog.status === "active" ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingLog;
                    setViewingLog(null);
                    handleForceLogout(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-brand-red border border-brand-red/30 font-bold text-[12px] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Paksa Logout Sesi Ini</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 italic">Sesi telah berakhir.</div>
              )}

              <button
                type="button"
                onClick={() => setViewingLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] font-bold text-[12px] transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
