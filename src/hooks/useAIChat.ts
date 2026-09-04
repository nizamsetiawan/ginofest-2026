import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { AIService } from "@/services/ai-service";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "ai",
    text: "Halo! Saya Asisten AI Gizi Kcal Pemkab Gresik. Ada yang bisa saya bantu terkait kebutuhan nutrisi MBG, potensi pangan lokal (Bandeng, Kupang, Udang), atau strategi penanganan stunting di wilayah Anda?",
    timestamp: "Sekarang",
  },
];

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: "Baru saja",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const aiReply = await AIService.generateNutritionAdvice(query);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        timestamp: "Baru saja",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    messagesEndRef,
    sendMessage,
  };
}
