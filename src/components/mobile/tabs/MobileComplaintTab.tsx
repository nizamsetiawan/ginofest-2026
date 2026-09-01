"use client";

import React from "react";
import { MessageSquare, CheckCircle2, Send } from "lucide-react";
import { Page, Card, List, ListInput, Button, Badge } from "konsta/react";

interface MobileComplaintTabProps {
  complaintCategory: string;
  setComplaintCategory: (val: string) => void;
  complaintMessage: string;
  setComplaintMessage: (val: string) => void;
  isSubmittingComplaint: boolean;
  submittedTicket: string | null;
  setSubmittedTicket: (ticket: string | null) => void;
  onSubmitComplaint: (e: React.FormEvent) => void;
}

export const MobileComplaintTab: React.FC<MobileComplaintTabProps> = ({
  complaintCategory,
  setComplaintCategory,
  complaintMessage,
  setComplaintMessage,
  isSubmittingComplaint,
  submittedTicket,
  setSubmittedTicket,
  onSubmitComplaint,
}) => {
  return (
    <div className="space-y-3.5 font-sans pb-6 animate-in fade-in duration-200 select-none">
      <div className="glass-card p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-brand-orange flex items-center justify-center">
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-ford-blue">Aduan &amp; Masukan Program MBG</h3>
            <p className="text-[10px] text-blue-gray">Terhubung langsung ke Tim Satgas MBG Gresik</p>
          </div>
        </div>

        {submittedTicket ? (
          <div className="p-4 rounded-2xl bg-green-tint/80 border border-green-02/40 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-green-02 mx-auto" />
            <h4 className="text-[13px] font-black text-ford-blue">Laporan Berhasil Terkirim!</h4>
            <p className="text-[11px] text-blue-gray">
              Nomor Tiket: <strong className="font-mono bg-white px-2 py-0.5 rounded text-ford-blue border border-green-02/30">{submittedTicket}</strong>
            </p>
            <Button
              small
              rounded
              onClick={() => setSubmittedTicket(null)}
              className="mt-2 bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold text-[11px] cursor-pointer"
            >
              Kirim Aduan Baru
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmitComplaint} className="space-y-3">
            <List strongIos insetIos className="!m-0 space-y-2.5 !p-0">
              <div>
                <label className="text-[11px] font-bold text-ford-blue block mb-1">Kategori Aduan</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[12px] font-bold text-ford-blue focus:outline-none focus:border-light-sea-green transition-all"
                >
                  <option value="Kualitas Menu MBG">Kualitas &amp; Rasa Makanan MBG</option>
                  <option value="Ketepatan Waktu">Keterlambatan Pengiriman Menu</option>
                  <option value="Porsi Makanan">Porsi Makanan Kurang Sesuai</option>
                  <option value="Saran & Masukan">Saran &amp; Masukan</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ford-blue block mb-1">Isi Keluhan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan keluhan atau saran Anda secara rinci..."
                  value={complaintMessage}
                  onChange={(e) => setComplaintMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[12px] font-medium text-ford-blue focus:outline-none focus:border-light-sea-green transition-all"
                />
              </div>
            </List>

            <Button
              large
              rounded
              component="button"
              type="submit"
              disabled={isSubmittingComplaint}
              className="w-full py-3 bg-gradient-to-r from-green-02 via-light-sea-green to-teal-400 text-ford-blue font-black text-[12px] shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmittingComplaint ? "Mengirim Laporan..." : "Kirim Laporan Resmi"}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
