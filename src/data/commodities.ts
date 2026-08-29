export interface CommodityItem {
  id: string;
  name: string;
  category: "Protein Hewani" | "Protein Nabati" | "Karbohidrat" | "Sayuran & Buah" | "Pelengkap";
  unit: string;
  currentPrice: number; // IDR per kg/satuan
  priceChange: number; // % change vs last week
  stockStatus: "Melimpah" | "Stabil" | "Terbatas";
  localOrigin: string; // Asal sentra di Gresik
  keyNutrition: string;
  proteinPer100g: number; // grams
  caloriesPer100g: number; // kcal
  ironMgPer100g: number; // mg
  calciumMgPer100g: number; // mg
}

export const GRESIK_COMMODITIES: CommodityItem[] = [
  {
    id: "bandeng",
    name: "Ikan Bandeng Segar Gresik",
    category: "Protein Hewani",
    unit: "kg",
    currentPrice: 32000,
    priceChange: -2.5,
    stockStatus: "Melimpah",
    localOrigin: "Tambak Manyar, Ujungpangkah & Bungah",
    keyNutrition: "Tinggi Omega-3, Protein, & Asam Amino Esensial",
    proteinPer100g: 20.0,
    caloriesPer100g: 148,
    ironMgPer100g: 2.1,
    calciumMgPer100g: 45,
  },
  {
    id: "kupang",
    name: "Kupang Segar Gresik",
    category: "Protein Hewani",
    unit: "kg",
    currentPrice: 18000,
    priceChange: 0.0,
    stockStatus: "Stabil",
    localOrigin: "Pesisir Sidayu & Pesisir Gresik Kota",
    keyNutrition: "Sangat Tinggi Zat Besi (Fe) & Zinc untuk Cegah Stunting",
    proteinPer100g: 17.5,
    caloriesPer100g: 102,
    ironMgPer100g: 15.6, // Super rich in iron!
    calciumMgPer100g: 130,
  },
  {
    id: "udang",
    name: "Udang Vaname / Windu Lokal",
    category: "Protein Hewani",
    unit: "kg",
    currentPrice: 58000,
    priceChange: -1.2,
    stockStatus: "Melimpah",
    localOrigin: "Tambak Duduksampeyan & Panceng",
    keyNutrition: "Kalsium, Zinc, dan Selenium Alami",
    proteinPer100g: 24.0,
    caloriesPer100g: 106,
    ironMgPer100g: 3.0,
    calciumMgPer100g: 70,
  },
  {
    id: "telur-ayam",
    name: "Telur Ayam Ras Segar",
    category: "Protein Hewani",
    unit: "kg",
    currentPrice: 27500,
    priceChange: 1.8,
    stockStatus: "Stabil",
    localOrigin: "Peternak Driyorejo & Kedamean",
    keyNutrition: "Kolin, Vitamin B12, & Protein Lengkap",
    proteinPer100g: 12.6,
    caloriesPer100g: 155,
    ironMgPer100g: 1.8,
    calciumMgPer100g: 56,
  },
  {
    id: "tempe-kedelai",
    name: "Tempe Kedelai Tradisional",
    category: "Protein Nabati",
    unit: "papan (500g)",
    currentPrice: 7000,
    priceChange: 0.0,
    stockStatus: "Stabil",
    localOrigin: "Sentra UKM Menganti & Benjeng",
    keyNutrition: "Isoflavon, Probiotik, & Serat Pangan",
    proteinPer100g: 19.0,
    caloriesPer100g: 192,
    ironMgPer100g: 2.7,
    calciumMgPer100g: 111,
  },
  {
    id: "beras-lokal",
    name: "Beras Putih Premium Gresik",
    category: "Karbohidrat",
    unit: "kg",
    currentPrice: 13500,
    priceChange: -0.8,
    stockStatus: "Melimpah",
    localOrigin: "Lumbung Padi Balongpanggang & Cerme",
    keyNutrition: "Sumber Energi Utama & Karbohidrat Kompleks",
    proteinPer100g: 7.1,
    caloriesPer100g: 360,
    ironMgPer100g: 0.8,
    calciumMgPer100g: 10,
  },
  {
    id: "bayam-hidroponik",
    name: "Bayam Hijau Segar",
    category: "Sayuran & Buah",
    unit: "ikat (300g)",
    currentPrice: 3500,
    priceChange: 0.0,
    stockStatus: "Melimpah",
    localOrigin: "Kebun Hidroponik Kebomas & Wringinanom",
    keyNutrition: "Asam Folat, Vitamin K, Lutein & Zat Besi",
    proteinPer100g: 2.9,
    caloriesPer100g: 23,
    ironMgPer100g: 2.7,
    calciumMgPer100g: 99,
  },
  {
    id: "pisang-ambon",
    name: "Pisang Cavendish / Ambon",
    category: "Sayuran & Buah",
    unit: "sisir",
    currentPrice: 16000,
    priceChange: -3.0,
    stockStatus: "Stabil",
    localOrigin: "Sentra Buah Panceng & Pulau Bawean",
    keyNutrition: "Kalium, Vitamin B6, & Energi Cepat",
    proteinPer100g: 1.1,
    caloriesPer100g: 89,
    ironMgPer100g: 0.3,
    calciumMgPer100g: 5,
  },
];
