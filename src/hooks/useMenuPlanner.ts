import { useState } from "react";
import { WEEKLY_MBG_MENUS } from "@/data/default-menus";
import { MealDayPlan, AIOptimizationMode } from "@/types";
import { AIService } from "@/services/ai-service";

export function useMenuPlanner() {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [mealPlans, setMealPlans] = useState<MealDayPlan[]>(WEEKLY_MBG_MENUS);
  const [optimizationMode, setOptimizationMode] = useState<AIOptimizationMode>("balanced");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const currentMeal = mealPlans[activeDayIndex];

  const handleOptimizedByAI = async () => {
    setIsGenerating(true);
    try {
      const optimizedMeal = await AIService.optimizeMealPlan(currentMeal, optimizationMode);
      setMealPlans((prev) => {
        const next = [...prev];
        next[activeDayIndex] = optimizedMeal;
        return next;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    activeDayIndex,
    setActiveDayIndex,
    mealPlans,
    currentMeal,
    optimizationMode,
    setOptimizationMode,
    isGenerating,
    handleOptimizedByAI,
  };
}
