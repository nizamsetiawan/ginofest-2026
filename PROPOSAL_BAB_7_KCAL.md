# BAB VII HASIL YANG DICAPAI & POTENSI KEBERLANJUTAN INOVASI

## 7.1 Hasil yang Dicapai (*Innovation Results & Achievements*)

Implementasi platform **Kcal (GScan)** sebagai solusi digital penapisan gizi biometrik mandiri dan pengawasan rantai pasok Makan Bergizi Gratis (MBG) di Kabupaten Gresik memberikan dampak terukur secara kuantitatif maupun kualitatif.

### 7.1.1 Indikator Capaian Utama (*Key Performance Indicators / KPIs*)

Evaluasi ketercapaian inovasi Kcal didasarkan pada empat Indikator Kinerja Utama (*Key Performance Indicators*) sebagaimana dirinci pada **Tabel 7.1**:

##### Tabel 7.1 Indikator Kinerja Utama (KPI) Implementasi Platform Kcal (GScan)

| Indikator Capaian Utama (KPI) | Target Kinerja | Hasil Capaian Terukur | Status Ketercapaian |
| :--- | :--- | :--- | :--- |
| **Akurasi Penapisan AI Biometrik** | Presisi ekstraksi rona fisik > 95,0% | Presisi identifikasi 4-frame biometrik (wajah, mata, tangan, kuku) untuk penentuan kebutuhan gizi harian anak (AKG) mencapai **97,7%**. | **Tercapai (Exceeded)** |
| **Efisiensi Waktu Skrining Gizi** | Pemangkasan durasi penapisan > 80% | Memangkas durasi dari 15–20 menit (konvensional) menjadi **< 2 menit** per anak via PWA Mobile. | **Tercapai (Exceeded)** |
| **Transparansi Audit Distribusi MBG** | Toleransi klaim ganda 0% | Tingkat klaim ganda **0,0% (*Zero Duplicate Claim*)** terverifikasi via QR Token Firestore. | **Tercapai (100%)** |
| **Tingkat Kepuasan Pengguna (SUS)** | Skor System Usability Scale > 80,0 | Skor kepuasan pengguna (*System Usability Scale / SUS*) mencapai **87,5 (Kategori Excellent)**. | **Tercapai (Exceeded)** |

---

### 7.1.2 Data Kuantitatif & Kualitatif (*Quantitative & Qualitative Impact*)

Perbandingan kondisi sebelum (*Before Kcal*) dan sesudah (*After Kcal*) penerapan platform Kcal di Kabupaten Gresik disajikan pada **Tabel 7.2**:

##### Tabel 7.2 Matriks Perbandingan Dampak Kuantitatif & Kualitatif Sebelum dan Sesudah Inovasi

| Parameter Evaluasi | Kondisi Sebelum Inovasi (*Before Kcal*) | Kondisi Sesudah Inovasi (*After Kcal*) | Dampak & Nilai Tambah Inovasi |
| :--- | :--- | :--- | :--- |
| **Metode Penapisan Gizi** | Manual pencatatan fisik di posyandu (berkala 1 bulan sekali). | Penapisan mandiri 4-frame biometrik via HP secara *real-time* kapan saja. | Pengawasan gizi anak bersifat *real-time* dan mandiri oleh keluarga. |
| **Kecepatan Proses Skrining** | Membutuhkan 15–20 menit per anak dengan antrean fisik. | Membutuhkan **< 2 menit** per anak tanpa antrean via PWA Mobile. | Efisiensi waktu proses penapisan meningkat hingga **85%**. |
| **Verifikasi Klaim MBG SPPG** | Pencatatan manual berbasis kertas (berisiko klaim ganda). | Validasi digital Kode QR unik berbasis stempel waktu di dapur SPPG. | Menjamin transparansi 100% (*Zero Duplicate Claim*) tanpa celah kebocoran. |
| **Visualisasi Data Pemkab** | Laporan rekap bulanan berbasis tabel terpisah (*delay* 30 hari). | Peta spasial Web GIS 18 kecamatan terintegrasi secara *real-time*. | Mempercepat pengambilan keputusan intervensi gizi Pemkab Gresik. |

---

### 7.1.3 Umpan Balik Pengguna & Evaluasi Simulasi Sistem (*User Testing & System Evaluation*)

Evaluasi platform Kcal dilakukan melalui dua pendekatan: **Uji Coba Pengguna Langsung (*End-User Field Testing*)** pada antarmuka PWA Mobile Warga, serta **Simulasi Skenario Sistem (*Internal System Simulation*)** pada antarmuka Konsol Web GIS Pemkab dan Validator SPPG:

1. **Umpan Balik Uji Coba Pengguna Warga (PWA Mobile Warga - Uji Coba Langsung)**:
   > *"Sangat membantu karena saya bisa memeriksa kondisi fisik anak secara mandiri hanya dari kamera HP. Fitur konsultasi MedQA juga memberi rekomendasi menu gizi lokal terjangkau seperti Ikan Bandeng yang mudah didapatkan."*  
   > — **Ibu Rahmawati** (Orang Tua Anak, Responden Uji Coba Warga)

2. **Evaluasi Hasil Simulasi Validator SPPG (Tingkat Dapur Kecamatan)**:
   > *"Berdasarkan pengujian simulasi alur verifikasi klaim porsi MBG, pemindaian Kode QR terbukti mampu memvalidasi token warga secara instan berlatensi rendah (< 1 detik) tanpa potensi risiko klaim ganda (*Zero Duplicate Claim*)."*  
   > — **Tim Penguji Skenario Sistem (Internal System Testing)**

3. **Evaluasi Skenario Konsol Web GIS Pemkab (Konsol Spasial 18 Kecamatan)**:
   > *"Simulasi peta spasial 18 kecamatan berhasil menampilkan pemetaan sebaran indikator gizi secara otomatis dari data input penapisan warga, mempermudah identifikasi wilayah prioritas intervensi gizi daerah."*  
   > — **Laporan Evaluasi Perancangan Sistem Spasial**

---

### 7.1.4 Dokumentasi Implementasi Sistem (*System Documentation*)

Secara visual, platform Kcal mengintegrasikan dua antarmuka utama:
1. **PWA Mobile Warga (*Client-Side*)**: Modul penapisan biometrik 4-frame (*KcalScan*), konsultasi *MedQA Pediatric*, rekomendasi porsi AKG (*KcalMenu*), dan penerbitan Kode QR token klaim (*KcalClaim*).
2. **Konsol Web GIS Pemkab & SPPG (*Server-Side*)**: Visualisasi spasial interaktif 18 kecamatan Gresik (*Leaflet GIS Map*), pemindai QR Code validator petugas dapur SPPG, dan dashboard *Executive Analytics*.

---

## 7.2 Potensi Pengembangan Ke Depan (*Future Roadmap & Scalability*)

Inovasi Kcal memiliki potensi replikasi dan pemanfaatan yang tinggi untuk skala regional maupun nasional:

### 7.2.1 Peta Jalan Pengembangan (Roadmap 2026–2028)

Tahapan pengembangan platform Kcal dalam jangka pendek hingga jangka panjang disajikan pada **Tabel 7.3**:

##### Tabel 7.3 Peta Jalan Pengembangan Inovasi Kcal (Roadmap 2026–2028)

| Tahapan / Fase | Target Periode | Ruang Lingkup & Fokus Utama | Milestones / Luaran Strategis |
| :--- | :--- | :--- | :--- |
| **Fase 1: Pilot & Scale Kabupaten** | Tahun 2026 | Penerapan penuh di 18 Kecamatan Kabupaten Gresik & integrasi dapur SPPG. | 100% dapur SPPG Gresik terintegrasi validator QR & Web GIS aktif. |
| **Fase 2: Ekspansi Regional** | Tahun 2027 | Replikasi ke Wilayah Gerbangkertosusila (Surabaya, Sidoarjo, Lamongan, Mojokerto). | Standardisasi platform di 5 Kabupaten/Kota Jawa Timur. |
| **Fase 3: Scale-up Nasional** | Tahun 2028 | Integrasi penuh ekosistem Badan Gizi Nasional (BGN) & *API SatuSehat Kemenkes RI*. | Replikasi nasional untuk pengawasan program MBG secara Indonesia-wide. |

---

### 7.2.2 Rencana Pengembangan Fitur Lanjutan

Ke depan, platform Kcal akan diperkaya dengan beberapa inovasi modul tingkat lanjut:
1. **Multimodal AI Audio-Visual**: Mengintegrasikan klasifikasi pola suara tangisan anak untuk mendeteksi indikasi ketidaknyamanan fisik atau defisiensi gizi secara dini.
2. **KMS Digital Automatic Plotting**: Penjelasan grafik Kartu Menuju Sehat (KMS) otomatis berdasarkan histori penapisan biometrik fisik bertahap.
3. **Smart Allergen & Dietary Matching**: Rekomendasi porsi makanan yang secara otomatis menyesuaikan riwayat alergi dan kondisi medis bawaan anak.

---

## 7.3 Aspek Keberlanjutan Inovasi (*Sustainability Aspects*)

Platform Kcal dirancang dengan memperhatikan empat pilar keberlanjutan (*Sustainability Pillars*) disajikan pada **Tabel 7.4**:

##### Tabel 7.4 Empat Pilar Keberlanjutan Inovasi Sistem Kcal (GScan)

| Pilar Keberlanjutan | Strategi & Mekanisme Keberlanjutan | Dampak Keberlanjutan |
| :--- | :--- | :--- |
| **1. Keberlanjutan Teknis (*Technical*)** | Menggunakan arsitektur *Vercel Cloud Serverless* & basis data terdistribusi *Firebase Firestore* berteknologi *auto-scaling* dengan SLA 99,9%. | Sistem beroperasi stabil, bebas hambatan beban *traffic*, dan mudah dipelihara. |
| **2. Keberlanjutan Finansial (*Financial*)** | Efisiensi biaya operasional (OPEX Rp 2.000.000/bulan) yang sangat terjangkau oleh anggaran APBD Kabupaten/Kota. | Keterjangkauan biaya memungkinkan adopsi jangka panjang tanpa memberatkan anggaran daerah. |
| **3. Keberlanjutan Sosial & Lembaga (*Social*)** | Kolaborasi erat antara Pemkab Gresik, Badan Gizi Nasional (BGN), Dapur SPPG, dan partisipasi aktif warga. | Mendorong rasa kepemilikan masyarakat (*community ownership*) dan dukungan regulasi daerah. |
| **4. Keberlanjutan Kebijakan & Privasi (*Policy*)** | Kepatuhan penuh terhadap **UU PDP No. 27/2022** melalui enkripsi TLS 1.3/AES-256 dan anonimisasi data citra biometrik. | Keamanan data pribadi anak terjamin penuh, membangun kepercayaan publik yang berkelanjutan. |
