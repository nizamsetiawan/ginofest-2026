export interface MealDayPlan {
  day: string;
  dayIndo: string;
  menuName: string;
  description: string;
  mainProtein: string;
  carbSource: string;
  vegetable: string;
  fruit: string;
  extraNutrition: string;
  caloriesKcal: number;
  proteinGrams: number;
  ironMg: number;
  calciumMg: number;
  zincMg: number;
  estimatedCostPerPortion: number;
  apbdStandardCost: number;
  savingPerPortion: number;
  localIngredientPercent: number;
  districtFocus: string;
  suitableAgeRange: string;
}

export const WEEKLY_MBG_MENUS: MealDayPlan[] = [
  {
    day: "Senin",
    dayIndo: "Senin Ceria Penuh Protein",
    menuName: "Nasi Bandeng Bakar Madu Asap Gresik + Sayur Bening Bayam Jagung",
    description: "Bandeng cabut duri Manyar dibakar bumbu madu gurih, disajikan bersama bayam segar dan tempe goreng kriuk.",
    mainProtein: "Bandeng Cabut Duri Manyar & Tempe Kedelai",
    carbSource: "Nasi Putih Pulen Balongpanggang",
    vegetable: "Sayur Bening Bayam + Jagung Manis",
    fruit: "Pisang Ambon Panceng",
    extraNutrition: "Susu Segar Pasteurisasi",
    caloriesKcal: 560,
    proteinGrams: 28.5,
    ironMg: 5.8,
    calciumMg: 310,
    zincMg: 3.4,
    estimatedCostPerPortion: 12500,
    apbdStandardCost: 15000,
    savingPerPortion: 2500,
    localIngredientPercent: 92,
    districtFocus: "Manyar, Bungah, Ujungpangkah",
    suitableAgeRange: "SD & MI (7 - 12 Tahun)",
  },
  {
    day: "Selasa",
    dayIndo: "Selasa Mineral & Zat Besi Tinggi",
    menuName: "Nasi Kupang Kuah Bening Sidayu + Telur Dadar Gulung Sayur",
    description: "Kupang segar kaya zat besi khas Sidayu dengan aroma daun bawang, telur dadar isi wortel, dan tahu bumbu kuning.",
    mainProtein: "Kupang Segar Sidayu & Telur Ayam Driyorejo",
    carbSource: "Nasi Putih Pulen",
    vegetable: "Tumis Labu Siam & Wortel",
    fruit: "Semangka Merah Segar",
    extraNutrition: "Air Jeruk Manis Alami",
    caloriesKcal: 530,
    proteinGrams: 26.0,
    ironMg: 9.4, // Extremely high iron for stunting prevention
    calciumMg: 280,
    zincMg: 4.8,
    estimatedCostPerPortion: 11800,
    apbdStandardCost: 15000,
    savingPerPortion: 3200,
    localIngredientPercent: 95,
    districtFocus: "Sidayu, Panceng, Benjeng",
    suitableAgeRange: "SD & MI (7 - 12 Tahun)",
  },
  {
    day: "Rabu",
    dayIndo: "Rabu Sehat Omega-3",
    menuName: "Nasi Sup Ikan Kakap/Bandeng Bening + Perkedel Tahu Tempe",
    description: "Sup kuah rempah bening kaya omega-3 dengan wortel, kentang, dan perkedel kedelai khas Menganti.",
    mainProtein: "Fillet Bandeng Gresik & Tahu Kedelai",
    carbSource: "Nasi Putih + Kentang Sup",
    vegetable: "Wortel, Buncis & Daun Seledri",
    fruit: "Pepaya California Manis",
    extraNutrition: "Susu UHT Fortifikasi",
    caloriesKcal: 545,
    proteinGrams: 27.2,
    ironMg: 4.6,
    calciumMg: 295,
    zincMg: 3.1,
    estimatedCostPerPortion: 12900,
    apbdStandardCost: 15000,
    savingPerPortion: 2100,
    localIngredientPercent: 88,
    districtFocus: "Kebomas, Gresik Kota, Cerme",
    suitableAgeRange: "SD & MI (7 - 12 Tahun)",
  },
  {
    day: "Kamis",
    dayIndo: "Kamis Stamina & Imun Anak",
    menuName: "Nasi Udang Tumis Mentega Gurih + Sayur Asem Segar Gresikan",
    description: "Udang vaname tambak Duduksampeyan ditumis saus mentega harum, berpadu kesegaran sayur asem kacang panjang.",
    mainProtein: "Udang Vaname Duduksampeyan & Tempe Bacem",
    carbSource: "Nasi Putih Pulen",
    vegetable: "Sayur Asem (Kacang Panjang, Labu, Jagung)",
    fruit: "Melon Hijau Manis",
    extraNutrition: "Puding Susu Buah Naga",
    caloriesKcal: 580,
    proteinGrams: 30.1,
    ironMg: 5.2,
    calciumMg: 340,
    zincMg: 4.2,
    estimatedCostPerPortion: 13800,
    apbdStandardCost: 15000,
    savingPerPortion: 1200,
    localIngredientPercent: 90,
    districtFocus: "Duduksampeyan, Dukun, Wringinanom",
    suitableAgeRange: "SD & MI (7 - 12 Tahun)",
  },
  {
    day: "Jumat",
    dayIndo: "Jumat Berkah Tumbuh Kuat",
    menuName: "Nasi Ayam Suwir Bumbu Kuning Lengkuas + Orak-Arik Telur Buncis",
    description: "Ayam ungkep bumbu rempah tradisional Kedamean dengan orak-arik telur bergizi tinggi dan tahu crispy.",
    mainProtein: "Daging Ayam Segar & Telur Kedamean",
    carbSource: "Nasi Putih Pulen",
    vegetable: "Orak-Arik Buncis & Wortel",
    fruit: "Jeruk Manis Gresik",
    extraNutrition: "Susu Kedelai Murni",
    caloriesKcal: 550,
    proteinGrams: 28.0,
    ironMg: 4.9,
    calciumMg: 270,
    zincMg: 3.6,
    estimatedCostPerPortion: 12600,
    apbdStandardCost: 15000,
    savingPerPortion: 2400,
    localIngredientPercent: 85,
    districtFocus: "Kedamean, Driyorejo, Balongpanggang",
    suitableAgeRange: "SD & MI (7 - 12 Tahun)",
  },
  {
    day: "Sabtu",
    dayIndo: "Sabtu Bahari Bawean",
    menuName: "Nasi Ikan Tongkol Suwir Balado Manis + Sayur Daun Kelor Bening",
    description: "Inspirasi pesisir Pulau Bawean, tongkol segar kaya protein dipadukan daun kelor superfood penangkal stunting.",
    mainProtein: "Ikan Tongkol Segar Bawean & Tahu Kukus",
    carbSource: "Nasi Putih Pulen",
    vegetable: "Sayur Bening Daun Kelor & Labu Kuning",
    fruit: "Pisang Mas Bawean",
    extraNutrition: "Air Kelapa Muda Alami",
    caloriesKcal: 565,
    proteinGrams: 31.0,
    ironMg: 7.1,
    calciumMg: 380, // Super high calcium from Moringa (Kelor)
    zincMg: 3.9,
    estimatedCostPerPortion: 12200,
    apbdStandardCost: 15000,
    savingPerPortion: 2800,
    localIngredientPercent: 96,
    districtFocus: "Sangkapura (Bawean), Tambak (Bawean)",
    suitableAgeRange: "SD & MI (7 - 12 Tahun)",
  },
];
