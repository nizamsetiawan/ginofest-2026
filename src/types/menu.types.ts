export type AIOptimizationMode = "balanced" | "iron" | "budget";

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
