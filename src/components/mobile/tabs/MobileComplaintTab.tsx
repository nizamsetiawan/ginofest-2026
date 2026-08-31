"use client";

import React from "react";
import { MessageSquare, CheckCircle2 } from "lucide-react";

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
    <div className="space-y-3 animate-in fade-in duration-200">
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-ford-blue">Aduan &amp; Masukan Program MBG</h3>
            <p className="text-[10px] text-blue-gray">Langsung masuk ke Dashboard Super Admin</p>
          </div>
        </div>

        {submittedTicket ? (
          <div className="p-3 rounded-2xl bg-green-tint border border-green-02/40 text-center space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-green-02 mx-auto" />
            <h4 className="text-[12px] font-bold text-ford-blue">Laporan Terkirim!</h4>
            <p className="text-[10.5px] text-blue-gray">
              Nomor Tiket: <strong className="font-mono bg-white px-1.5 py-0.5 rounded text-ford-blue border border-green-02/30">{submittedTicket}</strong>
            </p>
            <button
              type="button"
              onClick={() => setSubmittedTicket(null)}
              className="mt-1 px-3 py-1 bg-green-02 text-ford-blue rounded-xl text-[10.5px] font-bold cursor-pointer"
            >
              Kirim Aduan Baru
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmitComplaint} className="space-y-2.5">
            <div>
              <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Kategori Aduan</label>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-bold text-ford-blue focus:outline-none"
              >
                <option value="Kualitas Menu MBG">Kualitas &amp; Rasa Makanan MBG</option>
                <option value="Ketepatan Waktu">Keterlambatan Pengiriman Menu</option>
                <option value="Porsi Makanan">Porsi Makanan Kurang Sesuai</option>
                <option value="Saran & Masukan">Saran &amp; Masukan</option>
              </select>
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-ford-blue block mb-0.5">Isi Keluhan</label>
              <textarea
                rows={3}
                placeholder="Tuliskan keluhan atau saran Anda..."
                value={complaintMessage}
                onChange={(e) => setComplaintMessage(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-[11.5px] font-medium text-ford-blue focus:outline-none focus:border-light-sea-green"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingComplaint}
              className="w-full py-2.5 bg-ford-blue text-white text-[12px] font-bold rounded-xl shadow-2xs hover:bg-ford-blue/90 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingComplaint ? "Mengirim Laporan..." : "Kirim Laporan Resmi"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
