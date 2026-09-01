"use client";

import React from "react";
import { Utensils, CalendarDays } from "lucide-react";
import { Page, Card, Badge } from "konsta/react";
import { CitizenUser } from "../types";

interface MobileMenuTabProps {
  citizenUser: CitizenUser | null;
}

export const MobileMenuTab: React.FC<MobileMenuTabProps> = ({ citizenUser }) => {
  const weeklyMenus = [
    { day: "Senin", menu: "Nasi Pulen + Bandeng Bakar Madu Gresik", side: "Sayur Bening Bayam + Tempe Bacem + Jeruk", cal: "680 kkal" },
    { day: "Selasa", menu: "Nasi Gurih + Ayam Suwir Bumbu Kuning", side: "Tumis Buncis Jagung + Tahu Kukus + Semangka", cal: "695 kkal" },
    { day: "Rabu", menu: "Nasi Putih + Rolade Ikan Kerapu Segar", side: "Sayur Sop Wortel Kentang + Telur Puyuh + Pisang", cal: "675 kkal" },
    { day: "Kamis", menu: "Nasi Uduk + Telur Dadar Sayur Tebal", side: "Capcay Sayuran Segar + Tempe Mendoan + Melon", cal: "660 kkal" },
    { day: "Jumat", menu: "Nasi Putih + Semur Daging Sapi Lokal", side: "Sayur Lodeh Labu Siam + Kerupuk Udang + Pepaya", cal: "710 kkal" },
  ];

  return (
    <Page className="p-4 space-y-3.5 pb-36 font-sans animate-in fade-in duration-200 select-none bg-transparent">
      <Card className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-light-sea-green" />
          <h3 className="text-[14px] font-black text-ford-blue">Jadwal Menu MBG Mingguan</h3>
        </div>
        <p className="text-[10.5px] text-blue-gray">Standar Gizi BGN • Wilayah Kec. {citizenUser?.district || "Kebomas"}, Gresik</p>
      </Card>

      {weeklyMenus.map((m, idx) => (
        <Card key={idx} className="!m-0 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-tint border border-green-02/40 flex flex-col items-center justify-center shrink-0 shadow-2xs">
            <Utensils className="w-4 h-4 text-ford-blue" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <Badge colors={{ bg: "bg-ford-blue", text: "text-white" }} className="px-2 py-0.5 rounded-md text-[9.5px] font-bold">
                {m.day}
              </Badge>
              <Badge colors={{ bg: "bg-green-tint", text: "text-ford-blue" }} className="text-[9.5px] font-black px-2 py-0.5 rounded-full border border-green-02/40">
                {m.cal}
              </Badge>
            </div>
            <h4 className="text-[12px] font-black text-ford-blue truncate">{m.menu}</h4>
            <p className="text-[10.5px] text-blue-gray line-clamp-1 font-medium">{m.side}</p>
          </div>
        </Card>
      ))}
    </Page>
  );
};
