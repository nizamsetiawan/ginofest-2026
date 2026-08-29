import crypto from "crypto";

const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

const STRUCTURED_MBG_MENUS = [
  {
    no: 1,
    name: "Nasi Bandeng Bakar & Sayur Bening Kelor",
    targetGroup: "TK / SD / SMP",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Bandeng Bakar (80g) | Protein Nabati: Tahu Bacem (40g) | Sayuran: Sayur Bening Kelor (50g) | Buah: Semangka Segar (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "640 Kkal | 26.5g Protein | 5.2mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 2,
    name: "Nasi Tongkol Balado & Sayur Asem Kangkung",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Tongkol Balado (75g) | Protein Nabati: Tempe Goreng (40g) | Sayuran: Sayur Asem Kangkung (50g) | Buah: Pisang Ambon (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "620 Kkal | 25.0g Protein | 4.8mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 3,
    name: "Nasi Kupang Gurih & Tumis Buncis Tahu",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Kupang Segar Masak Gurih (70g) | Protein Nabati: Tahu Tumis (40g) | Sayuran: Tumis Buncis (50g) | Buah: Jeruk Manis (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "590 Kkal | 23.5g Protein | 14.2mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 4,
    name: "Nasi Ayam Goreng & Sop Bayam Jagung",
    targetGroup: "TK / SD / SMP",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Daging Ayam Broiler Goreng (80g) | Protein Nabati: Tempe Bacem (40g) | Sayuran: Sop Bayam Jagung (50g) | Buah: Melon Segar (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "650 Kkal | 27.2g Protein | 4.1mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 5,
    name: "Nasi Telur Dadar & Sayur Labu Siam",
    targetGroup: "TK / SD",
    composition: "Karbohidrat: Nasi Putih (130g) | Protein Hewani: Telur Ayam Ras Dadar (60g) | Protein Nabati: Tahu Kukus (40g) | Sayuran: Sayur Labu Siam (50g) | Buah: Pepaya California (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "580 Kkal | 22.0g Protein | 4.5mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 6,
    name: "Nasi Semur Bandeng & Sup Wortel Buncis",
    targetGroup: "TK / SD / SMP",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Bandeng Masak Semur (85g) | Protein Nabati: Tempe Mendoan (40g) | Sayuran: Sup Wortel Buncis (50g) | Buah: Pisang Ambon (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "635 Kkal | 26.0g Protein | 4.9mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 7,
    name: "Nasi Ayam Suwir & Sayur Lodeh Labu Kuning",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Daging Ayam Suwir Bumbu Kuning (75g) | Protein Nabati: Tempe Goreng (40g) | Sayuran: Sayur Lodeh Labu Kuning (50g) | Buah: Semangka Segar (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "615 Kkal | 24.8g Protein | 4.3mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 8,
    name: "Nasi Ikan Kembung Goreng & Sayur Bening Bayam",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Kembung Segar Goreng (80g) | Protein Nabati: Tahu Goreng (40g) | Sayuran: Sayur Bening Bayam (50g) | Buah: Jeruk Manis (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "610 Kkal | 25.5g Protein | 5.0mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 9,
    name: "Nasi Daging Sapi Cincang & Sup Brokoli Wortel",
    targetGroup: "SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Daging Sapi Segar Cincang (65g) | Protein Nabati: Tahu Putih (40g) | Sayuran: Sup Brokoli Wortel (50g) | Buah: Pisang Cavendish (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "660 Kkal | 28.0g Protein | 6.5mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 10,
    name: "Nasi Telur Puyuh Kecap & Tumis Kacang Panjang",
    targetGroup: "TK / SD",
    composition: "Karbohidrat: Nasi Putih (130g) | Protein Hewani: Telur Puyuh Rebus Kecap (5 butir / 50g) | Protein Nabati: Tempe Orek (40g) | Sayuran: Tumis Kacang Panjang (50g) | Buah: Melon Segar (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "595 Kkal | 23.0g Protein | 4.7mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 11,
    name: "Nasi Ikan Nila Bakar & Tumis Kangkung",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Nila Bakar (80g) | Protein Nabati: Tahu Bacem (40g) | Sayuran: Tumis Kangkung (50g) | Buah: Pepaya California (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "605 Kkal | 24.5g Protein | 4.6mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 12,
    name: "Nasi Ayam Panggang & Sayur Sop Wortel",
    targetGroup: "TK / SD / SMP",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Daging Ayam Panggang Madu (80g) | Protein Nabati: Tempe Bacem (40g) | Sayuran: Sayur Sop Wortel (50g) | Buah: Pisang Ambon (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "645 Kkal | 26.8g Protein | 4.2mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 13,
    name: "Nasi Ikan Kerapu Kukus & Sayur Bening Kelor",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Kerapu Kukus Jahe (85g) | Protein Nabati: Tahu Kukus (40g) | Sayuran: Sayur Bening Kelor (50g) | Buah: Semangka Segar (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "625 Kkal | 27.0g Protein | 5.5mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 14,
    name: "Nasi Udang Asam Manis & Tumis Buncis",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Udang Vaname Asam Manis (70g) | Protein Nabati: Tempe Goreng (40g) | Sayuran: Tumis Buncis Wortel (50g) | Buah: Jeruk Manis (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "600 Kkal | 24.0g Protein | 4.4mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 15,
    name: "Nasi Telur Balado & Sayur Bening Gambas",
    targetGroup: "SD / SMP",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Telur Ayam Ras Balado (60g) | Protein Nabati: Tahu Bacem (40g) | Sayuran: Sayur Bening Gambas / Oyong (50g) | Buah: Pisang Ambon (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "585 Kkal | 22.5g Protein | 4.3mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 16,
    name: "Nasi Cumi Tumis & Sayur Sawi Hijau",
    targetGroup: "SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Cumi-cumi Tumis Bawang (75g) | Protein Nabati: Tempe Goreng (40g) | Sayuran: Tumis Sawi Hijau (50g) | Buah: Melon Segar (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "615 Kkal | 25.2g Protein | 4.8mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 17,
    name: "Nasi Ikan Lele Goreng & Sayur Sop Bayam",
    targetGroup: "SD / SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Lele Segar Goreng (80g) | Protein Nabati: Tahu Goreng (40g) | Sayuran: Sayur Sop Bayam (50g) | Buah: Pepaya California (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "595 Kkal | 23.8g Protein | 4.6mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 18,
    name: "Nasi Ayam Opor & Sayur Buncis Jagung",
    targetGroup: "TK / SD / SMP",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Daging Ayam Masak Opor (80g) | Protein Nabati: Tempe Bacem (40g) | Sayuran: Tumis Buncis Jagung (50g) | Buah: Pisang Ambon (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "630 Kkal | 26.0g Protein | 4.4mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 19,
    name: "Nasi Rawon Daging Sapi & Telur Asin",
    targetGroup: "SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Daging Sapi Rawon (50g) & Telur Asin Gresik (1/2 butir / 30g) | Protein Nabati: Tempe Goreng (40g) | Sayuran: Tauge Pendek & Labu Siam (50g) | Buah: Jeruk Manis (50g) | Susu: Susu Sapi Segar (150ml)",
    nutritionTarget: "655 Kkal | 27.5g Protein | 6.0mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  },
  {
    no: 20,
    name: "Nasi Ikan Gurami Bakar & Sayur Kangkung",
    targetGroup: "SMP / SMA",
    composition: "Karbohidrat: Nasi Putih (150g) | Protein Hewani: Ikan Gurami Bakar (85g) | Protein Nabati: Tempe Bacem (40g) | Sayuran: Tumis Kangkung (50g) | Buah: Semangka Segar (50g) | Susu: Susu UHT Plain (125ml)",
    nutritionTarget: "620 Kkal | 25.8g Protein | 4.9mg Fe",
    source: "Standar Menu BGN RI",
    link: "https://badangizi.go.id"
  }
];

function toFirestoreFields(obj, uuid) {
  return {
    fields: {
      id: { stringValue: uuid },
      no: { integerValue: obj.no.toString() },
      name: { stringValue: obj.name },
      targetGroup: { stringValue: obj.targetGroup },
      composition: { stringValue: obj.composition },
      nutritionTarget: { stringValue: obj.nutritionTarget },
      source: { stringValue: obj.source || "Standar Menu BGN RI" },
      link: { stringValue: obj.link || "https://badangizi.go.id" },
      createdAt: { stringValue: new Date().toISOString() },
      updatedAt: { stringValue: new Date().toISOString() }
    }
  };
}

async function runUpdate() {
  console.log(`🚀 Memperbarui 20 Master Menu Makanan ke format terstruktur Formula 5 Bintang + Susu di Firestore...`);

  // 1. Fetch current docs in master_menu_makanan
  const listEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/master_menu_makanan?key=${apiKey}`;
  const listRes = await fetch(listEndpoint);
  const listData = await listRes.json();

  if (listData.documents && listData.documents.length > 0) {
    console.log(`🧹 Menghapus ${listData.documents.length} dokumen menu lama...`);
    for (const doc of listData.documents) {
      const docPath = doc.name.split("/documents/")[1];
      await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?key=${apiKey}`, { method: "DELETE" });
    }
  }

  // 2. Upload structured menus
  console.log(`➡️ Mengunggah 20 Menu Berstandar 5 Bintang + Susu (Non-Emoji/Icons)...`);
  for (const menu of STRUCTURED_MBG_MENUS) {
    const uuid = crypto.randomUUID();
    const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/master_menu_makanan/${uuid}?key=${apiKey}`;
    const payload = toFirestoreFields(menu, uuid);
    
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`✓ Menu #${menu.no}: ${menu.name} tersimpan.`);
  }

  console.log(`🎉 SUKSES! Seluruh 20 Menu Makanan di Firestore kini berformat terstruktur Formula 5 Bintang + Susu!`);
}

runUpdate().catch(console.error);
