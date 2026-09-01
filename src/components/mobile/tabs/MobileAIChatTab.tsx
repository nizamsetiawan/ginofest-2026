"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { Page, Card, Badge, Button } from "konsta/react";

export const MobileAIChatTab: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Halo Bunda/Ayah! 🤖 Saya K-Bot. Konsultasikan kebutuhan nutrisi si kecil atau cari resep bergizi murah khas Gresik di sini.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const samplePrompts = [
    "Ikan apa yang paling tinggi protein di Gresik untuk balita?",
    "Bagaimana cara mengatasi anak yang susah makan sayur?",
    "Berapa takaran porsi MBG yang ideal untuk anak SD?",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInputVal("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);

    setTimeout(() => {
      let botReply = "Ikan Bandeng dan Kerapu lokal Gresik memiliki kandungan asam lemak Omega-3 dan Protein tinggi (20-28g/100g) yang sangat optimal untuk perkembangan otak dan pencegahan stunting.";
      if (userMsg.toLowerCase().includes("sayur")) {
        botReply = "Coba kombinasikan sayur bayam/jagung manis dengan olahan bakso bandeng atau nugget ikan buatan sendiri agar si kecil lebih tertarik!";
      } else if (userMsg.toLowerCase().includes("takaran") || userMsg.toLowerCase().includes("mbg")) {
        botReply = "Untuk anak usia SD (7-12 tahun), porsi makan siang MBG idealnya mengandung 600-700 kkal dengan 20-25g protein hewani, sayur 1 mangkok kecil, dan buah segar.";
      }
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 600);
  };

  return (
    <Page className="p-4 space-y-3.5 pb-36 font-sans animate-in fade-in duration-200 select-none bg-transparent">
      {/* Header Info */}
      <Card className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[13.5px] font-black text-ford-blue">K-Bot Asisten Gizi AI</h3>
              <p className="text-[10px] text-blue-gray">AI Nutrisi Khusus Pangan Lokal Gresik</p>
            </div>
          </div>
          <Badge colors={{ bg: "bg-green-tint", text: "text-light-sea-green" }} className="px-2 py-0.5 rounded-full text-[9.5px] font-bold">
            Online
          </Badge>
        </div>
      </Card>

      {/* Chat Messages Stream */}
      <div className="space-y-2.5 min-h-[160px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${m.sender === "user" ? "bg-ford-blue text-white" : "bg-green-tint text-ford-blue"}`}>
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`p-3 rounded-2xl text-[11.5px] max-w-[82%] leading-relaxed ${
                m.sender === "user"
                  ? "bg-ford-blue text-white rounded-tr-none shadow-2xs"
                  : "bg-white text-ford-blue border border-slate-200/80 rounded-tl-none shadow-2xs"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10.5px] font-bold text-blue-gray px-1 block">Rekomendasi Pertanyaan:</span>
        <div className="space-y-1">
          {samplePrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-ford-blue font-medium shadow-2xs hover:bg-green-tint/50 hover:border-green-02/40 transition-colors cursor-pointer"
            >
              💡 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          placeholder="Tanya gizi si kecil..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(inputVal);
          }}
          className="flex-1 px-3.5 py-2.5 bg-white rounded-2xl border border-slate-200 text-[11.5px] font-medium text-ford-blue focus:outline-none focus:border-light-sea-green shadow-2xs"
        />
        <Button
          rounded
          onClick={() => handleSend(inputVal)}
          className="w-10 h-10 bg-gradient-to-tr from-green-02 via-light-sea-green to-teal-400 text-ford-blue flex items-center justify-center p-0 shrink-0 cursor-pointer shadow-2xs"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </Button>
      </div>
    </Page>
  );
};
