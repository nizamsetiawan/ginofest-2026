"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GovernmentDashboard } from "@/components/dashboard/GovernmentDashboard";

export default function RootPage() {
  const router = useRouter();
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is accessing from a mobile device or small viewport
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 768;

    if (isMobileUA || isSmallScreen) {
      setIsMobileDevice(true);
      router.replace("/masyarakat");
    } else {
      setIsMobileDevice(false);
    }
  }, [router]);

  if (isMobileDevice === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-white text-sm font-medium">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Memuat Kcal...</span>
        </div>
      </div>
    );
  }

  if (isMobileDevice) {
    return null;
  }

  return <GovernmentDashboard />;
}
