# BAB VI PROSES IMPLEMENTASI INOVASI

## 6.1 Deskripsi Teknis Inovasi (*Technical Innovation Description*)

Platform **Kcal (GScan)** dirancang sebagai ekosistem inovasi digital berbasis AI *Dual-Client* yang mengintegrasikan penapisan gizi biometrik mandiri bagi warga dengan konsol Web GIS pemantauan spasial untuk Pemerintah Kabupaten Gresik dan Satuan Pelayanan Pemenuhan Gizi (SPPG).

Sistem menerapkan **Role-Based Access Control (RBAC)** tiga tingkat otorisasi yang dirinci pada **Tabel 6.1**:

##### Tabel 6.1 Level Otorisasi & Hak Akses Pengguna Sistem Kcal (GScan)

| Role / Level Otorisasi | Identifikasi Scope | Pemangku Kepentingan | Hak Akses & Fitur Utama |
| :--- | :--- | :--- | :--- |
| **Super Admin** (`super_admin`) | Tingkat Kabupaten (`districtId: "all"`) | Pemkab Gresik, Dinkes, Bappeda | Konsol GIS Eksekutif 18 kecamatan, RAG master DB, & laporan statistik daerah. |
| **Admin Kecamatan** (`admin_kecamatan`) | Terisolasi per Kecamatan (`districtId: [nama_kecamatan]`) | Petugas SPPG & Kecamatan | Konsol pemantauan kecamatan, pemindaian QR Code validator MBG dapur SPPG, & aduan warga. |
| **Masyarakat** (`masyarakat`) | Public Mobile PWA Client | Warga & Orang Tua Anak | Penapisan 4-frame (*KcalScan*), konsultasi *MedQA*, rekomendasi AKG (*KcalMenu*), & token QR (*KcalClaim*). |

Secara teknis, inovasi Kcal bekerja melalui tiga mesin teknologi utama:
1. **Azure Vision 4-Frame Physical Scanner**: Antarmuka PWA Mobile memandu warga mengambil 4 bingkai citra biometrik fisik anak (wajah, mata, tangan, kuku). Model *Computer Vision* mengekstraksi parameter klinis rona pucat/kuning tanpa menyimpan data pribadi (PII), menjamin privasi sesuai **UU PDP No. 27/2022**.
2. **Google Gemini Generative RAG Engine**: Mesin RAG memadukan data Angka Kecukupan Gizi (AKG) Kemenkes RI, data *MedQA Pediatric*, dan *API real-time Siskaperbapo Jatim* untuk memformulasi rekomendasi menu harian lokal (misalnya Ikan Bandeng Gresik) yang mengoptimalkan gizi dengan target HPP Rp 14.800/porsi MBG.
3. **Zero Duplicate Claim QR Verification Engine**: Sistem menerbitkan token Kode QR unik berstempel waktu pada PWA warga. Saat klaim porsi MBG di dapur SPPG, petugas memindai Kode QR yang divalidasi secara *real-time* via Firebase Firestore untuk mencegah klaim ganda (*Zero Duplicate Claim*).

---

### 6.2 Tahapan Pelaksanaan Inovasi & Durasi Waktu (*Implementation Timeline*)

Pelaksanaan inovasi Kcal direncanakan berlangsung selama **3 bulan (12 minggu / September – November 2026)** yang terbagi ke dalam dua pilar utama, yaitu **Aspek Operasional (Pengembangan AI & Integrasi)** serta **Aspek Pemasaran & Edukasi Masyarakat** sebagaimana dirinci pada **Tabel 6.2**:

##### Tabel 6.2 Jadwal & Tahapan Pelaksanaan Inovasi Kcal (September – November 2026)

| Pilar Implementation | Tahapan Kegiatan Utama | Alokasi Waktu | Luaran Utama (*Key Result*) |
| :--- | :--- | :--- | :--- |
| **Pilar Operasional** *(AI & Integrasi Systems)* | **Pelatihan AI & Kerja Sama SatuSehat** | Minggu 1–5 (Sept – Okt) | Dataset biometrik tervalidasi & MoU API SatuSehat Kemenkes. |
| | **Integrasi Sistem & Pengembangan Akurasi** | Minggu 5–9 (Okt – Nov) | Integrasi PWA Mobile 4-frame, QR Validator SPPG, & Web GIS. |
| | **Uji Coba & Eksekusi Kcal** | Minggu 9–12 (Nov) | Deployment Vercel Cloud & verifikasi klaim porsi MBG SPPG. |
| **Pilar Pemasaran** *(Awareness & Edukasi)* | **Riset Pasar & Strategi Pemasaran** | Minggu 1–3 (Sept) | Pemetaan profil warga 18 kecamatan & strategi edukasi gizi. |
| | **Tahap Awareness & Uji Coba Edukasi** | Minggu 3–7 (Sept – Okt) | Uji coba fitur *MedQA* & sosialisasi pola asuh gizi warga. |
| | **Press Release & Edukasi Rutin** | Minggu 7–12 (Okt – Nov) | Campaign pers resmi & pendampingan klaim MBG tanpa duplikasi. |

##### Keterkaitan Hasil Utama (*Key Results & Strategic Impact*)
1. **Dampak Operasional**: Optimalisasi efisiensi penggunaan APBN, peningkatan efektivitas distribusi MBG (target HPP Rp 14.800/porsi), dan kontribusi nyata mendukung **Indonesia Emas 2045**.
2. **Dampak Pemasaran & Sosial**: Aksesibilitas program Makan Bergizi Gratis (MBG) bagi seluruh warga 18 kecamatan, peningkatan kesadaran gizi keluarga, dan percepatan penurunan angka stunting di Kabupaten Gresik.

---

## 6.3 Pihak yang Terlibat & Tata Kelola Peran (*Stakeholder Governance Matrix*)

Tata kelola pelaksanaan inovasi melibatkan empat kelompok pemangku kepentingan utama di dunia nyata. Pembagian peran dan penanggung jawab proyek diatur menggunakan **Matriks RACI (*Responsible, Accountable, Consulted, Informed*)** pada **Tabel 6.3**:

##### Tabel 6.3 Matriks Peran & Tata Kelola Pemangku Kepentingan (RACI Matrix)

| Pemangku Kepentingan | Peran & Tanggung Jawab Utama dalam Inovasi | Status RACI |
| :--- | :--- | :--- |
| **Pemkab Gresik (Dinkes & Bappeda)** | Penanggung jawab kebijakan daerah, penyedia regulasi daerah, & pengawas indikator gizi spasial 18 kecamatan. | **Accountable (A)** |
| **Petugas SPPG & Admin Kecamatan** | Pelaksana operasional distribusi program MBG & penanggung jawab verifikasi validator Kode QR klaim porsi di tingkat 18 kecamatan. | **Responsible (R)** |
| **Tim Inovator / AI Engineer Kcal** | Pengembang teknologi platform Dual-Client, pemelihara model AI biometrik & RAG engine, serta pengelola infrastruktur cloud. | **Responsible (R)** |
| **Badan Gizi Nasional (BGN) & Kemenkes RI** | Pembina teknis, penyedia pedoman Angka Kecukupan Gizi (AKG) nasional, & pengarah regulasi integrasi *SatuSehat*. | **Consulted (C)** |
| **Masyarakat / Orang Tua Anak** | Penerima manfaat inovasi, pengakses penapisan gizi mandiri 4-frame, & penerima porsi MBG terverifikasi. | **Informed (I)** |

---

## 6.4 Sumber Daya & Alat yang Digunakan (*Resources & Infrastructure*)

Pelaksanaan inovasi memanfaatkan sumber daya teknologi, data, dan manusia secara terpadu:
1. **Sumber Daya Infrastruktur & Cloud**: Vercel Cloud Serverless Hosting, Azure Computer Vision API, Google Gemini AI Engine, Firebase Firestore Real-Time DB, dan Azure Blob Storage.
2. **Sumber Daya Data & Basis Pengetahuan**: Wider Face Dataset, MedQA Pediatric Dataset, Database AKG Kemenkes RI, Tabel Komoditas Pangan TKPI, dan API Harga Pasar Siskaperbapo Pemprov Jatim.
3. **Sumber Daya Manusia (Tim Pengembang)**: Project Lead (1 orang), AI/ML Engineer (1 orang), Full-Stack Developer (1 orang), GIS Specialist (1 orang), dan UI/UX & QA Tester (1 orang).

---

## 6.5 Perhitungan Biaya Produksi & Operasional (*Cost Analysis*)

Perhitungan kelayakan finansial platform Kcal (GScan) dibagi secara transparan menjadi dua bagian utama: **Biaya Investasi Awal (*CAPEX*)** dan **Biaya Operasional Rutin (*OPEX*)** yang dirinci pada **Tabel 6.4**:

##### Tabel 6.4 Rincian Biaya Investasi Awal (CAPEX) & Operasional (OPEX) Sistem Kcal (GScan)

| Kategori Biaya | Komponen Biaya | Estimasi Biaya (Rp) | Keterangan / Spesifikasi Teknikal |
| :--- | :--- | :--- | :--- |
| **Biaya Investasi Awal (CAPEX)** | **Pengembangan Perangkat Lunak** | Rp 15.000.000 | PWA Mobile Warga, Engine QR Token, & Web GIS 18 Kecamatan. |
| | **Pelatihan & Training AI Model** | Rp 7.500.000 | Ekstraksi biometrik 4-frame, fine-tuning RAG, & kredit Azure. |
| | **Uji Coba Pilot & Validasi Lapangan** | Rp 4.500.000 | Testing *Black-Box* 10 pengguna & 20 sampel foto biometrik. |
| **SUBTOTAL CAPEX** | **Investasi Awal Satu Kali** | **Rp 27.000.000** | **Alokasi biaya pengembangan *one-time investment*.** |
| **Biaya Operasional (OPEX)** | **Azure Vision & Gemini RAG API** | Rp 1.200.000 / bln | Estimasi 5.000 transaksi penapisan biometrik & *MedQA*/bulan. |
| | **Firebase Firestore & Azure Blob** | Rp 450.000 / bln | Basis data *real-time* & penyimpanan citra teranonimisasi. |
| | **Vercel Cloud Serverless Hosting** | Rp 350.000 / bln | Infrastruktur *cloud hosting serverless* dengan SLA 99,9%. |
| **SUBTOTAL OPEX** | **Biaya Operasional Rutin** | **Rp 2.000.000 / bln** | **Total beban biaya operasional bulanan.** |

#### 6.5.1 Rincian Alokasi Finansial
1. **Capital Expenditure (CAPEX)**: Mengalokasikan dana awal sebesar **Rp 27.000.000,-** untuk merealisasikan infrastruktur platform *Dual-Client*, modul enkripsi keamanan, pelatihan model biometrik *Computer Vision*, dan pengujian validasi sistem.
2. **Operational Expenditure (OPEX)**: Membutuhkan biaya operasional rutin sebesar **Rp 2.000.000,- / bulan** untuk menjaga keandalan infrastruktur cloud Vercel (SLA 99,9%), kuota inferensi API *Azure Vision* & *Gemini RAG*, serta basis data Firestore.

#### 6.5.2 Analisis Efisiensi Biaya & Nilai Tambah (*Cost Efficiency & Value Proposition*)
1. **Efisiensi Anggaran Penapisan 85%**: Penapisan mandiri 4-frame biometrik via *smartphone* memangkas durasi dan biaya operasional skrining fisik konvensional di lapangan secara signifikan.
2. **Transparansi 100% Anggaran MBG**: Fitur *Zero Duplicate Claim QR Verification* menjamin transparansi penuh audit distribusi porsi MBG di dapur SPPG, mencegah klaim ganda dan menyelamatkan anggaran daerah dari risiko kebocoran distribusi.
