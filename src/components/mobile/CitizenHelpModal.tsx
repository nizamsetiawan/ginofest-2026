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

import { CitizenUser } from "./types";

interface CitizenHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizenUser?: CitizenUser | null;
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
  text: "Halo! Selamat datang di Pusat Bantuan & FAQ Kcal Warga.\n\nSaya K-Bot, asisten AI resmi Layanan Nutrisi MBG & Skrining Biometrik.\n\nAda yang ingin Anda tanyakan hari ini?\n• Ketik \"/\" untuk memilih topik bantuan siap pakai.\n• Ketik \"/komplain\" untuk mengirim pengaduan kualitas MBG / layanan.\n• Ketik \"/track\" untuk memantau status aduan Anda secara realtime.\n• Atau ketik pertanyaan apa saja secara bebas, saya siap membantu Anda!",
};

const WEB_ONLY_COMMANDS = new Set([
  "/menu",
  "/generate",
  "/bom",
  "/tahunan",
  "/mingguan",
  "/pagu",
  "/siklus",
  "/rag",
  "/rag_auth",
  "/rag_komoditas",
  "/rag_harga",
  "/rag_kalibrasi",
  "/rag_menu",
  "/rag_gizi",
  "/rag_wilayah",
  "/rag_upload",
  "/rag_template",
  "/rag_tambah",
  "/rag_edit",
  "/rag_hapus",
  "/rag_search",
  "/rag_export",
  "/rag_grounding",
  "/scan",
  "/zscore",
  "/peta",
  "/ekspor",
  "/notif",
  "/pengaturan",
  "/pin",
  "/admin",
  "/firestore",
  "/device",
  "/faq",
]);

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

  // Conversational Track Flow State
  const [isAwaitingTrackSelection, setIsAwaitingTrackSelection] = useState(false);
  const [userTrackedComplaints, setUserTrackedComplaints] = useState<ComplaintRecord[]>([]);

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

  const currentEmail = (citizenUser?.email || "nizam@gmail.com").trim().toLowerCase();

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
        answer: "Pilih tiket aduan Anda di percakapan untuk melihat perkembangan status & tanggapan tim SPPG.",
      },
    ];

    if (qaRes.success && qaRes.data) {
      // Filter out ALL WEB-only admin commands from mobile view
      const citizenOnlyData = qaRes.data.filter((q) => {
        const cmd = (q.command || "").toLowerCase();
        if (WEB_ONLY_COMMANDS.has(cmd)) return false;
        if (cmd.startsWith("/rag")) return false;
        return true;
      });

      const existingCmds = new Set(citizenOnlyData.map((q) => q.command));
      const combined = [...citizenOnlyData];
      baseCommands.forEach((bc) => {
        if (!existingCmds.has(bc.command)) combined.unshift(bc);
      });
      setQaData(combined);
    } else {
      setQaData(baseCommands);
    }

    // 2. Load Chat History locked by user email
    const historyRes = await fetchHelpChatHistory(currentEmail);
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
  }, [currentEmail]);

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
    setIsAwaitingTrackSelection(false);
    setIsAwaitingComplaint(true);
    const botMsg: ChatMsg = {
      id: `bot_complaint_prompt_${Date.now()}`,
      sender: "bot",
      text: `Silakan jelaskan keluhan atau masukan Anda secara langsung di percakapan ini.\n\nTuliskan rincian kendala yang Anda alami (seperti porsi makanan, rasa, ketepatan waktu, atau kendala skrining).\n\n*Nama (${citizenUser?.name || "Warga Kebomas"}), email (${currentEmail}), dan kecamatan (${citizenUser?.district || "Kebomas"}) Anda akan otomatis dilampirkan ke tiket aduan ini.*`,
    };
    setMessages((prev) => [...prev, botMsg]);
    saveHelpChatMessage({ sender: "bot", text: botMsg.text }, currentEmail);
  };

  // Start Conversational Track Flow
  const handleConversationalTrackFlow = async () => {
    handleHaptic();
    setIsAwaitingComplaint(false);
    setIsAwaitingTrackSelection(true);
    setIsTyping(true);

    const userName = (citizenUser?.name || "warga").toLowerCase();

    const res = await fetchComplaintsFromFirestore();
    let userComplaints: ComplaintRecord[] = [];

    if (res.success && res.data) {
      userComplaints = res.data.filter(
        (c) =>
          (c.senderContact || "").toLowerCase() === currentEmail ||
          (c.senderName || "").toLowerCase().includes(userName)
      );
      if (userComplaints.length === 0 && res.data.length > 0) {
        userComplaints = res.data.slice(0, 5);
      }
    }

    setUserTrackedComplaints(userComplaints);
    setIsTyping(false);

    if (userComplaints.length === 0) {
      const emptyBotMsg: ChatMsg = {
        id: `bot_track_empty_${Date.now()}`,
        sender: "bot",
        text: `Daftar Tiket Pengaduan Anda\n\nBelum ada tiket pengaduan yang terdaftar atas email (${currentEmail}).\n\nKetik "/komplain" untuk membuat laporan pengaduan baru secara langsung di percakapan ini.`,
      };
      setMessages((prev) => [...prev, emptyBotMsg]);
      saveHelpChatMessage({ sender: "bot", text: emptyBotMsg.text }, currentEmail);
      setIsAwaitingTrackSelection(false);
      return;
    }

    let listText = `Daftar Tiket Pengaduan Anda (Kec. ${citizenUser?.district || "Kebomas"}):\n\n`;
    userComplaints.forEach((item, idx) => {
      const ticketCode = item.ticketId || (item.id ? `ADUAN-${item.id.slice(-4).toUpperCase()}` : `ADUAN-${idx + 1}`);
      const statusLabel =
        item.status === "selesai"
          ? "SELESAI"
          : item.status === "proses"
            ? "DIPROSES SPPG"
            : "BARU";
      const snippet = item.message.length > 45 ? item.message.substring(0, 45) + "..." : item.message;

      listText += `${idx + 1}. [${ticketCode}] - ${item.category}\n   • Aduan: "${snippet}"\n   • Status: ${statusLabel}\n\n`;
    });

    listText += `------------------------------------\nSilakan ketik nomor urut (misal: 1, 2) atau Kode Tiket (misal: ADUAN-...) di percakapan ini untuk melihat detail perkembangan & tanggapan resmi dari SPPG.`;

    const botMsg: ChatMsg = {
      id: `bot_track_list_${Date.now()}`,
      sender: "bot",
      text: listText,
    };

    setMessages((prev) => [...prev, botMsg]);
    saveHelpChatMessage({ sender: "bot", text: botMsg.text }, currentEmail);
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
      const userMsg: ChatMsg = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: "/track",
      };
      setMessages((prev) => [...prev, userMsg]);
      saveHelpChatMessage({ sender: "user", text: "/track" }, currentEmail);
      handleConversationalTrackFlow();
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
    saveHelpChatMessage({ sender: "user", text: userMsg.text }, currentEmail);
    saveHelpChatMessage({ sender: "bot", text: botMsg.text }, currentEmail);
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

ATURAN UTAMA TANPA EMOJI:
DILARANG keras menggunakan emoji, emoticon, atau simbol dekoratif apapun dalam seluruh jawaban Anda. Gunakan hanya teks polos bahasa Indonesia yang rapi, profesional, dan ramah.

BATASAN CAKUPAN SISTEM (STRICT SCOPE):
Anda HANYA boleh menjawab pertanyaan yang berkaitan dengan:
1. Program Makan Bergizi Gratis (MBG), komposisi menu 5 Bintang, gizi anak sekolah & balita, kecukupan AKG.
2. Penanganan & pencegahan Stunting, pengukuran Z-Score WHO, antropometri balita.
3. Skrining Biometrik Wajah & Telapak Tangan pada aplikasi Kcal.
4. Penggunaan fitur aplikasi Kcal (Notifikasi, Profil, Fitur Lapor Pengaduan Warga /komplain, Lacak Aduan /track).
5. Layanan kesehatan warga, Posyandu, Puskesmas, dan bantuan helpdesk Dinkes Gresik.
6. Sapaan ramah dari warga (seperti "halo", "hai", "selamat pagi", "apa kabar").

ATURAN PENTING & OUT-OF-SCOPE GUARDRAIL:
- Jika pertanyaan TERFOKUS pada topik di atas: Berikan jawaban yang singkat, simpel, ramah, dan mudah dipahami oleh warga/orang tua (maksimal 2-3 paragraf ringkas). Jika pengguna menanyakan tentang stunting (misal: "apa yang kamu ketahui tentang stunting"), jelaskan pengertian stunting secara sederhana serta poin pencegahannya.
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
          const cleanText = replyText.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
          return cleanText.trim();
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
          const cleanText2 = replyText2.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
          return cleanText2.trim();
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
      saveHelpChatMessage({ sender: "user", text: query }, currentEmail);
      startComplaintFlow();
      return;
    }

    if (query === "/track" || query === "/lacak") {
      const userMsg: ChatMsg = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: query,
      };
      setMessages((prev) => [...prev, userMsg]);
      saveHelpChatMessage({ sender: "user", text: query }, currentEmail);
      handleConversationalTrackFlow();
      return;
    }

    const userMsg: ChatMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    saveHelpChatMessage({ sender: "user", text: query }, currentEmail);

    // Handle Active Complaint Input directly from chat
    if (isAwaitingComplaint && !query.startsWith("/")) {
      setIsAwaitingComplaint(false);
      setIsTyping(true);

      const userName = citizenUser?.name || "Warga Kebomas";
      const userDistrict = citizenUser?.district || "Kebomas";

      const res = await saveComplaintToFirestore({
        senderName: userName,
        senderContact: currentEmail,
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
          userEmail: currentEmail,
        });

        const createdTicketId = res.ticketId || `ADUAN-${Date.now().toString().slice(-4)}`;
        const confirmBotMsg: ChatMsg = {
          id: `bot_complaint_done_${Date.now()}`,
          sender: "bot",
          text: `Pengaduan Anda berhasil dikirim dan dibuatkan tiket resmi.\n\nNo. Tiket: ${createdTicketId}\nPelapor: ${userName} (Kec. ${userDistrict})\nDetail Aduan: "${query}"\n\nLaporan ini otomatis tersimpan di Firestore dan diteruskan ke Tim SPPG & Dinkes. Ketik "/track" untuk memantau status tindak lanjut secara realtime.`,
        };

        setMessages((prev) => [...prev, confirmBotMsg]);
        saveHelpChatMessage({ sender: "bot", text: confirmBotMsg.text }, currentEmail);
      } else {
        const errorBotMsg: ChatMsg = {
          id: `bot_complaint_err_${Date.now()}`,
          sender: "bot",
          text: "Gagal menyimpan pengaduan. Silakan coba lagi.",
        };
        setMessages((prev) => [...prev, errorBotMsg]);
      }

      setIsTyping(false);
      return;
    }

    // Handle Conversational Track Selection directly from chat input
    if (isAwaitingTrackSelection && !query.startsWith("/")) {
      const cleanInput = query.trim().toLowerCase();
      let matchedComplaint: ComplaintRecord | undefined;
      let matchedTicketCode = "";

      const parsedNum = parseInt(cleanInput, 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= userTrackedComplaints.length) {
        matchedComplaint = userTrackedComplaints[parsedNum - 1];
        matchedTicketCode =
          matchedComplaint.ticketId ||
          (matchedComplaint.id ? `ADUAN-${matchedComplaint.id.slice(-4).toUpperCase()}` : `ADUAN-${parsedNum}`);
      }

      if (!matchedComplaint) {
        matchedComplaint = userTrackedComplaints.find((c, idx) => {
          const tId = (c.ticketId || "").toLowerCase();
          const docId = (c.id || "").toLowerCase();
          return (
            tId.includes(cleanInput) ||
            docId.includes(cleanInput) ||
            `aduan-${idx + 1}` === cleanInput
          );
        });
        if (matchedComplaint) {
          matchedTicketCode =
            matchedComplaint.ticketId ||
            (matchedComplaint.id ? `ADUAN-${matchedComplaint.id.slice(-4).toUpperCase()}` : "ADUAN-TIKET");
        }
      }

      if (matchedComplaint) {
        setIsAwaitingTrackSelection(false);
        const statusBadge =
          matchedComplaint.status === "selesai"
            ? "SELESAI"
            : matchedComplaint.status === "proses"
              ? "DIPROSES SPPG"
              : "BARU (MENUNGGU VERIFIKASI)";

        const createdDate = matchedComplaint.createdAtIso
          ? new Date(matchedComplaint.createdAtIso).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
          : "Baru saja";

        const detailBotMsg: ChatMsg = {
          id: `bot_track_detail_${Date.now()}`,
          sender: "bot",
          text: `Detail Status Tiket: ${matchedTicketCode}\n\n• Pelapor: ${matchedComplaint.senderName}\n• Kecamatan: ${matchedComplaint.district || citizenUser?.district || "Kebomas"}\n• Kategori: ${matchedComplaint.category}\n• Status Tiket: ${statusBadge}\n• Rincian Aduan: "${matchedComplaint.message}"\n• Tanggal Dilaporkan: ${createdDate}\n\nTanggapan Resmi Tim SPPG / Dinkes:\n${matchedComplaint.responseNotes
              ? `"${matchedComplaint.responseNotes}"`
              : "Laporan Anda telah tersimpan di sistem dan sedang dalam proses verifikasi tim verifikator SPPG Kebomas."
            }\n\n------------------------------------\nKetik "/track" untuk memantau tiket lain, atau "/komplain" untuk membuat laporan baru.`,
        };

        setMessages((prev) => [...prev, detailBotMsg]);
        saveHelpChatMessage({ sender: "bot", text: detailBotMsg.text }, currentEmail);
        return;
      }
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
        saveHelpChatMessage({ sender: "bot", text: botMsg.text }, currentEmail);
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
    saveHelpChatMessage({ sender: "bot", text: botMsg.text, isAiGenerated: true }, currentEmail);
    setIsTyping(false);
  };

  // Submit Form Pengaduan to Firestore
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintMessage.trim()) return;

    handleHaptic();
    setIsSubmittingComplaint(true);

    const userDistrict = citizenUser?.district || "Kebomas";

    const res = await saveComplaintToFirestore({
      senderName: complaintName || "Warga Kebomas",
      senderContact: complaintContact || currentEmail,
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
        userEmail: currentEmail,
      });

      const ticketId = `ADUAN-${Date.now().toString().slice(-4)}`;
      const confirmBotMsg: ChatMsg = {
        id: `bot_complaint_${Date.now()}`,
        sender: "bot",
        text: `✅ Pengaduan Anda berhasil dikirimkan ke SPPG Kecamatan ${userDistrict}!\n\n📋 No. Tiket: ${ticketId}\n📁 Kategori: ${complaintCategory}\n\nKetik "/track" atau klik tombol Lacak Aduan di atas untuk memantau status tindak lanjut secara realtime.`,
      };

      setMessages((prev) => [...prev, confirmBotMsg]);
      saveHelpChatMessage({ sender: "bot", text: confirmBotMsg.text }, currentEmail);

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
      const userComplaints = res.data.filter(
        (c) =>
          (c.senderContact || "").toLowerCase() === currentEmail ||
          (c.senderName || "").toLowerCase().includes("warga")
      );
      setMyComplaints(userComplaints);
    }
    setIsLoadingTrack(false);
  };

  // Clear Chat History
  const handleClearHistory = async () => {
    handleHaptic();
    await clearHelpChatHistory(currentEmail);
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
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-hidden"
      >
        <div className="bg-[#F8FAFC] sm:rounded-3xl sm:border sm:border-slate-200/90 shadow-2xl h-full sm:h-[90vh] w-full max-w-5xl flex flex-col overflow-hidden relative">
          {/* 1. TOP NAVBAR / HEADER */}
          <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  handleHaptic();
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.2]" />
              </button>

              <h2 className="text-[17px] font-black text-slate-800 tracking-tight leading-none truncate">
                Pusat Bantuan &amp; FAQ
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* TRASH / HAPUS BUTTON ONLY */}
              <button
                type="button"
                onClick={() => {
                  handleHaptic();
                  setIsConfirmClearOpen(true);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Bersihkan Chat"
              >
                <Trash2 className="w-4.5 h-4.5 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* 2. MAIN CHAT STREAM AREA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8FAFC] relative">
            {isLoading ? (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#52D4C5]" />
                <p className="text-xs font-bold">Memuat Pusat Bantuan Kcal...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <>
                      <div className="w-9 h-9 rounded-full bg-[#52D4C5] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                        <Bot className="w-5 h-5 stroke-[2.2]" />
                      </div>

                      <div className="max-w-[88%] sm:max-w-[80%] bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl sm:rounded-3xl text-[13px] leading-relaxed text-slate-800 shadow-2xs whitespace-pre-line font-medium space-y-1.5">
                        {msg.isAiGenerated && (
                          <div className="text-[11px] font-black text-[#3ECFBE] mb-2 pb-1 border-b border-slate-100">
                            Jawaban dari K-Bot
                          </div>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    </>
                  )}

                  {msg.sender === "user" && (
                    <>
                      <div className="max-w-[85%] sm:max-w-[75%] bg-[#4EDBCB] text-white font-semibold rounded-2xl sm:rounded-3xl px-5 py-3 text-[13px] shadow-xs whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </div>

                      {citizenUser?.photoURL ? (
                        <img
                          src={citizenUser.photoURL}
                          alt={citizenUser.name || "User Avatar"}
                          className="w-9 h-9 rounded-full object-cover shrink-0 shadow-xs mt-0.5 border-2 border-white select-none"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1E2B45] text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-0.5">
                          <User className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))
            )}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-slate-400 text-[12px] font-bold italic"
              >
                <div className="w-9 h-9 rounded-full bg-teal-50 text-[#52D4C5] flex items-center justify-center shrink-0 border border-teal-100">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <span>K-Bot sedang mengetik jawaban...</span>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 3. SLASH COMMAND POPOVER MENU */}
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
                        <span className="text-[12px] font-black text-[#52D4C5]">
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
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#52D4C5] shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. BOTTOM INPUT BAR (FIXED AT BOTTOM) */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-3 shrink-0 sticky bottom-0 z-20">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder='Ketik "/" untuk perintah cepat, "/komplain" untuk kirim keluhan, atau tanyakan apa saja...'
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="w-full pl-5 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl text-[13px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#52D4C5] focus:bg-white transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleInputChange("/")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#52D4C5] font-black text-sm px-1 cursor-pointer"
                title="Tampilkan Command"
              >
                /
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => handleSendMessage()}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#52D4C5] hover:bg-[#43c5b6] text-white flex items-center justify-center cursor-pointer shadow-md shrink-0 transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
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
                          className={`p-2.5 rounded-xl border text-[10.5px] font-bold leading-tight text-left transition-all cursor-pointer ${complaintCategory === cat
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
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.status === "selesai"
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
