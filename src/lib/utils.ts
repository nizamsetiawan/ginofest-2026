import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export function getRiskColor(level: "Tinggi" | "Sedang" | "Rendah" | string): string {
  switch (level) {
    case "Tinggi":
      return "text-rose-600 bg-rose-50 border-rose-200";
    case "Sedang":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "Rendah":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
}

export function getRiskBadgeClass(level: "Tinggi" | "Sedang" | "Rendah" | string): string {
  switch (level) {
    case "Tinggi":
      return "bg-red-500/10 text-red-600 border-red-200";
    case "Sedang":
      return "bg-amber-500/10 text-amber-600 border-amber-200";
    case "Rendah":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    default:
      return "bg-slate-500/10 text-slate-600 border-slate-200";
  }
}
