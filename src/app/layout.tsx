import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GScan - Dashboard Pemkab Gresik | Optimalisasi MBG & AI Stunting",
  description: "Dashboard Terpadu Pemerintah Kabupaten Gresik untuk Monitoring Penurunan Stunting dan Optimalisasi Program Makan Bergizi Gratis (MBG) Berbasis AI Pangan Lokal.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
