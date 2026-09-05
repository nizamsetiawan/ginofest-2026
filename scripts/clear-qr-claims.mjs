const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

async function clearQrClaims() {
  console.log("🧹 Memulai pembersihan koleksi 'gscan_qr_claims' di Firestore...");

  const listEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/gscan_qr_claims?key=${apiKey}&pageSize=500`;

  try {
    const res = await fetch(listEndpoint);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) {
      console.log("✅ Koleksi 'gscan_qr_claims' sudah kosong. Tidak ada dokumen untuk dihapus.");
      return;
    }

    console.log(`📋 Ditemukan ${data.documents.length} dokumen klaim QR. Memproses penghapusan...`);

    for (const doc of data.documents) {
      // doc.name looks like: projects/ginofest-2026/databases/(default)/documents/gscan_qr_claims/DOC_ID
      const docPath = doc.name;
      const deleteEndpoint = `https://firestore.googleapis.com/v1/${docPath}?key=${apiKey}`;

      const delRes = await fetch(deleteEndpoint, { method: "DELETE" });
      if (delRes.ok) {
        console.log(`  ✓ Berhasil menghapus dokumen: ${docPath.split("/").pop()}`);
      } else {
        console.warn(`  ⚠️ Gagal menghapus dokumen ${docPath.split("/").pop()}: HTTP ${delRes.status}`);
      }
    }

    console.log("✨ SELESAI PEMBERSIHAN! Semua dokumen di 'gscan_qr_claims' telah berhasil dihapus!");
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat menghapus data:", err);
  }
}

clearQrClaims();
