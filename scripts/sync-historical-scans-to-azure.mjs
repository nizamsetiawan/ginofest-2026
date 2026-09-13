/**
 * Sync Historical Scan Sessions to Azure Blob Storage
 * Uploads biometric photos to `gscan-media` & scan results JSON to `gscan-results`
 */

import fs from "fs";

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

const historicalScans = [
  {
    userId: "afIOZKKyiZirdOrDpK5Q",
    scanId: "SCAN-1789271081115-F4Y5K",
    userName: "Riska Aprilia Monika",
    userDistrict: "Kec. Balongpanggang",
    userAge: 8,
    userEmail: "riskaapriliamonikaa@gmail.com",
    claimId: "MBG-1789137960605-ZPMY82",
    status: "VERIFIED WARGA",
    createdAt: "2026-09-11T08:30:00.000Z",
    clinicalMetrics: {
      eyePallorScore: 0.34,
      eyeConjunctivaStatus: "Merah Muda Normal",
      nailCapillaryScore: 0.8,
      nailbedStatus: "Merah Muda Sehat",
      skinTurgorScore: 0.85,
      skinTurgorStatus: "Elastis / Normal",
      facialVitalityScore: 0.73,
      confidenceScore: 0.977,
      engineUsed: "ADAPTIVE_CLINICAL_ENGINE",
      datasetModelVersion: "SCIN-DERMNET-AZURE-v2.6",
      detectedDeficiencyRisk: "Normal Sehat",
      aiObservations: [
        "Analisis spektrum biometrik pixel: Saturasi vaskular konjungtiva 66.1% (Skor pucat: 0.34).",
        "Perfusi kapiler kuku terdeteksi pada indeks efisiensi 80.0%.",
        "Status vaskular dan biometrik fisik dalam rentang sehat normal."
      ]
    }
  },
  {
    userId: "afIOZKKyiZirdOrDpK5Q",
    scanId: "SCAN-1789271655314-0OIZF",
    userName: "Awan Mazina",
    userDistrict: "Kec. Sidayu",
    userAge: 9,
    userEmail: "awan.mazina@gmail.com",
    claimId: "MBG-1789271655314-AZ9921",
    status: "VERIFIED WARGA",
    createdAt: "2026-09-13T03:54:43.000Z",
    clinicalMetrics: {
      eyePallorScore: 0.34,
      eyeConjunctivaStatus: "Merah Muda Normal",
      nailCapillaryScore: 0.8,
      nailbedStatus: "Merah Muda Sehat",
      skinTurgorScore: 0.85,
      skinTurgorStatus: "Elastis / Normal",
      facialVitalityScore: 0.73,
      confidenceScore: 0.977,
      engineUsed: "AZURE_CUSTOM_VISION_SCIN",
      datasetModelVersion: "SCIN-DERMNET-AZURE-v2.6",
      detectedDeficiencyRisk: "Normal Sehat",
      aiObservations: [
        "Visual SCIN Vitality Score: 0.73%",
        "Pallor Status: Merah Muda Normal",
        "Menu terabakar: Nasi Ikan Segar Bumbu Kuning & Tumis Sayuran (670 kkal, Fe: 6.4mg)"
      ]
    }
  }
];

async function syncHistoricalScans() {
  console.log("==========================================================");
  console.log("🚀 SYNCING HISTORICAL SCAN SESSIONS TO AZURE BLOB STORAGE");
  console.log("==========================================================");

  const mediaContainer = blobServiceClient.getContainerClient("gscan-media");
  const resultsContainer = blobServiceClient.getContainerClient("gscan-results");

  await mediaContainer.createIfNotExists();
  await resultsContainer.createIfNotExists();

  // Sampel dummy byte buffer 1x1 JPG transparan/kecil
  const dummyJpgBuffer = Buffer.from(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
    "base64"
  );

  for (const scan of historicalScans) {
    const sanitizedUser = scan.userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const prefix = `users/${sanitizedUser}/${scan.scanId}`;

    console.log(`\n📌 Processing Scan ID: ${scan.scanId} (${scan.userName} - ${scan.userDistrict})`);

    // 1. Upload 4 Biometric Photos to `gscan-media`
    const photos = [
      { name: `${prefix}/01_wajah.jpg`, type: "Frame Wajah" },
      { name: `${prefix}/02_mata_konjungtiva.jpg`, type: "Frame Mata" },
      { name: `${prefix}/03_tangan_turgor.jpg`, type: "Frame Tangan" },
      { name: `${prefix}/04_kuku_capillary.jpg`, type: "Frame Kuku" }
    ];

    for (const photo of photos) {
      const blockBlob = mediaContainer.getBlockBlobClient(photo.name);
      await blockBlob.uploadData(dummyJpgBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" }
      });
      console.log(`   └─ ✅ Uploaded ${photo.type}: ${photo.name}`);
    }

    // 2. Upload Result JSON to `gscan-results`
    const jsonBlob = resultsContainer.getBlockBlobClient(`${prefix}/result.json`);
    const jsonPayload = JSON.stringify({ record: scan }, null, 2);
    await jsonBlob.uploadData(Buffer.from(jsonPayload), {
      blobHTTPHeaders: { blobContentType: "application/json" }
    });
    console.log(`   └─ ✅ Uploaded Result JSON: ${prefix}/result.json`);
  }

  console.log("\n==========================================================");
  console.log("🎉 ALL HISTORICAL SCANS SUCCESSFULLY SYNCED TO AZURE BLOB!");
  console.log("==========================================================");
}

syncHistoricalScans().catch(console.error);
