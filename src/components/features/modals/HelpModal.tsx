"use client";

import React, { useState } from "react";
import { HelpCircle, X, ChevronDown, ChevronUp, Bot, ExternalLink, Mail, Phone, BookOpen } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Bagaimana cara kerja AI Generator Menu MBG?",
    answer: "AI memanfaatkan penalaran RAG (Retrieval-Augmented Generation) berbasis Google Gemini 1.5 Flash yang mengombinasikan 4 master dataset: komoditas lokal per kecamatan, harga pasar harian SISKAPERBAPO, standar formula 5 Bintang Kemenkes, dan data nilai gizi laboratorium TKPI 2019.",
  },
  {
    question: "Dari mana data harga pangan dan zat gizi diperoleh?",
    answer: "Data harga pangan bersumber langsung dari sistem pemantauan harga pasar Jawa Timur (SISKAPERBAPO Gresik), sedangkan data gizi pangan terintegrasi dengan Tabel Komposisi Pangan Indonesia (TKPI 2019) resmi Kementerian Kesehatan RI.",
  },
  {
    question: "Bagaimana cara melakukan screening balita & scan QR Code?",
    answer: "Gunakan menu 'Scan QR Code' pada sidebar navigasi untuk mensimulasikan pemindaian data antropometri digital balita dari posyandu/puskesmas untuk deteksi dini risiko stunting dan gizi buruk.",
  },
  {
    question: "Apakah hasil rancangan menu bulanan tersimpan otomatis?",
    answer: "Ya, setelah menu selesai di-generate, seluruh jadwal mingguan dan kalkulasi kebutuhan bahan pokok (BOM) otomatis tersimpan ke Cloud Firestore sehingga dapat diakses kapan saja dan diunduh dalam format Excel (.XLS).",
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onOpenChat }) => {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const toggleFAQ = (idx: number) => {
    setOpenFAQIndex(openFAQIndex === idx ? null : idx);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-[#cbd5e1] space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-[#2C3968]">Pusat Bantuan & Panduan</h3>
              <p className="text-[11px] text-[#64748b]">
                Panduan operasional sistem Kcal dan AI Makan Bergizi Gratis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Assistant Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-[#2C3968]">Butuh bantuan interaktif cepat?</h4>
              <p className="text-[11px] text-[#64748b]">Tanyakan apa saja kepada Asisten AI Kcal</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue text-[11px] font-bold transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Tanya AI
          </button>
        </div>

        {/* FAQ Accordion */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <h4 className="text-[12px] font-bold text-[#2C3968] flex items-center gap-1.5 pt-1">
            <BookOpen className="w-4 h-4 text-light-sea-green" />
            <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
          </h4>

          <div className="space-y-2 pt-1">
            {FAQS.map((faq, idx) => {
              const isOpen = openFAQIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 font-bold text-[12px] text-[#2C3968] hover:text-light-sea-green transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-light-sea-green shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-[11px] text-[#64748b] leading-relaxed border-t border-slate-200/60 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Support */}
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-[#64748b] space-y-1.5">
            <p className="font-bold text-[#2C3968]">Helpdesk Teknis Dinas Kesehatan Kab. Gresik:</p>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-light-sea-green" />
                <span>dinkes@gresikkab.go.id</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>(031) 3981234 / SPGDT 119</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
