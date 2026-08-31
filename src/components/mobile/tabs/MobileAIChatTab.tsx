"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const MobileAIChatTab: React.FC = () => {
  const samplePrompts = [
    "Ikan apa yang paling tinggi protein di Gresik untuk balita?",
    "Bagaimana cara mengatasi anak yang susah makan sayur?",
    "Berapa takaran MPASI untuk anak usia 12 bulan?",
  ];

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 animate-in fade-in duration-200">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-ford-blue">K-Bot Asisten Gizi AI</h3>
          <p className="text-[10px] text-blue-gray">Tanya seputar MPASI &amp; gizi pangan lokal Gresik</p>
        </div>
      </div>

      <div className="p-2.5 bg-green-tint/70 rounded-xl border border-green-02/30 text-[11.5px] text-ford-blue leading-relaxed">
        <span className="font-bold">Halo Bunda/Ayah! 🤖</span> Saya K-Bot. Konsultasikan kebutuhan nutrisi si kecil atau cari resep bergizi murah khas Gresik di sini.
      </div>

      <div className="space-y-1">
        {samplePrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => alert(`Pertanyaan: "${q}"\n\nJawaban K-Bot: Ikan Bandeng dan Kerapu Gresik memiliki kandungan asam lemak Omega-3 dan Protein tinggi 20g/100g yang sangat baik untuk kecerdasan otak balita.`)}
            className="w-full text-left p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[11px] text-ford-blue font-medium shadow-2xs hover:bg-green-tint/50 hover:border-green-02/40 transition-colors cursor-pointer"
          >
            💡 {q}
          </button>
        ))}
      </div>
    </div>
  );
};
