import { RiskLevel } from "./district.types";

export interface ChildScreeningInput {
  childName: string;
  districtId: string;
  ageMonths: number;
  heightCm: number;
  weightKg: number;
  hasPhoto: boolean;
}

export interface ScreeningAnalysisResult {
  zScoreHeightForAge: number;
  diagnosis: string;
  riskLevel: RiskLevel;
  indicatedNutrientDeficiencies: string[];
  localFoodRecommendations: {
    foodName: string;
    origin: string;
    benefits: string;
  }[];
  posyanduReferral: string;
}
