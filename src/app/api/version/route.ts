import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Return current deployment commit SHA or timestamp to detect new Vercel deploys
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_BUILD_ID ||
    "build_" + (process.env.NODE_ENV === "production" ? "prod" : Date.now());

  return NextResponse.json(
    {
      buildId,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}
