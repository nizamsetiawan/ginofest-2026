export type RiskLevel = "Tinggi" | "Sedang" | "Rendah";

export interface DistrictData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  stuntingRate: number; // in percentage
  targetChildren: number;
  coverageMBG: number; // in percentage
  localCommodity: string;
  deficiencyFocus: string;
  schoolsCount: number;
  posyanduCount: number;
  monthlyBudget: number; // IDR
}

export interface GresikTotalStats {
  totalDistricts: number;
  totalChildrenTarget: number;
  totalChildrenServed: number;
  overallCoverage: number;
  averageStuntingRate: number;
  stuntingTargetYearEnd: number;
  nationalStuntingBenchmark: number;
  localCommodityUtilization: number;
  monthlyAPBDAllocation: number;
  costPerMealAPBD: number;
  actualCostOptimizedAI: number;
  monthlySavings: number;
}
