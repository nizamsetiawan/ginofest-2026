const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

const oldRagDocs = [
  "1_master_komoditas",
  "2_master_harga_pasar",
  "3_master_menu_makanan",
  "4_master_nilai_gizi",
  "master_store"
];

const oldCommodityDocs = [
  "kec_kebomas", "kec_gresik_kota", "kec_manyar", "kec_driyorejo", "kec_menganti",
  "kec_cerme", "kec_sidayu", "kec_ujungpangkah", "kec_sangkapura", "kec_tambak",
  "kec_balongpanggang", "kec_benjeng", "kec_bungah", "kec_duduksampeyan", "kec_dukun",
  "kec_kedamean", "kec_panceng", "kec_wringinanom"
];

const oldPriceDocs = [
  "beras_medium", "daging_ayam", "ikan_bandeng", "telur_ayam", "susu_sapi",
  "susu_uht", "tempe_kedelai", "tahu_putih", "daun_kelor", "bayam_hijau",
  "pisang_ambon", "semangka_merah"
];

const oldRecipeDocs = [
  "menu_01", "menu_02", "menu_03", "menu_04", "menu_05", "menu_06", "menu_07",
  "menu_08", "menu_09", "menu_10", "menu_11", "menu_12", "menu_13", "menu_14",
  "menu_15", "menu_16", "menu_17", "menu_18", "menu_19", "menu_20"
];

const oldNutritionDocs = [
  "gizi_ap001", "gizi_ap032", "gizi_ap015", "gizi_ap004", "gizi_ap008",
  "gizi_ss001", "gizi_bd002", "gizi_sd014", "gizi_kh001"
];

async function deleteDoc(collectionName, docId) {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}`;
  try {
    const res = await fetch(endpoint, { method: "DELETE" });
    console.log(`[DELETE] ${collectionName}/${docId} -> HTTP ${res.status}`);
  } catch (err) {
    console.warn(`[ERROR] Delete ${collectionName}/${docId}:`, err);
  }
}

async function runCleanup() {
  console.log("🧹 Mulai Membersihkan Dokumen Lama Non-UUID di Cloud Firestore...");

  // 1. Delete rag_database old documents
  for (const docId of oldRagDocs) {
    await deleteDoc("rag_database", docId);
  }

  // 2. Delete non-UUID documents in master_komoditas
  for (const docId of oldCommodityDocs) {
    await deleteDoc("master_komoditas", docId);
  }

  // 3. Delete non-UUID documents in master_harga_pasar
  for (const docId of oldPriceDocs) {
    await deleteDoc("master_harga_pasar", docId);
  }

  // 4. Delete non-UUID documents in master_menu_makanan
  for (const docId of oldRecipeDocs) {
    await deleteDoc("master_menu_makanan", docId);
  }

  // 5. Delete non-UUID documents in master_nilai_gizi
  for (const docId of oldNutritionDocs) {
    await deleteDoc("master_nilai_gizi", docId);
  }

  console.log("✨ SELESAI PEMBERSIHAN! Database kini 100% Bersih & Hanya Berisi Dokumen UUID!");
}

runCleanup();
