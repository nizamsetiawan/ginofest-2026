import { NextResponse } from "next/server";
import { generateMenusWithGemini, calculateMenuNutritionWithGemini, estimateTKPIWithGemini } from "@/services/gemini-rag-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "generate_menus";

    if (action === "estimate_tkpi") {
      const foodName: string = body.foodName || "";
      const category: string = body.category || "Pangan Lainnya";
      const state: string = body.state || "Mentah";
      const customApiKey: string | undefined = body.apiKey;
      const result = await estimateTKPIWithGemini(foodName, category, state, customApiKey);
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    if (action === "calculate_nutrition") {
      const menuName: string = body.menuName || "";
      const currentComposition: string = body.composition || "";
      const result = await calculateMenuNutritionWithGemini(menuName, currentComposition);
      return NextResponse.json({
        success: true,
        data: result
      });
    }

    const availableIngredients: string[] = body.ingredients || [];
    const existingMenuNames: string[] = body.existingMenus || [];
    const customApiKey: string | undefined = body.apiKey;

    const result = await generateMenusWithGemini(availableIngredients, existingMenuNames, customApiKey);

    return NextResponse.json({
      success: true,
      menus: result,
      total: result.length
    });
  } catch (error: any) {
    console.error("API error in generate-menus-rag:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

