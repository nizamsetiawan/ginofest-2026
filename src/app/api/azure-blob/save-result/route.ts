/**
 * Azure Blob Storage — Server-side Scan Result JSON Saver
 * POST /api/azure-blob/save-result
 *
 * Menyimpan hasil lengkap scan G-SCAN (analisis klinis Gemini + MedQA + rekomendasi menu)
 * sebagai JSON file per anak di Azure Blob Storage container: gscan-results
 *
 * Path: gscan-results/users/{userId}/{scanId}/result.json
 *
 * Ini melengkapi Firestore (untuk realtime query) dengan Azure Blob (untuk:
 *   - Penyimpanan jangka panjang & audit trail
 *   - File besar tanpa batasan Firestore 1MB
 *   - Cost-efficient backup (~10x lebih murah dari Firestore)
 */

import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { CompleteBiometricScanRecord } from "@/services/biometric-sync-service";

// ─── CONTAINER CONFIG ─────────────────────────────────────────────────────────

const RESULTS_CONTAINER = "gscan-results"; // Container terpisah dari gscan-media (foto)

// ─── SAVE RESULT HANDLER ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      record: CompleteBiometricScanRecord;
      // Tambahan metadata enrichment untuk disimpan bersama
      medqaQuestions?: Array<{ id: number; title: string; subtitle: string; options: string[] }>;
      enrichedKBVersion?: string;
    };

    const { record, medqaQuestions, enrichedKBVersion } = body;

    if (!record?.scanId || !record?.userId) {
      return NextResponse.json({ error: "Record tidak valid" }, { status: 400 });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      return NextResponse.json({ error: "AZURE_STORAGE_CONNECTION_STRING tidak dikonfigurasi" }, { status: 500 });
    }

    // Inisialisasi BlobServiceClient
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(RESULTS_CONTAINER);

    // Buat container gscan-results jika belum ada (default is private)
    await containerClient.createIfNotExists();

    // Susun payload JSON lengkap yang akan disimpan
    const sanitizedUser = record.userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const resultPayload = {
      // ─── Identitas & Metadata ───────────────────────────────────────────
      scanId: record.scanId,
      claimId: record.claimId,
      userId: record.userId,
      userName: record.userName,
      userDistrict: record.userDistrict,
      userAge: record.userAge,
      userEmail: record.userEmail,
      scannedAt: record.createdAt,
      status: record.status,

      // ─── Foto Biometrik (URLs dari Azure Blob gscan-media) ─────────────
      biometricPhotos: {
        wajahUrl: record.blobUrls.faceBlobUrl,
        mataUrl: record.blobUrls.eyeBlobUrl,
        tanganUrl: record.blobUrls.handBlobUrl,
        kukuUrl: record.blobUrls.nailBlobUrl,
        uploadedAt: record.blobUrls.uploadedAt,
      },

      // ─── Analisis Klinis Gemini (MedQA Enriched) ───────────────────────
      clinicalAnalysis: {
        eyePallorScore: record.azureVisionMetrics.eyePallorScore,
        nailCapillaryScore: record.azureVisionMetrics.nailCapillaryScore,
        skinTurgorScore: record.azureVisionMetrics.skinTurgorScore,
        facialVitalityScore: record.azureVisionMetrics.facialVitalityScore,
        detectedDeficiencyRisk: record.azureVisionMetrics.detectedDeficiencyRisk,
        eyeConjunctivaStatus: record.azureVisionMetrics.eyeConjunctivaStatus,
        nailbedStatus: record.azureVisionMetrics.nailbedStatus,
        skinTurgorStatus: record.azureVisionMetrics.skinTurgorStatus,
        aiObservations: record.azureVisionMetrics.aiObservations,
      },

      // ─── Pertanyaan Anamnesis MedQA (Adaptive) ─────────────────────────
      adaptiveMedQAQuestions: medqaQuestions || [],
      medqaEnrichedKBVersion: enrichedKBVersion || "base",

      // ─── Jawaban Kuesioner ──────────────────────────────────────────────
      questionnaireAnswers: record.questionnaireAnswers,

      // ─── Rekomendasi Menu ───────────────────────────────────────────────
      menuRecommendation: {
        menuId: record.recommendedMenu.menuId,
        menuTitle: record.recommendedMenu.menuTitle,
        calories: record.recommendedMenu.calories,
        proteinGram: record.recommendedMenu.proteinGram,
        ironMg: record.recommendedMenu.ironMg,
        portionDesc: record.recommendedMenu.portionDesc,
        akgPercentage: record.recommendedMenu.akgPercentage,
        source: (record.recommendedMenu as any).source || "FALLBACK_NASIONAL",
      },

      // ─── Storage Metadata ───────────────────────────────────────────────
      storageMetadata: {
        primaryStorage: "FIREBASE_FIRESTORE",
        backupStorage: "AZURE_BLOB_STORAGE",
        azureAccount: process.env.AZURE_STORAGE_ACCOUNT_NAME || "stgscanginofest26",
        azureContainerPhotos: process.env.AZURE_STORAGE_CONTAINER_NAME || "gscan-media",
        azureContainerResults: RESULTS_CONTAINER,
        firestoreCollection: "biometric_scans_history",
        savedAt: new Date().toISOString(),
        schemaVersion: "2.0_GSCAN_GINOFEST26",
      },
    };

    // Blob path: users/{userId}/{scanId}/result.json
    const blobName = `users/${sanitizedUser}/${record.scanId}/result.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload JSON ke Azure Blob
    const jsonString = JSON.stringify(resultPayload, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: "application/json; charset=utf-8",
      },
      metadata: {
        scanId: record.scanId,
        userId: sanitizedUser,
        userName: encodeURIComponent(record.userName), // encode untuk header safe
        savedAt: new Date().toISOString(),
        schemaVersion: "2.0",
      },
    });

    // Juga simpan index entry kecil per-user untuk listing riwayat
    const indexBlobName = `users/${sanitizedUser}/index.json`;
    const indexBlobClient = containerClient.getBlockBlobClient(indexBlobName);

    // Load existing index jika ada, atau buat baru
    let userIndex: Array<{ scanId: string; scannedAt: string; deficiencyRisk: string; resultBlobPath: string }> = [];
    try {
      const downloaded = await indexBlobClient.downloadToBuffer();
      userIndex = JSON.parse(downloaded.toString("utf-8"));
    } catch {
      userIndex = []; // Index belum ada, mulai baru
    }

    // Prepend entry baru (terbaru di atas)
    userIndex.unshift({
      scanId: record.scanId,
      scannedAt: record.createdAt,
      deficiencyRisk: record.azureVisionMetrics.detectedDeficiencyRisk,
      resultBlobPath: blobName,
    });

    // Simpan kembali index (maks 50 entry per user)
    const trimmedIndex = userIndex.slice(0, 50);
    await indexBlobClient.uploadData(
      Buffer.from(JSON.stringify(trimmedIndex, null, 2), "utf-8"),
      { blobHTTPHeaders: { blobContentType: "application/json; charset=utf-8" } }
    );

    return NextResponse.json({
      success: true,
      blobName,
      containerName: RESULTS_CONTAINER,
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || "stgscanginofest26",
      savedAt: new Date().toISOString(),
      payloadSizeBytes: buffer.byteLength,
      indexUpdated: true,
      message: `Hasil scan ${record.scanId} berhasil disimpan ke Azure Blob Storage.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Azure Blob Save Result] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET: Ambil index riwayat scan user ──────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId diperlukan" }, { status: 400 });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      return NextResponse.json({ error: "AZURE_STORAGE_CONNECTION_STRING tidak dikonfigurasi" }, { status: 500 });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(RESULTS_CONTAINER);

    const sanitizedUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const indexBlobClient = containerClient.getBlockBlobClient(`users/${sanitizedUser}/index.json`);

    try {
      const buffer = await indexBlobClient.downloadToBuffer();
      const index = JSON.parse(buffer.toString("utf-8"));
      return NextResponse.json({ success: true, userId, scanHistory: index });
    } catch {
      return NextResponse.json({ success: true, userId, scanHistory: [] });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
