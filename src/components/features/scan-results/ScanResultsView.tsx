"use client";

import React, { useState, useEffect } from "react";
import { 
  OFFICIAL_GRESIK_DATA, 
  MULTI_YEAR_TREND_DATA,
  DistrictStuntingYearRecord 
} from "@/data/gresik-official-stunting";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts";
import { 
  Search, 
  Activity, 
  HeartHandshake, 
  GraduationCap, 
  CheckCircle2,
  RefreshCw,
  Calendar,
  Building2,
  Download
} from "lucide-react";

interface ScanResultsViewProps {
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
}

// Custom Clean White Tooltip for High Legibility
const CustomTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-[#e2e8f0] space-y-2 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-1.5">
          <span className="text-[13px] font-black text-[#071e49]">
            Tahun {label}
          </span>
        </div>
        <div className="space-y-1.5 text-[12px]">
          {payload.map((entry: any, index: number) => {
            const isStunting = entry.dataKey === "totalStunting" || entry.dataKey === "balitaStunting";
            const isSembuh = entry.dataKey === "totalSembuh" || entry.dataKey === "balitaSembuh";
            const colorClass = isStunting 
              ? "text-red-600 bg-red-50 border-red-100" 
              : isSembuh 
              ? "text-[#1a73e8] bg-blue-50 border-blue-100" 
              : "text-emerald-600 bg-emerald-50 border-emerald-100";

            return (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="text-[#64748b] font-medium flex items-center gap-1.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
                <span className={`font-black px-2 py-0.5 rounded-md border text-[11px] ${colorClass}`}>
                  {Number(entry.value).toLocaleString("id-ID")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for District Bar Chart
const CustomDistrictTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-[#e2e8f0] space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-1.5">
          <span className="text-[13px] font-black text-[#071e49]">
            Kec. {label}
          </span>
        </div>
        <div className="space-y-1.5 text-[12px]">
          {payload.map((entry: any, index: number) => {
            const isStunting = entry.dataKey === "balitaStunting";
            const isSembuh = entry.dataKey === "balitaSembuh";
            const colorClass = isStunting 
              ? "text-red-600 bg-red-50 border-red-100" 
              : isSembuh 
              ? "text-[#1a73e8] bg-blue-50 border-blue-100" 
              : "text-emerald-600 bg-emerald-50 border-emerald-100";

            return (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="text-[#64748b] font-medium flex items-center gap-1.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
                <span className={`font-black px-2 py-0.5 rounded-md border text-[11px] ${colorClass}`}>
                  {Number(entry.value).toLocaleString("id-ID")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const ScanResultsView: React.FC<ScanResultsViewProps> = ({
  selectedDistrictId,
  setSelectedDistrictId,
}) => {
  const [subTab, setSubTab] = useState<"utama" | "grafik" | "tabel">("utama");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiSource, setApiSource] = useState("Dinas Kesehatan Kab. Gresik");
  const [activeRecords, setActiveRecords] = useState<DistrictStuntingYearRecord[]>(
    OFFICIAL_GRESIK_DATA["2026"].records
  );
  const [totals, setTotals] = useState({
    stunting: OFFICIAL_GRESIK_DATA["2026"].totalStunting,
    sembuh: OFFICIAL_GRESIK_DATA["2026"].totalSembuh,
    lulus: OFFICIAL_GRESIK_DATA["2026"].totalLulus,
  });

  // Fetch real-time data from API Route /api/stunting
  const fetchYearData = async (year: string) => {
    setIsLoadingApi(true);
    try {
      const res = await fetch(`/api/stunting?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setActiveRecords(data.records);
          setTotals({
            stunting: data.totalStunting,
            sembuh: data.totalSembuh,
            lulus: data.totalLulus,
          });
          setApiSource(data.source || "Dinas Kesehatan Kab. Gresik");
        }
      }
    } catch (err) {
      console.warn("Menggunakan data cadangan:", err);
      const fallback = OFFICIAL_GRESIK_DATA[year] || OFFICIAL_GRESIK_DATA["2026"];
      setActiveRecords(fallback.records);
      setTotals({
        stunting: fallback.totalStunting,
        sembuh: fallback.totalSembuh,
        lulus: fallback.totalLulus,
      });
      setApiSource("Dinas Kesehatan Kab. Gresik");
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchYearData(selectedYear);
  }, [selectedYear]);

  // Filtered district records for table
  const filteredRecords = activeRecords.filter((item) => {
    if (!searchQuery) return true;
    const matchName = item.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCode = item.kodeWilayah.toLowerCase().includes(searchQuery.toLowerCase());
    return matchName || matchCode;
  });

  // 3 Summary Cards
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Balita Stunting */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#64748b] block">
            Balita Stunting ({selectedYear})
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[22px] font-black text-red-600 tracking-tight">
              {totals.stunting.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-[#64748b] font-medium">Jiwa</span>
          </div>
        </div>
      </div>

      {/* 2. Balita Sembuh */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#64748b] block">
            Balita Sembuh ({selectedYear})
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[22px] font-black text-[#1a73e8] tracking-tight">
              {totals.sembuh.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-[#64748b] font-medium">Jiwa</span>
          </div>
        </div>
      </div>

      {/* 3. Balita Lulus */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#64748b] block">
            Balita Lulus ({selectedYear})
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[22px] font-black text-emerald-600 tracking-tight">
              {totals.lulus.toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-[#64748b] font-medium">Jiwa</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to download any Recharts container as crisp PNG image
  const downloadChartAsPng = (containerId: string, filename: string) => {
    const container = document.getElementById(containerId);
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
        const scale = 2; // High DPI crisp retina quality
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
        downloadLink.download = `${filename}.png`;
        downloadLink.href = png;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URLObject.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Gagal mengunduh gambar grafik:", err);
    }
  };

  // Reusable Line & Bar Charts
  const renderCharts = () => (
    <div className="space-y-6">
      {/* 1. Multi-Year Trend Chart (2022 - 2026) */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-[16px] font-black text-[#071e49]">
              Tren Kasus Stunting Kabupaten Gresik (2022 - 2026)
            </h2>
            <p className="text-[12px] text-[#64748b]">
              Perbandingan tren tahunan balita stunting, sembuh, dan lulus
            </p>
          </div>

          <button
            onClick={() => downloadChartAsPng("chart-trend-stunting", `Grafik_Tren_Stunting_Gresik_2022_2026`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#071e49] text-[11px] font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
            title="Unduh Grafik sebagai Gambar (PNG)"
          >
            <Download className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Unduh PNG</span>
          </button>
        </div>

        <div id="chart-trend-stunting" className="w-full h-72 min-h-[280px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MULTI_YEAR_TREND_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTrendTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line 
                  name="Balita Stunting" 
                  type="monotone" 
                  dataKey="totalStunting" 
                  stroke="#dc2626" 
                  strokeWidth={2.5} 
                  dot={{ r: 4.5, fill: "#dc2626" }} 
                />
                <Line 
                  name="Balita Sembuh" 
                  type="monotone" 
                  dataKey="totalSembuh" 
                  stroke="#1a73e8" 
                  strokeWidth={2.5} 
                  dot={{ r: 4.5, fill: "#1a73e8" }} 
                />
                <Line 
                  name="Balita Lulus" 
                  type="monotone" 
                  dataKey="totalLulus" 
                  stroke="#059669" 
                  strokeWidth={2.5} 
                  dot={{ r: 4.5, fill: "#059669" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#64748b] text-[13px] animate-pulse">
              Memuat grafik tren...
            </div>
          )}
        </div>
      </div>

      {/* 2. Bar Chart Per-Kecamatan (Tahun Terpilih) */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-[16px] font-black text-[#071e49]">
              Distribusi 18 Kecamatan Tahun {selectedYear}
            </h2>
            <p className="text-[12px] text-[#64748b]">
              Perbandingan Balita Stunting, Sembuh, dan Lulus per Kecamatan
            </p>
          </div>

          <button
            onClick={() => downloadChartAsPng("chart-district-distribution", `Grafik_Distribusi_Kecamatan_${selectedYear}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#071e49] text-[11px] font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
            title="Unduh Grafik sebagai Gambar (PNG)"
          >
            <Download className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Unduh PNG</span>
          </button>
        </div>

        <div id="chart-district-distribution" className="w-full h-80 min-h-[320px]">
          {isMounted && !isLoadingApi ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeRecords} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="kecamatan" 
                  tick={{ fontSize: 10, fill: "#64748b" }} 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomDistrictTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar name="Balita Stunting" dataKey="balitaStunting" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar name="Balita Sembuh" dataKey="balitaSembuh" fill="#1a73e8" radius={[4, 4, 0, 0]} />
                <Bar name="Balita Lulus" dataKey="balitaLulus" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col justify-end p-6 gap-3 animate-pulse bg-slate-50/50 rounded-2xl">
              <div className="flex items-end justify-between gap-3 h-52">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="flex-1 flex items-end gap-1 h-full">
                    <Skeleton className="w-full rounded-t-sm" style={{ height: `${25 + (i * 9) % 70}%` }} />
                    <Skeleton className="w-full rounded-t-sm bg-blue-200/80" style={{ height: `${35 + (i * 13) % 60}%` }} />
                    <Skeleton className="w-full rounded-t-sm bg-emerald-200/80" style={{ height: `${20 + (i * 11) % 65}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-2 border-t border-slate-200 pt-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-7" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Reusable Table Section
  const renderTableSection = () => (
    <div className="space-y-4">
      {/* Search Input Filter */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari kecamatan atau kode wilayah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-[#e2e8f0] rounded-xl text-[#071e49] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1a73e8] transition-all"
          />
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-[12px] text-[#64748b] font-medium hidden sm:inline">
          Menampilkan {filteredRecords.length} Kecamatan (Tahun {selectedYear})
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[#071e49] font-bold text-[12px]">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Kode Wilayah</th>
                <th className="py-3 px-4">Kecamatan</th>
                <th className="py-3 px-4 text-center text-red-600 font-black">Balita Stunting</th>
                <th className="py-3 px-4 text-center text-[#1a73e8] font-black">Balita Sembuh</th>
                <th className="py-3 px-4 text-center text-emerald-600 font-black">Balita Lulus</th>
                <th className="py-3 px-4 text-center">Status Intervensi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f1f5f9]">
              {isLoadingApi ? (
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={rIdx} className="divide-x divide-slate-100 animate-pulse">
                    <td className="py-2.5 px-3 text-center bg-slate-50/50">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-2.5 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-2.5 px-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Skeleton className="h-5 w-24 rounded-full mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((row, idx) => (
                  <tr 
                    key={row.kodeWilayah || idx}
                    onClick={() => setSelectedDistrictId(row.kecamatan.toLowerCase())}
                    className="hover:bg-[#f0f7ff] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-[#64748b] text-[12px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1a73e8] text-[12px]">
                      {row.kodeWilayah}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#071e49]">
                      Kec. {row.kecamatan}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-red-600">
                      {row.balitaStunting}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#1a73e8]">
                      {row.balitaSembuh}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">
                      {row.balitaLulus}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-[#1a73e8]" />
                        MBG Terlaksana
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748b]">
                    Tidak ada kecamatan yang sesuai dengan pencarian
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-black text-[#071e49] tracking-tight">
            Hasil Scan & Data Stunting
          </h1>
          <p className="text-[12px] text-[#64748b] mt-0.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Sumber: <strong className="text-[#071e49] font-bold">{apiSource}</strong></span>
          </p>
        </div>

        {/* Refresh Button */}
        <button 
          onClick={() => fetchYearData(selectedYear)}
          disabled={isLoadingApi}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#dbeafe] rounded-xl transition-all shadow-2xs shrink-0 self-start sm:self-auto"
          title="Perbarui Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? "animate-spin" : ""}`} />
          <span>Perbarui Data</span>
        </button>
      </div>

      {/* 2. Top Navigation Bar: Sub-Tabs on Left + Year Selector on Right */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-1.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
        {/* Capsule Sub-tabs */}
        <div className="inline-flex p-1 rounded-xl bg-[#edf2f7]">
          <button
            onClick={() => setSubTab("utama")}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              subTab === "utama"
                ? "bg-white text-[#1a73e8] shadow-xs"
                : "text-[#64748b] hover:text-[#1a73e8]"
            }`}
          >
            Tab Utama
          </button>

          <button
            onClick={() => setSubTab("grafik")}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              subTab === "grafik"
                ? "bg-white text-[#1a73e8] shadow-xs"
                : "text-[#64748b] hover:text-[#1a73e8]"
            }`}
          >
            Tab Grafik
          </button>

          <button
            onClick={() => setSubTab("tabel")}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
              subTab === "tabel"
                ? "bg-white text-[#1a73e8] shadow-xs"
                : "text-[#64748b] hover:text-[#1a73e8]"
            }`}
          >
            Tab Tabel
          </button>
        </div>

        {/* Global Year Selector in Header */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-1 py-0.5">
          <span className="text-[12px] font-bold text-[#64748b] shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#1a73e8]" />
            Tahun:
          </span>
          {["2026", "2025", "2024", "2023", "2022"].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all shrink-0 ${
                selectedYear === yr
                  ? "bg-[#1a73e8] text-white shadow-xs"
                  : "bg-slate-50 text-[#64748b] hover:bg-slate-100 hover:text-[#071e49]"
              }`}
            >
              {yr === "2026" ? "2026 (Terkini)" : yr}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB UTAMA: SUMMARY CARDS + CHARTS + TABLE */}
      {subTab === "utama" && (
        <div className="space-y-6">
          {renderSummaryCards()}
          {renderCharts()}
          {renderTableSection()}
        </div>
      )}

      {/* 4. TAB GRAFIK: SUMMARY CARDS + CHARTS ONLY */}
      {subTab === "grafik" && (
        <div className="space-y-6">
          {renderSummaryCards()}
          {renderCharts()}
        </div>
      )}

      {/* 5. TAB TABEL: SUMMARY CARDS + TABLE ONLY */}
      {subTab === "tabel" && (
        <div className="space-y-6">
          {renderSummaryCards()}
          {renderTableSection()}
        </div>
      )}
    </div>
  );
};
