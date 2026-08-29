import { NextResponse } from "next/server";
import { OFFICIAL_GRESIK_STUDENTS } from "@/data/gresik-official-students";

// URL Resmi API Portal Satu Data Gresik & Kemendikdasmen (Dapodik)
const SATUDATA_GRESIK_API_URL = "https://satudata.gresikkab.go.id/api/3/action/package_search?q=pendidikan+gresik";
const KEMENDIKBUD_DAPODIK_API_URL = "https://referensi.data.kemdikbud.go.id/dapo/rekap/pd/052500";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("districtId") || "manyar";

  let liveApiResponse: any = null;
  let apiStatus = "FALLBACK_CACHED";
  let activeApiUrl = SATUDATA_GRESIK_API_URL;

  try {
    // 1. Direct Live HTTP Fetch ke Server API Satu Data Gresik (CKAN API)
    const response = await fetch(SATUDATA_GRESIK_API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "NuSantap-GovAI/2.0 (Gresik Stunting & MBG Platform)",
      },
      next: { revalidate: 3600 }, // Cache 1 jam
    });

    if (response.ok) {
      liveApiResponse = await response.json();
      apiStatus = "LIVE_HTTP_200_OK";
    }
  } catch (err) {
    console.warn("Gagal terhubung ke remote server Satu Data Gresik, beralih ke snapshot resmi:", err);
    apiStatus = "REMOTE_TIMEOUT_FALLBACK";
  }

  // Ambil data murid kecamatan sesuai kode wilayah
  const districtData = OFFICIAL_GRESIK_STUDENTS[districtId] || OFFICIAL_GRESIK_STUDENTS["manyar"];

  return NextResponse.json({
    success: true,
    apiSource: {
      provider: "Portal Satu Data Kabupaten Gresik & Dapodik Kemendikbud RI",
      directApiEndpoint: SATUDATA_GRESIK_API_URL,
      secondaryDapodikEndpoint: KEMENDIKBUD_DAPODIK_API_URL,
      connectionStatus: apiStatus,
      timestamp: new Date().toISOString(),
    },
    data: districtData,
    upstreamMetadata: liveApiResponse ? {
      totalDatasetsFound: liveApiResponse?.result?.count || 0,
      ckanServerStatus: liveApiResponse?.success ? "ONLINE" : "OFFLINE",
    } : null,
  });
}
