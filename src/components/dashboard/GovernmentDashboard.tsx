"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NuSantapSidebar, NavKey } from "@/components/layout/NuSantapSidebar";
import { NuSantapHeader } from "@/components/layout/NuSantapHeader";
import { ScanResultsView } from "@/components/features/scan-results/ScanResultsView";
import { PrevalenceMapView } from "@/components/dashboard/PrevalenceMapView";
import { MenuPlannerAI } from "@/components/features/menu-planner/MenuPlannerAI";
import { RAGKnowledgeBaseView } from "@/components/features/rag-database/RAGKnowledgeBaseView";
import { ScreeningView } from "@/components/features/screening/ScreeningView";
import { NotificationsView } from "@/components/features/notifications/NotificationsView";
import { HelpView } from "@/components/features/help/HelpView";
import { UserManagementView } from "@/components/features/users/UserManagementView";
import { ComplaintCenterView } from "@/components/features/complaints/ComplaintCenterView";
import { BackupSnapshotView } from "@/components/features/backup/BackupSnapshotView";
import { LiveScanLogsView } from "@/components/features/telemetry/LiveScanLogsView";
import { SettingsView } from "@/components/features/settings/SettingsView";
import { AdminSwitchModal } from "@/components/features/modals/AdminSwitchModal";
import { AIChatbotModal } from "@/components/features/modals/AIChatbotModal";
import { ExportReportModal } from "@/components/dashboard/ExportReportModal";
import { LoginView } from "@/components/auth/LoginView";
import { SetupPinModal } from "@/components/auth/SetupPinModal";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_PROFILES, AdminProfile } from "@/data/admin-profiles";
import { fetchNotifications } from "@/services/firebase-service";
import { DashboardAppSkeleton } from "@/components/ui/Skeleton";
import { LogoutModal } from "@/components/layout/LogoutModal";

export const GovernmentDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, isSetupPinOpen, setIsSetupPinOpen } = useAuth();

  const {
    selectedDistrictId,
    setSelectedDistrictId,
    selectedDistrict,
    isChatOpen,
    setIsChatOpen,
    isExportOpen,
    setIsExportOpen,
  } = useDashboardState();

  const [activeNav, setActiveNav] = useState<NavKey>("scan");
  const [isAdminSwitchOpen, setIsAdminSwitchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Sync selectedDistrictId based on logged in user role
  useEffect(() => {
    if (user) {
      if (user.role === "admin_kecamatan" && user.districtId !== "all") {
        setSelectedDistrictId(user.districtId);
      }
    }
  }, [user, setSelectedDistrictId]);

  // Fetch unread notifications count
  useEffect(() => {
    async function loadNotifs() {
      try {
        const notifs = await fetchNotifications();
        if (notifs.success && notifs.data) {
          const unread = notifs.data.filter((n) => !n.isRead).length;
          setUnreadNotifCount(unread);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (isAuthenticated) loadNotifs();
  }, [activeNav, isAuthenticated]);

  const currentAdmin = useMemo(() => {
    if (user?.role === "super_admin") {
      return ADMIN_PROFILES[0];
    }
    const found = ADMIN_PROFILES.find((a) => a.id === user?.districtId || a.districtId === user?.districtId);
    if (found) return found;
    return {
      id: user?.districtId || "admin",
      name: user?.name || "Admin Kecamatan",
      role: "Kecamatan" as const,
      regionLabel: user?.regionLabel || "Kecamatan",
      districtId: user?.districtId || "all",
      initials: (user?.name || "AK").slice(0, 2).toUpperCase(),
      email: user?.email || "admin@gresik.go.id",
      avatarBg: "#35CBC3",
      stats: { totalChildren: 0, stuntingCases: 0, targetSchools: 0, coveragePct: 0 }
    };
  }, [user]);

  const handleAdminSelect = (admin: AdminProfile) => {
    if (admin.role === "Kabupaten") {
      setSelectedDistrictId("all");
    } else {
      if (admin.districtId) {
        setSelectedDistrictId(admin.districtId);
      }
    }
  };

  // 1. Loading State (Modern Dashboard Skeleton Screen)
  if (isLoading) {
    return <DashboardAppSkeleton />;
  }

  // 2. Unauthenticated State -> Show Login View
  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  // 3. IF RAG DATABASE IS ACTIVE: RENDER IN FULLSCREEN
  if (activeNav === "rag_db") {
    return (
      <div className="h-screen w-full overflow-y-auto bg-[#F8FAFC] text-ford-blue selection:bg-green-02/30 selection:text-ford-blue font-sans">
        <RAGKnowledgeBaseView onBackToDashboard={() => setActiveNav("scan")} />
        <SetupPinModal isOpen={isSetupPinOpen} onClose={() => setIsSetupPinOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-ford-blue flex selection:bg-green-02/30 selection:text-ford-blue font-sans">
      {/* 1. Left Sidebar */}
      <NuSantapSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        currentAdmin={currentAdmin}
        unreadNotifCount={unreadNotifCount}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Top Greeting (Only visible on main analytical dashboard pages) */}
        {!["notifications", "help", "users", "complaints", "backup", "settings"].includes(activeNav) && (
          <NuSantapHeader
            adminName={user.name}
            regionName={user.regionLabel}
          />
        )}

        {/* Dynamic Navigation Content */}
        <div className={!["notifications", "help", "users", "complaints", "backup", "settings"].includes(activeNav) ? "mt-4" : ""}>
          {activeNav === "scan" && (
            <ScanResultsView
              selectedDistrictId={selectedDistrictId}
              setSelectedDistrictId={setSelectedDistrictId}
            />
          )}

          {activeNav === "generate" && (
            <MenuPlannerAI selectedDistrict={selectedDistrictId} />
          )}

          {activeNav === "telemetry_logs" && (
            <LiveScanLogsView />
          )}

          {activeNav === "map" && (
            <PrevalenceMapView
              selectedDistrict={selectedDistrictId}
              onSelectDistrict={setSelectedDistrictId}
            />
          )}

          {activeNav === "qrcode" && (
            <ScreeningView />
          )}

          {activeNav === "notifications" && (
            <NotificationsView />
          )}

          {activeNav === "help" && (
            <HelpView onOpenChat={() => setIsChatOpen(true)} />
          )}

          {activeNav === "users" && (
            <UserManagementView />
          )}

          {activeNav === "complaints" && (
            <ComplaintCenterView />
          )}

          {activeNav === "backup" && (
            <BackupSnapshotView />
          )}

          {activeNav === "settings" && (
            <SettingsView
              currentAdmin={currentAdmin}
              onOpenAdminSwitch={() => setIsAdminSwitchOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Admin Switcher Modal (Only for Super Admin) */}
      {user.role === "super_admin" && (
        <AdminSwitchModal
          isOpen={isAdminSwitchOpen}
          onClose={() => setIsAdminSwitchOpen(false)}
          onNavigateToUserManagement={() => {
            setIsAdminSwitchOpen(false);
            setActiveNav("users");
          }}
        />
      )}

      {/* Setup PIN Modal for First Time Setup */}
      <SetupPinModal
        isOpen={isSetupPinOpen}
        onClose={() => setIsSetupPinOpen(false)}
      />

      {/* Interactive Modals */}
      <AIChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedDistrict={selectedDistrictId}
      />

      {/* Global Root Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        currentAdmin={currentAdmin}
      />
    </div>
  );
};
