import { NextRequest, NextResponse } from "next/server";
import { ContinuousTrainingService } from "@/services/continuous-training-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/ml/continuous-train
 * Mengambil telemetri model aktif, metrik akurasi, dan riwayat iterasi training.
 */
export async function GET() {
  try {
    const telemetry = await ContinuousTrainingService.getActiveModelTelemetry();
    return NextResponse.json({
      status: "success",
      pipeline: "G-SCAN-Multistage-Clinical-AI",
      activeModel: telemetry
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch model telemetry" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ml/continuous-train
 * Memicu siklus fine-tuning berkelanjutan (Active Learning Iteration).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const iterationName = body.iterationName;

    const result = await ContinuousTrainingService.triggerContinuousFineTuning(iterationName);
    return NextResponse.json({
      status: "success",
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to trigger training cycle" },
      { status: 500 }
    );
  }
}
