"use client";

import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface NuSantapHeaderProps {
  adminName?: string;
  regionName?: string;
  onDownloadPDF: () => void;
}

export const NuSantapHeader: React.FC<NuSantapHeaderProps> = ({
  adminName = "Dr. Hendra Pratama",
  onDownloadPDF,
}) => {
  const [greetingText, setGreetingText] = useState<string>("Selamat Datang");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 11) {
        setGreetingText("Selamat Pagi");
      } else if (hour >= 11 && hour < 15) {
        setGreetingText("Selamat Siang");
      } else if (hour >= 15 && hour < 18) {
        setGreetingText("Selamat Sore");
      } else {
        setGreetingText("Selamat Malam");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
      <div>
        <p className="text-[14px] text-[#475569]">
          {greetingText},{" "}
          <strong className="text-[#071e49] font-black">{adminName}</strong> 👋
        </p>
      </div>

      <button
        onClick={onDownloadPDF}
        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-white bg-[#1a73e8] hover:bg-[#155fc0] rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Download PDF</span>
      </button>
    </div>
  );
};
