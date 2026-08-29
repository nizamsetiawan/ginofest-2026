# 📄 Proposal & Slide Deck Structure: GScan (Gresik Growth & Nutrition Scan AI)
> **Fokus Utama**: Web Dashboard Pemkab Gresik & Optimalisasi Program Makan Bergizi Gratis (MBG)  
> **Struktur**: Presisi 1-to-1 mengikuti alur slide presentasi resmi.

---

## 📌 SLIDE 1: Cover & Judul Utama

* **Judul**: **GScan** *(Gresik Growth & Nutrition Scan AI)*
* **Sub-Judul**: Optimalisasi Program Makan Bergizi Gratis di Kabupaten Gresik dengan Multimodal Generative AI dan Computer Vision
* **Kategori**: Inovasi Digital Pelayanan Publik — Kab. Gresik 2026
* **Target SDG**:
  * 🎯 **SDG 2**: Zero Hunger (Tanpa Kelaparan)
  * 🎯 **SDG 3**: Good Health & Well-Being (Kehidupan Sehat & Sejahtera)
  * 🎯 **SDG 8**: Decent Work & Economic Growth (Pekerjaan Layak & Pertumbuhan Ekonomi Lokal)

---

## 📌 SLIDE 2: Masalah & Peluang
> *"Stunting bukan hanya sekadar isu kesehatan."*

### 🔴 Sisi Masalah (Urgensi Stunting):
1. **Dampak Nyata pada Anak**:
   * 📉 **3-4 Poin Pengurangan IQ**: Berdampak langsung pada kemampuan kognitif anak.
   * 🏥 **25% Lebih Rentan**: Terkena penyakit degeneratif dan infeksi.
   * 💸 **Rp 300 Triliun/Tahun**: Kerugian nasional akibat dampak stunting.
   * ⚠️ **Menghambat Visi Indonesia Emas 2045**.
2. **Kondisi Lapangan**: 1 dari 5 anak Indonesia terdampak stunting, termasuk di wilayah Kabupaten Gresik.

### 🟢 Sisi Peluang & Tantangan Program MBG:
* **Komitmen Pemerintah**: *"Program Makan Bergizi Gratis akan mengurangi angka stunting hingga di bawah 10%"*
* **Realita & Keraguan (61% Ragu Efektivitas Program)**:
  1. 🥗 **Nutrisi Menu Sentralistik**: Kurang menyesuaikan potensi pangan daerah.
  2. 🔍 **Skema Masih Buram**: Mekanisme kontrol gizi dan distribusi belum terukur digital.
  3. 💰 **Membebani Postur Anggaran**: Risiko pemborosan anggaran APBD/APBN tanpa efisiensi lokal.
* **Peluang Inovasi GScan**: Mengirimkan solusi berbasis Web Dashboard AI untuk Pemkab Gresik agar program MBG tepat gizi, tepat biaya, dan terukur.

---

## 📌 SLIDE 3: GScan sebagai Solusi (Fokus Web Dashboard)

### 💡 Solusi Kami:
**GScan** hadir sebagai solusi digital inovatif untuk mengoptimalkan program **"Makan Bergizi Gratis" di Kabupaten Gresik** dengan memanfaatkan teknologi **Generative AI** dan **Computer Vision (CV)**.

### ⚙️ Teknologi AI:
* **Computer Vision + Chatbot GenAI** = Model *Screening & Recommendation Engine* presisitinggi, yang terus berkembang melalui **Continuous Learning Model**.

### 🏛️ Fitur Utama — Sisi Pemerintah (Web Dashboard Pemkab Gresik) — *FOKUS UTAMA*:
1. **Analisis dan Pemetaan Stunting Real-Time**: Heatmap tingkat risiko gizi anak di 18 Kecamatan se-Kabupaten Gresik.
2. **Analisis Efektivitas Program MBG**: Tracking dampak intervensi gizi terhadap penurunan stunting daerah.
3. **Rekomendasi Pembuatan Menu Berbasis AI**:
   * Merekondasikan Menu MBG harian/mingguan untuk sekolah-sekolah di Gresik berdasarkan:
     * ✅ Alokasi Sumber Daya & Anggaran Daerah (APBD Gresik)
     * ✅ Ketersediaan Pangan Lokal Gresik (Ikan Bandeng, Kupang, Udang)
     * ✅ Defisiensi Nutrisi Umum di Setiap Kecamatan

### 📱 Fitur Utama — Sisi Masyarakat (Web App Warga):
1. **Pendeteksian Growth & Physical Screening**: Penapisan indikator fisik anak via analisis visual & kuesioner GenAI.
2. **Rekomendasi Menu Bergizi Berbasis AI**: Rekomendasi masakan sehat harian ramah kantong berbasis bahan pasar lokal.

---

## 📌 SLIDE 4: Tools dan Teknologi yang Digunakan (Tech Stack)

### 🛠️ Tech Stack Web Dashboard (Full-Stack & Cost-Effective):
* **Next.js**: Framework utama full-stack web dashboard (SSR bawaan, performa produksi tinggi).
* **Tailwind CSS**: Utility-first CSS untuk membangun UI dashboard pemerintahan yang modern, cepat, dan ringan.
* **TypeScript**: Mengembangkan JavaScript dengan pengetikan aman (*maintainability & scalability*).
* **Firebase / Supabase**: Back-end untuk penyimpanan data real-time, otentikasi, dan database kecamatan.
* **JavaScript**: Interaktif di seluruh perangkat (laptop Pemkab maupun tablet petugas lapangan).
* **Cloud Storage**: Penyimpanan objek visual (foto screening & laporan).

### 🤖 AI / ML Framework (Hemat Biaya & Bebas Server Mahal):
* **Google Gemini API (LLM Engine)**: Generator rekomendasi menu MBG, RAG data gizi, dan chatbot kuesioner.
* **Google MediaPipe / Vision Framework**: Pola dan klasifikasi Computer Vision untuk penapisan postur tumbuh kembang.
* **ChromaDB / RAG Engine**: Search engine otomatis untuk mencocokkan harga komoditas pasar Gresik dengan standar gizi Kemenkes.

---

## 📌 SLIDE 5: Metode / Mekanisme AI — Sisi Pemerintah (Flow Web Dashboard)

### 🔬 Proses Pelatihan & Logika AI:
* **Fine-Tuning** + **Retrieval-Augmented Generation (RAG)** + **Prompt Engineering**

### 🔄 Alur Kerja AI pada Web Dashboard Pemkab Gresik:

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT DATA DAERAH                    │
├─────────────────────────────────────────────────────────┤
│ 1. Data Komoditas Pangan Daerah (Ikan Bandeng, dll)     │
│ 2. Data Harga Pangan Pasar Daerah (BPS / Disperindag)   │
│ 3. Data Katalog Menu Makanan Bergizi                    │
│ 4. Data Angka Gizi & Stunting Daerah (Dinkes Gresik)    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               GENERATE MENU TEROPTIMAL                  │
│  Menggabungkan 4 data di atas untuk menghasilkan        │
│  pilihan menu teroptimal beserta estimasi anggaran.     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               OUTPUT WEB DASHBOARD PEMKAB               │
├─────────────────────────────────────────────────────────┤
│ 📊 Generate Rekomendasi Menu MBG 1 Minggu Ke Depan     │
│ 💰 Generate Rincian Anggaran yang Diperlukan (APBD)     │
│ 🐟 Generate Kebutuhan Bahan Pokok Komoditas Lokal       │
└─────────────────────────────────────────────────────────┘
```
