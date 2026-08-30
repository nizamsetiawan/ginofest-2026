"use client";

import React, { useState } from "react";
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  MapPin, 
  ChefHat, 
  LineChart, 
  Fish, 
  ScanLine, 
  FileText,
  Settings
} from "lucide-react";

interface SidebarProps {
  currentView: "districts" | "menu" | "map" | "commodities" | "trends";
  setCurrentView: (view: "districts" | "menu" | "map" | "commodities" | "trends") => void;
  onOpenScreening: () => void;
  onOpenExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  onOpenScreening,
  onOpenExport,
}) => {
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-white border-r border-[#e2e8f0] h-full flex flex-col justify-between transition-all duration-200 select-none ${
      isCollapsed ? "w-16" : "w-60"
    }`}>
      {/* Top Section */}
      <div className="overflow-y-auto flex-1 py-3">
        {/* Module Header Card (GreatDay style) */}
        <div className="px-4 pb-3 mb-2 border-b border-[#f1f5f9] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#eaf7e1] text-[#71aa42] flex items-center justify-center shrink-0 font-bold">
              <Users className="w-4 h-4 text-[#71aa42]" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h2 className="text-[13px] font-bold text-[#2C3968] truncate">
                  Data Siswa & Gizi
                </h2>
                <p className="text-[11px] text-[#a5b0b7] truncate">
                  Program MBG Gresik
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-[#a5b0b7] hover:text-[#2C3968] hover:bg-slate-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Section: Master Data */}
        <div className="px-2 space-y-0.5">
          <SidebarItem
            icon={<Users className="w-4 h-4" />}
            label="Daftar Wilayah & Siswa"
            isActive={currentView === "districts"}
            isCollapsed={isCollapsed}
            onClick={() => setCurrentView("districts")}
          />
          <SidebarItem
            icon={<MapPin className="w-4 h-4" />}
            label="Peta Spasial Stunting"
            isActive={currentView === "map"}
            isCollapsed={isCollapsed}
            onClick={() => setCurrentView("map")}
          />
        </div>

        {/* Section: Manajemen MBG (Collapsible Accordion) */}
        <div className="mt-4 pt-3 border-t border-[#f1f5f9] px-2">
          {!isCollapsed ? (
            <button
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-bold text-[#64748b] uppercase tracking-wider hover:text-[#2C3968]"
            >
              <span>Manajemen MBG</span>
              {isManagementOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-2" />
          )}

          {(isManagementOpen || isCollapsed) && (
            <div className="space-y-0.5 mt-1">
              <SidebarItem
                icon={<ChefHat className="w-4 h-4" />}
                label="Rencana Menu Mingguan"
                isActive={currentView === "menu"}
                isCollapsed={isCollapsed}
                onClick={() => setCurrentView("menu")}
              />
              <SidebarItem
                icon={<Fish className="w-4 h-4" />}
                label="Monitoring Komoditas"
                isActive={currentView === "commodities"}
                isCollapsed={isCollapsed}
                onClick={() => setCurrentView("commodities")}
              />
              <SidebarItem
                icon={<ScanLine className="w-4 h-4" />}
                label="Penapisan Tumbuh Kembang"
                isActive={false}
                isCollapsed={isCollapsed}
                onClick={onOpenScreening}
              />
            </div>
          )}
        </div>

        {/* Section: Laporan & Evaluasi */}
        <div className="mt-4 pt-3 border-t border-[#f1f5f9] px-2">
          {!isCollapsed ? (
            <button
              onClick={() => setIsReportOpen(!isReportOpen)}
              className="flex items-center justify-between w-full px-2 py-1 text-[11px] font-bold text-[#64748b] uppercase tracking-wider hover:text-[#2C3968]"
            >
              <span>Laporan & Evaluasi</span>
              {isReportOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-2" />
          )}

          {(isReportOpen || isCollapsed) && (
            <div className="space-y-0.5 mt-1">
              <SidebarItem
                icon={<LineChart className="w-4 h-4" />}
                label="Evaluasi Stunting & Fiskal"
                isActive={currentView === "trends"}
                isCollapsed={isCollapsed}
                onClick={() => setCurrentView("trends")}
              />
              <SidebarItem
                icon={<FileText className="w-4 h-4" />}
                label="Cetak Dokumen Resmi"
                isActive={false}
                isCollapsed={isCollapsed}
                onClick={onOpenExport}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
            <Settings className="w-3.5 h-3.5 text-[#d1b06c]" />
            <span>Versi MBG 2026</span>
          </div>
        ) : (
          <div className="flex justify-center text-[#d1b06c]">
            <Settings className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive,
  isCollapsed,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
        isActive
          ? "bg-[#fff8f0] text-[#2C3968] font-black border-l-4 border-[#2C3968] shadow-xs"
          : "text-[#475569] hover:bg-slate-100 hover:text-[#2C3968]"
      } ${isCollapsed ? "justify-center px-0" : ""}`}
    >
      <span className={isActive ? "text-[#2C3968]" : "text-[#64748b]"}>{icon}</span>
      {!isCollapsed && <span className="truncate flex-1 text-left">{label}</span>}
    </button>
  );
};
