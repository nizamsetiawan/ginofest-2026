// Seeding 4 Dedicated Documents to Cloud Firestore
const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

const commodities = [
  { no: 1, name: "Kec. Kebomas", items: ["Beras", "Jagung", "Kentang", "Daging Ayam", "Daging Sapi", "Ikan Bandeng", "Telur Ayam", "Telur Puyuh", "Susu Sapi", "Susu UHT", "Tempe", "Tahu", "Bayam", "Wortel", "Brokoli", "Buncis", "Labu Kuning", "Pisang", "Semangka", "Jeruk", "Pepaya"] },
  { no: 2, name: "Kec. Gresik Kota", items: ["Beras", "Kentang", "Bihun", "Daging Sapi", "Daging Ayam", "Ikan Bandeng", "Ikan Tongkol", "Ikan Kembung", "Kupang", "Telur Ayam", "Telur Puyuh", "Susu UHT", "Tempe", "Tahu", "Wortel", "Buncis", "Kembang Kol", "Bayam", "Jagung", "Pisang", "Semangka", "Jeruk", "Pepaya"] },
  { no: 3, name: "Kec. Manyar", items: ["Beras", "Ubi Jalar", "Jagung", "Ikan Bandeng", "Udang", "Ikan Kakap", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Kacang Hijau", "Daun Kelor", "Kangkung", "Wortel", "Labu Siam", "Terong", "Semangka", "Pisang", "Melon", "Jeruk"] },
  { no: 4, name: "Kec. Driyorejo", items: ["Beras", "Jagung", "Kentang", "Daging Ayam", "Daging Sapi", "Telur Ayam", "Telur Bebek", "Susu Sapi", "Tempe", "Tahu", "Kacang Merah", "Bayam", "Wortel", "Buncis", "Brokoli", "Labu Siam", "Pepaya", "Pisang", "Semangka", "Jeruk"] },
  { no: 5, name: "Kec. Menganti", items: ["Beras", "Ubi Jalar", "Jagung", "Ikan Nila", "Ikan Lele", "Ikan Patin", "Ikan Gurami", "Daging Ayam", "Telur Ayam", "Telur Bebek", "Susu Sapi", "Tempe", "Tahu", "Kacang Hijau", "Bayam", "Kangkung", "Sawi Hijau", "Kembang Kol", "Wortel", "Melon", "Pisang", "Semangka", "Jeruk"] },
  { no: 6, name: "Kec. Cerme", items: ["Beras", "Jagung", "Kentang", "Ikan Bandeng", "Ikan Nila", "Udang", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Daun Kelor", "Kangkung", "Terong", "Wortel", "Buncis", "Semangka", "Pepaya", "Pisang", "Jeruk"] },
  { no: 7, name: "Kec. Sidayu", items: ["Beras", "Jagung", "Kupang", "Ikan Bandeng", "Daging Ayam", "Telur Ayam", "Susu UHT", "Tempe", "Tahu", "Kacang Hijau", "Daun Kelor", "Kangkung", "Wortel", "Labu Siam", "Kacang Panjang", "Semangka", "Jeruk", "Pisang"] },
  { no: 8, name: "Kec. Ujungpangkah", items: ["Beras", "Jagung", "Ikan Bandeng", "Udang", "Ikan Kakap", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Daun Kelor", "Kangkung", "Wortel", "Buncis", "Mangga", "Jeruk", "Semangka", "Pisang"] },
  { no: 9, name: "Kec. Sangkapura (Bawean)", items: ["Beras", "Singkong", "Ubi Jalar", "Ikan Tongkol", "Ikan Cakalang", "Ikan Kerapu", "Ikan Teri", "Daging Sapi", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Daun Kelor", "Bayam", "Wortel", "Labu Kuning", "Pisang", "Pepaya", "Semangka"] },
  { no: 10, name: "Kec. Tambak (Bawean)", items: ["Beras", "Jagung", "Ikan Tongkol", "Ikan Kembung", "Ikan Kakap", "Cumi-cumi", "Daging Sapi", "Telur Ayam", "Susu UHT", "Tempe", "Tahu", "Daun Kelor", "Terong", "Bayam", "Wortel", "Labu Siam", "Pepaya", "Pisang", "Semangka", "Jeruk"] },
  { no: 11, name: "Kec. Balongpanggang", items: ["Beras", "Beras Merah", "Jagung", "Kacang Hijau", "Ubi Jalar", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Daun Kelor", "Bayam", "Labu Siam", "Wortel", "Buncis", "Tempe", "Tahu", "Pisang", "Pepaya", "Semangka", "Jeruk"] },
  { no: 12, name: "Kec. Benjeng", items: ["Beras", "Jagung", "Kentang", "Daging Ayam", "Daging Sapi", "Telur Ayam", "Susu UHT", "Tempe", "Tahu", "Kacang Kedelai", "Kacang Merah", "Bayam", "Kangkung", "Brokoli", "Wortel", "Labu Kuning", "Pepaya", "Pisang", "Semangka", "Jeruk"] },
  { no: 13, name: "Kec. Bungah", items: ["Beras", "Jagung", "Ikan Bandeng", "Udang", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Kacang Hijau", "Daun Kelor", "Kangkung", "Wortel", "Terong", "Buncis", "Pisang", "Semangka", "Jeruk", "Pepaya"] },
  { no: 14, name: "Kec. Duduksampeyan", items: ["Beras", "Jagung", "Ubi Jalar", "Ikan Bandeng", "Udang", "Telur Bebek", "Telur Asin", "Telur Ayam", "Daging Ayam", "Susu Sapi", "Tempe", "Tahu", "Terong", "Bayam", "Wortel", "Labu Siam", "Kangkung", "Semangka", "Melon", "Pisang", "Jeruk"] },
  { no: 15, name: "Kec. Dukun", items: ["Beras", "Kentang", "Jagung", "Ikan Gurami", "Ikan Nila", "Ikan Patin", "Ikan Lele", "Daging Sapi", "Daging Ayam", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Kangkung", "Sawi Hijau", "Bayam", "Wortel", "Buncis", "Pepaya", "Pisang", "Jeruk"] },
  { no: 16, name: "Kec. Kedamean", items: ["Beras", "Jagung", "Kentang", "Daging Ayam", "Daging Sapi", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Kacang Panjang", "Bayam", "Wortel", "Buncis", "Kembang Kol", "Pisang", "Pepaya", "Semangka", "Jeruk"] },
  { no: 17, name: "Kec. Panceng", items: ["Beras", "Jagung", "Ubi Jalar", "Ikan Kembung", "Ikan Teri", "Ikan Tongkol", "Daging Ayam", "Telur Ayam", "Susu UHT", "Tempe", "Tahu", "Daun Kelor", "Kangkung", "Wortel", "Labu Siam", "Semangka", "Pisang", "Jeruk", "Mangga"] },
  { no: 18, name: "Kec. Wringinanom", items: ["Beras", "Jagung", "Kentang", "Daging Ayam", "Daging Sapi", "Telur Ayam", "Susu Sapi", "Tempe", "Tahu", "Buncis", "Bayam", "Wortel", "Brokoli", "Labu Siam", "Jeruk", "Pisang", "Pepaya", "Semangka"] },
];

const prices = [
  { no: 1, item: "Beras Medium / Premium", category: "Karbohidrat", price: "Rp 14.500 / kg", districts: "18 Kecamatan" },
  { no: 2, item: "Daging Ayam Broiler", category: "Protein Hewani", price: "Rp 36.000 / kg", districts: "18 Kecamatan" },
  { no: 3, item: "Ikan Bandeng Segar", category: "Protein Hewani", price: "Rp 32.000 / kg", districts: "Manyar, Ujungpangkah, Bungah, Sidayu" },
  { no: 4, item: "Telur Ayam Ras", category: "Susu & Telur", price: "Rp 27.500 / kg", districts: "18 Kecamatan" },
  { no: 5, item: "Susu Sapi Segar Murni", category: "Susu & Telur", price: "Rp 14.000 / liter", districts: "18 Kecamatan" },
  { no: 6, item: "Susu UHT MBG", category: "Susu & Telur", price: "Rp 4.500 / kotak", districts: "18 Kecamatan" },
  { no: 7, item: "Tempe Kedelai Segar", category: "Protein Nabati", price: "Rp 5.000 / papan", districts: "18 Kecamatan" },
  { no: 8, item: "Tahu Putih Segar", category: "Protein Nabati", price: "Rp 8.000 / bks", districts: "18 Kecamatan" },
  { no: 9, item: "Daun Kelor Segar", category: "Sayuran", price: "Rp 3.000 / ikat", districts: "Panceng, Bawean, Sidayu" },
  { no: 10, item: "Bayam Hijau Segar", category: "Sayuran", price: "Rp 3.500 / ikat", districts: "18 Kecamatan" },
  { no: 11, item: "Pisang Cavendish / Ambon", category: "Buah-buahan", price: "Rp 18.000 / sisir", districts: "18 Kecamatan" },
  { no: 12, item: "Semangka Merah Segar", category: "Buah-buahan", price: "Rp 18.000 / buah", districts: "18 Kecamatan" },
];

const recipes = [
  { no: 1, name: "Nasi Bandeng Bakar & Sayur Bening Kelor", targetGroup: "TK / SD / SMP", composition: "Nasi, Ikan Bandeng (80g), Tahu, Sayur Kelor, Semangka, Susu Sapi", nutritionTarget: "640 Kkal | 26.5g Protein | 5.2mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 2, name: "Nasi Tongkol Balado & Sayur Asem", targetGroup: "SD / SMP / SMA", composition: "Nasi, Ikan Tongkol (75g), Tempe, Sayur Kangkung, Pisang, Susu UHT", nutritionTarget: "620 Kkal | 25.0g Protein | 4.8mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 3, name: "Nasi Kupang Gurih & Tumis Buncis Tahu", targetGroup: "SD / SMP / SMA", composition: "Nasi, Kupang (70g), Tahu, Buncis, Jeruk, Susu Sapi", nutritionTarget: "590 Kkal | 23.5g Protein | 14.2mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 4, name: "Nasi Ayam Goreng & Sop Bayam Jagung", targetGroup: "TK / SD / SMP", composition: "Nasi, Daging Ayam (80g), Tempe, Sop Bayam, Melon, Susu UHT", nutritionTarget: "650 Kkal | 27.2g Protein | 4.1mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 5, name: "Nasi Telur Dadar & Sayur Labu Siam", targetGroup: "TK / SD", composition: "Nasi, Telur Ayam (60g), Tahu, Labu Siam, Pepaya, Susu Sapi", nutritionTarget: "580 Kkal | 22.0g Protein | 4.5mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 6, name: "Nasi Semur Bandeng & Sup Wortel", targetGroup: "TK / SD / SMP", composition: "Nasi, Ikan Bandeng (85g), Tempe, Sup Wortel, Pisang, Susu UHT", nutritionTarget: "635 Kkal | 26.0g Protein | 4.9mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 7, name: "Nasi Ayam Suwir & Sayur Lodeh Labu Kuning", targetGroup: "SD / SMP / SMA", composition: "Nasi, Daging Ayam (75g), Tempe, Labu Kuning, Semangka, Susu Sapi", nutritionTarget: "615 Kkal | 24.8g Protein | 4.3mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 8, name: "Nasi Ikan Kembung Goreng & Sayur Bening Bayam", targetGroup: "SD / SMP / SMA", composition: "Nasi, Ikan Kembung (80g), Tahu, Bayam, Jeruk, Susu UHT", nutritionTarget: "610 Kkal | 25.5g Protein | 5.0mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 9, name: "Nasi Daging Sapi Cincang & Sup Sayuran", targetGroup: "SMP / SMA", composition: "Nasi, Daging Sapi (65g), Tahu, Brokoli, Pisang, Susu Sapi", nutritionTarget: "660 Kkal | 28.0g Protein | 6.5mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 10, name: "Nasi Telur Puyuh Kecap & Tumis Kacang Panjang", targetGroup: "TK / SD", composition: "Nasi, Telur Puyuh (5 btr), Tempe, Kacang Panjang, Melon, Susu UHT", nutritionTarget: "595 Kkal | 23.0g Protein | 4.7mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 11, name: "Nasi Ikan Nila Bakar & Tumis Kangkung", targetGroup: "SD / SMP / SMA", composition: "Nasi, Ikan Nila (80g), Tahu, Kangkung, Pepaya, Susu Sapi", nutritionTarget: "605 Kkal | 24.5g Protein | 4.6mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 12, name: "Nasi Ayam Panggang & Sayur Sop Wortel", targetGroup: "TK / SD / SMP", composition: "Nasi, Daging Ayam (80g), Tempe, Sop Wortel, Pisang, Susu UHT", nutritionTarget: "645 Kkal | 26.8g Protein | 4.2mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 13, name: "Nasi Ikan Kerapu Kukus & Sayur Kelor", targetGroup: "SD / SMP / SMA", composition: "Nasi, Ikan Kerapu (85g), Tahu, Daun Kelor, Semangka, Susu Sapi", nutritionTarget: "625 Kkal | 27.0g Protein | 5.5mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 14, name: "Nasi Udang Asam Manis & Tumis Buncis", targetGroup: "SD / SMP / SMA", composition: "Nasi, Udang (70g), Tempe, Buncis, Jeruk, Susu UHT", nutritionTarget: "600 Kkal | 24.0g Protein | 4.4mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 15, name: "Nasi Telur Balado & Sayur Bening Gambas", targetGroup: "SD / SMP", composition: "Nasi, Telur Ayam (60g), Tahu, Oyong, Pisang, Susu Sapi", nutritionTarget: "585 Kkal | 22.5g Protein | 4.3mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 16, name: "Nasi Cumi Tumis & Sayur Sawi Hijau", targetGroup: "SMP / SMA", composition: "Nasi, Cumi-cumi (75g), Tempe, Sawi Hijau, Melon, Susu UHT", nutritionTarget: "615 Kkal | 25.2g Protein | 4.8mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 17, name: "Nasi Ikan Lele Goreng & Sayur Sop Bayam", targetGroup: "SD / SMP / SMA", composition: "Nasi, Ikan Lele (80g), Tahu, Sop Bayam, Pepaya, Susu Sapi", nutritionTarget: "595 Kkal | 23.8g Protein | 4.6mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 18, name: "Nasi Ayam Opor & Sayur Buncis Jagung", targetGroup: "TK / SD / SMP", composition: "Nasi, Daging Ayam (80g), Tempe, Buncis Jagung, Pisang, Susu UHT", nutritionTarget: "630 Kkal | 26.0g Protein | 4.4mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 19, name: "Nasi Telur Asin & Sayur Rawon Labu", targetGroup: "SMP / SMA", composition: "Nasi, Telur Asin (1 btr), Daging Sapi (40g), Tahu, Tauge, Jeruk, Susu Sapi", nutritionTarget: "655 Kkal | 27.5g Protein | 6.0mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" },
  { no: 20, name: "Nasi Ikan Gurami Bakar & Sayur Kangkung", targetGroup: "SMP / SMA", composition: "Nasi, Ikan Gurami (85g), Tempe, Kangkung, Semangka, Susu UHT", nutritionTarget: "620 Kkal | 25.8g Protein | 4.9mg Fe", source: "Standar Menu BGN RI", link: "https://badangizi.go.id" }
];

const nutrition = [
  { no: 1, code: "AP001", name: "Ikan Bandeng", calories: "129 Kkal", protein: "20.0g", iron: "2.0mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 2, code: "AP032", name: "Kupang", calories: "102 Kkal", protein: "17.8g", iron: "15.6mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 3, code: "AP015", name: "Ikan Tongkol", calories: "130 Kkal", protein: "24.0g", iron: "2.2mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 4, code: "AP004", name: "Daging Ayam", calories: "239 Kkal", protein: "27.0g", iron: "1.5mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 5, code: "AP008", name: "Telur Ayam", calories: "155 Kkal", protein: "12.6g", iron: "2.7mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 6, code: "SS001", name: "Susu Sapi (100ml)", calories: "61 Kkal", protein: "3.2g", iron: "0.2mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 7, code: "BD002", name: "Tempe", calories: "192 Kkal", protein: "19.0g", iron: "2.7mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 8, code: "SD014", name: "Daun Kelor", calories: "92 Kkal", protein: "6.7g", iron: "6.0mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
  { no: 9, code: "KH001", name: "Beras", calories: "130 Kkal", protein: "2.7g", iron: "0.4mg", source: "TKPI Kemenkes RI", link: "https://www.panganku.org" },
];

async function seedDoc(docId, data, title) {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/rag_database/${docId}?key=${apiKey}`;
  const payload = {
    fields: {
      items: {
        stringValue: JSON.stringify(data)
      },
      title: { stringValue: title },
      updatedAt: { stringValue: new Date().toISOString() }
    }
  };

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log(`[${docId}] HTTP ${response.status}: ${response.ok ? 'OK' : 'FAILED'}`);
}

async function seedAll() {
  console.log("=== Menulis 4 Dokumen Terpisah ke Cloud Firestore (ginofest-2026) ===");
  await seedDoc("1_master_komoditas", commodities, "Master Komoditas Pangan Daerah");
  await seedDoc("2_master_harga_pasar", prices, "Master Harga Pasar SISKAPERBAPO");
  await seedDoc("3_master_menu_makanan", recipes, "Master Menu Makanan Standar BGN");
  await seedDoc("4_master_nilai_gizi", nutrition, "Master Nilai Gizi TKPI Kemenkes");
  console.log("=== Selesai 100%! ===");
}

seedAll();
