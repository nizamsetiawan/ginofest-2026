"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Sunrise, Sunset, Clock, MapPin, Loader2 } from "lucide-react";

interface NuSantapHeaderProps {
  adminName?: string;
  regionName?: string;
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export const NuSantapHeader: React.FC<NuSantapHeaderProps> = ({
  adminName = "Nizam Setiawan",
  regionName = "Kabupaten Gresik",
}) => {
  const [greetingText, setGreetingText] = useState<string>("Selamat Datang");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("night");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<string>("Memuat Lokasi...");
  const [isLocating, setIsLocating] = useState<boolean>(true);

  // 1. Get Live Clock & Time of Day
  useEffect(() => {
    const updateTimeAtmosphere = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 4 && hour < 11) {
        setGreetingText("Selamat Pagi");
        setTimeOfDay("morning");
      } else if (hour >= 11 && hour < 15) {
        setGreetingText("Selamat Siang");
        setTimeOfDay("afternoon");
      } else if (hour >= 15 && hour < 18) {
        setGreetingText("Selamat Sore");
        setTimeOfDay("evening");
      } else {
        setGreetingText("Selamat Malam");
        setTimeOfDay("night");
      }

      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );

      setCurrentDateStr(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateTimeAtmosphere();
    const interval = setInterval(updateTimeAtmosphere, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Get Current Location via Geolocation API
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
              { headers: { "Accept-Language": "id" } }
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const district = addr.suburb || addr.municipality || addr.village || addr.town || addr.city_district || "";
              const city = addr.city || addr.regency || addr.county || "";

              if (district && city) {
                setCurrentLocation(`${district}, ${city}`);
              } else if (city) {
                setCurrentLocation(city);
              } else if (data.name) {
                setCurrentLocation(data.name);
              } else {
                setCurrentLocation(regionName || "Kabupaten Gresik");
              }
            } else {
              setCurrentLocation(regionName || "Kabupaten Gresik");
            }
          } catch {
            setCurrentLocation(regionName || "Kabupaten Gresik");
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          // GPS inactive / permission not granted
          setCurrentLocation("GPS Belum Aktif");
          setIsLocating(false);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      setCurrentLocation("GPS Belum Aktif");
      setIsLocating(false);
    }
  }, [regionName]);

  return (
    <div className="relative pb-3 overflow-hidden select-none">
      {timeOfDay === "night" ? (
        /* ═══════════ SUASANA MALAM (NIGHT AESTHETIC) ═══════════ */
        <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#071426] via-[#0d1f3c] to-[#081b38] border border-blue-950/60 shadow-xl overflow-hidden text-white transition-all duration-700 animate-in fade-in">
          {/* Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

          {/* Twinkling Star Dots */}
          <div className="absolute top-3 left-1/4 w-1.5 h-1.5 rounded-full bg-blue-200/60 animate-ping duration-1000"></div>
          <div className="absolute top-6 right-1/4 w-1 h-1 rounded-full bg-amber-200/80 animate-pulse"></div>
          <div className="absolute bottom-4 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-200/50 animate-pulse"></div>
          <div className="absolute top-4 right-12 w-1 h-1 rounded-full bg-white/70 animate-pulse"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-[11px] font-bold text-blue-200 shadow-inner">
                  <Moon className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                  <span>Suasana Malam</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                </span>

                {/* Location Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold text-blue-100 backdrop-blur-sm">
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-blue-300" />
                  )}
                  <span>{currentLocation}</span>
                </span>
              </div>

              <h1 className="text-[20px] sm:text-[22px] font-black tracking-tight text-white flex items-center gap-2">
                <span>{greetingText},</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-200">
                  {adminName}
                </span>
                <span className="inline-block animate-bounce">🌙</span>
              </h1>
              <p className="text-[12px] text-blue-200/70">
                Dashboard Pemantauan MBG & Intervensi Gizi tetap aktif dan tersinkronisasi 24/7.
              </p>
            </div>

            {/* Night Clock Badge */}
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-[13px] font-mono font-black text-white tracking-wider">
                  {currentTimeStr}
                </div>
                <div className="text-[10px] text-blue-300/80 font-medium">
                  {currentDateStr}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════ SUASANA SIANG / PAGI / SORE (DAYLIGHT AESTHETIC) ═══════════ */
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-3xl bg-gradient-to-r from-blue-50/60 via-slate-50 to-white border border-[#e2e8f0] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center shadow-xs shrink-0">
              {timeOfDay === "morning" && <Sunrise className="w-5 h-5 text-amber-500" />}
              {timeOfDay === "afternoon" && <Sun className="w-5 h-5 text-amber-500" />}
              {timeOfDay === "evening" && <Sunset className="w-5 h-5 text-orange-500" />}
            </div>
            <div>
              <p className="text-[14px] text-[#475569]">
                {greetingText},{" "}
                <strong className="text-[#071e49] font-black">{adminName}</strong> 👋
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mt-0.5">
                {isLocating ? (
                  <Loader2 className="w-3 h-3 text-[#1a73e8] animate-spin" />
                ) : (
                  <MapPin className="w-3 h-3 text-[#1a73e8]" />
                )}
                <span className="font-semibold text-[#071e49]">{currentLocation}</span>
                <span>•</span>
                <span>Sistem Aktif Realtime</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[12px] font-mono text-[#64748b] bg-white px-3.5 py-1.5 rounded-xl border border-[#cbd5e1] self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span className="font-bold text-[#071e49]">{currentTimeStr}</span>
            <span>•</span>
            <span className="text-[11px]">{currentDateStr}</span>
          </div>
        </div>
      )}
    </div>
  );
};
