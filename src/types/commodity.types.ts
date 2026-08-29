export type CommodityCategory = 
  | "Protein Hewani" 
  | "Protein Nabati" 
  | "Karbohidrat" 
  | "Sayuran & Buah" 
  | "Pelengkap";

export type StockStatus = "Melimpah" | "Stabil" | "Terbatas";

export interface CommodityItem {
  id: string;
  name: string;
  category: CommodityCategory;
  unit: string;
  currentPrice: number; // IDR per kg/unit
  priceChange: number; // % change vs last period
  stockStatus: StockStatus;
  localOrigin: string; // District or sentra in Gresik
  keyNutrition: string;
  proteinPer100g: number; // grams
  caloriesPer100g: number; // kcal
  ironMgPer100g: number; // mg
  calciumMgPer100g: number; // mg
}
