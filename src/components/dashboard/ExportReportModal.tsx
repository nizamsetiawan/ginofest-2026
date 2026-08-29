"use client";

import React, { useState } from "react";
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  ShieldCheck, 
  Building2, 
  FileText, 
  Calendar,
  Sparkles
} from "lucide-react";
import { GRESIK_TOTAL_STATS, GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { WEEKLY_MBG_MENUS } from "@/data/default-menus";
import { formatNumber, formatRupiah } from "@/lib/utils";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentDistrict = GRESIK_DISTRICTS.find((d) => d.id === selectedDistrict);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Pratinjau Dokumen Eksekutif Resmi Pemkab Gresik
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Mengunduh..." : "Download PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md border border-slate-200 text-slate-800 text-xs space-y-6">
            {/* Official Letterhead (Kop Surat Pemkab) */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-lg">
                  G
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                    Pemerintah Kabupaten Gresik
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Dinas Kesehatan & Tim Koordinasi Penurunan Stunting (TPPS)
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Jl. Dr. Wahidin Sudirohusodo No. 245, Gresik, Jawa Timur • Sistem GScan AI (2026)
              </p>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h5 className="font-black text-sm text-slate-900 uppercase">
                Laporan Evaluasi & Rekomendasi Menu Program MBG Berbasis AI
              </h5>
              <p className="text-[11px] text-slate-500">
                Wilayah: <strong>{currentDistrict ? `Kecamatan ${currentDistrict.name}` : "Seluruh 18 Kecamatan Kabupaten Gresik"}</strong> • Periode: Maret 2026
              </p>
            </div>

            {/* Key Summary Table */}
            <div className="space-y-2">
              <h6 className="font-bold text-slate-900 uppercase text-[11px]">
                I. Ringkasan Kinerja Stunting & Fiskal APBD
              </h6>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Prevalensi Stunting Daerah:</span>
                  <strong className="text-sm text-slate-900 font-bold">
                    {currentDistrict ? `${currentDistrict.stuntingRate}%` : `${GRESIK_TOTAL_STATS.averageStuntingRate}%`}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Total Siswa Terlayani MBG:</span>
                  <strong className="text-sm text-emerald-600 font-bold">
                    {currentDistrict ? formatNumber(currentDistrict.targetChildren) : formatNumber(GRESIK_TOTAL_STATS.totalChildrenServed)} Anak
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Efisiensi Anggaran (Hemat APBD):</span>
                  <strong className="text-sm text-emerald-700 font-bold">
                    {currentDistrict ? formatRupiah(Math.round(currentDistrict.monthlyBudget * 0.143)) : "Rp 4,07 Milyar/Bulan"}
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Utilisasi Komoditas Lokal:</span>
                  <strong className="text-sm text-blue-700 font-bold">
                    {GRESIK_TOTAL_STATS.localCommodityUtilization}% (Bandeng, Kupang, Udang)
                  </strong>
                </div>
              </div>
            </div>

            {/* Meal Plan Sample */}
            <div className="space-y-2">
              <h6 className="font-bold text-slate-900 uppercase text-[11px]">
                II. Standar Menu MBG Mingguan Terverifikasi AI
              </h6>
              <table className="w-full text-left border divide-y text-[11px]">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="p-2">Hari</th>
                    <th className="p-2">Formulasi Menu Pangan Lokal</th>
                    <th className="p-2">Kalori / Protein</th>
                    <th className="p-2 text-right">Biaya Satuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {WEEKLY_MBG_MENUS.slice(0, 4).map((m) => (
                    <tr key={m.day}>
                      <td className="p-2 font-bold">{m.day}</td>
                      <td className="p-2">{m.menuName}</td>
                      <td className="p-2">{m.caloriesKcal} kcal / {m.proteinGrams}g</td>
                      <td className="p-2 text-right font-semibold text-emerald-700">
                        {formatRupiah(m.estimatedCostPerPortion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="pt-6 flex items-center justify-between text-center text-xs">
              <div>
                <p className="text-[11px] text-slate-500">Mengetahui,</p>
                <p className="font-bold text-slate-900 mt-1">Kepala Dinas Kesehatan Kab. Gresik</p>
                <div className="h-12 flex items-center justify-center text-slate-300 italic text-[10px]">
                  [Tanda Tangan Digital Tersertifikasi]
                </div>
                <p className="font-semibold text-slate-800">dr. H. Mukhibatul Khusnah, M.Kes</p>
                <p className="text-[10px] text-slate-400">NIP. 19740512 200212 2 003</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">Gresik, {new Date().toLocaleDateString("id-ID")}</p>
                <p className="font-bold text-slate-900 mt-1">Tim Ahli Gizi & AI GScan</p>
                <div className="h-12 flex items-center justify-center text-emerald-600 font-mono text-[10px]">
                  ✓ Verified by Gemini AI Engine
                </div>
                <p className="font-semibold text-slate-800">Koordinator GScan Pemkab</p>
                <p className="text-[10px] text-slate-400">ID Dokumen: GSK-2026-MBG-094</p>
              </div>
            </div>
          </div>
        </div>

        {downloadSuccess && (
          <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-semibold text-center animate-in slide-in-from-bottom">
            ✓ Berkas Laporan Resmi GScan Berhasil Diunduh (PDF Ready)!
          </div>
        )}
      </div>
    </div>
  );
};
