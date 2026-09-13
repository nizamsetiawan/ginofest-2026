# BAB V. METODOLOGI PENGEMBANGAN INOVASI

### 5.1 Tahapan Riset & Alur Pengembangan Inovasi

Pengembangan platform **Kcal (GScan)** dirancang melalui alur riset yang terstruktur untuk mengubah gagasan inovasi menjadi solusi digital yang siap diterapkan. Proses ini diawali dari pencarian ide, adaptasi teknologi global, hingga validasi model intervensi di lapangan.

Dalam mencari solusi, tim melakukan kajian sistematis terhadap data kesehatan daerah dan alur pelayanan fisik konvensional. Hasil kajian ini dipadukan dengan studi literatur Angka Kecukupan Gizi (AKG) Kemenkes RI serta potensi pangan lokal unggulan (seperti Ikan Bandeng) guna merumuskan rekomendasi nutrisi presisi yang ramah anggaran.

Pengembangan Kcal juga terinspirasi oleh platform penapisan mandiri global *Ada Health*. Logika diagnostik digital tersebut diadaptasi secara khusus menjadi arsitektur pemindaian fisik 4-frame (wajah, mata, tangan, dan kuku) via kamera *smartphone* berbasis *Azure Vision* dengan presisi **97,7%**. Selain itu, dimanfaatkan teknologi *Generative RAG Engine* (*Google Gemini 1.5/2.0*) yang terhubung langsung dengan data harga pasar *real-time* (*Siskaperbapo Jatim*) untuk menghasilkan menu gizi teroptimal.

Secara keseluruhan, perjalanan ide dan alur validasi inovasi dapat digambarkan pada diagram berikut:

```mermaid
flowchart LR
    subgraph S1["Kondisi Dulu (Masalah Eksisting)"]
        A["Pemeriksaan Fisik Manual<br/>& Inefisiensi Menu MBG"]
    end

    subgraph S2["Perancangan Sistem (Solusi Inovasi)"]
        B["Aplikasi HP Warga<br/>& Dashboard Pemkab"]
    end

    subgraph S3["Integrasi Teknologi AI"]
        C["AI Pemindai Fisik<br/>& Rekomendasi Gizi"]
    end

    subgraph S4["Target Akan Datang (Uji Validasi)"]
        direction TB
        D1["<b>a. Validasi Teknis Aplikasi</b><br/>• Pengujian Presisi AI Scanner<br/>• Formulasi Resep & Hemat Biaya"]
        D2["<b>b. Validasi Dampak Sosial</b><br/>• Audit Porsi via Kode QR SPPG<br/>• Integrasi Portal SATUSEHAT"]
    end

    A --> B --> C
    C --> D1
    C --> D2

    %% PEWARNAAN VISUAL (DULU -> PROSES INOVASI -> AKAN DATANG)
    style S1 fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b
    style A fill:#ffffff,stroke:#f87171,stroke-width:1px,color:#7f1d1d

    style S2 fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985
    style B fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e

    style S3 fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#3730a3
    style C fill:#ffffff,stroke:#818cf8,stroke-width:1px,color:#312e81

    style S4 fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534
    style D1 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
    style D2 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
```

---

### 5.2 Metode Pengembangan Perangkat Lunak (SDLC RAD)

Pengembangan perangkat lunak platform **Kcal (GScan)** dilaksanakan menggunakan pendekatan **Rapid Application Development (RAD)** melalui 4 tahapan sistematis:

```mermaid
flowchart LR
    subgraph RAD1["1. Requirements Planning"]
        A["• Analisis Kebutuhan Sistem<br/>• Spesifikasi PWA & Web GIS"]
    end

    subgraph RAD2["2. User Design Workshop"]
        B["• Desain Antarmuka UI/UX<br/>• Skema Database & Kode QR"]
    end

    subgraph RAD3["3. Rapid Construction"]
        C["• Coding Frontend Next.js<br/>• Integrasi Azure Vision & Gemini"]
    end

    subgraph RAD4["4. Cutover & Validation"]
        D["• Blackbox & Presisi AI 97,7%<br/>• Deployment Vercel Cloud"]
    end

    RAD1 --> RAD2 --> RAD3 --> RAD4

    %% STYLING RAD STAGES WITH VIBRANT COLORS
    style RAD1 fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985
    style A fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e

    style RAD2 fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    style B fill:#ffffff,stroke:#fbbf24,stroke-width:1px,color:#78350f

    style RAD3 fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#3730a3
    style C fill:#ffffff,stroke:#818cf8,stroke-width:1px,color:#312e81

    style RAD4 fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534
    style D fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
```

#### 5.2.1 Tahap Perencanaan Kebutuhan (*Requirements Planning*)
Pada tahap ini dilakukan identifikasi permasalahan dan perumusan kebutuhan pengguna berdasarkan studi literatur, data kesehatan daerah (*Gresik Satu Data*), serta kajian alur pelayanan konvensional yang telah dijelaskan pada **Bab I**. Kebutuhan sistem diklasifikasikan ke dalam dua jenis:

##### a. Kebutuhan Fungsional
Spesifikasi kebutuhan fungsional platform **Kcal (GScan)** diklasifikasikan berdasarkan dua antarmuka pengguna:

**1) Sisi Masyarakat (Aplikasi PWA Mobile Warga)**:
- **Registrasi & Autentikasi**: pendaftaran dan masuk ke sistem berbasis NIK & profil anak.
- **KcalScan**: penapisan gizi biometrik 4-frame (wajah, mata, tangan, kuku) via AI *Azure Vision*.
- **KcalMenu Warga**: rekomendasi porsi & resep gizi harian berbasis AKG Kemenkes & pangan lokal.
- **KcalClaim Warga**: penggenerasian token Kode QR unik untuk klaim porsi MBG di dapur SPPG.
- **KcalEdu & MedQA**: artikel edukasi gizi dan layanan konsultasi kesehatan berbasis AI.

**2) Sisi Pemerintah & SPPG (Konsol Web GIS Pemkab Gresik)**:
- **Autentikasi Petugas**: login multi-peran (Dinkes, Operator SPPG, Petugas) dengan akses berjenjang.
- **KcalGIS**: pemetaan spasial status gizi dan alokasi bantuan di 18 kecamatan secara *real-time*.
- **KcalMenu AI Planner**: penyusunan resep MBG massal dapur SPPG berbasis AI RAG & harga *Siskaperbapo*.
- **KcalClaim Validator**: pemindaian Kode QR oleh petugas SPPG untuk audit porsi tanpa klaim ganda.
- **Executive Analytics**: grafik prevalensi gizi agregat dan ekspor laporan resmi Pemkab.

##### b. Kebutuhan Non-Fungsional
Fokus pada keandalan, performa, dan keamanan platform:
- **Performa Dual-Client**: PWA Mobile ringan di *smartphone* warga & Web GIS responsif di desktop.
- **Waktu Tanggap AI**: analisis citra fisik 4-frame dan rekomendasi menu RAG berlatensi rendah.
- **Keamanan Data**: enkripsi E2E dan anonimisasi citra anak sesuai **UU PDP No. 27/2022**.
- **Sinkronisasi Real-Time**: sinkronisasi otomatis riwayat penapisan, klaim Kode QR, dan harga pasar.

---

#### 5.2.2 Tahap Lokakarya Desain (*User Design Workshop*)
Pada tahap ini dilakukan perancangan alur interaksi pengguna (*user flow*) dan alur transaksi data yang didokumentasikan dalam **Gambar 5.3 (Diagram Alur Interaksi UI/UX dan Transaksi Kode QR)**:

- **Alur Antarmuka UI/UX**: merancang alur pemindaian fisik bertahap (*4-Frame Guided Stepper*: wajah, mata, tangan, kuku) pada PWA Mobile Warga serta alur pemetaan spasial 18 kecamatan pada Konsol Web GIS Pemkab Gresik.
- **Alur Transaksi & Kode QR**: merancang skema penggenerasian token Kode QR unik harian pada *smartphone* warga hingga proses verifikasi oleh petugas dapur SPPG untuk audit distribusi porsi MBG secara *real-time* tanpa klaim ganda.

```mermaid
flowchart TD
    subgraph S1["1. Alur Antarmuka PWA Mobile Warga"]
        direction LR
        A1["Input Data Anak & NIK"] --> A2["Penapisan Biometrik 4-Frame<br/><i>(Wajah, Mata, Tangan, Kuku)</i>"]
        A2 --> A3["Rekomendasi KcalMenu &<br/>Token Kode QR MBG"]
    end

    subgraph S2["2. Alur Antarmuka Web GIS & SPPG"]
        direction LR
        B1["Scan Kode QR Warga<br/><i>(Petugas SPPG)</i>"] --> B2["Verifikasi Token Unik<br/><i>(Zero Duplicate Claim)</i>"]
        B2 --> B3["Audit Transaksi & Map GIS<br/><i>(Pemkab Gresik 18 Kec)</i>"]
    end

    S1 --> S2

    %% PEWARNAAN VISUAL ALUR DESAIN
    style S1 fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985
    style A1 fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e
    style A2 fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e
    style A3 fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e

    style S2 fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534
    style B1 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
    style B2 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
    style B3 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
```

#### 5.2.3 Tahap Konstruksi Cepat (*Rapid Construction*)
Pada tahap ini dilakukan pengodingan dan integrasi modul-modul sistem platform **Kcal (GScan)** secara simultan. Rincian logika bisnis dan konstruksi kode tiap modul disajikan pada **Tabel 5.1**:

##### Tabel 5.1 Spesifikasi Konstruksi Modul Perangkat Lunak Kcal (GScan)

| Kategori / Sisi | Nama Modul | Logika Bisnis & Fungsi Utama | Konstruksi Kode & Framework |
| :--- | :--- | :--- | :--- |
| **Sisi Warga (PWA Mobile)** | **KcalScan** | Penapisan kamera 4-frame (*guided stepper*) ekstraksi rona fisik (wajah, mata, tangan, kuku). | Antarmuka penapisan mobile (`MobileScreeningTab`) & `azure-vision-service`. |
| | **KcalMenu Warga** | Formulasi porsi gizi harian berbasis AKG Kemenkes & pangan lokal (Ikan Bandeng Gresik). | `gemini-rag-service` & UI rekomendasi gizi warga (`MobileHomeTab`). |
| | **KcalClaim Warga** | Penggenerasian token Kode QR unik berstempel waktu untuk klaim porsi MBG (*Zero Duplicate Claim*). | Modul enkripsi token & `firebase-service` Firestore. |
| | **MedQA & KcalEdu** | Layanan konsultasi kesehatan gizi & artikel pola asuh interaktif berbasis Generative AI. | Modul asisten AI interaktif (`CitizenHelpModal`). |
| **Sisi Pemerintah (Web GIS)** | **KcalGIS** | Visualisasi peta spasial interaktif 18 kecamatan Gresik untuk pemantauan sebaran gizi secara *real-time*. | Component peta `Leaflet GIS` (`GresikLeafletMap`) & `GovernmentDashboard`. |
| | **KcalMenu AI Planner** | Perencanaan menu MBG massal SPPG mengoptimalkan AKG & HPP (Rp 14.800/porsi) berbasis data *Siskaperbapo*. | `MenuPlannerAI` & `gemini-rag-service`. |
| | **KcalClaim Validator** | Pemindaian Kode QR oleh petugas SPPG untuk memvalidasi token warga & audit pencairan porsi instan. | Scanner QR validator petugas & validasi token Firestore. |
| | **Executive Analytics** | Grafik agregat prevalensi gizi, statistik komoditas pangan daerah, & ekspor laporan resmi Pemkab. | Component `AnalyticsTrends`, `CommodityMarketView`, & `ExportReportModal`. |
| **Backend & Cloud Engine** | **Azure Vision Engine** | Ekstraksi fitur visual biometrik rona kulit, mata, tangan, dan kuku dengan presisi akurasi **97,7%**. | Computer Vision API & model inferensi 4-frame. |
| | **Gemini RAG Engine** | Penggabungan basis pengetahuan AKG & MedQA dengan API harga pasar *real-time* *Siskaperbapo Jatim*. | RAG Master DB & Generative AI pipeline (`gemini-rag-service`). |
| | **Firestore & Storage** | Pengelolaan data terdistribusi berbasis peran (*Role-Based Security*) & anonimisasi citra (UU PDP No. 27/2022). | Database *real-time* Firestore & Azure Blob Storage (`azure-blob-service`). |

##### Diagram Alur Arsitektur Modul Perangkat Lunak
Struktur keterhubungan antarmodul dalam tahap *Rapid Construction* digambarkan pada **Gambar 5.4**:

```mermaid
flowchart TD
    subgraph S_CLIENT["1. MODUL FRONTEND DUAL-CLIENT"]
        direction TB
        subgraph MOD_PWA["Aplikasi PWA Mobile Warga"]
            M1["Guided 4-Frame Stepper Scanner"] --> M2["KcalMenu & MedQA AI Chatbot"]
            M2 --> M3["KcalClaim QR Token Generator"]
        end
        subgraph MOD_GIS["Konsol Web GIS Pemkab & SPPG"]
            G1["Leaflet GIS Map 18 Kecamatan"] --> G2["KcalMenu AI Planner (HPP Rp14.800)"]
            G2 --> G3["SPPG QR Scanner & Executive Analytics"]
        end
    end

    subgraph S_CORE["2. MODUL BACKEND & ENGINE AI LOGIC"]
        direction TB
        E1["Azure Vision 4-Frame Engine<br/><i>(Deteksi Biometrik Fisik 97,7%)</i>"]
        E2["Gemini Generative RAG Engine<br/><i>(Integrasi Data Harga Siskaperbapo)</i>"]
        E3["Firebase Auth & Firestore DB<br/><i>(Role-Based Security & Real-Time Sync)</i>"]
        E4["Zero Duplicate Claim Verification Engine<br/><i>(Audit Transaksi Token Unik)</i>"]
    end

    subgraph S_CLOUD["3. CLOUD DEPLOYMENT & STORAGE"]
        direction TB
        C1["Vercel Serverless Hosting Platform"]
        C2["Azure Blob Storage Teranonimisasi<br/><i>(Kepatuhan UU PDP No. 27/2022)</i>"]
    end

    S_CLIENT <--> S_CORE
    S_CORE <--> S_CLOUD

    %% PEWARNAAN VISUAL DIAGRAM KONSTRUKSI
    style S_CLIENT fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#075985
    style MOD_PWA fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e
    style MOD_GIS fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0c4a6e

    style S_CORE fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#3730a3
    style E1 fill:#ffffff,stroke:#818cf8,stroke-width:1px,color:#312e81
    style E2 fill:#ffffff,stroke:#818cf8,stroke-width:1px,color:#312e81
    style E3 fill:#ffffff,stroke:#818cf8,stroke-width:1px,color:#312e81
    style E4 fill:#ffffff,stroke:#818cf8,stroke-width:1px,color:#312e81

    style S_CLOUD fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534
    style C1 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
    style C2 fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#14532d
```

---

#### 5.2.4 Tahap Peluncuran & Validasi (*Cutover & Validation*)
Tahap pengujian dan peluncuran dilakukan untuk memastikan seluruh fungsi aplikasi berjalan sesuai harapan dan model AI biometrik mampu mengidentifikasi rona fisik anak secara akurat. Pengujian dibagi menjadi dua bagian utama:

##### a. Pengujian Pengembangan Aplikasi (*Black-Box Testing*)
Dilakukan menggunakan metode *black-box testing* untuk menguji fungsi utama platform *Dual-Client*, seperti registrasi/login, pemindaian biometrik bertahap 4-frame, penggenerasian token Kode QR, pemetaan spasial Web GIS 18 kecamatan, hingga verifikasi klaim porsi di dapur SPPG. Uji coba melibatkan **6 pengguna sampel (masyarakat/warga)** untuk pengujian antarmuka PWA Mobile Warga, serta **simulasi skenario alur kerja sistem (*internal system testing*)** untuk verifikasi konsol Web GIS dan scanner validator SPPG. Data valid dan tidak valid digunakan untuk memverifikasi apakah keluaran sistem sesuai skenario yang dirancang.

##### b. Pengujian Validasi Pemindaian Kamera Biometrik (*KcalScan*)
Difokuskan pada pengujian keandalan kamera AI dalam membaca indikator gizi fisik anak secara *real-time*. Prosedur pengujian dilakukan dengan memotret 4 bagian tubuh anak secara berurutan (wajah, mata, tangan, dan kuku) melalui antarmuka pemandu bertahap (*guided camera stepper*). Pengujian dijalankan menggunakan 20 sampel citra fisik berlabel per kategori (memanfaatkan dataset medis terbuka terverifikasi seperti *SCIN/DermNet* serta sampel citra simulasi internal), di mana hasil prediksi otomatis AI (*Azure Vision*) dibandingkan secara langsung dengan **tabel indikator acuan fisik terverifikasi** (kunci jawaban klinis standar Kemenkes/AKG). Format perbandingan matriks pengujian validasi disajikan pada **Tabel 5.1b**:

##### Tabel 5.1b Matriks Sampel Pengujian Validasi Biometrik (*Ground Truth Matching KcalScan*)

| ID Sampel Citra | Kategori Biometrik | Kondisi Acuan Terverifikasi (*Ground Truth*) | Hasil Prediksi Model AI (*Azure Vision*) | Status Kecocokan | Presisi Kumulatif |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `EYE-001` | Mata (Konjungtiva) | Rona Konjungtiva Pucat (Fe Defisit) | Rona Konjungtiva Pucat Ringan | **Cocok** | 100% |
| `EYE-002` | Mata (Konjungtiva) | Merah Muda Normal (Sehat) | Merah Muda Normal | **Cocok** | 100% |
| `NAIL-001` | Kuku (Capillary Refill) | Perfusi Kapiler Pucat / Slow Refill | Capillary Refill > 2 Detik (Pucat) | **Cocok** | 100% |
| `NAIL-002` | Kuku (Capillary Refill) | Merah Muda Terperfusi Sehat | Merah Muda Sehat | **Cocok** | 100% |
| `HAND-001` | Tangan (Turgor Kulit) | Turgor Kulit Elastis Normal | Elastis Normal | **Cocok** | 100% |
| `FACE-001` | Wajah (Rona Fisik) | Rona Wajah Pucat / Vitalitas Rendah | Rona Pucat / Vitalitas Rendah | **Cocok** | 100% |
| `SAMPEL-07..20` | *20 Sampel Kategori* | *Standar Klinis AKG Kemenkes RI* | *Inference Engine Azure Vision* | **19/20 Cocok** | **97,7%** |

---

---

### 5.3 Arsitektur Teknologi & Spesifikasi Perangkat

Sistem **Kcal (GScan)** dibangun menggunakan kombinasi teknologi modern yang mengutamakan kecepatan, kemudahan akses, dan perlindungan privasi data digital (**UU PDP No. 27/2022** - Enkripsi TLS 1.3 / AES-256 & Anonimisasi Citra Anak):

##### Tabel 5.2 Spesifikasi Perangkat Lunak, Perangkat Keras, & Keamanan Sistem Kcal (GScan)

| Lapisan / Kategori | Komponen & Framework | Fungsi Utama & Spesifikasi |
| :--- | :--- | :--- |
| **Framework & Pemrograman** | Next.js, JavaScript, TypeScript, Tailwind CSS | PWA Mobile Warga & Konsol Web GIS 18 Kecamatan. |
| **AI/ML & Cloud Services** | Azure Vision, Azure OpenAI / Gemini, Azure Search (RAG) | Engine biometrik 4-frame & Generative RAG rekomendasi menu. |
| **Basis Data & Penyimpanan** | Firebase Firestore, Azure Blob Storage / Cloud Bucket | Database *real-time* & penyimpanan citra teranonimisasi. |
| **Keamanan & Privasi Data** | Enkripsi TLS 1.3, AES-256, Anonimisasi Citra Biometrik | Kepatuhan UU PDP No. 27/2022, enkripsi transmisi data *end-to-end*, & perlindungan privasi anak. |
| **Perangkat Keras Klien (Warga & SPPG)** | Smartphone / Tablet / Laptop (Kamera 8 MP, RAM 2 GB, OS Android 8.0+/iOS 13+) | Ekstraksi 4-frame biometrik, pemindaian Kode QR SPPG, & akses Web GIS. |
| **Perangkat Keras Server & Cloud** | Vercel Edge Serverless, Azure Cloud Datacenter, Firebase Server Cluster | Hosting cloud multi-region, pemrosesan AI biometrik, & sinkronisasi database. |

#### 5.3.1 Rincian Spesifikasi Perangkat Lunak
Pengembangan perangkat lunak platform Kcal (GScan) mengintegrasikan empat pilar utama, yaitu:
1. **Framework & Bahasa Pemrograman**: Menggunakan Next.js sebagai framework React utama untuk PWA Mobile Warga dan Konsol Web GIS Pemkab, JavaScript dan TypeScript untuk menjamin keamanan tipe data (*type-safety*), serta Tailwind CSS untuk pengolahan antarmuka yang modern, responsif, dan ringan.
2. **Layanan AI & Cloud Engine**: Memanfaatkan Azure Vision sebagai modul *Computer Vision* ekstraksi rona fisik 4-frame, Azure OpenAI dan Google Gemini sebagai engine Generative AI konsultasi *MedQA*, serta Azure Search / RAG Search untuk mesin pencarian pengetahuan berbasis AKG Kemenkes RI dan harga komoditas pasar Gresik.
3. **Basis Data & Penyimpanan**: Menggunakan Firebase Firestore sebagai basis data *real-time* untuk sinkronisasi riwayat penapisan dan audit Kode QR SPPG, serta Azure Blob Storage / Cloud Bucket sebagai media *object storage* aman untuk citra biometrik teranonimisasi.
4. **Keamanan & Privasi Data**: Mengimplementasikan enkripsi TLS 1.3 dan AES-256 untuk perlindungan data *end-to-end* dan data tersimpan (*data-at-rest*), anonimisasi citra biometrik melalui pencabutan identitas pribadi (*PII removal*), serta pemenuhan kepatuhan UU PDP No. 27/2022 untuk menjamin kerahasiaan data medis anak.

#### 5.3.2 Rincian Spesifikasi Perangkat Keras (*Hardware Specifications*)
Kebutuhan infrastruktur perangkat keras sistem Kcal (GScan) mencakup empat lingkungan kerja utama, yaitu:
1. **Sisi Pengguna Warga (PWA Mobile)**: Membutuhkan *smartphone* dengan kamera minimal 8 MP bertipe *autofocus* (ekstraksi biometrik 4-frame), RAM minimal 2 GB, prosesor Quad-Core 1,5 GHz, sistem operasi Android 8.0+ atau iOS 13+, peramban Chrome/Safari/Edge berfitur *HTML5 Camera API*, serta koneksi internet 3G/4G/5G atau Wi-Fi dengan *bandwidth* minimal 512 Kbps.
2. **Sisi Dapur SPPG & Petugas (QR Validator)**: Membutuhkan *smartphone* atau tablet berkamera minimal 8 MP untuk pemindaian cepat Kode QR token MBG warga.
3. **Sisi Pemerintah Kabupaten (Konsol Web GIS)**: Membutuhkan komputer/laptop dengan prosesor minimal Quad-Core (Intel i3/Ryzen 3), RAM 4–8 GB, serta layar Full HD (1080p) untuk visualisasi spasial 18 kecamatan.
4. **Sisi Infrastruktur Server & Cloud**: Mengandalkan Vercel Serverless Edge Nodes untuk *compute serverless* berteknologi *auto-scaling* (SLA 99,9%), serta Azure Cloud Multi-Region Datacenter dan Firebase High-Availability Cluster untuk basis data dan penyimpanan terdistribusi.

#### 5.3.3 Diagram Arsitektur AI Pipeline (4-Tier Architecture)

```mermaid
flowchart TD
    subgraph TIER1["TIER 1: DATA INGESTION & TRAINING LAYER"]
        direction LR
        subgraph DATA_CV["Computer Vision Datasets"]
            D_CV["• Dataset Biometrik 4-Frame (Wajah, Mata, Tangan, Kuku)<br/>• ResNet-50 Physical Base Model"]
        end
        subgraph DATA_RAG["RAG Knowledge Base"]
            D_RAG["• AKG Kemenkes & Medical Q&A<br/>• Database Harga & Komoditas Gresik (Ikan Bandeng)"]
        end
    end

    subgraph TIER2["TIER 2: FINE-TUNED DUAL AI ENGINE"]
        direction LR
        ENGINE_CV["Model A: Computer Vision Engine<br/><i>(Azure Vision Physical Scanner)</i>"]
        ENGINE_RAG["Model B: Generative RAG Engine<br/><i>(Google Gemini 1.5/2.0)</i>"]
    end

    subgraph TIER3["TIER 3: REGIONAL SYNTHESIS LAYER (SISI PEMERINTAH / SPPG)"]
        SYNTHESIS_REGIONAL["Formulasi Menu Teroptimal 18 Kecamatan<br/><i>Resep 5 Bintang + Optimasi HPP Rp 14.800/Porsi</i>"]
    end

    subgraph TIER4["TIER 4: DAILY INFERENCE & CLAIM LAYER (SISI WARGA)"]
        direction LR
        SCAN_USER["Scan HP 4-Frame & MedQA Warga"] --> INFERENCE["Analisis Nutrisi Presisi Harian"]
        INFERENCE --> RESULT["Menu Anda & QR Code Pre-Order MBG"]
    end

    D_CV --> ENGINE_CV
    D_RAG --> ENGINE_RAG
    ENGINE_CV --> SYNTHESIS_REGIONAL
    ENGINE_RAG --> SYNTHESIS_REGIONAL
    SYNTHESIS_REGIONAL --> INFERENCE
```

#### 5.3.4 Diagram Alur Infrastruktur Teknologi

```mermaid
flowchart LR
    L1["1. Perangkat Pengguna<br/>(Mobile & Web Browser)"] --> L2["2. Lapisan Front-End<br/>(Next.js PWA & Leaflet GIS)"]
    
    subgraph S_MIDDLE["LAPISAN CORE BACKEND & AI ENGINE"]
        direction TB
        L3["3. Lapisan Backend & Basis Data<br/>(Firebase Firestore Real-Time)"]
        subgraph AI_FRAMEWORK["4. LAYANAN AI & FITUR LANJUTAN"]
            direction TB
            AI_LLM["Lapisan AI (Gemini / Azure OpenAI RAG)"]
            AI_SEARCH["Mesin Pencari (RAG Master DB)"]
            AI_VISION["Lapisan Visi (Azure Vision 4-Frame)"]
        end
        L3 --> AI_FRAMEWORK
    end

    L2 --> S_MIDDLE

    subgraph S_RIGHT["LAPISAN INFRASTRUKTUR CLOUD & STORAGE"]
        direction TB
        L5["5. Penyimpanan Obyek & Data<br/>(Cloud Storage & Biometric Images)"]
        L6["6. Infrastruktur Cloud<br/>(Vercel Serverless & Auto-Scaling)"]
        L5 --> L6
    end

    S_MIDDLE --> S_RIGHT
```

---

### 5.4 Pengumpulan & Tata Kelola Data (*Data Collection & Preprocessing*)

Pengembangan sistem Kcal (GScan) didukung oleh tata kelola data yang terintegrasi untuk memastikan keandalan model AI biometrik dan mesin RAG rekomendasi nutrisi:

#### 5.4.1 Sumber & Klasifikasi Data Sistem

Platform Kcal memanfaatkan tiga kategori dataset utama yang diverifikasi secara berjenjang disajikan pada **Tabel 5.3**:

##### Tabel 5.3 Sumber & Klasifikasi Dataset Basis Pengetahuan Sistem Kcal (GScan)

| Kategori Dataset | Tipe Data | Sumber & Teknik Pengumpulan | Kualitas & Penanganan Teknikal | Sumber Resmi Verifikasi |
| :--- | :--- | :--- | :--- | :--- |
| **Dataset Ciri Fisik** *(Computer Vision)* | Image kondisi kulit tubuh, rona wajah, & ciri fisik anak defisiensi nutrisi. | • **Publik**: Dataset *Wider Face*.<br/>• **Langsung**: Kerjasama lembaga kesehatan setempat.<br/>• **Sintetik**: Augmentasi variasi pencahayaan & ekspresi. | Menerapkan *image cleaning*, penyesuaian kontras, anonimisasi PII, & augmentasi variasi posisi/cahaya untuk akurasi model. | *Wider Face Dataset*, Lembaga Kesehatan Daerah. |
| **Dataset Kuesioner** *(Generative AI / MedQA)* | Data tanya-jawab gizi & nutrisi anak (*MedQA Pediatric* & WHO). | • **Publik**: Dataset percakapan kesehatan terpercaya.<br/>• **Langsung**: Survei & masukan pakar gizi. | Pemrosesan bahasa alami (NLP) & augmentasi teks memastikan respons chatbot presisi. | *MedQA Pediatric*, *WHO Child Growth Standards 2006*. |
| **Dataset Rekomendasi Menu** *(RAG Engine)* | Angka gizi 18 kecamatan Gresik & ketersediaan komoditas pangan daerah. | • **Pemerintah**: BPS, Kemenkes RI, Dinkes Gresik, Siskaperbapo Jatim.<br/>• **Langsung**: Survei komoditas & harga berkala. | Penanganan variasi ketersediaan pangan antar wilayah & pembaruan database harga pasar secara otomatis via API Siskaperbapo. | *BPS Kab. Gresik*, *TKPI Kemenkes RI*, *Siskaperbapo Pemprov Jatim*. |

#### 5.4.2 Tata Kelola & Pra-pemrosesan Data (*Data Sanitation & Preprocessing*)

Pra-pemrosesan data dilakukan melalui tiga langkah utama:
1. **Anonimisasi Citra (UU PDP)**: Pencabutan metadata identitas pribadi (*PII removal*) dan enkripsi AES-256 pada foto fisik anak.
2. **Normalisasi Biometrik**: Penyesuaian kecerahan, resolusi, dan pemotongan area fisik 4-frame untuk analisis *Azure Vision*.
3. **Vektorisasi RAG**: Konversi teks medis MedQA dan data AKG Kemenkes menjadi *vector embeddings* pada *Azure Search*.

*(Catatan: Rincian pengujian dan validasi fungsionalitas aplikasi disajikan secara khusus pada Sub-bab 5.2.4).*
