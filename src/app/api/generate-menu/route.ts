import { NextResponse } from "next/server";
import { GRESIK_DISTRICTS } from "@/data/gresik-districts";
import { generateMenuWithSinglePrompt } from "@/services/gemini-rag-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("districtId") || "manyar";
  const studentsCount = parseInt(searchParams.get("students") || "12500");
  const customApiKey = searchParams.get("apiKey") || undefined;

  const district = GRESIK_DISTRICTS.find((d) => d.id === districtId) || GRESIK_DISTRICTS[0];

  // 1 Single Master Prompt to Google Gemini AI
  const result = await generateMenuWithSinglePrompt({
    districtName: district.name,
    districtId: district.id,
    studentsCount,
    customApiKey,
  });

  return NextResponse.json({
    success: true,
    engineUsed: result.engineUsed,
    modelName: result.modelName,
    districtName: result.districtName,
    studentsCount: result.studentsCount,
    weeklyPlan: result.weeklyPlan,
    budgetSummary: result.budgetSummary,
    logisticsBOM: result.logisticsBOM,
    availableGeneratedRecipes: result.availableGeneratedRecipes,
    aiReasoning: result.aiReasoning,
  });
}
