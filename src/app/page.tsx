"use client";

import React, { useState } from "react";
import { NuSantapSidebar, NavKey } from "@/components/layout/NuSantapSidebar";
import { NuSantapHeader } from "@/components/layout/NuSantapHeader";
import { ScanResultsView } from "@/components/features/scan-results/ScanResultsView";
import { PrevalenceMapView } from "@/components/dashboard/PrevalenceMapView";
import { MenuPlannerAI } from "@/components/features/menu-planner/MenuPlannerAI";
import { RAGKnowledgeBaseView } from "@/components/features/rag-database/RAGKnowledgeBaseView";
import { CommodityMarketView } from "@/components/dashboard/CommodityMarketView";
import { AdminSwitchModal } from "@/components/features/modals/AdminSwitchModal";
import { ScreeningSimModal } from "@/components/features/modals/ScreeningSimModal";
import { AIChatbotModal } from "@/components/features/modals/AIChatbotModal";
import { ExportReportModal } from "@/components/dashboard/ExportReportModal";
import { useDashboardState } from "@/hooks/useDashboardState";
import { ADMIN_PROFILES, AdminProfile } from "@/data/admin-profiles";

export default function DashboardPage() {
  const {
    selectedDistrictId,
    setSelectedDistrictId,
    selectedDistrict,
    isChatOpen,
    setIsChatOpen,
    isScreeningOpen,
    setIsScreeningOpen,
    isExportOpen,
    setIsExportOpen,
  } = useDashboardState();

  const [activeNav, setActiveNav] = useState<NavKey>("scan");
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile>(ADMIN_PROFILES[0]);
  const [isAdminSwitchOpen, setIsAdminSwitchOpen] = useState(false);

  const handleAdminSelect = (admin: AdminProfile) => {
    setCurrentAdmin(admin);
    if (admin.districtId !== "all") {
      setSelectedDistrictId(admin.districtId);
    }
  };

  // IF RAG DATABASE IS ACTIVE: RENDER IN 100% FULLSCREEN (NO SIDEBAR / NO DEFAULT HEADER)
  if (activeNav === "rag_db") {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#071e49] selection:bg-[#dbeafe] selection:text-[#1a73e8]">
        <RAGKnowledgeBaseView onBackToDashboard={() => setActiveNav("scan")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#071e49] flex selection:bg-[#dbeafe] selection:text-[#1a73e8]">
      {/* 1. Left Sidebar */}
      <NuSantapSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenScreening={() => setIsScreeningOpen(true)}
        currentAdmin={currentAdmin}
        onOpenAdminSwitch={() => setIsAdminSwitchOpen(true)}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Top Greeting & Download PDF button */}
        <NuSantapHeader
          regionName={currentAdmin.regionLabel}
          onDownloadPDF={() => setIsExportOpen(true)}
        />

        {/* Dynamic Navigation Content */}
        <div className="mt-4">
          {activeNav === "scan" && (
            <ScanResultsView
              selectedDistrictId={selectedDistrictId}
              setSelectedDistrictId={setSelectedDistrictId}
            />
          )}

          {activeNav === "generate" && (
            <MenuPlannerAI selectedDistrict={selectedDistrictId} />
          )}

          {activeNav === "map" && (
            <PrevalenceMapView
              selectedDistrict={selectedDistrictId}
              onSelectDistrict={setSelectedDistrictId}
            />
          )}

          {activeNav === "market" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h1 className="text-[24px] font-black text-[#071e49] tracking-tight">
                  Komoditas Pangan
                </h1>
                <span className="text-[12px] text-[#64748b]">
                  Monitoring Harga Pasar & Ketersediaan Komoditas Gresik
                </span>
              </div>
              <CommodityMarketView />
            </div>
          )}
        </div>
      </main>

      {/* Admin Switcher Modal */}
      <AdminSwitchModal
        isOpen={isAdminSwitchOpen}
        onClose={() => setIsAdminSwitchOpen(false)}
        currentAdmin={currentAdmin}
        onSelectAdmin={handleAdminSelect}
      />

      {/* Interactive Modals */}
      <ScreeningSimModal
        isOpen={isScreeningOpen}
        onClose={() => setIsScreeningOpen(false)}
      />

      <AIChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedDistrict={selectedDistrictId}
      />
    </div>
  );
}
