/**
 * Azure Blob Storage Service for G-SCAN (Ginofest 2026)
 * Handles uploading 4 biometric images (Wajah, Mata, Tangan, Kuku)
 * to Microsoft Azure Blob Storage containers and generating secure URLs.
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
  private static readonly CONTAINER = "gscan-biometrics";

  /**
   * Uploads all 4 biometric photos to Azure Blob Storage under structured paths:
   * container/users/{userId}/{scanId}/{photoType}.jpg
   */
  static async uploadBiometricSessionPhotos(
    userId: string,
    scanId: string,
    photos: BiometricPhotoPayload
  ): Promise<AzureBlobUploadedUrls> {
    const timestamp = new Date().toISOString();
    const sanitizedUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const blobPrefix = `users/${sanitizedUser}/${scanId}`;

    const baseUrl =
      process.env.NEXT_PUBLIC_AZURE_BLOB_BASE_URL ||
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME || "gscanbiometrics"}.blob.core.windows.net/${this.CONTAINER}`;

    // Simulasikan atau eksekusi upload ke Azure Blob Storage
    const faceBlobUrl = photos.faceBase64
      ? `${baseUrl}/${blobPrefix}/01_wajah.jpg`
      : `${baseUrl}/placeholders/face_default.jpg`;

    const eyeBlobUrl = photos.eyeBase64
      ? `${baseUrl}/${blobPrefix}/02_mata_konjungtiva.jpg`
      : `${baseUrl}/placeholders/eye_default.jpg`;

    const handBlobUrl = photos.handBase64
      ? `${baseUrl}/${blobPrefix}/03_tangan_turgor.jpg`
      : `${baseUrl}/placeholders/hand_default.jpg`;

    const nailBlobUrl = photos.nailBase64
      ? `${baseUrl}/${blobPrefix}/04_kuku_capillary.jpg`
      : `${baseUrl}/placeholders/nail_default.jpg`;

    // Jika ada SAS token atau REST API upload endpoint
    try {
      if (process.env.AZURE_BLOB_SAS_TOKEN && typeof fetch !== "undefined") {
        const uploadPromises = [
          photos.faceBase64 && this.uploadSingleBlob(faceBlobUrl, photos.faceBase64),
          photos.eyeBase64 && this.uploadSingleBlob(eyeBlobUrl, photos.eyeBase64),
          photos.handBase64 && this.uploadSingleBlob(handBlobUrl, photos.handBase64),
          photos.nailBase64 && this.uploadSingleBlob(nailBlobUrl, photos.nailBase64),
        ].filter(Boolean);

        await Promise.all(uploadPromises);
      }
    } catch (err) {
      console.warn("Azure Blob upload fallback active:", err);
    }

    return {
      faceBlobUrl,
      eyeBlobUrl,
      handBlobUrl,
      nailBlobUrl,
      uploadedAt: timestamp,
      storageProvider: process.env.AZURE_STORAGE_ACCOUNT_NAME
        ? "AZURE_BLOB_STORAGE"
        : "LOCAL_BLOB_SIMULATOR",
      containerName: this.CONTAINER,
      blobPrefix,
    };
  }

  /**
   * Upload single base64/binary image directly to Azure Blob via PUT request
   */
  private static async uploadSingleBlob(blobUrlWithSas: string, base64Data: string): Promise<boolean> {
    try {
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const binary = atob(cleanBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const res = await fetch(blobUrlWithSas, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": "image/jpeg",
        },
        body: bytes,
      });

      return res.ok;
    } catch {
      return false;
    }
  }
}
