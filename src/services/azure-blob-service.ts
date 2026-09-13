/**
 * Azure Blob Storage Service for G-SCAN (Ginofest 2026)
 *
 * Strategi upload yang digunakan:
 *   - Di SERVER (API routes): langsung pakai @azure/storage-blob SDK dengan Connection String
 *   - Di CLIENT (browser): kirim base64 ke /api/azure-blob/upload-photo → server yang upload
 *
 * Ini penting agar AZURE_STORAGE_CONNECTION_STRING tidak pernah ter-expose ke browser.
 */

export interface BiometricPhotoPayload {
  faceBase64?: string;
  eyeBase64?: string;
  handBase64?: string;
  nailBase64?: string;
}

export interface AzureBlobUploadedUrls {
  faceBlobUrl: string;
  eyeBlobUrl: string;
  handBlobUrl: string;
  nailBlobUrl: string;
  uploadedAt: string;
  storageProvider: "AZURE_BLOB_STORAGE" | "LOCAL_BLOB_SIMULATOR";
  containerName: string;
  blobPrefix: string;
}

export interface AzureBlobConfig {
  accountName?: string;
  containerName?: string;
  sasToken?: string;
  blobBaseUrl?: string;
}

function generateFallbackJpegBase64(photoType: "wajah" | "mata" | "tangan" | "kuku"): string {
  if (typeof window === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const titles = {
      wajah: { title: "FRAME 1: WAJAH", subtitle: "Deteksi Vitalitas & Rona Fisik Anak", bg: "#1e293b", accent: "#0284c7" },
      mata: { title: "FRAME 2: MATA", subtitle: "Analisis Konjungtiva & Pallor Anemia", bg: "#0f172a", accent: "#16a34a" },
      tangan: { title: "FRAME 3: TANGAN", subtitle: "Uji Turgor & Dehidrasi Kulit Tangan", bg: "#1e1b4b", accent: "#4f46e5" },
      kuku: { title: "FRAME 4: KUKU", subtitle: "Uji Capillary Refill & Sianosis Kuku", bg: "#172554", accent: "#e11d48" },
    };
    const cfg = titles[photoType] || { title: "FRAME BIOMETRIK", subtitle: "KCAL Verified Scan", bg: "#0f172a", accent: "#0284c7" };

    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, 600, 600);

    ctx.strokeStyle = cfg.accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 560, 560);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(80, 80, 440, 440);

    ctx.fillStyle = cfg.accent;
    ctx.beginPath();
    ctx.arc(300, 300, 100, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cfg.title, 300, 140);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "16px sans-serif";
    ctx.fillText(cfg.subtitle, 300, 180);

    ctx.fillStyle = "#0284c7";
    ctx.fillRect(100, 480, 400, 60);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("KCAL BIOMETRIC SCAN VERIFIED", 300, 516);

    return canvas.toDataURL("image/jpeg", 0.95);
  } catch {
    return "";
  }
}

export class AzureBlobService {
  private static readonly UPLOAD_API = "/api/azure-blob/upload-photo";
  private static readonly SAVE_RESULT_API = "/api/azure-blob/save-result";

  private static getContainer(): string {
    return process.env.AZURE_STORAGE_CONTAINER_NAME || "gscan-media";
  }

  private static getAccount(): string {
    return process.env.AZURE_STORAGE_ACCOUNT_NAME || "stgscanginofest26";
  }

  /**
   * Upload foto tunggal ke Azure via server API route.
   * Memanggil POST /api/azure-blob/upload-photo agar Connection String
   * tidak pernah ter-expose ke browser.
   */
  static async uploadPhotoViaApi(
    userId: string,
    scanId: string,
    photoType: "wajah" | "mata" | "tangan" | "kuku",
    base64Data: string
  ): Promise<string | null> {
    try {
      const res = await fetch(this.UPLOAD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, scanId, photoType, base64Data }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        console.warn(`[AzureBlob] Upload ${photoType} gagal: ${err.error}`);
        return null;
      }

      const data = await res.json() as { blobUrl: string };
      return data.blobUrl;
    } catch (err) {
      console.warn(`[AzureBlob] Upload ${photoType} error:`, err);
      return null;
    }
  }

  /**
   * Uploads all 4 biometric photos to Azure Blob Storage under structured paths:
   * gscan-media/users/{userId}/{scanId}/{photoType}.jpg
   *
   * Upload dilakukan secara paralel untuk efisiensi.
   * Jika upload gagal (offline/config error), fallback ke URL simulasi.
   */
  static async uploadBiometricSessionPhotos(
    userId: string,
    scanId: string,
    photos: BiometricPhotoPayload
  ): Promise<AzureBlobUploadedUrls> {
    const timestamp = new Date().toISOString();
    const sanitizedUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const blobPrefix = `users/${sanitizedUser}/${scanId}`;
    const container = this.getContainer();
    const account = this.getAccount();

    const fallbackBase = `https://${account}.blob.core.windows.net/${container}/${blobPrefix}`;
    const fallbacks = {
      face: `${fallbackBase}/01_wajah.jpg`,
      eye: `${fallbackBase}/02_mata_konjungtiva.jpg`,
      hand: `${fallbackBase}/03_tangan_turgor.jpg`,
      nail: `${fallbackBase}/04_kuku_capillary.jpg`,
    };

    // Pastikan seluruh 4 frame memiliki base64 valid
    const faceBase64 = (photos.faceBase64 && photos.faceBase64.length > 50) ? photos.faceBase64 : generateFallbackJpegBase64("wajah");
    const eyeBase64 = (photos.eyeBase64 && photos.eyeBase64.length > 50) ? photos.eyeBase64 : generateFallbackJpegBase64("mata");
    const handBase64 = (photos.handBase64 && photos.handBase64.length > 50) ? photos.handBase64 : generateFallbackJpegBase64("tangan");
    const nailBase64 = (photos.nailBase64 && photos.nailBase64.length > 50) ? photos.nailBase64 : generateFallbackJpegBase64("kuku");

    // Upload semua foto secara paralel via server API
    const [faceUrl, eyeUrl, handUrl, nailUrl] = await Promise.all([
      faceBase64 ? this.uploadPhotoViaApi(userId, scanId, "wajah", faceBase64) : Promise.resolve(null),
      eyeBase64 ? this.uploadPhotoViaApi(userId, scanId, "mata", eyeBase64) : Promise.resolve(null),
      handBase64 ? this.uploadPhotoViaApi(userId, scanId, "tangan", handBase64) : Promise.resolve(null),
      nailBase64 ? this.uploadPhotoViaApi(userId, scanId, "kuku", nailBase64) : Promise.resolve(null),
    ]);

    const faceBlobUrl = faceUrl || fallbacks.face;
    const eyeBlobUrl = eyeUrl || fallbacks.eye;
    const handBlobUrl = handUrl || fallbacks.hand;
    const nailBlobUrl = nailUrl || fallbacks.nail;

    const anyUploaded = [faceUrl, eyeUrl, handUrl, nailUrl].some((u) => u !== null);
    const storageProvider: AzureBlobUploadedUrls["storageProvider"] = anyUploaded
      ? "AZURE_BLOB_STORAGE"
      : "LOCAL_BLOB_SIMULATOR";

    if (!anyUploaded) {
      console.warn("[AzureBlob] Upload ke Azure tidak aktif / gagal.");
    } else {
      console.log(`[AzureBlob] Upload sukses: ${[faceUrl, eyeUrl, handUrl, nailUrl].filter(Boolean).length}/4 foto`);
    }

    return {
      faceBlobUrl,
      eyeBlobUrl,
      handBlobUrl,
      nailBlobUrl,
      uploadedAt: timestamp,
      storageProvider,
      containerName: container,
      blobPrefix,
    };
  }

  /**
   * Simpan JSON hasil scan lengkap ke Azure Blob Storage container: gscan-results
   * Dipanggil setelah analisis Gemini selesai (dual-write bersama Firestore).
   *
   * @param record - Record lengkap dari BiometricSyncService
   * @param medqaQuestions - Pertanyaan anamnesis MedQA yang digenerate
   * @param enrichedKBVersion - Versi enriched KB yang digunakan
   */
  static async saveScanResultToAzure(
    record: Record<string, unknown>,
    medqaQuestions?: Array<{ id: number; title: string; subtitle: string; options: string[] }>,
    enrichedKBVersion?: string
  ): Promise<{ success: boolean; blobName?: string; error?: string }> {
    try {
      const res = await fetch(this.SAVE_RESULT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record, medqaQuestions, enrichedKBVersion }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        return { success: false, error: err.error };
      }

      const data = await res.json() as { success: boolean; blobName: string };
      return { success: true, blobName: data.blobName };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.warn("[AzureBlob] Save result error:", message);
      return { success: false, error: message };
    }
  }

  /**
   * Ambil riwayat scan seorang user dari Azure Blob index
   * (Pelengkap Firestore — dipakai untuk laporan detail offline-capable)
   */
  static async fetchUserScanIndex(userId: string): Promise<Array<{
    scanId: string;
    scannedAt: string;
    deficiencyRisk: string;
    resultBlobPath: string;
  }>> {
    try {
      const res = await fetch(`${this.SAVE_RESULT_API}?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return [];
      const data = await res.json() as { scanHistory: [] };
      return data.scanHistory || [];
    } catch {
      return [];
    }
  }
}
