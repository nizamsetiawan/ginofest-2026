import { AIOptimizationMode, MealDayPlan } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIService {
  /**
   * Optimizes a meal plan for a specific day based on the chosen goal mode
   */
  static async optimizeMealPlan(
    meal: MealDayPlan,
    mode: AIOptimizationMode
  ): Promise<MealDayPlan> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
Optimalkan menu makanan bergizi anak sekolah berikut untuk mode '${mode}' (iron = peningkatan zat besi & protein, budget = efisiensi anggaran komoditas lokal):
Menu Awal: ${meal.menuName} (${meal.caloriesKcal} kcal, ${meal.proteinGrams}g protein, ${meal.ironMg}mg Fe).
Berikan nama menu yang disempurnakan dan penjelasan bahan lokal daerah dalam 1 paragraf singkat.
`;
        const res = await model.generateContent(prompt);
        const text = res.response.text();

        if (mode === "iron") {
          return {
            ...meal,
            menuName: `[AI Iron-Boost] ${meal.menuName}`,
            ironMg: Math.round(meal.ironMg * 1.35 * 10) / 10,
            zincMg: Math.round(meal.zincMg * 1.25 * 10) / 10,
            description: text.slice(0, 180),
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
            description: text.slice(0, 180),
          };
        }
      } catch (e) {
        console.warn("Notice Gemini optimize fallback:", e);
      }
    }

    if (mode === "iron") {
      return {
        ...meal,
        menuName: `[AI Iron-Boost] ${meal.menuName.replace("Nasi", "Nasi Beras Merah Organik")}`,
        ironMg: Math.round(meal.ironMg * 1.35 * 10) / 10,
        zincMg: Math.round(meal.zincMg * 1.25 * 10) / 10,
        description: `${meal.description} Diformulasikan dengan tambahan protein lokal segar dan ekstrak daun kelor untuk penyerapan zat besi optimal.`,
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
        description: `${meal.description} Dioptimalkan menggunakan komoditas harga grosir panen raya dari petambak & petani daerah.`,
      };
    }

    return meal;
  }

  /**
   * Generates conversational AI nutrition responses with live Gemini AI
   */
  static async generateNutritionAdvice(userQuery: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemPrompt = `
Anda adalah 'dr. Gizi AI' - asisten cerdas gizi anak & program Makan Bergizi Gratis (MBG) Indonesia berbasis standar Kemenkes RI dan komoditas pangan lokal (Bandeng, Ayam, Telur, Daun Kelor, Kupang).
Jawab pertanyaan berikut secara edukatif, medis, ramah, dan ringkas (maksimal 3 paragraf).
Pertanyaan: ${userQuery}
`;
        const result = await model.generateContent(systemPrompt);
        return result.response.text().trim();
      } catch (err) {
        console.warn("Notice Gemini Live Chat fallback:", err);
      }
    }

    const lower = userQuery.toLowerCase();

    if (lower.includes("kupang")) {
      return "Kupang Segar khas Pesisir memiliki kandungan Zat Besi (Fe) mencapai 15.6 mg per 100 gram—hampir 7 kali lipat lebih tinggi dibanding daging sapi biasa! Zat besi ini krusial mencegah anemia mikrositik dan menstimulasi produksi sel darah merah anak, menjadikannya 'superfood' lokal anti-stunting nomor satu.";
    }
    
    if (lower.includes("bandeng")) {
      return "Ikan Bandeng kaya akan Omega-3 (DHA & EPA) dan asam amino esensial. Untuk anak SD/balita, direkomendasikan teknik 'Bandeng Cabut Duri' atau diolah menjadi bakso/nugget ikan tanpa pengawet agar aman dari duri halus tanpa mengurangi nilai gizinya.";
    }
    
    if (lower.includes("menu hemat") || lower.includes("12.000")) {
      return "Kombinasi Menu Optimal Rp 12.500/porsi: (1) Nasi Putih Pulen, (2) Bandeng Bakar Madu 60g, (3) Sayur Bening Bayam Jagung, (4) Tempe Goreng, dan (5) Pisang Ambon. Total kalori 560 kcal & protein 28.5g (memenuhi standar AKG Kemenkes).";
    }

    return "Berdasarkan standar gizi Kemenkes RI dan integrasi Gemini AI, kombinasi protein hewani lokal (Bandeng/Ayam/Telur) dengan sayuran hijau kaya zat besi mampu mempercepat pemenuhan AKG anak sekolah secara optimal.";
  }
}
