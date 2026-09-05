const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

async function resetBiometricScansStatus() {
  console.log("🔄 Memulai reset status dokumen di koleksi 'biometric_scans_history' menjadi VALID (Tersedia)...");

  const listEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/biometric_scans_history?key=${apiKey}&pageSize=500`;

  try {
    const res = await fetch(listEndpoint);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) {
      console.log("ℹ️ Koleksi 'biometric_scans_history' kosong.");
      return;
    }

    console.log(`📋 Ditemukan ${data.documents.length} dokumen analisis biometrik. Memeriksa status...`);
    let updatedCount = 0;

    for (const docItem of data.documents) {
      const docPath = docItem.name;
      const docId = docPath.split("/").pop();
      const fields = docItem.fields || {};
      const currentStatus = fields.status?.stringValue;

      if (currentStatus === "CLAIMED" || currentStatus !== "VALID") {
        const patchEndpoint = `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=status&key=${apiKey}`;

        const patchBody = {
          fields: {
            status: { stringValue: "VALID" }
          }
        };

        const patchRes = await fetch(patchEndpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        });

        if (patchRes.ok) {
          console.log(`  ✓ Berhasil reset status dokumen ID [${docId}] (${currentStatus || 'null'} -> VALID / Tersedia)`);
          updatedCount++;
        } else {
          console.warn(`  ⚠️ Gagal reset dokumen ID [${docId}]: HTTP ${patchRes.status}`);
        }
      } else {
        console.log(`  - Dokumen ID [${docId}] sudah berstatus VALID / Tersedia.`);
      }
    }

    console.log(`\n✨ SELESAI RESET! Total ${updatedCount} dari ${data.documents.length} dokumen biometrik telah di-reset ke status 'VALID' (Tersedia).`);
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat reset data biometrik:", err);
  }
}

resetBiometricScansStatus();
