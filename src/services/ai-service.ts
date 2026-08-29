import { AIOptimizationMode, MealDayPlan } from "@/types";

export class AIService {
  /**
   * Optimizes a meal plan for a specific day based on the chosen goal mode
   */
  static async optimizeMealPlan(
    meal: MealDayPlan,
    mode: AIOptimizationMode
  ): Promise<MealDayPlan> {
    // Simulate smart AI response latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (mode === "iron") {
      return {
        ...meal,
        menuName: `[AI Iron-Boost] ${meal.menuName.replace("Nasi", "Nasi Beras Merah Organik")}`,
        ironMg: Math.round(meal.ironMg * 1.35 * 10) / 10,
        zincMg: Math.round(meal.zincMg * 1.25 * 10) / 10,
        description: `${meal.description} Diformulasikan dengan tambahan Kupang Sidayu segar dan ekstrak daun kelor untuk penyerapan zat besi optimal.`,
        localIngredientPercent: Math.min(100, meal.localIngredientPercent + 5),
      };
    }

    if (mode === "budget") {
      const discount = 1200;
      return {
        ...meal,
        menuName: `[AI Cost-Saving] ${meal.menuName}`,
        estimatedCostPerPortion: Math.max(10500, meal.estimatedCostPerPortion - discount),
        savingPerPortion: meal.savingPerPortion + discount,
        description: `${meal.description} Dioptimalkan menggunakan komoditas harga grosir panen raya dari petambak & petani Gresik.`,
      };
    }

    return meal;
  }

  /**
   * Generates conversational AI nutrition responses
   */
  static async generateNutritionAdvice(userQuery: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const lower = userQuery.toLowerCase();

    if (lower.includes("kupang")) {
      return "Kupang Segar khas Sidayu & Pesisir Gresik memiliki kandungan Zat Besi (Fe) mencapai 15.6 mg per 100 gram—hampir 7 kali lipat lebih tinggi dibanding daging sapi biasa! Zat besi ini krusial mencegah anemia mikrositik dan menstimulasi produksi sel darah merah anak, menjadikannya 'superfood' lokal anti-stunting nomor satu di Gresik.";
    }
    
    if (lower.includes("bandeng")) {
      return "Ikan Bandeng Gresik kaya akan Omega-3 (DHA & EPA) dan asam amino esensial. Untuk anak SD/balita, Pemkab Gresik merekomendasikan teknik 'Bandeng Cabut Duri' atau diolah menjadi bakso/nugget ikan tanpa pengawet agar aman dari duri halus tanpa mengurangi nilai gizinya.";
    }
    
    if (lower.includes("bawean")) {
      return "Untuk Kepulauan Bawean (Kec. Sangkapura & Tambak), strategi optimal adalah memanfaatkan melimpahnya Ikan Tongkol/Cakalang segar dipadukan dengan Sayur Bening Daun Kelor (Moringa) yang tumbuh subur di pekarangan warga, memberikan asupan kalsium 380mg dan protein tinggi dengan biaya sangat terjangkau.";
    }
    
    if (lower.includes("menu hemat") || lower.includes("12.000")) {
      return "Kombinasi Menu Optimal Rp 12.500/porsi: (1) Nasi Putih Pulen Cerme, (2) Bandeng Bakar Madu Manyar 60g, (3) Sayur Bening Bayam Jagung Hidroponik Kebomas, (4) Tempe Goreng Menganti, dan (5) Pisang Ambon Panceng. Total kalori 560 kcal & protein 28.5g (memenuhi standar AKG Kemenkes).";
    }

    return "Berdasarkan database gizi Dinas Kesehatan Kabupaten Gresik dan integrasi Gemini AI, kombinasi protein hewani lokal (Bandeng/Kupang/Udang) dengan sayuran segar daerah mampu menghemat anggaran APBD hingga 14.3% sekaligus mempercepat pencapaian target stunting di bawah 10%.";
  }
}
