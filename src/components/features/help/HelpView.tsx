"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  HelpCircle, Send, Bot, User, Loader2, Slash, Sparkles, Command,
  Trash2, AlertTriangle, MessageSquare, Check, ExternalLink, Mail,
  ClipboardList, CircleDot, CheckCircle2, Clock, X, RefreshCw
} from "lucide-react";
import {
  fetchHelpQA,
  HelpQA,
  fetchSettings,
  fetchHelpChatHistory,
  saveHelpChatMessage,
  clearHelpChatHistory,
  saveComplaintToFirestore,
  fetchComplaintsFromFirestore,
  ComplaintRecord,
  addNotification,
} from "@/services/firebase-service";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton, CardListSkeleton } from "@/components/ui/Skeleton";

interface HelpViewProps {
  onOpenChat: () => void;
}

interface ChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
  isAiGenerated?: boolean;
}

const DEFAULT_GREETING: ChatMsg = {
  id: "initial_1",
  sender: "bot",
  text: "Halo! Selamat datang di Pusat Bantuan Kcal.\n\nSaya K-Bot, asisten yang siap membantu Anda menggunakan seluruh fitur sistem ini.\n\nAda yang bisa saya bantu hari ini?\n• Ketik \"/\" untuk memilih topik bantuan siap pakai.\n• Ketik \"/komplain\" untuk menyampaikan keluhan/pengaduan.\n• Ketik \"/track\" untuk memantau status tiket aduan Anda secara realtime.\n• Atau ketik pertanyaan apa saja secara bebas, saya siap menjelaskan dengan senang hati!",
};

export const HelpView: React.FC<HelpViewProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [qaData, setQaData] = useState<HelpQA[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([DEFAULT_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<HelpQA[]>([]);

  // Complaint Dialog State
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintName, setComplaintName] = useState(user?.name || "Nizam Setiawan");
  const [complaintContact, setComplaintContact] = useState(user?.email || "nizamsetiawan15@gmail.com");
  const [complaintCategory, setComplaintCategory] = useState("Kendala Fitur / Generate Menu");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Track Aduan State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [myComplaints, setMyComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load all Q&A commands and chat history from Firestore
  const loadData = useCallback(async () => {
    setIsLoading(true);
    // 1. Load QA Commands
    const qaRes = await fetchHelpQA();
    const baseCommands: HelpQA[] = [
      {
        id: "built_in_komplain",
        command: "/komplain",
        category: "Layanan & Bantuan",
        question: "Kirim Pengaduan & Keluhan Sistem",
        answer: "Buka formulir pengaduan untuk menyampaikan kendala atau masukan ke pengelola sistem.",
      },
      {
        id: "built_in_track",
        command: "/track",
        category: "Layanan & Bantuan",
        question: "Pantau Status Pengaduan Saya (Realtime)",
        answer: "Buka panel pelacakan status tiket aduan yang telah Anda kirimkan ke sistem.",
      },
    ];

    if (qaRes.success && qaRes.data) {
      const existingCmds = new Set(qaRes.data.map((q) => q.command));
      const combined = [...qaRes.data];
      baseCommands.forEach((bc) => {
        if (!existingCmds.has(bc.command)) combined.unshift(bc);
      });
      setQaData(combined);
    } else {
      setQaData(baseCommands);
    }

    // 2. Load Chat History from Firestore
    const historyRes = await fetchHelpChatHistory();
    if (historyRes.success && historyRes.data && historyRes.data.length > 0) {
      const loadedMsgs: ChatMsg[] = historyRes.data.map((m, idx) => ({
        id: m.id || `msg_${idx}`,
        sender: m.sender,
        text: m.text,
        isAiGenerated: m.isAiGenerated,
      }));
      setMessages(loadedMsgs);
    } else {
      setMessages([DEFAULT_GREETING]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle input change and `/` command suggestions dynamically from Firestore qaData
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.startsWith("/")) {
      const search = val.toLowerCase();
      const term = search.replace("/", "");
      const matched = qaData.filter((q) =>
        q.command.toLowerCase().startsWith(search) ||
        q.command.toLowerCase().includes(term) ||
        q.question.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term) ||
        (term.startsWith("komp") && q.command === "/komplain") ||
        (term.startsWith("lap") && q.command === "/komplain")
      );
      setFilteredCommands(matched);
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const handleSelectCommand = async (qa: HelpQA) => {
    setShowCommands(false);
    setInputText("");

    if (qa.command === "/komplain") {
      setIsComplaintModalOpen(true);
      return;
    }

    if (qa.command === "/track") {
      handleOpenTrack();
      return;
    }

    const userText = `${qa.command} — ${qa.question}`;
    const botText = qa.answer;

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };
    const botMsg: ChatMsg = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: botText,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);

    // Save both to Firestore
    await saveHelpChatMessage({ sender: "user", text: userText });
    await saveHelpChatMessage({ sender: "bot", text: botText });
  };

  // Clear Chat History from Firestore
  const handleClearHistory = async () => {
    setIsClearing(true);
    await clearHelpChatHistory();
    setMessages([DEFAULT_GREETING]);
    setIsClearing(false);
    setIsConfirmClearOpen(false);
  };

  // Load user's complaints for tracking
  const loadMyComplaints = useCallback(async () => {
    setIsLoadingTrack(true);
    try {
      const res = await fetchComplaintsFromFirestore();
      if (res.success && res.data) {
        // Filter complaints by current user's name or email
        const userEmail = user?.email || "";
        const userName = user?.name || "";
        const filtered = res.data.filter((c) =>
          c.senderContact?.toLowerCase() === userEmail.toLowerCase() ||
          c.senderName?.toLowerCase() === userName.toLowerCase()
        );
        setMyComplaints(filtered.length > 0 ? filtered : res.data);
      }
    } catch (e) {
      console.error("Failed to load complaints:", e);
    } finally {
      setIsLoadingTrack(false);
    }
  }, [user]);

  const handleOpenTrack = () => {
    setIsTrackModalOpen(true);
    loadMyComplaints();
  };

  // Submit Complaint Form
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMessage.trim()) return;

    setIsSubmittingComplaint(true);

    // 1. Save Complaint Record in Firestore
    await saveComplaintToFirestore({
      senderName: complaintName,
      senderContact: complaintContact,
      category: complaintCategory,
      message: complaintMessage,
    });

    // 2. Log System Notification in Firestore
    await addNotification({
      title: "Pengaduan Pengguna Masuk",
      description: `Keluhan [${complaintCategory}] dari ${complaintName}: "${complaintMessage.substring(0, 80)}..."`,
      category: "system",
    });

    // 3. Log in Chat History
    const userLogText = `[Pengaduan / Komplain Sistem]\nKategori: ${complaintCategory}\nPengirim: ${complaintName} (${complaintContact})\nPesan: ${complaintMessage}`;
    const botReplyText = `Keluhan Anda telah berhasil dicatat ke sistem dan tersimpan di Cloud Firestore.\nLaporan ini juga otomatis diteruskan ke kontak pengelola. Terima kasih atas masukan yang diberikan!`;

    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text: userLogText };
    const botMsg: ChatMsg = { id: (Date.now() + 1).toString(), sender: "bot", text: botReplyText };
    setMessages((prev) => [...prev, userMsg, botMsg]);

    await saveHelpChatMessage({ sender: "user", text: userLogText });
    // 4. Forward Exclusively to Gmail takathasan82@gmail.com
    const formattedText = `PENGADUAN SISTEM KCAL (GINOFEST 2026)\n\n• Nama: ${complaintName}\n• Kontak: ${complaintContact}\n• Kategori: ${complaintCategory}\n• Waktu: ${new Date().toLocaleString("id-ID")}\n\nRincian Keluhan/Masukan:\n${complaintMessage}\n\n---\nDikirim otomatis via Pusat Bantuan Kcal`;

    const subject = `[Kcal Komplain] ${complaintCategory} - ${complaintName}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=takathasan82@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedText)}`;
    window.open(gmailUrl, "_blank");

    setIsSubmittingComplaint(false);
    setIsComplaintModalOpen(false);
    setComplaintMessage("");
  };

  // Call AI Assistant for free-text questions (natural & conversational)
  const askBotAboutSystem = async (userQuery: string): Promise<string> => {
    try {
      let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      if (!apiKey) {
        const settingsRes = await fetchSettings();
        if (settingsRes.success && settingsRes.data?.geminiApiKey) {
          apiKey = settingsRes.data.geminiApiKey;
        }
      }

      if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
        throw new Error("No API key");
      }

      const systemPrompt = `Anda adalah "K-Bot", asisten pemandu resmi aplikasi Kcal Dashboard MBG (Makan Bergizi Gratis & Penanganan Stunting) GinoFest 2026 Pemerintah Kabupaten Gresik.

BATASAN CAKUPAN SISTEM (STRICT SCOPE):
Anda HANYA boleh menjawab pertanyaan yang berkaitan dengan:
1. Program Makan Bergizi Gratis (MBG), Perencana Menu AI, Pagu Rp 15.000, Laporan Kebutuhan Bahan Pokok (Excel BOM).
2. Penanganan & pencegahan Stunting, Z-Score WHO, Antropometri Balita, Peta Prevalensi 18 Kecamatan.
3. Basis Data RAG 5 Dataset Master (Komoditas, Harga Pasar, Menu Standar, Nilai Gizi, Data Wilayah), PIN 8 Digit.
4. Penggunaan fitur sistem Kcal / GSCAN (Notifikasi Firestore, Pengaturan, Log Audit, Layanan Pengaduan /komplain, Lacak Aduan /track).
5. Layanan kesehatan, Posyandu, Puskesmas, dan Helpdesk Dinas Kesehatan Kabupaten Gresik.
6. Sapaan ramah dari pengguna (seperti "halo", "hai", "selamat pagi").

ATURAN PENTING & OUT-OF-SCOPE GUARDRAIL:
- Jika pertanyaan MASUK DALAM CAKUPAN: Berikan jawaban yang terfokus, ramah, dan profesional.
- Jika pertanyaan DILUAR CAKUPAN SISTEM (misal tentang politik, olahraga, kuis, hiburan, gosip, film, koding/pemrograman umum, matematika umum, atau topik di luar gizi/stunting/MBG/sistem Kcal):
  WAJIB HANYA mengembalikan kalimat berikut secara persis tanpa tambahan kata lain:
  "Mohon maaf, pertanyaan Anda berada di luar cakupan Layanan Nutrisi & Sistem GSCAN. Pastikan pertanyaan Anda berkaitan dengan Program Makan Bergizi Gratis (MBG), Skrining Biometrik, Pencegahan Stunting, atau Layanan Kesehatan Warga."

PERTANYAAN PENGGUNA: "${userQuery}"`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText && replyText.trim()) {
          return replyText.trim();
        }
      }
      throw new Error("Failed response");
    } catch {
      // Conversational Fallback
      const lower = userQuery.toLowerCase().trim();

      if (lower.includes("komplain") || lower.includes("keluhan") || lower.includes("lapor") || lower.includes("masalah")) {
        return "Jika Anda menemukan kendala atau ingin menyampaikan keluhan terkait sistem, silakan ketik perintah /komplain di kolom chat bawah. Anda dapat menuliskan detail kendala dan pesan akan langsung tercatat di sistem serta diteruskan ke kontak pengelola.";
      }

      if (lower.includes("stunting") || lower.includes("gizi") || lower.includes("mbg") || lower.includes("menu")) {
        return "Program Kcal MBG dan Penanganan Stunting memadukan perencana menu AI berbasis komoditas pangan lokal dengan penapisan fisik anak. Gunakan menu sidebar untuk melihat fitur selengkapnya!";
      }

      if (lower === "halo" || lower === "hai" || lower === "hei" || lower === "hi" || lower.startsWith("halo") || lower.startsWith("hai")) {
        return "Halo juga! Senang bisa menyapa Anda. Ada yang bisa saya bantu terkait penggunaan fitur di dashboard Kcal hari ini?";
      }

      if (lower.includes("apa kabar") || lower.includes("gimana kabar")) {
        return "Kabar baik, terima kasih! Saya siap membantu Anda mengelola data stunting maupun perencana menu MBG. Ada hal tertentu yang ingin Anda tanyakan?";
      }

      if (lower.includes("pagi") || lower.includes("siang") || lower.includes("sore") || lower.includes("malam")) {
        return `Halo, selamat ${lower.includes("pagi") ? "pagi" : lower.includes("siang") ? "siang" : lower.includes("sore") ? "sore" : "malam"}! Ada yang bisa saya bantu seputar sistem Kcal?`;
      }

      if (lower.includes("terima kasih") || lower.includes("makasih") || lower.includes("thanks")) {
        return "Sama-sama! Senang bisa membantu Anda. Jika nanti butuh bantuan lainnya, jangan ragu untuk bertanya lagi ya.";
      }

      if (lower.includes("siapa kamu") || lower.includes("kamu siapa")) {
        return "Saya K-Bot, asisten pemandu di dashboard Kcal MBG. Tugas saya membantu Anda memahami dan menggunakan seluruh fitur yang ada di sistem ini dengan mudah.";
      }

      // Match from Firestore qaData
      const match = qaData.find(
        (q) =>
          lower.includes(q.command.replace("/", "")) ||
          q.question.toLowerCase().split(" ").some(word => word.length > 3 && lower.includes(word)) ||
          lower.includes(q.category.toLowerCase())
      );

      if (match) {
        return `${match.answer}\n\nTip: Anda juga bisa mengetik "/" untuk melihat daftar seluruh topik panduan.`;
      }

      return "Mohon maaf, pertanyaan Anda berada di luar cakupan Layanan Nutrisi & Sistem GSCAN. Pastikan pertanyaan Anda berkaitan dengan Program Makan Bergizi Gratis (MBG), Skrining Biometrik, Pencegahan Stunting, atau Layanan Kesehatan Warga.";
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    setInputText("");
    setShowCommands(false);

    // 1. If command is `/komplain` or `/komplan` -> open modal directly
    const cleanCmd = text.toLowerCase().trim();
    if (cleanCmd === "/komplain" || cleanCmd === "/komplan" || cleanCmd === "/lapor" || cleanCmd === "/keluhan") {
      setIsComplaintModalOpen(true);
      return;
    }

    // 1b. If command is `/track` or `/aduan` -> open track modal directly
    if (cleanCmd === "/track" || cleanCmd === "/aduan" || cleanCmd === "/status") {
      handleOpenTrack();
      return;
    }

    // 2. If starts with `/` check Firestore loaded commands
    if (text.startsWith("/")) {
      const lower = text.toLowerCase().replace("/", "");
      const match = qaData.find(
        (q) =>
          q.command.replace("/", "").toLowerCase() === lower ||
          q.command.toLowerCase() === text.toLowerCase() ||
          q.question.toLowerCase().includes(lower)
      );

      const botReply = match
        ? match.answer
        : `Perintah "${text}" belum tersedia. Silakan ketik "/" untuk melihat ${qaData.length} topik panduan yang siap membantu Anda.`;

      const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text };
      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReply,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);

      // Save to Firestore
      await saveHelpChatMessage({ sender: "user", text });
      await saveHelpChatMessage({ sender: "bot", text: botReply });
      return;
    }

    // 3. Free-text user question -> Send to K-Bot Assistant
    const userMsg: ChatMsg = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Save user message to Firestore
    await saveHelpChatMessage({ sender: "user", text });

    try {
      const aiReply = await askBotAboutSystem(text);
      const botMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: aiReply,
        isAiGenerated: true,
      };
      setMessages((prev) => [...prev, botMsg]);

      // Save bot reply to Firestore
      await saveHelpChatMessage({ sender: "bot", text: aiReply, isAiGenerated: true });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-[22px] font-black text-[#2C3968] tracking-tight">
              Pusat Bantuan
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-tint text-ford-blue text-[11px] font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-light-sea-green" />
              <span>K-Bot Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </div>
          <p className="text-[12px] text-[#64748b]">
            Riwayat chat tersimpan otomatis ke Cloud Firestore — ketik <code className="text-ford-blue bg-blue-50 px-1.5 py-0.5 rounded font-bold">/</code> untuk topik cepat atau ketik <code className="text-ford-blue bg-blue-50 px-1.5 py-0.5 rounded font-bold">/komplain</code> untuk layanan keluhan
          </p>
        </div>

        {/* Action Buttons (Compact Icon Buttons) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto font-sans">
          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-ford-blue bg-green-tint hover:bg-green-02/30 border border-green-02/40 transition-all cursor-pointer shadow-2xs hover:scale-105"
            title="Kirim Komplain / Aduan Baru"
          >
            <MessageSquare className="w-4 h-4 text-ford-blue" />
          </button>

          <button
            onClick={handleOpenTrack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-ford-blue bg-green-tint hover:bg-green-02/30 border border-green-02/40 transition-all cursor-pointer shadow-2xs hover:scale-105"
            title="Lacak Status Aduan (Track Aduan)"
          >
            <ClipboardList className="w-4 h-4 text-ford-blue" />
          </button>

          {messages.length > 1 && (
            <button
              onClick={() => setIsConfirmClearOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-red bg-red-50 hover:bg-red-100 border border-brand-red/30 transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Hapus Riwayat Percakapan"
            >
              <Trash2 className="w-4 h-4 text-brand-red" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: "460px" }}>
        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex gap-3 justify-start">
                <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                <div className="space-y-2 p-4 rounded-2xl bg-white border border-[#e2e8f0] w-3/4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-5/6" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="space-y-2 p-4 rounded-2xl bg-blue-100/60 w-2/3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-[12px] leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold rounded-tr-none"
                      : "bg-white text-[#2C3968] rounded-tl-none border border-[#e2e8f0]"
                  }`}
                >
                  {msg.isAiGenerated && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-light-sea-green mb-1 pb-1 border-b border-slate-100">
                      <Sparkles className="w-3 h-3" />
                      <span>Jawaban dari K-Bot</span>
                    </div>
                  )}
                  {msg.text}
                </div>
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-[#2C3968] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-[#e2e8f0] text-[12px] text-[#64748b] flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-light-sea-green animate-spin" />
                <span>K-Bot sedang menyiapkan jawaban untuk Anda...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Command Suggestions Popup (Loaded from Firestore) */}
        {showCommands && filteredCommands.length > 0 && (
          <div className="mx-4 mb-2 bg-white border border-[#cbd5e1] rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in slide-in-from-bottom-2">
            <div className="px-3.5 py-1.5 bg-blue-50/60 text-[10px] font-bold text-light-sea-green flex items-center justify-between sticky top-0 backdrop-blur-sm">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                Daftar Topik Bantuan ({filteredCommands.length} topik)
              </span>
              <span className="text-[#64748b] text-[9px]">Klik untuk memilih</span>
            </div>
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.id || cmd.command}
                onClick={() => handleSelectCommand(cmd)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <code className="text-[11px] font-mono font-bold text-ford-blue bg-blue-50 group-hover:bg-[#35CBC3] group-hover:text-white px-2 py-0.5 rounded transition-colors shrink-0">
                    {cmd.command}
                  </code>
                  <span className="text-[12px] text-[#2C3968] font-medium truncate">{cmd.question}</span>
                </div>
                <span className="text-[10px] text-[#64748b] bg-slate-100 px-2 py-0.5 rounded-full shrink-0 font-medium">
                  {cmd.category}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-[#e2e8f0]">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder='Ketik "/" untuk perintah cepat, "/komplain" untuk kirim keluhan, atau tanyakan apa saja...'
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isTyping}
                className="w-full px-4 py-2.5 text-[12px] bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35CBC3]/20 focus:border-[#35CBC3] transition-all pr-10 disabled:opacity-50"
              />
              <Slash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 disabled:opacity-40 text-ford-blue font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-ford-blue" />}
            </button>
          </form>
        </div>
      </div>

      {/* ═══ MODAL FORM LAYANAN PENGADUAN & KOMPLAIN (/komplain) ═══ */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#f1f5f9]">
              <div className="w-11 h-11 rounded-2xl bg-green-tint text-ford-blue flex items-center justify-center shadow-xs shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-black text-[#2C3968] tracking-tight">
                  Layanan Pengaduan & Keluhan Sistem
                </h2>
                <p className="text-[11px] text-[#64748b]">
                  Laporan akan tersimpan ke Firestore dan diteruskan ke kontak pengelola
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-[12px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3968] mb-1">Nama Pengirim</label>
                  <input
                    type="text"
                    required
                    value={complaintName}
                    onChange={(e) => setComplaintName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3968] mb-1">Kontak (Email / No. HP)</label>
                  <input
                    type="text"
                    required
                    value={complaintContact}
                    onChange={(e) => setComplaintContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#2C3968] focus:outline-none focus:border-[#35CBC3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C3968] mb-1">Kategori Kendala</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#2C3968] font-medium focus:outline-none focus:border-[#35CBC3] cursor-pointer"
                >
                  <option value="Kendala Fitur / Generate Menu">Kendala Perencana Menu MBG</option>
                  <option value="Basis Data & Upload Excel">Kendala Basis Data RAG / Upload Excel</option>
                  <option value="Skrining Balita & QR Code">Kendala Modul Skrining Balita</option>
                  <option value="Akurasi Data Prevalensi">Pertanyaan Akurasi Data Stunting</option>
                  <option value="Saran & Masukan Pengembangan">Saran / Masukan Fitur Baru</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C3968] mb-1">Rincian Keluhan / Masukan</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ceritakan kendala, bug, atau masukan yang Anda alami secara detail..."
                  value={complaintMessage}
                  onChange={(e) => setComplaintMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#2C3968] focus:outline-none focus:border-[#35CBC3] leading-relaxed resize-none"
                />
              </div>

              {/* Gmail Destination Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green text-ford-blue font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-light-sea-green uppercase tracking-wider block">Tujuan Pengiriman Langsung</span>
                  <span className="text-[12px] font-bold text-[#2C3968] font-mono block truncate">takathasan82@gmail.com</span>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">Otomatis tersimpan di database & diteruskan ke Gmail</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  disabled={isSubmittingComplaint}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] font-bold text-[12px] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!complaintMessage.trim() || isSubmittingComplaint}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-02 to-light-sea-green hover:opacity-95 text-ford-blue font-bold text-[12px] shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Kirim & Teruskan Keluhan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL TRACK ADUAN ═══ */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-black text-[#2C3968]">Status Pengaduan Saya</h2>
                  <p className="text-[11px] text-[#64748b]">Pantau status tiket aduan yang telah Anda kirimkan</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={loadMyComplaints} disabled={isLoadingTrack} className="p-1.5 rounded-lg text-slate-400 hover:text-light-sea-green hover:bg-blue-50 cursor-pointer transition-colors">
                  <RefreshCw className={`w-4 h-4 ${isLoadingTrack ? "animate-spin text-light-sea-green" : ""}`} />
                </button>
                <button onClick={() => setIsTrackModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Complaint List */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {isLoadingTrack ? (
                <CardListSkeleton count={2} />
              ) : myComplaints.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-[13px] font-bold text-[#2C3968]">Belum ada pengaduan</p>
                  <p className="text-[11px] text-[#64748b]">Gunakan tombol "Kirim Komplain" untuk menyampaikan keluhan atau masukan.</p>
                </div>
              ) : (
                myComplaints.map((c, idx) => {
                  const status = c.status || "baru";
                  const statusConfig = {
                    baru: { label: "Baru", color: "bg-red-50 text-red-700 border-red-200", icon: CircleDot },
                    proses: { label: "Ditindaklanjuti", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
                    selesai: { label: "Selesai", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
                  };
                  const cfg = statusConfig[status];
                  const StatusIcon = cfg.icon;

                  return (
                    <div key={c.id || idx} className="p-4 rounded-2xl border border-[#e2e8f0] bg-white space-y-2.5 hover:border-slate-300 transition-colors">
                      {/* Top row: category + status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-green-tint text-ford-blue text-[10px] font-bold border border-blue-100">
                          {c.category}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-[12px] text-slate-700 leading-relaxed font-medium line-clamp-3">
                        &ldquo;{c.message}&rdquo;
                      </p>

                      {/* Response notes if any */}
                      {c.responseNotes && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                          <span className="font-bold text-[10px] uppercase text-emerald-600">Tanggapan Admin: </span>
                          {c.responseNotes}
                        </div>
                      )}

                      {/* Bottom: time */}
                      <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
                        <Clock className="w-3 h-3" />
                        <span>{c.createdAtIso ? new Date(c.createdAtIso).toLocaleString("id-ID") : "Baru saja"}</span>
                        <span>•</span>
                        <span>{c.senderName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM CLEAR CHAT HISTORY MODAL ═══ */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#2C3968]">Hapus Riwayat Chat?</h3>
              <p className="text-[12px] text-[#64748b] mt-1">
                Seluruh percakapan dengan K-Bot akan dihapus secara permanen dari Cloud Firestore.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmClearOpen(false)}
                disabled={isClearing}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#2C3968] text-[12px] font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isClearing ? "Menghapus..." : "Ya, Hapus"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
