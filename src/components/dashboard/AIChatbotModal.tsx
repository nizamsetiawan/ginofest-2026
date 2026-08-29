"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Fish, 
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Halo! Saya Asisten AI Gizi GScan Pemkab Gresik. Ada yang bisa saya bantu terkait kebutuhan nutrisi MBG, potensi pangan lokal (Bandeng, Kupang, Udang), atau strategi penanganan stunting di wilayah Anda?",
      timestamp: "Sekarang",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    "Mengapa Kupang Sidayu sangat efektif mencegah stunting?",
    "Bagaimana mengolah Ikan Bandeng agar aman dikonsumsi anak balita?",
    "Menu hemat MBG Rp 12.000 dengan bahan pasar Gresik?",
    "Strategi intervensi stunting di wilayah Bawean?",
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      timestamp: "Baru saja",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Pertanyaan Anda sangat relevan untuk optimalisasi gizi daerah Gresik.";
      const lower = text.toLowerCase();

      if (lower.includes("kupang")) {
        reply = "Kupang Segar khas Sidayu & Pesisir Gresik memiliki kandungan Zat Besi (Fe) mencapai 15.6 mg per 100 gram—hampir 7 kali lipat lebih tinggi dibanding daging sapi biasa! Zat besi ini krusial mencegah anemia mikrositik dan menstimulasi produksi sel darah merah anak, menjadikannya 'superfood' lokal anti-stunting nomor satu di Gresik.";
      } else if (lower.includes("bandeng")) {
        reply = "Ikan Bandeng Gresik kaya akan Omega-3 (DHA & EPA) dan asam amino esensial. Untuk anak SD/balita, Pemkab Gresik merekomendasikan teknik 'Bandeng Cabut Duri' atau diolah menjadi bakso/nugget ikan tanpa pengawet agar aman dari duri halus tanpa mengurangi nilai gizinya.";
      } else if (lower.includes("bawean")) {
        reply = "Untuk Kepulauan Bawean (Kec. Sangkapura & Tambak), strategi optimal adalah memanfaatkan melimpahnya Ikan Tongkol/Cakalang segar dipadukan dengan Sayur Bening Daun Kelor (Moringa) yang tumbuh subur di pekarangan warga, memberikan asupan kalsium 380mg dan protein tinggi dengan biaya sangat terjangkau.";
      } else if (lower.includes("menu hemat") || lower.includes("12.000")) {
        reply = "Kombinasi Menu Optimal Rp 12.500/porsi: (1) Nasi Putih Pulen Cerme, (2) Bandeng Bakar Madu Manyar 60g, (3) Sayur Bening Bayam Jagung Hidroponik Kebomas, (4) Tempe Goreng Menganti, dan (5) Pisang Ambon Panceng. Total kalori 560 kcal & protein 28.5g (memenuhi standar AKG Kemenkes).";
      } else {
        reply = `Berdasarkan database gizi Dinas Kesehatan Kabupaten Gresik dan integrasi Gemini AI, kombinasi protein hewani lokal (Bandeng/Kupang/Udang) dengan sayuran segar daerah mampu menghemat anggaran APBD hingga 14.3% sekaligus mempercepat pencapaian target stunting di bawah 10%.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: reply,
        timestamp: "Baru saja",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                Asisten AI Gizi GScan Gresik
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  Online
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Konsultasi gizi anak & formulasi menu MBG berbasis pangan lokal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-tr-none shadow-sm"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs"
                }`}
              >
                <p>{msg.text}</p>
                <span className={`block text-[10px] mt-1 text-right ${msg.sender === "user" ? "text-slate-400" : "text-slate-400"}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-slate-400 pl-9">
              <span className="animate-pulse">Mengetik respon AI...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 shrink-0 font-semibold text-[10px]">Tanya Cepat:</span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-full shrink-0 border border-slate-200 transition-colors truncate max-w-[200px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ketik pertanyaan gizi atau menu pangan Gresik..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl shadow transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
