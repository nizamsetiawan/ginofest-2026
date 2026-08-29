# GScan (Gresik Stunting & Nutrition AI) - Ginofest 2026

> **Dashboard Terpadu Pemerintah Kabupaten Gresik untuk Monitoring Penurunan Stunting dan Optimalisasi Program Makan Bergizi Gratis (MBG) Berbasis AI Pangan Lokal.**

---

## 📌 Gambaran Proyek

**GScan** adalah platform cerdas yang dirancang untuk mendukung percepatan penurunan stunting di 18 Kecamatan Kabupaten Gresik. Platform ini mengintegrasikan pemetaan wilayah stunting, optimasi menu Program Makan Bergizi Gratis (MBG) berbasis formula 5 Bintang & potensi komoditas pangan lokal, standardisasi harga pasar harian (SISKAPERBAPO), serta analisis nilai gizi laboratorium (TKPI 2019 Kemenkes RI).

---

## 🚀 Fitur Utama

1. **Dashboard Eksekutif & Monitoring Spasial (Peta Interaktif 18 Kecamatan)**:
   - Pemetaan tingkat kerawanan stunting per kecamatan di Kabupaten Gresik.
   - Status logistik, sasaran penerima manfaat MBG, dan indikator gizi terpadu.

2. **RAG Database Knowledge Base (Terhubung Cloud Firestore `ginofest-2026`)**:
   - **Tabel Master 1: Komoditas Pangan Lokal 18 Kecamatan**: Pemetaan bahan pangan per kecamatan dengan sinkronisasi otomatis ke master harga.
   - **Tabel Master 2: Standar Harga Pangan Pasar (SISKAPERBAPO)**: Monitoring harga pasar harian dengan estimasi & kalibrasi AI.
   - **Tabel Master 3: Standar Menu Makanan MBG**: Generator 5 Menu Baru Unik berbasis AI (Formula 5 Bintang + Susu Sapi/UHT + Anti-duplikasi) dan kalkulasi gizi otomatis.
   - **Tabel Master 4: Nilai Gizi Pangan Indonesia (TKPI 2019 Kemenkes RI)**: Database laboratorium lengkap 25+ parameter zat gizi (*Makronutrisi, Mineral Fe/Ca/Zn, Vitamin A/B/C, % BDD*) dengan AI Auto-Complete.

3. **Autentikasi & Keamanan Data**:
   - PIN Keamanan 6-digit untuk akses RAG Knowledge Base.
   - Sinkronisasi real-time langsung ke Google Cloud Firestore.

---

## 🛠️ Teknologi & Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Peta Interaktif**: Leaflet & React-Leaflet
- **Kecerdasan Buatan (AI)**: Google Gemini 1.5 / 2.0 Flash (RAG Pipeline & Nutrition Reasoning)
- **Database & Cloud**: Firebase Cloud Firestore
- **Ekspor Data**: Microsoft Excel Multi-Column Spreadsheet Generator

---

## 📦 Menjalankan Proyek Secara Lokal

```bash
# 1. Clone repositori
git clone https://github.com/nizamsetiawan/ginofest-2026.git
cd ginofest-2026

# 2. Instal dependensi
npm install

# 3. Buat file .env.local dan isi konfigurasi Firebase & Gemini API:
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ginofest-2026
GEMINI_API_KEY=your_gemini_api_key

# 4. Jalankan server pengembangan
npm run dev
```

Akses aplikasi di browser pada: `http://localhost:3000`

---

## 📄 Lisensi & Hak Cipta

Dikembangkan untuk **Gresik Inovasi Festival (GINOFEST) 2026** — Pemerintah Kabupaten Gresik.
