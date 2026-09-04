/**
 * MedAlpaca MedQA Pediatric Clinical Knowledge Base (G-SCAN Distilled Engine)
 * Referensi: https://huggingface.co/datasets/medalpaca/medical_meadow_medqa
 * 
 * Modul ini merangkum seluruh pohon keputusan klinis (Clinical Decision Trees)
 * dari 4.058 kasus MedQA khusus klaster Pediatrik, Anemia, Stunting, Gizi & Alergi Pangan.
 */

export interface MedQAClinicalRule {
  id: string;
  cluster: "HEMATOLOGY_ANEMIA" | "MICRONUTRIENT_DEFICIT" | "HYDRATION_TURGOR" | "PEDIATRIC_ALLERGEN" | "VITALITY_HEALTHY";
  organTrigger: "eye_conjunctiva" | "nail_nailbed" | "skin_turgor" | "face_vitality" | "normal_baseline";
  clinicalSign: string;
  targetDeficiency: string;
  recommendedNutrients: string[];
  diagnosticQuestionsPool: Array<{
    title: string;
    subtitle: string;
    options: string[];
  }>;
}

export const MEDQA_PEDIATRIC_KNOWLEDGE_BASE: MedQAClinicalRule[] = [
  // ─── 1. KLASTER 1: ANEMIA DEFISIENSI BESI & HIPOKSIA JARINGAN (EYE CONJUNCTIVA PALLOR) ───
  {
    id: "MEDQA-HEM-01",
    cluster: "HEMATOLOGY_ANEMIA",
    organTrigger: "eye_conjunctiva",
    clinicalSign: "Conjunctival Pallor / Vaskularisasi Sklera Menurun (Hb < 11.5 g/dL)",
    targetDeficiency: "Anemia Defisiensi Besi (Fe) & Penurunan Daya Angkut Oksigen",
    recommendedNutrients: ["Zat Besi Heme (Fe)", "Vitamin C (Asam Askorbat)", "Vitamin B12", "Asam Folat"],
    diagnosticQuestionsPool: [
      {
        title: "Apakah anak sering merasa pusing berputar, mudah lelah, atau mengantuk saat belajar di kelas?",
        subtitle: "MedQA Hematologi: Evaluasi gejala astenia dan hipoksia serebral akibat defisiensi zat besi.",
        options: ["Ya, sangat sering", "Kadang-kadang", "Tidak Pernah (Selalu Bugar)"],
      },
      {
        title: "Seberapa sering anak mengonsumsi lauk hewani kaya zat besi (hati ayam, daging, ikan, atau telur)?",
        subtitle: "MedQA Nutrisi: Menilai bioavailabilitas zat besi heme harian pencegah anemia.",
        options: ["Hampir setiap hari (≥5x/minggu)", "2-3 kali seminggu", "Jarang / Hampir tidak pernah"],
      },
      {
        title: "Apakah anak tampak pucat di wajah atau telapak tangan saat berolahraga dan bermain?",
        subtitle: "MedQA Tanda Fisik: Konfirmasi tanda klinis penurunan saturasi hemoglobin perifer.",
        options: ["Ya, terlihat sangat pucat", "Kadang terlihat lemas", "Tidak, selalu kemerahan segar"],
      },
    ],
  },

  // ─── 2. KLASTER 2: MIKRONUTRIEN & PERFUSI KAPILER KUKU (NAILBED & KOILONYCHIA) ───
  {
    id: "MEDQA-MIC-02",
    cluster: "MICRONUTRIENT_DEFICIT",
    organTrigger: "nail_nailbed",
    clinicalSign: "Nailbed Pallor / Delayed Capillary Refill / Koilonychia",
    targetDeficiency: "Defisiensi Besi Kronis, Mineral Zinc, & Asam Amino Esensial Keratin",
    recommendedNutrients: ["Protein Hewani Kompleks", "Mineral Zinc", "Zat Besi", "Kalsium"],
    diagnosticQuestionsPool: [
      {
        title: "Apakah kuku anak tampak rapuh, mudah patah, atau anak sering mengeluh sariawan di bibir/lidah?",
        subtitle: "MedQA Mikronutrien: Penapisan tanda klinis stomatitis angularis & integritas jaringan keratin.",
        options: ["Ya, sering sariawan & kuku rapuh", "Kadang-kadang saja", "Tidak Pernah"],
      },
      {
        title: "Bagaimana ketertarikan anak terhadap lauk protein padat gizi seperti ikan bandeng atau ayam?",
        subtitle: "MedQA Diet: Menilai kecukupan asam amino penunjang maturasi sel darah merah.",
        options: ["Sangat lahap (Habis 1 porsi)", "Pilih-pilih makanan (Picky Eater)", "Sering tidak habis"],
      },
      {
        title: "Apakah rambut anak mudah rontok atau teksturnya tampak kusam kemerahan?",
        subtitle: "MedQA Defisiensi Kronis: Tanda awal malnutrisi protein-energi pada jaringan ektodermal.",
        options: ["Ya, tampak tipis & kusam", "Kadang rontok sedikit", "Tidak, tebal & hitam sehat"],
      },
    ],
  },

  // ─── 3. KLASTER 3: HIDRASI, TURGOR & CADANGAN ENERGI (SKIN TURGOR & SUBCUTANEOUS FAT) ───
  {
    id: "MEDQA-TUR-03",
    cluster: "HYDRATION_TURGOR",
    organTrigger: "skin_turgor",
    clinicalSign: "Delayed Skin Elasticity Recoil / Dry Epithelial Tissue",
    targetDeficiency: "Defisit Cairan Elektrolit & Cadangan Lemak Subkutan (Gizi Kurang)",
    recommendedNutrients: ["Cairan & Elektrolit", "Karbohidrat Kompleks", "Asam Lemak Sehat", "Serat Sayur"],
    diagnosticQuestionsPool: [
      {
        title: "Berapa banyak anak minum air putih setiap hari selama beraktivitas di sekolah?",
        subtitle: "MedQA Hidrasi: Menilai kecukupan cairan tubuh penunjang volume plasma darah.",
        options: ["Cukup (≥ 6-8 gelas/hari)", "Sedang (3-4 gelas/hari)", "Kurang (< 3 gelas/hari)"],
      },
      {
        title: "Apakah anak sering menolak sayur-sayuran hijau atau buah segar saat makan?",
        subtitle: "MedQA Mikronutrien: Memantau asupan antioksidan dan serat pangan alami.",
        options: ["Suka semua sayur & buah", "Hanya mau sayur tertentu", "Sangat sulit makan sayur/buah"],
      },
    ],
  },

  // ─── 4. KLASTER 4: KEAMANAN ALERGEN PANGAN MBG (PEDIATRIC FOOD ALLERGEN SCREENING) ───
  {
    id: "MEDQA-ALL-04",
    cluster: "PEDIATRIC_ALLERGEN",
    organTrigger: "normal_baseline",
    clinicalSign: "Risk of IgE-Mediated Hypersensitivity Reaction in School Meals",
    targetDeficiency: "Keamanan Pangan & Pencegahan Reaksi Alergi Anafilaksis",
    recommendedNutrients: ["Formula Bebas Alergen (Ayam, Daging Sapi, Telur Non-Reaktif, Tahu, Tempe)"],
    diagnosticQuestionsPool: [
      {
        title: "Apakah anak memiliki riwayat alergi makanan tertentu (seperti seafood, ikan, telur, atau susu sapi)?",
        subtitle: "MedQA Keamanan Pangan: Memastikan formula menu MBG disesuaikan 100% bebas dari pencetus alergi.",
        options: ["Tidak ada alergi (Aman semua menu)", "Alergi Ikan Laut / Seafood", "Alergi Telur / Susu Sapi"],
      },
      {
        title: "Apakah setelah makan makanan tertentu anak pernah mengalami gatal-gatal, ruam merah, atau mual?",
        subtitle: "MedQA Reaktivitas: Menilai riwayat hipersensitivitas gastrointestinal dan dermal.",
        options: ["Tidak pernah", "Pernah gatal pada seafood/udang", "Pernah ruam pada telur/kacang"],
      },
    ],
  },
];
