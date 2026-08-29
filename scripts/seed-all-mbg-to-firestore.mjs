import crypto from "crypto";

const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

const ALL_MBG_PRICES = [
  // Karbohidrat
  { item: "Beras Medium / Premium", category: "Karbohidrat", price: "Rp 13.800 / kg", districts: "18 Kecamatan" },
  { item: "Beras Merah", category: "Karbohidrat", price: "Rp 17.500 / kg", districts: "Balongpanggang, Benjeng" },
  { item: "Jagung Manis / Pipil", category: "Karbohidrat", price: "Rp 9.500 / kg", districts: "18 Kecamatan" },
  { item: "Kentang Dieng", category: "Karbohidrat", price: "Rp 16.000 / kg", districts: "Kebomas, Gresik Kota, Driyorejo" },
  { item: "Ubi Jalar / Ubi Ungu", category: "Karbohidrat", price: "Rp 8.500 / kg", districts: "Manyar, Menganti, Bawean" },
  { item: "Singkong Manis", category: "Karbohidrat", price: "Rp 6.000 / kg", districts: "Sangkapura, Tambak" },
  { item: "Bihun Jagung", category: "Karbohidrat", price: "Rp 6.000 / bks", districts: "18 Kecamatan" },

  // Protein Hewani
  { item: "Daging Ayam Broiler", category: "Protein Hewani", price: "Rp 34.000 / kg", districts: "18 Kecamatan" },
  { item: "Daging Ayam Kampung", category: "Protein Hewani", price: "Rp 65.000 / ekor", districts: "18 Kecamatan" },
  { item: "Daging Sapi Segar", category: "Protein Hewani", price: "Rp 115.000 / kg", districts: "18 Kecamatan" },
  { item: "Ikan Bandeng Segar", category: "Protein Hewani", price: "Rp 28.000 / kg", districts: "Manyar, Ujungpangkah, Bungah, Sidayu" },
  { item: "Ikan Tongkol Segar", category: "Protein Hewani", price: "Rp 32.000 / kg", districts: "Gresik Kota, Bawean, Panceng" },
  { item: "Ikan Kembung Segar", category: "Protein Hewani", price: "Rp 30.000 / kg", districts: "Panceng, Bawean, Ujungpangkah" },
  { item: "Ikan Nila Segar", category: "Protein Hewani", price: "Rp 26.000 / kg", districts: "Menganti, Cerme, Dukun" },
  { item: "Ikan Lele Segar", category: "Protein Hewani", price: "Rp 22.000 / kg", districts: "Menganti, Dukun, Kedamean" },
  { item: "Ikan Gurami", category: "Protein Hewani", price: "Rp 45.000 / kg", districts: "Menganti, Dukun" },
  { item: "Ikan Kakap Merah", category: "Protein Hewani", price: "Rp 55.000 / kg", districts: "Manyar, Ujungpangkah, Bawean" },
  { item: "Ikan Patin", category: "Protein Hewani", price: "Rp 25.000 / kg", districts: "Menganti, Dukun" },
  { item: "Ikan Teri Nasi", category: "Protein Hewani", price: "Rp 15.000 / ons", districts: "Bawean, Panceng" },
  { item: "Ikan Kerapu", category: "Protein Hewani", price: "Rp 60.000 / kg", districts: "Sangkapura, Tambak" },
  { item: "Udang Vaname / Tambak", category: "Protein Hewani", price: "Rp 65.000 / kg", districts: "Manyar, Ujungpangkah, Bungah" },
  { item: "Kupang Segar", category: "Protein Hewani", price: "Rp 12.000 / bungkus", districts: "Gresik Kota, Sidayu" },
  { item: "Cumi-cumi Segar", category: "Protein Hewani", price: "Rp 70.000 / kg", districts: "Bawean, Gresik Kota" },

  // Susu & Telur (Wajib Standar BGN)
  { item: "Susu Sapi Segar Murni", category: "Susu & Telur", price: "Rp 14.000 / liter", districts: "18 Kecamatan" },
  { item: "Susu UHT MBG", category: "Susu & Telur", price: "Rp 4.500 / kotak", districts: "18 Kecamatan" },
  { item: "Telur Ayam Ras", category: "Susu & Telur", price: "Rp 27.000 / kg", districts: "18 Kecamatan" },
  { item: "Telur Bebek", category: "Susu & Telur", price: "Rp 3.000 / butir", districts: "Duduksampeyan, Driyorejo" },
  { item: "Telur Puyuh", category: "Susu & Telur", price: "Rp 36.000 / kg", districts: "Kebomas, Gresik Kota" },
  { item: "Telur Asin Gresik", category: "Susu & Telur", price: "Rp 3.500 / butir", districts: "Duduksampeyan, Cerme" },
  { item: "Keju Cheddar MBG", category: "Susu & Telur", price: "Rp 14.000 / kotak", districts: "18 Kecamatan" },

  // Protein Nabati
  { item: "Tempe Kedelai Segar", category: "Protein Nabati", price: "Rp 5.000 / papan", districts: "18 Kecamatan" },
  { item: "Tahu Putih Segar", category: "Protein Nabati", price: "Rp 8.000 / bungkus", districts: "18 Kecamatan" },
  { item: "Kacang Hijau", category: "Protein Nabati", price: "Rp 22.000 / kg", districts: "Balongpanggang, Manyar, Sidayu" },
  { item: "Kacang Merah", category: "Protein Nabati", price: "Rp 26.000 / kg", districts: "Benjeng, Driyorejo" },
  { item: "Kacang Tanah", category: "Protein Nabati", price: "Rp 28.000 / kg", districts: "18 Kecamatan" },
  { item: "Kacang Kedelai Lokal", category: "Protein Nabati", price: "Rp 13.500 / kg", districts: "Benjeng, Balongpanggang" },
  { item: "Edamame", category: "Protein Nabati", price: "Rp 12.000 / bks", districts: "Kebomas, Gresik Kota" },

  // Sayuran
  { item: "Bayam Hijau Segar", category: "Sayuran", price: "Rp 3.500 / ikat", districts: "18 Kecamatan" },
  { item: "Kangkung Segar", category: "Sayuran", price: "Rp 3.000 / ikat", districts: "18 Kecamatan" },
  { item: "Daun Kelor Segar", category: "Sayuran", price: "Rp 4.000 / ikat", districts: "Panceng, Bawean, Sidayu, Bungah" },
  { item: "Wortel Segar", category: "Sayuran", price: "Rp 14.000 / kg", districts: "18 Kecamatan" },
  { item: "Brokoli Hijau", category: "Sayuran", price: "Rp 24.000 / kg", districts: "Kebomas, Driyorejo, Benjeng" },
  { item: "Kembang Kol", category: "Sayuran", price: "Rp 20.000 / kg", districts: "Kebomas, Menganti, Kedamean" },
  { item: "Buncis Segar", category: "Sayuran", price: "Rp 15.000 / kg", districts: "18 Kecamatan" },
  { item: "Kacang Panjang", category: "Sayuran", price: "Rp 4.000 / ikat", districts: "Sidayu, Kedamean, Menganti" },
  { item: "Labu Siam", category: "Sayuran", price: "Rp 4.000 / buah", districts: "18 Kecamatan" },
  { item: "Labu Kuning (Waluh)", category: "Sayuran", price: "Rp 12.000 / buah", districts: "Kebomas, Benjeng, Sangkapura" },
  { item: "Terong Ungu", category: "Sayuran", price: "Rp 9.000 / kg", districts: "Manyar, Cerme, Bungah, Tambak" },
  { item: "Sawi Hijau (Caisim)", category: "Sayuran", price: "Rp 3.500 / ikat", districts: "Menganti, Dukun" },
  { item: "Sawi Putih", category: "Sayuran", price: "Rp 8.000 / buah", districts: "18 Kecamatan" },
  { item: "Tomat Sayur", category: "Sayuran", price: "Rp 12.000 / kg", districts: "18 Kecamatan" },
  { item: "Oyong (Gambas)", category: "Sayuran", price: "Rp 4.000 / buah", districts: "18 Kecamatan" },
  { item: "Tauge Segar", category: "Sayuran", price: "Rp 3.000 / bungkus", districts: "18 Kecamatan" },

  // Buah-buahan
  { item: "Pisang Cavendish / Ambon", category: "Buah-buahan", price: "Rp 18.000 / sisir", districts: "18 Kecamatan" },
  { item: "Pepaya California", category: "Buah-buahan", price: "Rp 10.000 / buah", districts: "18 Kecamatan" },
  { item: "Semangka Merah Segar", category: "Buah-buahan", price: "Rp 18.000 / buah", districts: "18 Kecamatan" },
  { item: "Melon Segar", category: "Buah-buahan", price: "Rp 20.000 / buah", districts: "Manyar, Menganti, Duduksampeyan" },
  { item: "Jeruk Manis", category: "Buah-buahan", price: "Rp 20.000 / kg", districts: "18 Kecamatan" },
  { item: "Buah Naga Merah", category: "Buah-buahan", price: "Rp 22.000 / kg", districts: "18 Kecamatan" },
  { item: "Mangga Gresik", category: "Buah-buahan", price: "Rp 22.000 / kg", districts: "Ujungpangkah, Panceng" },
  { item: "Kelapa Muda", category: "Buah-buahan", price: "Rp 10.000 / butir", districts: "18 Kecamatan" }
];

function toFirestoreFields(obj, uuid, index) {
  return {
    id: { stringValue: uuid },
    no: { integerValue: (index + 1).toString() },
    item: { stringValue: obj.item },
    category: { stringValue: obj.category },
    price: { stringValue: obj.price },
    districts: { stringValue: obj.districts },
    source: { stringValue: "SISKAPERBAPO Jawa Timur & MBG Gresik" },
    createdAt: { stringValue: new Date().toISOString() },
    updatedAt: { stringValue: new Date().toISOString() }
  };
}

async function runSeed() {
  console.log(`🔥 Mulai Mengupload ${ALL_MBG_PRICES.length} Master Bahan Pangan MBG Lengkap ke Firestore...`);

  // First fetch existing docs to avoid duplicates
  const listEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/master_harga_pasar?key=${apiKey}`;
  const listRes = await fetch(listEndpoint);
  const listData = await listRes.json();
  if (listData.documents) {
    console.log(`🧹 Membersihkan ${listData.documents.length} dokumen harga lama...`);
    for (const doc of listData.documents) {
      const docPath = doc.name.split("/documents/")[1];
      await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?key=${apiKey}`, { method: "DELETE" });
    }
  }

  console.log(`➡️ Menulis ${ALL_MBG_PRICES.length} dokumen bahan pangan ber-UUID ke master_harga_pasar...`);
  for (let i = 0; i < ALL_MBG_PRICES.length; i++) {
    const uuid = crypto.randomUUID();
    const item = ALL_MBG_PRICES[i];
    const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/master_harga_pasar/${uuid}?key=${apiKey}`;
    const payload = { fields: toFirestoreFields(item, uuid, i) };
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  console.log(`✅ SELESAI! Seluruh ${ALL_MBG_PRICES.length} Master Bahan Pangan MBG telah tersimpan di Cloud Firestore!`);
}

runSeed();
