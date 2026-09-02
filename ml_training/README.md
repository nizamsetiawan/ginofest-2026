# 🧠 G-SCAN Machine Learning Training Pipeline

Pipeline pelatihan model AI lengkap untuk **G-SCAN (Ginofest 2026)** berbasis 4 dataset utama:
1. **SCIN (Skin Condition Image Dataset - Google Research)** & **DermNet**
2. **Medical QnA Dataset (MedAlpaca / MedQA)**
3. **Data Komoditas dan Harga Pangan Daerah (Badan Pangan Nasional / Bapanas)**
4. **Wider Face & Pediatric Clinical Landmarks**

---

## 📁 Struktur Modul Training

```
ml_training/
├── requirements.txt                         # Dependencies Python (PyTorch, Azure SDK, Google AI)
├── 01_dataset_loader_scin_dermnet.py        # Preprocessing, CLAHE Contrast & Augmentasi Citra
├── 02_train_azure_custom_vision.py          # Script Otomatisasi Training & Publish ke Azure Cloud
├── 03_finetune_medical_qna_gemini.py        # Fine-Tuning & Knowledge Base MedQA ke Gemini AI
├── 04_sync_bapanas_nutrition_rag.py         # Sinkronisasi Data Pangan Bapanas ke RAG Database
├── 05_evaluate_and_benchmark.py             # Evaluasi Akurasi, Recall, Precision, & F1-Score
└── README.md                                # Panduan Eksekusi Lengkap
```

---

## 🚀 Panduan Eksekusi Bertahap

### 1. Instalasi Lingkungan Python
```bash
cd ml_training
pip install -r requirements.txt
```

### 2. Preprocessing & Augmentasi Dataset (SCIN & DermNet)
```bash
python 01_dataset_loader_scin_dermnet.py
```
* Melakukan *CLAHE Contrast Equalization* untuk menonjolkan saturasi hemoglobin konjungtiva dan bantalan kuku.
* Menghasilkan manifest terstruktur di `processed_data/dataset_manifest.json`.

### 3. Training & Publish Model ke Azure Custom Vision
```bash
python 02_train_azure_custom_vision.py
```
* Mengunggah batch dataset berlabel ke project **Azure Custom Vision**.
* Menjalankan iterasi pelatihan di GPU Azure Cloud.
* Mem-publish model ke **Prediction Endpoint**.

### 4. Fine-Tuning & Grounding MedQA ke Gemini AI
```bash
python 03_finetune_medical_qna_gemini.py
```
* Menyiapkan dataset tanya-jawab klinis anak ke format `.jsonl` untuk asisten *dr. Gizi AI*.

### 5. Sinkronisasi Data Pangan Bapanas ke RAG Engine
```bash
python 04_sync_bapanas_nutrition_rag.py
```
* Menyiapkan data komoditas pangan lokal (Bandeng, Ayam, Kelor) agar rekomendasi menu MBG teroptimasi biaya dan ketersediaan daerah.

### 6. Uji Tolak Ukur & Validasi Klinis (Benchmark)
```bash
python 05_evaluate_and_benchmark.py
```
* Menghitung Sensitivity (>94%), Specificity (>92%), dan F1-Score model.

---

## 🔗 Menghubungkan Model ke Aplikasi Web/Mobile Next.js

Setelah training selesai, cukup masukkan endpoint hasil publish ke file `.env` di root project:

```env
# Azure Custom Vision Endpoint (Hasil Training Script 02)
AZURE_CUSTOM_VISION_PREDICTION_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/customvision/v3.0/Prediction/.../url
AZURE_CUSTOM_VISION_PREDICTION_KEY=your_prediction_key_here

# Google Gemini AI Key (Hasil Setup Script 03)
GEMINI_API_KEY=your_gemini_api_key_here

# Azure Blob Storage (Tempat Foto Kamera Disimpan)
AZURE_STORAGE_ACCOUNT_NAME=gscanbiometrics
NEXT_PUBLIC_AZURE_BLOB_BASE_URL=https://gscanbiometrics.blob.core.windows.net/gscan-biometrics
```
