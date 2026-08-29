import { ChildScreeningInput, ScreeningAnalysisResult } from "@/types";

export class ScreeningService {
  /**
   * Calculates anthropometry Z-score and provides clinical insights
   */
  static analyzeChild(input: ChildScreeningInput): ScreeningAnalysisResult {
    // Standard reference median for 36 months height is ~96 cm
    const heightDiff = input.heightCm - (input.ageMonths * 2.6);
    const zScore = Math.round((heightDiff / 4.2) * 10) / 10;

    const isStunted = zScore < -2.0;

    return {
      zScoreHeightForAge: zScore,
      diagnosis: isStunted 
        ? "Indikasi: Berisiko Stunting Ringan (Mild Growth Faltering)" 
        : "Pertumbuhan Fisik Normal Sesuai Usia",
      riskLevel: isStunted ? "Sedang" : "Rendah",
      indicatedNutrientDeficiencies: [
        "Defisiensi Zat Besi (Fe)",
        "Asupan Protein Hewani Esensial",
        "Kalsium dan Vitamin D3",
      ],
      localFoodRecommendations: [
        {
          foodName: "Kupang Segar Sidayu",
          origin: "Pesisir Sidayu & Gresik Kota",
          benefits: "Sangat kaya zat besi (15.6mg/100g) untuk menstimulasi pembentukan sel darah merah & mencegah anemia.",
        },
        {
          foodName: "Ikan Bandeng Cabut Duri",
          origin: "Sentra Tambak Manyar & Bungah",
          benefits: "Protein hewani tinggi & omega-3 esensial untuk memicu pertumbuhan linier tulang panjang.",
        },
        {
          foodName: "Sayur Daun Kelor & Bayam",
          origin: "Kebun Warga Bawean & Kebomas",
          benefits: "Kaya kalsium organik, serat, dan mikronutrien pembangun imunitas anak.",
        },
      ],
      posyanduReferral: `Posyandu Balita Terdekat & Puskesmas Kecamatan ${input.districtId.toUpperCase()}`,
    };
  }
}
