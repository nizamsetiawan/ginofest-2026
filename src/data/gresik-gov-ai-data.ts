/**
 * Dataset Resmi Flow AI Pemerintah - Program Makan Bergizi Gratis (MBG) Kabupaten Gresik
 * Sumber:
 * - Komoditas: Dinas Perikanan & Ketahanan Pangan Kab. Gresik (Kampung Bandeng)
 * - Harga Pasar: SISKAPERBAPO Pemprov Jatim (Pasar Baru Gresik & Pasar Sidomoro)
 * - Nilai Gizi: TKPI Kemenkes RI (panganku.org) & Permenkes No. 28/2019
 */

export interface WeeklyMenuItem {
  day: string;
  dayName: string;
  menuTitle: string;
  theme: string;
  localIngredient: string;
  sourceDistrict: string;
  components: {
    name: string;
    category: "Karbohidrat" | "Protein Hewani" | "Protein Nabati" | "Sayuran" | "Buah" | "Pelengkap";
    portionGram: number;
    pricePerPortion: number;
    calories: number;
    proteinGram: number;
    fatGram: number;
    ironMg: number;
    calciumMg: number;
  }[];
  totalPricePerPortion: number;
  totalCalories: number;
  totalProtein: number;
  totalIron: number;
  akgPercentage: number;
  efficiencySavings: number;
}

export const OFFICIAL_WEEKLY_MEAL_PLAN: WeeklyMenuItem[] = [
  {
    day: "Senin",
    dayName: "Senin Ceria",
    menuTitle: "Nasi Bandeng Bakar Bumbu Kuning & Sayur Bening Kelor",
    theme: "Kaya Omega-3 & Antioksidan",
    localIngredient: "Ikan Bandeng Kampung Bandeng Ujungpangkah & Kelor Balongpanggang",
    sourceDistrict: "Kec. Ujungpangkah & Kec. Balongpanggang",
    components: [
      { name: "Nasi Putih Pulen", category: "Karbohidrat", portionGram: 100, pricePerPortion: 1380, calories: 130, proteinGram: 2.7, fatGram: 0.3, ironMg: 0.4, calciumMg: 10 },
      { name: "Bandeng Bakar Bumbu Kuning", category: "Protein Hewani", portionGram: 85, pricePerPortion: 4200, calories: 165, proteinGram: 18.2, fatGram: 6.8, ironMg: 1.8, calciumMg: 85 },
      { name: "Tempe Mendoan Gurih", category: "Protein Nabati", portionGram: 50, pricePerPortion: 1100, calories: 110, proteinGram: 8.5, fatGram: 5.2, ironMg: 1.2, calciumMg: 45 },
      { name: "Sayur Bening Kelor & Jagung Manis", category: "Sayuran", portionGram: 80, pricePerPortion: 1300, calories: 75, proteinGram: 4.8, fatGram: 0.8, ironMg: 2.4, calciumMg: 180 },
      { name: "Pisang Ambon Segar", category: "Buah", portionGram: 100, pricePerPortion: 1800, calories: 92, proteinGram: 1.2, fatGram: 0.2, ironMg: 0.3, calciumMg: 8 },
      { name: "Minyak & Bumbu Dapur Higienis", category: "Pelengkap", portionGram: 15, pricePerPortion: 1220, calories: 95, proteinGram: 0.2, fatGram: 10.2, ironMg: 0.1, calciumMg: 2 },
    ],
    totalPricePerPortion: 11000,
    totalCalories: 667,
    totalProtein: 35.6,
    totalIron: 6.2,
    akgPercentage: 98,
    efficiencySavings: 4000, // Plafon 15.000 - 11.000 = 4.000
  },
  {
    day: "Selasa",
    dayName: "Selasa Nutrisi",
    menuTitle: "Nasi Ayam Suwir Sambal Tomat Manis & Oseng Tahu Buncis",
    theme: "Tinggi Protein Pertumbuhan",
    localIngredient: "Ayam Broiler Kedamean & Sayuran Cerme",
    sourceDistrict: "Kec. Kedamean & Kec. Cerme",
    components: [
      { name: "Nasi Putih Pulen", category: "Karbohidrat", portionGram: 100, pricePerPortion: 1380, calories: 130, proteinGram: 2.7, fatGram: 0.3, ironMg: 0.4, calciumMg: 10 },
      { name: "Ayam Suwir Ungkep Bumbu Tomat", category: "Protein Hewani", portionGram: 80, pricePerPortion: 4100, calories: 185, proteinGram: 19.5, fatGram: 7.2, ironMg: 1.5, calciumMg: 15 },
      { name: "Tahu Putih Goreng Tepung", category: "Protein Nabati", portionGram: 50, pricePerPortion: 1000, calories: 95, proteinGram: 6.8, fatGram: 4.5, ironMg: 1.8, calciumMg: 120 },
      { name: "Tumis Buncis & Wortel Manis", category: "Sayuran", portionGram: 75, pricePerPortion: 1400, calories: 65, proteinGram: 2.4, fatGram: 1.5, ironMg: 1.1, calciumMg: 45 },
      { name: "Jeruk Manis Lokal", category: "Buah", portionGram: 90, pricePerPortion: 1600, calories: 45, proteinGram: 0.9, fatGram: 0.1, ironMg: 0.4, calciumMg: 35 },
      { name: "Bumbu Rempah & Minyak Dapur", category: "Pelengkap", portionGram: 15, pricePerPortion: 1220, calories: 90, proteinGram: 0.2, fatGram: 9.8, ironMg: 0.1, calciumMg: 2 },
    ],
    totalPricePerPortion: 10700,
    totalCalories: 610,
    totalProtein: 32.5,
    totalIron: 5.3,
    akgPercentage: 94,
    efficiencySavings: 4300,
  },
  {
    day: "Rabu",
    dayName: "Rabu Pangan Laut",
    menuTitle: "Nasi Ikan Tongkol Balado Gurih & Sup Sayur Labu Siam",
    theme: "DHA Tinggi & Kecerdasan Otak",
    localIngredient: "Ikan Tongkol Segar Pulau Bawean & Labu Siam Benjeng",
    sourceDistrict: "Kec. Sangkapura Bawean & Kec. Benjeng",
    components: [
      { name: "Nasi Putih Pulen", category: "Karbohidrat", portionGram: 100, pricePerPortion: 1380, calories: 130, proteinGram: 2.7, fatGram: 0.3, ironMg: 0.4, calciumMg: 10 },
      { name: "Fillet Tongkol Masak Balado Manis", category: "Protein Hewani", portionGram: 80, pricePerPortion: 4400, calories: 178, proteinGram: 21.0, fatGram: 5.5, ironMg: 2.1, calciumMg: 28 },
      { name: "Bakwan Sayur & Tahu", category: "Protein Nabati", portionGram: 50, pricePerPortion: 1200, calories: 120, proteinGram: 5.2, fatGram: 6.0, ironMg: 1.1, calciumMg: 35 },
      { name: "Sup Labu Siam & Jagung Pipil", category: "Sayuran", portionGram: 80, pricePerPortion: 1300, calories: 60, proteinGram: 2.1, fatGram: 0.5, ironMg: 0.9, calciumMg: 40 },
      { name: "Semangka Merah Segar", category: "Buah", portionGram: 100, pricePerPortion: 1400, calories: 35, proteinGram: 0.6, fatGram: 0.2, ironMg: 0.3, calciumMg: 12 },
      { name: "Pelengkap Bumbu & Minyak", category: "Pelengkap", portionGram: 15, pricePerPortion: 1220, calories: 95, proteinGram: 0.2, fatGram: 10.0, ironMg: 0.1, calciumMg: 2 },
    ],
    totalPricePerPortion: 10900,
    totalCalories: 618,
    totalProtein: 31.8,
    totalIron: 4.9,
    akgPercentage: 96,
    efficiencySavings: 4100,
  },
  {
    day: "Kamis",
    dayName: "Kamis Sehat",
    menuTitle: "Nasi Tumis Kupang Sidayu Gurih, Telur Rebus & Sayur Bayam",
    theme: "Sangat Tinggi Zat Besi (Anti-Anemia & Stunting)",
    localIngredient: "Kupang Putih Pesisir Sidayu & Bayam Hijau Cerme",
    sourceDistrict: "Kec. Sidayu & Kec. Cerme",
    components: [
      { name: "Nasi Putih Pulen", category: "Karbohidrat", portionGram: 100, pricePerPortion: 1380, calories: 130, proteinGram: 2.7, fatGram: 0.3, ironMg: 0.4, calciumMg: 10 },
      { name: "Tumis Kupang Bumbu Bawang", category: "Protein Hewani", portionGram: 60, pricePerPortion: 3500, calories: 115, proteinGram: 16.5, fatGram: 2.4, ironMg: 8.5, calciumMg: 140 },
      { name: "Telur Ayam Rebus 1/2 Butir", category: "Protein Hewani", portionGram: 30, pricePerPortion: 1200, calories: 75, proteinGram: 6.2, fatGram: 4.8, ironMg: 0.9, calciumMg: 25 },
      { name: "Tempe Bacem Legit", category: "Protein Nabati", portionGram: 50, pricePerPortion: 1100, calories: 105, proteinGram: 7.8, fatGram: 3.5, ironMg: 1.3, calciumMg: 40 },
      { name: "Sayur Bening Bayam & Jagung", category: "Sayuran", portionGram: 80, pricePerPortion: 1300, calories: 55, proteinGram: 3.2, fatGram: 0.4, ironMg: 2.8, calciumMg: 110 },
      { name: "Pepaya Matang Manis", category: "Buah", portionGram: 100, pricePerPortion: 1300, calories: 46, proteinGram: 0.8, fatGram: 0.1, ironMg: 0.4, calciumMg: 24 },
    ],
    totalPricePerPortion: 9780,
    totalCalories: 526,
    totalProtein: 37.2,
    totalIron: 14.3, // Sangat tinggi zat besi
    akgPercentage: 100,
    efficiencySavings: 5220,
  },
  {
    day: "Jumat",
    dayName: "Jumat Berkah",
    menuTitle: "Nasi Rawon Daging Sapi Suwir & Tahu Tempe Bacem",
    theme: "Zat Besi Heme & Kalsium Optimal",
    localIngredient: "Daging Sapi Segar Wringinanom & Tahu Driyorejo",
    sourceDistrict: "Kec. Wringinanom & Kec. Driyorejo",
    components: [
      { name: "Nasi Putih Pulen", category: "Karbohidrat", portionGram: 100, pricePerPortion: 1380, calories: 130, proteinGram: 2.7, fatGram: 0.3, ironMg: 0.4, calciumMg: 10 },
      { name: "Daging Sapi Suwir Kuah Rawon", category: "Protein Hewani", portionGram: 60, pricePerPortion: 5200, calories: 190, proteinGram: 18.8, fatGram: 8.5, ironMg: 2.8, calciumMg: 18 },
      { name: "Tempe & Tahu Goreng Bumbu Lengkuas", category: "Protein Nabati", portionGram: 60, pricePerPortion: 1300, calories: 115, proteinGram: 8.2, fatGram: 5.0, ironMg: 1.5, calciumMg: 75 },
      { name: "Kecambah Pendek & Sambal Rebus", category: "Sayuran", portionGram: 50, pricePerPortion: 900, calories: 40, proteinGram: 2.8, fatGram: 0.5, ironMg: 1.2, calciumMg: 35 },
      { name: "Melon Segar Potong", category: "Buah", portionGram: 90, pricePerPortion: 1600, calories: 42, proteinGram: 0.7, fatGram: 0.1, ironMg: 0.3, calciumMg: 14 },
      { name: "Bumbu Keluak & Pelengkap", category: "Pelengkap", portionGram: 20, pricePerPortion: 1220, calories: 85, proteinGram: 0.4, fatGram: 8.5, ironMg: 0.2, calciumMg: 5 },
    ],
    totalPricePerPortion: 11600,
    totalCalories: 602,
    totalProtein: 33.6,
    totalIron: 6.4,
    akgPercentage: 97,
    efficiencySavings: 3400,
  },
];

/**
 * Kalkulasi Pengadaan Logistik Bahan Pokok (Bill of Materials) untuk Dapur SPPG MBG
 */
export function calculateProcurementLogistics(totalStudents: number, daysCount: number = 5) {
  // Rata-rata per siswa per minggu:
  // Beras: 100g x 5 hari = 500g (0.5 kg)
  // Ikan Bandeng / Tongkol / Daging / Kupang: 80g x 5 = 400g (0.4 kg)
  // Telur Ayam: 2 butir / minggu (~0.12 kg)
  // Tempe & Tahu: 250g / minggu (0.25 kg)
  // Sayuran Segar (Kelor, Bayam, Buncis, Jagung): 350g / minggu (0.35 kg)
  // Buah Segar (Pisang, Jeruk, Semangka, Pepaya): 450g / minggu (0.45 kg)
  // Minyak & Bumbu Dapur: 75g / minggu (0.075 kg)

  const totalBerasKg = totalStudents * 0.5;
  const totalIkanDagingKg = totalStudents * 0.4;
  const totalTelurButir = totalStudents * 2;
  const totalTempeTahuKg = totalStudents * 0.25;
  const totalSayuranKg = totalStudents * 0.35;
  const totalBuahKg = totalStudents * 0.45;
  const totalBumbuMinyakKg = totalStudents * 0.075;

  const totalBudgetBahanBaku = totalStudents * 10996 * daysCount; // Rata-rata HPP bahan Rp 10.996
  const totalBudgetOperasional = totalStudents * 3500 * daysCount; // Operasional masak & kemas
  const totalAnggaranPemerintah = totalStudents * 15000 * daysCount; // Plafon Rp 15.000 x 5 hari
  const totalPenghematan = totalAnggaranPemerintah - (totalBudgetBahanBaku + totalBudgetOperasional);

  return {
    totalStudents,
    daysCount,
    logistics: [
      { item: "Beras Medium Pulen", volume: `${(totalBerasKg / 1000).toFixed(2)} Ton (${totalBerasKg.toLocaleString("id-ID")} Kg)`, supplierRecom: "Gapoktan Cerme & Balongpanggang", unitPrice: "Rp 13.800/kg", totalCost: totalBerasKg * 13800 },
      { item: "Ikan Bandeng & Tongkol Segar", volume: `${(totalIkanDagingKg / 1000).toFixed(2)} Ton (${totalIkanDagingKg.toLocaleString("id-ID")} Kg)`, supplierRecom: "Kampung Bandeng Ujungpangkah & Bawean", unitPrice: "Rp 29.500/kg", totalCost: totalIkanDagingKg * 29500 },
      { item: "Telur Ayam Ras Segar", volume: `${totalTelurButir.toLocaleString("id-ID")} Butir (${(totalTelurButir / 16).toFixed(0)} Kg)`, supplierRecom: "Peternak Rakyat Kedamean", unitPrice: "Rp 1.680/butir", totalCost: totalTelurButir * 1680 },
      { item: "Tempe & Tahu Kedelai", volume: `${totalTempeTahuKg.toLocaleString("id-ID")} Kg`, supplierRecom: "Koperasi Pengrajin Tahu Driyorejo & Manyar", unitPrice: "Rp 11.500/kg", totalCost: totalTempeTahuKg * 11500 },
      { item: "Sayur Daun Kelor, Bayam & Jagung", volume: `${totalSayuranKg.toLocaleString("id-ID")} Kg`, supplierRecom: "Petani Sayur Organik Balongpanggang & Benjeng", unitPrice: "Rp 10.500/kg", totalCost: totalSayuranKg * 10500 },
      { item: "Buah Pisang Ambon & Jeruk Manis", volume: `${totalBuahKg.toLocaleString("id-ID")} Kg`, supplierRecom: "Pasar Induk Sidomoro & Pasar Baru Gresik", unitPrice: "Rp 17.500/kg", totalCost: totalBuahKg * 17500 },
      { item: "Minyak Goreng & Bumbu Rempah", volume: `${totalBumbuMinyakKg.toLocaleString("id-ID")} Kg`, supplierRecom: "Distributor Pangan Diskoperindag Gresik", unitPrice: "Rp 24.000/kg", totalCost: totalBumbuMinyakKg * 24000 },
    ],
    budgetSummary: {
      plafonBGN: totalAnggaranPemerintah,
      biayaBahanBaku: totalBudgetBahanBaku,
      biayaOperasionalDapur: totalBudgetOperasional,
      totalRealisasi: totalBudgetBahanBaku + totalBudgetOperasional,
      penghematanEfisiensi: totalPenghematan,
      biayaRataRataPerPorsi: Math.round((totalBudgetBahanBaku + totalBudgetOperasional) / (totalStudents * daysCount)),
    }
  };
}
