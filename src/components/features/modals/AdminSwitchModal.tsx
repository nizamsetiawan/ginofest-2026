"use client";

import React, { useState } from "react";
import { ADMIN_PROFILES, AdminProfile } from "@/data/admin-profiles";
import { ArrowLeftRight, Plus, Edit, Check, X } from "lucide-react";

interface AdminSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: AdminProfile;
  onSelectAdmin: (admin: AdminProfile) => void;
}

export const AdminSwitchModal: React.FC<AdminSwitchModalProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onSelectAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2 text-[#071e49]">
            <div className="w-7 h-7 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center">
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[16px] font-black tracking-tight">
              Ganti Profil Admin
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#94a3b8] hover:text-[#071e49] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {ADMIN_PROFILES.map((admin) => {
            const isSelected = currentAdmin.id === admin.id;

            return (
              <button
                key={admin.id}
                onClick={() => {
                  onSelectAdmin(admin);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? "bg-white border-2 border-[#1a73e8] shadow-sm ring-2 ring-[#1a73e8]/15"
                    : "bg-white border border-[#e2e8f0] hover:border-[#1a73e8] hover:bg-[#e8f0fe]/30"
                }`}
              >
                {/* Avatar with Initials in Blue */}
                <div className="w-11 h-11 rounded-full bg-[#1a73e8] text-white font-black text-[13px] flex items-center justify-center shrink-0 shadow-xs">
                  {admin.initials}
                </div>

                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[13px] font-bold text-[#071e49] truncate">
                      {admin.name} <span className="font-normal text-[#64748b]">({admin.regionLabel})</span>
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                    {admin.email}
                  </p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#f1f5f9]">
          <button
            onClick={() => alert("Fitur integrasi SSO Dinkes Gresik")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#155fc0] text-white text-[12px] font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Profil</span>
          </button>

          <button
            onClick={() => alert("Pengaturan akun admin")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#071e49] hover:bg-[#0d2a63] text-white text-[12px] font-bold shadow-xs transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
