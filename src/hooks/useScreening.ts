import { useState } from "react";
import { ChildScreeningInput, ScreeningAnalysisResult } from "@/types";
import { ScreeningService } from "@/services/screening-service";

export function useScreening() {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  const [formData, setFormData] = useState<ChildScreeningInput>({
    childName: "Ahmad Fauzi",
    districtId: "manyar",
    ageMonths: 36,
    heightCm: 88.5,
    weightKg: 11.2,
    hasPhoto: true,
  });
  const [result, setResult] = useState<ScreeningAnalysisResult | null>(null);

  const startAnalysis = () => {
    setStep("analyzing");
    setTimeout(() => {
      const computedResult = ScreeningService.analyzeChild(formData);
      setResult(computedResult);
      setStep("result");
    }, 1200);
  };

  const resetScreening = () => {
    setStep("input");
    setResult(null);
  };

  return {
    step,
    formData,
    setFormData,
    result,
    startAnalysis,
    resetScreening,
  };
}
