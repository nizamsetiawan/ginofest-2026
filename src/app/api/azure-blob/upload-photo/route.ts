/**
 * Azure Blob Storage — Server-side Photo Upload API Route
 * POST /api/azure-blob/upload-photo
 *
 * Alasan server-side:
 *   - Connection String & AccountKey TIDAK BOLEH expose ke browser
 *   - Semua Azure credential hanya tersimpan di server environment
 *
 * Pipeline:
 *   Client (base64 foto) → Server API Route → Azure Blob Container (gscan-media) → return blobUrl
 */

import { NextRequest, NextResponse } from "next/server";
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

// ─── AZURE CONFIG (server-side only) ─────────────────────────────────────────

function getAzureConfig() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || "stgscanginofest26";
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "gscan-media";

  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING tidak dikonfigurasi di environment.");
  }

  // Parse AccountKey dari connection string
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
  const accountKey = accountKeyMatch ? accountKeyMatch[1] : null;

  return { connectionString, accountName, containerName, accountKey };
}

// ─── SAS URL GENERATOR (private blob → temporary URL 24 jam) ─────────────────

function generateSasUrl(
  accountName: string,
  accountKey: string,
  containerName: string,
  blobName: string,
  expiryHours = 24
): string {
  const sharedKey = new StorageSharedKeyCredential(accountName, accountKey);
  const expiresOn = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  const sasParams = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // read-only
      expiresOn,
    },
    sharedKey
  );

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasParams.toString()}`;
}

// ─── UPLOAD HANDLER ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId: string;
      scanId: string;
      photoType: "wajah" | "mata" | "tangan" | "kuku";
      base64Data: string; // "data:image/jpeg;base64,..." atau pure base64
    };

    const { userId, scanId, photoType, base64Data } = body;

    if (!userId || !scanId || !photoType || !base64Data) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    const { connectionString, accountName, containerName, accountKey } = getAzureConfig();

    // Inisialisasi BlobServiceClient menggunakan Connection String
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Buat container jika belum ada (default is private)
    await containerClient.createIfNotExists();

    // Susun blob name: users/{userId}/{scanId}/{filename}.jpg
    const fileMap: Record<string, string> = {
      wajah: "01_wajah.jpg",
      mata: "02_mata_konjungtiva.jpg",
      tangan: "03_tangan_turgor.jpg",
      kuku: "04_kuku_capillary.jpg",
    };
    const sanitizedUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const blobName = `users/${sanitizedUser}/${scanId}/${fileMap[photoType]}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Konversi base64 → Buffer
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    // Upload ke Azure Blob
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
      metadata: {
        userId: sanitizedUser,
        scanId,
        photoType,
        uploadedAt: new Date().toISOString(),
        source: "gscan-ginofest-2026",
      },
    });

    // Generate SAS URL (private blob, expired 24 jam)
    let blobUrl: string;
    if (accountKey) {
      blobUrl = generateSasUrl(accountName, accountKey, containerName, blobName, 24);
    } else {
      // Fallback: public URL (hanya jika container public)
      blobUrl = blockBlobClient.url;
    }

    return NextResponse.json({
      success: true,
      blobName,
      blobUrl,
      containerName,
      accountName,
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      storageProvider: "AZURE_BLOB_STORAGE",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Azure Blob Upload] Error:", message);
    return NextResponse.json({ error: message, storageProvider: "ERROR" }, { status: 500 });
  }
}
