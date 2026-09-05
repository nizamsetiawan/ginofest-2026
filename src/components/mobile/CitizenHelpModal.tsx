"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bot, Send, User, Loader2, Slash, Sparkles, MessageSquare,
  Trash2, AlertTriangle, CheckCircle2, Clock, X, ChevronRight, MessageSquarePlus,
  HelpCircle, RefreshCw, Filter, Phone, MapPin, Check
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

interface CitizenHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizenUser?: {
    name?: string;
    email?: string;
    district?: string;
    age?: number;
  } | null;
  triggerHaptic?: () => void;
}

interface ChatMsg {
  id: string;
  sender: "user" | "bot";
  text: string;
  isAiGenerated?: boolean;
}

const DEFAULT_CITIZEN_GREETING: ChatMsg = {
  id: "citizen_init_1",
  sender: "bot",
  text: "Halo! Selamat datang di Pusat Bantuan & FAQ Kcal Warga.\n\nSaya K-Bot, asisten AI resmi Layanan Nutrisi MBG & Skrining Biometrik Kecamatan Kebomas.\n\nAda yang ingin Anda tanyakan hari ini?\n• Ketik \"/\" untuk memilih topik bantuan siap pakai.\n• Ketik \"/komplain\" untuk mengirim pengaduan kualitas MBG / layanan.\n• Ketik \"/track\" untuk memantau status aduan Anda secara realtime.\n• Atau ketik pertanyaan apa saja secara bebas, saya siap membantu Anda!",
};

export const CitizenHelpModal: React.FC<CitizenHelpModalProps> = ({
  isOpen,
  onClose,
  citizenUser,
  triggerHaptic,
}) => {
  const [qaData, setQaData] = useState<HelpQA[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([DEFAULT_CITIZEN_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<HelpQA[]>([]);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Conversational Complaint Flow State
  const [isAwaitingComplaint, setIsAwaitingComplaint] = useState(false);

  // Form Pengaduan Warga Modal State
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintName, setComplaintName] = useState(citizenUser?.name || "Warga Kebomas");
  const [complaintContact, setComplaintContact] = useState(citizenUser?.email || "nizam@gmail.com");
  const [complaintCategory, setComplaintCategory] = useState("Kualitas & Porsi Makanan MBG");
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Track Aduan State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [myComplaints, setMyComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleHaptic = () => {
    if (triggerHaptic) triggerHaptic();
  };

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Load QA Commands & Chat History
  const loadData = useCallback(async () => {
    setIsLoading(true);
    // 1. Fetch Q&A commands from Firestore
    const qaRes = await fetchHelpQA();
    const baseCommands: HelpQA[] = [
      {
        id: "citizen_cmd_komplain",
        command: "/komplain",
        category: "Layanan Pengaduan",
        question: "Kirim Pengaduan & Keluhan Warga",
        answer: "Tuliskan keluhan atau kendala Anda secara langsung di percakapan untuk dibuatkan tiket aduan resmi.",
      },
      {
        id: "citizen_cmd_track",
        command: "/track",
        category: "Layanan Pengaduan",
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

    // 2. Load Chat History
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
      setMessages([DEFAULT_CITIZEN_GREETING]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Handle Input Change & `/` Command Filter
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.startsWith("/")) {
      const search = val.toLowerCase();
      const term = search.replace("/", "");
      const matched = qaData.filter(
        (q) =>
          q.command.toLowerCase().startsWith(search) ||
          q.command.toLowerCase().includes(term) ||
          q.question.toLowerCase().includes(term) ||
          q.category.toLowerCase().includes(term)
      );
      setFilteredCommands(matched);
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  // Start Conversational Complaint Prompt
  const startComplaintFlow = () => {
    handleHaptic();
    setIsAwaitingComplaint(true);
    const botMsg: ChatMsg = {
      id: `bot_complaint_prompt_${Date.now()}`,
      sender: "bot",
      text: `📝 Silakan jelaskan keluhan atau masukan Anda secara langsung di percakapan ini.\n\nTuliskan rincian kendala yang Anda alami (seperti porsi makanan, rasa, ketepatan waktu, atau kendala skrining).\n\n*Nama (${citizenUser?.name || "Warga Kebomas"}), email (${citizenUser?.email || "nizam@gmail.com"}), dan kecamatan (${citizenUser?.district || "Kebomas"}) Anda akan otomatis dilampirkan ke tiket aduan ini.*`,
    };
    setMessages((prev) => [...prev, botMsg]);
    saveHelpChatMessage({ sender: "bot", text: botMsg.text });
  };

  // Execute Command Selection
  const handleSelectCommand = async (qa: HelpQA) => {
    handleHaptic();
    setShowCommands(false);
    setInputText("");

    if (qa.command === "/komplain") {
      startComplaintFlow();
      return;
    }

    if (qa.command === "/track") {
      handleOpenTrackModal();
      return;
    }

    // Append User Question & Bot Answer
    const userMsg: ChatMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: qa.command + " - " + qa.question,
    };
    const botMsg: ChatMsg = {
      id: `bot_${Date.now()}`,
      sender: "bot",
      text: qa.answer,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    saveHelpChatMessage({ sender: "user", text: userMsg.text });
    saveHelpChatMessage({ sender: "bot", text: botMsg.text });
  };

  // Call Gemini AI Assistant for freeform user questions
  const askGeminiAiAssistant = async (userQuery: string): Promise<string> => {
    try {
      let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        const settingsRes = await fetchSettings();
        if (settingsRes.success && settingsRes.data?.geminiApiKey) {
          apiKey = settingsRes.data.geminiApiKey;
        }
      }

      if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
        throw new Error("No Gemini API Key");
      }

      const systemPrompt = `Anda adalah "K-Bot", asisten AI resmi pemandu Layanan Nutrisi Kcal, Skrining Biometrik, dan Program Makan Bergizi Gratis (MBG) Kecamatan ${citizenUser?.district || "Kebomas"}, Kabupaten Gresik.

BATASAN CAKUPAN SISTEM (STRICT SCOPE):
Anda HANYA boleh menjawab pertanyaan yang berkaitan dengan:
1. Program Makan Bergizi Gratis (MBG), komposisi menu 5 Bintang, gizi anak sekolah & balita, kecukupan AKG.
2. Penanganan & pencegahan Stunting, pengukuran Z-Score WHO, antropometri balita.
3. Skrining Biometrik Wajah & Telapak Tangan pada aplikasi Kcal.
4. Penggunaan fitur aplikasi Kcal (Notifikasi, Profil, Fitur Lapor Pengaduan Warga /komplain, Lacak Aduan /track).
5. Layanan kesehatan warga, Posyandu, Puskesmas, dan bantuan helpdesk Dinkes Gresik.
6. Sapaan ramah dari warga (seperti "halo", "hai", "selamat pagi", "apa kabar").

ATURAN PENTING & OUT-OF-SCOPE GUARDRAIL:
- Jika pertanyaan TERFOKUS pada topik di atas: Berikan jawaban yang **singkat, simpel, ramah, dan mudah dipahami** oleh warga/orang tua (maksimal 2-3 paragraf ringkas). Jika pengguna menanyakan tentang stunting (misal: "apa yang kamu ketahui tentang stunting"), jelaskan pengertian stunting secara sederhana serta poin pencegahannya.
- Jika pertanyaan DILUAR CAKUPAN SISTEM (misal: tentang politik, olahraga, kuis, hiburan, gosip, film, koding/pemrograman umum, matematika umum, atau topik di luar nutrisi/stunting/MBG/Kcal):
  WAJIB HANYA mengembalikan kalimat berikut secara persis tanpa tambahan kata lain:
  "Mohon maaf, pertanyaan Anda berada di luar cakupan Layanan Nutrisi & Sistem Kcal. Pastikan pertanyaan Anda berkaitan dengan Program Makan Bergizi Gratis (MBG), Skrining Biometrik, Pencegahan Stunting, atau Layanan Kesehatan Warga."

PERTANYAAN WARGA: "${userQuery}"`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
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

      // Fallback endpoint
      const gemini2Url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const resp2 = await fetch(gemini2Url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      });

      if (resp2.ok) {
        const data2 = await resp2.json();
        const replyText2 = data2?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText2 && replyText2.trim()) {
          return replyText2.trim();
        }
      }

      throw new Error("Empty Gemini response");
    } catch (err) {
      console.warn("Gemini API call fallback:", err);
      const lower = userQuery.toLowerCase();
      if (lower.includes("stunting")) {
        return "Stunting adalah kondisi tumbuh kembang anak yang terhambat akibat kekurangan gizi kronis dalam waktu lama, sehingga tinggi badan anak lebih pendek dari usianya.\n\nPencegahan Utama:\n1. Asupan gizi seimbang (lauk protein hewani seperti ikan bandeng, telur, kupang lokal).\n2. Rutin menimbang BB & TB anak.\n3. Akses air bersih & sanitasi lingkungan yang sehat.";
      }
      if (lower.includes("gizi") || lower.includes("makanan") || lower.includes("nutrisi") || lower.includes("mbg")) {
        return "Kebutuhan gizi anak terdiri dari 5 komponen utama (5 Bintang): Karbohidrat, Protein Hewani, Nabati, Sayur, dan Buah. Asupan nutrisi lokal yang kaya zat besi Fe & protein hewani efektif menjaga kesehatan dan mendukung prestasi belajar siswa.";
      }
      if (lower.includes("halo") || lower.includes("hai") || lower.includes("selamat")) {
        return "Halo! Selamat datang di Pusat Bantuan Warga Kcal. Ada yang bisa saya bantu terkait layanan gizi, skrining biometrik, atau MBG hari ini?";
      }
      return "Mohon maaf, pertanyaan Anda berada di luar cakupan Layanan Nutrisi & Sistem Kcal. Pastikan pertanyaan Anda berkaitan dengan Program Makan Bergizi Gratis (MBG), Skrining Biometrik, Pencegahan Stunting, atau Layanan Kesehatan Warga.";
    }
  };

  // Send Custom Freeform Message or AI Response
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    handleHaptic();
    setInputText("");
    setShowCommands(false);

    if (query === "/komplain" || query === "/lapor") {
      const userMsg: ChatMsg = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: query,
      };
      setMessages((prev) => [...prev, userMsg]);
      saveHelpChatMessage({ sender: "user", text: query });
      startComplaintFlow();
      return;
    }

    if (query === "/track") {
      setIsAwaitingComplaint(false);
      handleOpenTrackModal();
      return;
    }

    const userMsg: ChatMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    saveHelpChatMessage({ sender: "user", text: query });

    // Handle Active Complaint Input directly from chat
    if (isAwaitingComplaint && !query.startsWith("/")) {
      setIsAwaitingComplaint(false);
      setIsTyping(true);

      const userEmail = citizenUser?.email || "nizam@gmail.com";
      const userName = citizenUser?.name || "Warga Kebomas";
      const userDistrict = citizenUser?.district || "Kebomas";

      const res = await saveComplaintToFirestore({
        senderName: userName,
        senderContact: userEmail,
        category: "Pengaduan Warga (Chat)",
        message: query,
        district: userDistrict,
        status: "baru",
      });

      if (res.success) {
        await addNotification({
          title: `Pengaduan Warga (${userName})`,
          description: `Pengaduan dari ${userName} (Kec. ${userDistrict}): "${query.substring(0, 80)}..."`,
          category: "user",
          userEmail: userEmail,
        });

        const ticketId = `ADUAN-${Date.now().toString().slice(-4)}`;
        const confirmBotMsg: ChatMsg = {
          id: `bot_complaint_done_${Date.now()}`,
          sender: "bot",
          text: `✅ Pengaduan Anda berhasil dikirim dan dibuatkan tiket resmi!\n\n📋 No. Tiket: ${ticketId}\n👤 Pelapor: ${userName} (Kec. ${userDistrict})\n💬 Detail Aduan: "${query}"\n\nLaporan ini otomatis tersimpan di Firestore dan diteruskan ke Tim SPPG & Dinkes. Ketik "/track" untuk memantau status tindak lanjut secara realtime.`,
        };

        setMessages((prev) => [...prev, confirmBotMsg]);
        saveHelpChatMessage({ sender: "bot", text: confirmBotMsg.text });
      } else {
        const errorBotMsg: ChatMsg = {
          id: `bot_complaint_err_${Date.now()}`,
          sender: "bot",
          text: "❌ Gagal menyimpan pengaduan. Silakan coba lagi.",
        };
        setMessages((prev) => [...prev, errorBotMsg]);
      }

      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    // Check exact command or category match in qaData
    const queryLower = query.toLowerCase();
    const exactQa = qaData.find(
      (q) =>
        q.command.toLowerCase() === queryLower ||
        q.question.toLowerCase() === queryLower
    );

    if (exactQa) {
      setTimeout(() => {
        const botMsg: ChatMsg = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: exactQa.answer,
        };
        setMessages((prev) => [...prev, botMsg]);
        saveHelpChatMessage({ sender: "bot", text: botMsg.text });
        setIsTyping(false);
      }, 500);
      return;
    }

    // Call Gemini AI for freeform prompt
    const aiAnswer = await askGeminiAiAssistant(query);

    const botMsg: ChatMsg = {
      id: `bot_${Date.now()}`,
      sender: "bot",
      text: aiAnswer,
      isAiGenerated: true,
    };

    setMessages((prev) => [...prev, botMsg]);
    saveHelpChatMessage({ sender: "bot", text: botMsg.text, isAiGenerated: true });
    setIsTyping(false);
  };

  // Submit Form Pengaduan to Firestore
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMessage.trim()) return;

    handleHaptic();
    setIsSubmittingComplaint(true);

    const userEmail = citizenUser?.email || "nizam@gmail.com";
    const userDistrict = citizenUser?.district || "Kebomas";

    const res = await saveComplaintToFirestore({
      senderName: complaintName || "Warga Kebomas",
      senderContact: complaintContact || userEmail,
      category: complaintCategory,
      message: complaintMessage,
      district: userDistrict,
      status: "baru",
    });

    if (res.success) {
      // Record Notification in Firestore
      await addNotification({
        title: `Pengaduan Warga (${complaintCategory})`,
        description: `Pengaduan dari ${complaintName} (Kec. ${userDistrict}): "${complaintMessage.substring(0, 80)}..."`,
        category: "user",
        userEmail: userEmail,
      });

      const ticketId = `ADUAN-${Date.now().toString().slice(-4)}`;
      const confirmBotMsg: ChatMsg = {
        id: `bot_complaint_${Date.now()}`,
        sender: "bot",
        text: `✅ Pengaduan Anda berhasil dikirimkan ke SPPG Kecamatan ${userDistrict}!\n\n📋 No. Tiket: ${ticketId}\n📁 Kategori: ${complaintCategory}\n\nKetik "/track" atau klik tombol Lacak Aduan di atas untuk memantau status tindak lanjut secara realtime.`,
      };

      setMessages((prev) => [...prev, confirmBotMsg]);
      saveHelpChatMessage({ sender: "bot", text: confirmBotMsg.text });

      setComplaintMessage("");
      setIsComplaintModalOpen(false);
    }

    setIsSubmittingComplaint(false);
  };

  // Load Track Aduan Modal
  const handleOpenTrackModal = async () => {
    handleHaptic();
    setIsTrackModalOpen(true);
    setIsLoadingTrack(true);

    const res = await fetchComplaintsFromFirestore();
    if (res.success && res.data) {
      const cleanEmail = (citizenUser?.email || "nizam@gmail.com").toLowerCase();
      const userComplaints = res.data.filter(
        (c) =>
          (c.senderContact || "").toLowerCase() === cleanEmail ||
          (c.senderName || "").toLowerCase().includes("warga")
      );
      setMyComplaints(userComplaints);
    }
    setIsLoadingTrack(false);
  };

  // Clear Chat History
  const handleClearHistory = async () => {
    handleHaptic();
    await clearHelpChatHistory();
    setMessages([DEFAULT_CITIZEN_GREETING]);
    setIsConfirmClearOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="fixed inset-0 z-[100] bg-white h-screen w-screen flex flex-col overflow-hidden"
      >
        {/* 1. TOP NAVBAR / HEADER */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                handleHaptic();
                onClose();
              }}
              className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            </button>

            <div className="min-w-0">
              <h2 className="text-[16px] font-black text-slate-800 tracking-tight leading-tight truncate">
                Pusat Bantuan &amp; FAQ
              </h2>
              <p className="text-[10.5px] text-[#0FA89B] font-bold tracking-wide truncate">
                Asisten AI &amp; Layanan Warga Kebomas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* COMPLAINT BUTTON */}
            <button
              type="button"
              onClick={startComplaintFlow}
              className="px-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Kirim Pengaduan"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600 stroke-[2.3]" />
              <span className="hidden sm:inline">Lapor</span>
            </button>

            {/* TRACK BUTTON */}
            <button
              type="button"
              onClick={handleOpenTrackModal}
              className="px-2.5 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#0FA89B] border border-teal-200/80 text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Lacak Aduan"
            >
              <Clock className="w-3.5 h-3.5 text-[#0FA89B] stroke-[2.3]" />
              <span className="hidden sm:inline">Track</span>
            </button>

            {/* CLEAR HISTORY BUTTON */}
            <button
              type="button"
              onClick={() => {
                handleHaptic();
                setIsConfirmClearOpen(true);
              }}
              className="w-8.5 h-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Bersihkan Chat"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* 2. TOP QUICK PROMPTS CHIPS BAR */}
        <div className="bg-slate-50 border-b border-slate-200/60 px-3.5 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { label: "📢 Kirim Pengaduan", cmd: "/komplain" },
            { label: "🔍 Lacak Status Aduan", cmd: "/track" },
            { label: "🩺 Skrining Biometrik", cmd: "/skrining" },
            { label: "📞 Dukungan Helpdesk", cmd: "/kontak" },
            { label: "💡 Topik Sering Ditanyakan", cmd: "/faq" },
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt.cmd)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-[#0FA89B] hover:border-[#0FA89B]/40 text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all shadow-2xs shrink-0"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* 3. MAIN CHAT STREAM AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white relative">
          {isLoading ? (
            <div className="py-20 text-center space-y-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0FA89B]" />
              <p className="text-xs font-bold">Memuat Pusat Bantuan Warga...</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#0FA89B] to-[#0B7E74] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 stroke-[2.2]" />
                  </div>
                )}

                <div
                  className={`max-w-[84%] sm:max-w-[78%] p-3.5 rounded-2xl text-[12.5px] leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white font-bold rounded-tr-xs shadow-sm"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800 font-medium rounded-tl-xs shadow-2xs"
                  }`}
                >
                  {msg.text}

                  {msg.isAiGenerated && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center gap-1 text-[10px] font-extrabold text-[#0FA89B]">
                      <Sparkles className="w-3 h-3 text-[#0FA89B]" />
                      <span>Jawaban Otomatis AI Gemini</span>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4 stroke-[2.2]" />
                  </div>
                )}
              </motion.div>
            ))
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 text-slate-400 text-[11.5px] font-bold italic"
            >
              <div className="w-8 h-8 rounded-2xl bg-teal-50 text-[#0FA89B] flex items-center justify-center shrink-0 border border-teal-100">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <span>Menyiapkan jawaban untuk Warga Kebomas...</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 4. SLASH COMMAND POPOVER MENU */}
        <AnimatePresence>
          {showCommands && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white border-t border-b border-slate-200 shadow-2xl max-h-56 overflow-y-auto p-2 space-y-1 shrink-0 z-30"
            >
              <div className="px-3 py-1 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>Topik Bantuan Tersedia ({filteredCommands.length})</span>
                <span>Pilih Command</span>
              </div>
              {filteredCommands.map((qa) => (
                <button
                  key={qa.id}
                  type="button"
                  onClick={() => handleSelectCommand(qa)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50/80 transition-colors flex items-center justify-between cursor-pointer group border border-transparent hover:border-teal-200/60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-[#0FA89B]">
                        {qa.command}
                      </span>
                      <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {qa.category}
                      </span>
                    </div>
                    <p className="text-[11.5px] font-bold text-slate-700 truncate mt-0.5">
                      {qa.question}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0FA89B] shrink-0" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. BOTTOM INPUT BAR */}
        <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2.5 shrink-0 sticky bottom-0 z-20">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ketik pertanyaan gizi / ketik '/' untuk topik..."
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="w-full pl-4 pr-10 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-[12.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0FA89B] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => handleInputChange("/")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0FA89B] font-black text-sm px-1 cursor-pointer"
              title="Tampilkan Command"
            >
              /
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => handleSendMessage()}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white flex items-center justify-center cursor-pointer shadow-md shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </motion.button>
        </div>

        {/* ═══ MODAL A: FORM PENGADUAN WARGA (/komplain) ═══ */}
        <AnimatePresence>
          {isComplaintModalOpen && (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <MessageSquare className="w-4.5 h-4.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] font-black text-slate-800">Form Pengaduan Warga</h3>
                      <p className="text-[10.5px] text-slate-400 font-bold">Kecamatan {citizenUser?.district || "Kebomas"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsComplaintModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitComplaint} className="p-5 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Nama Pelapor</label>
                    <input
                      type="text"
                      required
                      value={complaintName}
                      onChange={(e) => setComplaintName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 focus:outline-none focus:border-[#0FA89B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Kontak / Email</label>
                    <input
                      type="text"
                      required
                      value={complaintContact}
                      onChange={(e) => setComplaintContact(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 focus:outline-none focus:border-[#0FA89B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700">Kategori Pengaduan</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Kualitas & Porsi Makanan MBG",
                        "Kendala Skrining Biometrik",
                        "Layanan Posyandu & Puskesmas",
                        "Kendala Aplikasi Kcal",
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setComplaintCategory(cat)}
                          className={`p-2.5 rounded-xl border text-[10.5px] font-bold leading-tight text-left transition-all cursor-pointer ${
                            complaintCategory === cat
                              ? "bg-[#0FA89B]/10 border-[#0FA89B] text-[#0FA89B]"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Detail Masukan / Kendala</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Jelaskan secara singkat kendala atau masukan Anda..."
                      value={complaintMessage}
                      onChange={(e) => setComplaintMessage(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-800 focus:outline-none focus:border-[#0FA89B] resize-none"
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isSubmittingComplaint}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0FA89B] to-[#79D7D2] text-white text-[13px] font-black cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmittingComplaint ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirimkan Laporan...</span>
                      </>
                    ) : (
                      <span>Kirim Laporan ke SPPG &amp; Dinkes</span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ MODAL B: STATUS TRACKER ADUAN (/track) ═══ */}
        <AnimatePresence>
          {isTrackModalOpen && (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0FA89B] flex items-center justify-center border border-teal-100">
                      <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] font-black text-slate-800">Status Tiket Pengaduan Saya</h3>
                      <p className="text-[10.5px] text-[#0FA89B] font-bold">Realtime Live Sync Firestore</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50">
                  {isLoadingTrack ? (
                    <div className="py-16 text-center space-y-2 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0FA89B]" />
                      <p className="text-xs font-bold">Memuat status aduan...</p>
                    </div>
                  ) : myComplaints.length === 0 ? (
                    <div className="py-16 text-center space-y-2 bg-white rounded-2xl p-6 border border-slate-200/80">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-black text-slate-700">Belum Ada Pengaduan Dikirim</p>
                      <p className="text-[11px] text-slate-400 font-medium">Gunakan /komplain jika mengalami kendala layanan MBG atau skrining.</p>
                    </div>
                  ) : (
                    myComplaints.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                            {item.category}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              item.status === "selesai"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "proses"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.status === "selesai"
                              ? "● SELESAI"
                              : item.status === "proses"
                              ? "● DIPROSES SPPG"
                              : "● BARU (MENUNGGU)"}
                          </span>
                        </div>

                        <p className="text-[12px] font-extrabold text-slate-800 leading-snug">
                          {item.message}
                        </p>

                        <div className="text-[10px] text-slate-400 font-bold flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>Pelapor: {item.senderName}</span>
                          <span>{item.createdAtIso ? new Date(item.createdAtIso).toLocaleDateString("id-ID") : "Baru saja"}</span>
                        </div>

                        {item.responseNotes && (
                          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-800 space-y-1">
                            <span className="font-black text-[10px] uppercase text-[#0FA89B] block">Tanggapan Resmi SPPG:</span>
                            <p className="font-medium">{item.responseNotes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ═══ MODAL C: CONFIRMATION CLEAR CHAT ═══ */}
        <AnimatePresence>
          {isConfirmClearOpen && (
            <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl border border-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                  <Trash2 className="w-6 h-6 stroke-[2]" />
                </div>
                <h4 className="text-[14px] font-black text-slate-800">Bersihkan Riwayat Chat?</h4>
                <p className="text-[11.5px] text-slate-500 font-medium">Seluruh pesan percakapan bantuan akan dihapus dari tampilan Anda.</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmClearOpen(false)}
                    className="py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11.5px] font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="py-2.5 rounded-xl bg-rose-600 text-white text-[11.5px] font-bold cursor-pointer shadow-md"
                  >
                    Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
