"use client";

import React, { useState } from "react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { MONTHLY_TRENDS } from "@/data/monthly-trends";
import { TrendingDown, LineChart as LineChartIcon, Coins, Sparkles, Download } from "lucide-react";

export const AnalyticsTrends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"stunting" | "budget">("stunting");

  const downloadChartAsPng = () => {
    const container = document.getElementById("chart-analytics-trends");
    if (!container) return;
    const svgElement = container.querySelector("svg");
    if (!svgElement) return;

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URLObject = window.URL || window.webkitURL || window;
      const blobURL = URLObject.createObjectURL(svgBlob);

      const image = new window.Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 2;
        const width = svgElement.clientWidth || 800;
        const height = svgElement.clientHeight || 350;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.scale(scale, scale);
          context.drawImage(image, 0, 0, width, height);
        }
        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `Tren_Efektivitas_MBG_${activeTab}.png`;
        downloadLink.href = png;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URLObject.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Gagal unduh gambar grafik:", err);
    }
  };

  return (
    <div className="app-card p-5 shadow-subtle font-sans">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-[#e2e8f0] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-tint text-ford-blue flex items-center justify-center">
              <LineChartIcon className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-bold text-ford-blue">
              Tren Efektivitas Intervensi Gizi & Dampak MBG
            </h2>
          </div>
          <p className="text-[12px] text-blue-gray mt-0.5">
            Data historis 6 bulan terakhir capaian penurunan stunting dan optimalisasi fiskal APBD Gresik
          </p>
        </div>

        {/* Controls: Tab switcher & Download button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-[12px] font-bold">
            <button
              onClick={() => setActiveTab("stunting")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === "stunting"
                  ? "bg-white text-ford-blue shadow-xs"
                  : "text-blue-gray hover:text-ford-blue"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-light-sea-green" />
              <span>Tren Stunting (%)</span>
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === "budget"
                  ? "bg-white text-ford-blue shadow-xs"
                  : "text-blue-gray hover:text-ford-blue"
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-brand-orange" />
              <span>Efisiensi APBD (Rp M)</span>
            </button>
          </div>

          <button
            onClick={downloadChartAsPng}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-ford-blue text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
            title="Unduh Grafik sebagai Gambar (PNG)"
          >
            <Download className="w-3.5 h-3.5 text-light-sea-green" />
            <span>Unduh PNG</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div id="chart-analytics-trends" className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "stunting" ? (
            <AreaChart
              data={MONTHLY_TRENDS}
              margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="stuntingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4DE0A3" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4DE0A3" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#35CBC3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#35CBC3" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "#748DA6", fontSize: 11 }} 
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis 
                domain={[5, 20]} 
                tick={{ fill: "#748DA6", fontSize: 11 }} 
                axisLine={{ stroke: "#e2e8f0" }}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  borderRadius: "12px", 
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                  fontSize: "12px"
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Area 
                type="monotone" 
                dataKey="stuntingPrevalence" 
                name="Prevalensi Nyata (%)" 
                stroke="#4DE0A3" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#stuntingGrad)" 
              />
              <Area 
                type="monotone" 
                dataKey="targetPrevalence" 
                name="Target Pemkab (%)" 
                stroke="#35CBC3" 
                strokeDasharray="4 4"
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#targetGrad)" 
              />
            </AreaChart>
          ) : (
            <BarChart
              data={MONTHLY_TRENDS}
              margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "#748DA6", fontSize: 11 }} 
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis 
                tick={{ fill: "#748DA6", fontSize: 11 }} 
                axisLine={{ stroke: "#e2e8f0" }}
                unit=" M"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  borderRadius: "12px", 
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
                  fontSize: "12px"
                }}
                formatter={(value: any) => [`Rp ${value} Milyar`, ""]}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
              <Bar 
                dataKey="apbdBudgetMilyar" 
                name="Alokasi Pagu APBD" 
                fill="#cbd5e1" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="actualCostMilyar" 
                name="Realisasi Teroptimasi" 
                fill="#4DE0A3" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="savedBudgetMilyar" 
                name="Dana Terselamatkan (Hemat)" 
                fill="#f68a22" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insight Summary */}
      <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center sm:justify-between text-[12px] text-[#64748b] gap-2">
        <span className="flex items-center gap-1.5 text-[#222222] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#f68a22]" />
          Proyeksi AI: Gresik berpotensi mencapai prevalensi <strong>&lt; 9.5%</strong> pada Q4 2026.
        </span>
        <span className="text-[#1e7d36] font-semibold bg-[#d5f0db] px-2 py-0.5 rounded-md">
          Status: Unggul Nasional
        </span>
      </div>
    </div>
  );
};
