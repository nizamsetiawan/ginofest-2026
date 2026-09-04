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
  private static async uploadPhotoViaApi(
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

    // Fallback URL (digunakan jika upload gagal)
    const fallbackBase = `https://${account}.blob.core.windows.net/${container}/${blobPrefix}`;
    const fallbacks = {
      face: `${fallbackBase}/01_wajah.jpg`,
      eye: `${fallbackBase}/02_mata_konjungtiva.jpg`,
      hand: `${fallbackBase}/03_tangan_turgor.jpg`,
      nail: `${fallbackBase}/04_kuku_capillary.jpg`,
    };

    // Upload semua foto secara paralel via server API
    const [faceUrl, eyeUrl, handUrl, nailUrl] = await Promise.all([
      photos.faceBase64
        ? this.uploadPhotoViaApi(userId, scanId, "wajah", photos.faceBase64)
        : Promise.resolve(null),
      photos.eyeBase64
        ? this.uploadPhotoViaApi(userId, scanId, "mata", photos.eyeBase64)
        : Promise.resolve(null),
      photos.handBase64
        ? this.uploadPhotoViaApi(userId, scanId, "tangan", photos.handBase64)
        : Promise.resolve(null),
      photos.nailBase64
        ? this.uploadPhotoViaApi(userId, scanId, "kuku", photos.nailBase64)
        : Promise.resolve(null),
    ]);

    const faceBlobUrl = faceUrl || photos.faceBase64 || "";
    const eyeBlobUrl = eyeUrl || photos.eyeBase64 || "";
    const handBlobUrl = handUrl || photos.handBase64 || "";
    const nailBlobUrl = nailUrl || photos.nailBase64 || "";

    // Tentukan provider: jika minimal 1 sukses → AZURE_BLOB_STORAGE
    const anyUploaded = [faceUrl, eyeUrl, handUrl, nailUrl].some((u) => u !== null);
    const storageProvider: AzureBlobUploadedUrls["storageProvider"] = anyUploaded
      ? "AZURE_BLOB_STORAGE"
      : "LOCAL_BLOB_SIMULATOR";

    if (!anyUploaded) {
      console.warn("[AzureBlob] Upload ke Azure tidak aktif / gagal. Menggunakan data foto lokal / visual fallback.");
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
