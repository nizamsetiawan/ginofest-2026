"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { HelpCircle, Send, Bot, User, Loader2, Slash } from "lucide-react";
import { fetchHelpQA, seedHelpQA, HelpQA } from "@/services/firebase-service";

interface HelpViewProps {
  onOpenChat: () => void;
}

interface ChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
}

// Built-in system usage Q&A (will seed to Firebase on first load)
const BUILTIN_QA: Omit<HelpQA, "id">[] = [
  { command: "/menu", question: "Bagaimana cara generate menu MBG?", answer: "Klik \"Generate Menu\" di sidebar → pilih kecamatan & bulan → tekan tombol \"Generate Menu AI\" → AI akan merancang jadwal mingguan otomatis berdasarkan komoditas pangan lokal tiap kecamatan. Hasil tersimpan otomatis ke Firestore.", category: "Perencana Menu" },
  { command: "/bom", question: "Bagaimana cara melihat laporan kebutuhan bahan pokok (BOM)?", answer: "Setelah menu berhasil di-generate, klik tombol \"Laporan Kebutuhan Bahan Pokok\" di bagian bawah perencana menu. Akan muncul tabel tonase komoditas beserta estimasi anggaran. Klik \"Download Excel (.XLS)\" untuk mengunduh laporan.", category: "Perencana Menu" },
  { command: "/rag", question: "Apa itu Basis Data RAG dan bagaimana menggunakannya?", answer: "Basis Data RAG (Retrieval-Augmented Generation) berisi 5 master dataset: Komoditas Pangan, Harga Pasar SISKAPERBAPO, Menu Masakan, Nilai Gizi TKPI 2019, dan Data Wilayah. Data ini digunakan AI untuk merancang menu yang akurat dan berbasis bukti. Klik \"Basis Data RAG\" di sidebar untuk mengelola.", category: "Basis Data" },
  { command: "/upload", question: "Bagaimana cara upload data master dari Excel?", answer: "Di halaman Basis Data RAG, pilih tab dataset yang ingin diupdate → klik tombol \"Upload Excel\" → pilih file .xlsx/.xls yang sesuai format template. Data akan otomatis diparse dan disimpan ke Cloud Firestore.", category: "Basis Data" },
  { command: "/scan", question: "Bagaimana cara menggunakan fitur Scan QR Code?", answer: "Klik \"Scan QR Code\" di sidebar → isi form data anak (nama, usia, TB, BB, kecamatan) → tekan \"Mulai Analisis AI\". Sistem akan menganalisis Z-Score WHO dan memberikan rekomendasi intervensi gizi berbasis pangan lokal Gresik.", category: "Skrining" },
  { command: "/peta", question: "Bagaimana cara membaca Peta Prevalensi?", answer: "Klik \"Peta Prevalensi\" di sidebar. Peta menampilkan 18 kecamatan di Kabupaten Gresik dengan warna indikator risiko stunting (hijau = rendah, kuning = sedang, merah = tinggi). Klik kecamatan untuk melihat detail data sasaran siswa MBG.", category: "Peta" },
  { command: "/ekspor", question: "Format apa yang tersedia untuk ekspor laporan?", answer: "Laporan kebutuhan bahan pokok (BOM) dapat diunduh dalam format Excel (.XLS) dengan kop resmi Pemerintah Kabupaten Gresik, ringkasan anggaran, dan tabel rincian komoditas. Klik tombol \"Download Excel (.XLS)\" berwarna biru di dialog BOM.", category: "Ekspor" },
  { command: "/pagu", question: "Berapa standar pagu resmi MBG per porsi?", answer: "Pagu resmi Badan Gizi Nasional (BGN) RI Tahun 2026 adalah Rp 15.000 per porsi per anak per hari kerja. Angka ini digunakan sebagai dasar kalkulasi anggaran di seluruh fitur perencanaan menu dan laporan BOM.", category: "Anggaran" },
  { command: "/siklus", question: "Apa perbedaan siklus 5 hari dan 6 hari?", answer: "Siklus 5 hari = Senin sampai Jumat. Siklus 6 hari = Senin sampai Sabtu. Pilihan ini mempengaruhi jumlah hari kerja MBG per bulan dan total tonase kebutuhan bahan pokok. Atur di halaman Pengaturan atau langsung saat generate menu.", category: "Anggaran" },
  { command: "/notif", question: "Bagaimana cara kerja notifikasi sistem?", answer: "Setiap aktivitas penting (upload master data, generate menu, perubahan pengaturan, skrining balita) otomatis tercatat sebagai notifikasi di Firestore. Klik \"Notifikasi\" di sidebar untuk melihat log aktivitas terbaru. Badge biru menandakan notifikasi belum dibaca.", category: "Sistem" },
  { command: "/admin", question: "Bagaimana cara ganti akun administrator?", answer: "Klik foto profil di bagian bawah sidebar → pilih akun administrator lain dari daftar yang tersedia. Setiap admin terhubung ke wilayah kecamatan tertentu sehingga data yang ditampilkan akan menyesuaikan.", category: "Sistem" },
  { command: "/firestore", question: "Data apa saja yang tersimpan di Cloud Firestore?", answer: "Semua data tersimpan di 8 koleksi Firestore: master_komoditas, master_harga_pasar, master_menu_makanan, master_nilai_gizi, master_wilayah, mbg_menu_plans, gscan_notifications, gscan_settings. Data ini persisten dan dapat diakses kapan saja.", category: "Sistem" },
  { command: "/tahunan", question: "Bagaimana cara melihat kalender tahunan MBG?", answer: "Di halaman Generate Menu, klik tab \"Tahunan\" pada bagian atas. Akan ditampilkan grid 12 bulan (Agustus 2026 – Juli 2027) dengan status per bulan. Klik \"Buka Rencana Menu →\" pada bulan tertentu untuk mulai merancang.", category: "Perencana Menu" },
  { command: "/help", question: "Bagaimana cara menggunakan fitur bantuan ini?", answer: "Ketik \"/\" di kolom chat untuk melihat daftar perintah cepat yang tersedia. Pilih perintah atau ketik pertanyaan bebas. Sistem akan mencocokkan dengan basis pengetahuan yang tersimpan di Firestore.", category: "Sistem" },
];

export const HelpView: React.FC<HelpViewProps> = ({ onOpenChat }) => {
  const [qaData, setQaData] = useState<HelpQA[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "1", sender: "bot", text: "Halo! Saya asisten panduan G-Scan. Ketik \"/\" untuk melihat daftar perintah, atau ketik pertanyaan Anda langsung." },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<HelpQA[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load Q&A from Firebase, seed if empty
  const loadQA = useCallback(async () => {
    const res = await fetchHelpQA();
    if (res.success && res.data && res.data.length > 0) {
      setQaData(res.data);
    } else {
      // Seed built-in Q&A to Firebase
      await seedHelpQA(BUILTIN_QA);
      const res2 = await fetchHelpQA();
      if (res2.success && res2.data) {
        setQaData(res2.data);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadQA();
  }, [loadQA]);

  // Handle input change and `/` command suggestions
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.startsWith("/")) {
      const search = val.toLowerCase();
      const matched = qaData.filter((q) =>
        q.command.toLowerCase().startsWith(search) ||
        q.question.toLowerCase().includes(search.replace("/", ""))
      );
      setFilteredCommands(matched);
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleSelectCommand = (qa: HelpQA) => {
    setShowCommands(false);
    setInputText("");

    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text: qa.command + " — " + qa.question };
    const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), sender: "bot", text: qa.answer };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    setShowCommands(false);

    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    // Match against Q&A
    const lower = text.toLowerCase().replace("/", "");
    const match = qaData.find(
      (q) =>
        q.command.replace("/", "") === lower ||
        q.question.toLowerCase().includes(lower) ||
        lower.includes(q.command.replace("/", ""))
    );

    setTimeout(() => {
      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: match
          ? match.answer
          : "Maaf, saya belum memiliki jawaban untuk pertanyaan tersebut. Coba gunakan perintah \"/\" untuk melihat topik yang tersedia, atau hubungi Helpdesk Dinkes Gresik di (031) 3981234.",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#071e49] tracking-tight">
              Pusat Bantuan
            </h1>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Panduan penggunaan sistem G-Scan — ketik <code className="text-[#1a73e8] bg-blue-50 px-1.5 py-0.5 rounded font-bold">/</code> untuk melihat daftar perintah
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: "400px" }}>
        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#1a73e8] animate-spin" />
              <span className="ml-2 text-[12px] text-[#64748b]">Memuat basis pengetahuan...</span>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[80%] text-[12px] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#1a73e8] text-white rounded-tr-none shadow-xs"
                      : "bg-[#f8fafc] text-[#071e49] rounded-tl-none border border-[#e2e8f0]"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-[#071e49] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Command Suggestions Popup */}
        {showCommands && filteredCommands.length > 0 && (
          <div className="mx-4 mb-2 bg-white border border-[#e2e8f0] rounded-2xl shadow-lg max-h-52 overflow-y-auto">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleSelectCommand(cmd)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-3 cursor-pointer border-b border-slate-100 last:border-0"
              >
                <code className="text-[11px] font-bold text-[#1a73e8] bg-blue-50 px-2 py-0.5 rounded shrink-0">
                  {cmd.command}
                </code>
                <span className="text-[12px] text-[#071e49] truncate">{cmd.question}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-[#e2e8f0]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder='Ketik "/" untuk perintah atau tanya langsung...'
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-2.5 text-[12px] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-all pr-10"
              />
              <Slash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-[#1a73e8] hover:bg-[#155fc0] disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
