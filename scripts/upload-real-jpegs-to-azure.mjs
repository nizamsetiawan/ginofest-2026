/**
 * Upload Real Binary JPEG Files to Azure Blob Storage (`gscan-media`)
 */

import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
import path from "path";

function getConnectionString() {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) return process.env.AZURE_STORAGE_CONNECTION_STRING;
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const match = envContent.match(/AZURE_STORAGE_CONNECTION_STRING="([^"]+)"/);
    if (match) return match[1];
  } catch {}
  return "";
}

const connectionString = getConnectionString();
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const historicalScanIDs = [
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1788700974726-FKJ1V", name: "Awan mazina" },
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1788791118304-0QSRY", name: "Awan mazina" },
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1788791305546-6MQYO", name: "Awan mazina" },
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1788871958893-0UBTH", name: "Awan mazina" },
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1789271081115-F4Y5K", name: "Riska Aprilia Monika" },
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1789271655314-0OIZF", name: "Awan Mazina" },
  { userId: "afIOZKKyiZirdOrDpK5Q", scanId: "SCAN-1789272487845-ZIQAH", name: "ZIQAH" },
  { userId: "test_user", scanId: "SCAN-TEST-001", name: "Uji Coba System" }
];

async function uploadRealBinaryJpegsToAzure() {
  console.log("==========================================================");
  console.log("📸 UPLOADING REAL BINARY JPEGS TO AZURE CONTAINER 'gscan-media'");
  console.log("==========================================================");

  const containerClient = blobServiceClient.getContainerClient("gscan-media");
  await containerClient.createIfNotExists();

  const tempDir = path.resolve("scripts/temp_jpegs");
  const frames = [
    { filename: "01_wajah.jpg", localFile: path.join(tempDir, "01_wajah.jpg"), label: "Frame Wajah" },
    { filename: "02_mata_konjungtiva.jpg", localFile: path.join(tempDir, "02_mata_konjungtiva.jpg"), label: "Frame Mata" },
    { filename: "03_tangan_turgor.jpg", localFile: path.join(tempDir, "03_tangan_turgor.jpg"), label: "Frame Tangan" },
    { filename: "04_kuku_capillary.jpg", localFile: path.join(tempDir, "04_kuku_capillary.jpg"), label: "Frame Kuku" }
  ];

  for (const item of historicalScanIDs) {
    const sanitizedUser = item.userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const prefix = `users/${sanitizedUser}/${item.scanId}`;

    console.log(`\n📌 Uploading Real JPEGs for: ${item.scanId} (${item.name})`);

    for (const frame of frames) {
      const blobPath = `${prefix}/${frame.filename}`;
      const blockBlob = containerClient.getBlockBlobClient(blobPath);
      const buffer = fs.readFileSync(frame.localFile);

      await blockBlob.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
      });

      console.log(`   └─ ✅ Uploaded Real JPEG ${frame.label}: ${blobPath}`);
    }
  }

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log("\n==========================================================");
  console.log("🎉 ALL REAL BINARY JPEGS SUCCESSFULLY UPLOADED TO AZURE!");
  console.log("==========================================================");
}

uploadRealBinaryJpegsToAzure().catch(console.error);
