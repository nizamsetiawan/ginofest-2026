import { NextResponse } from "next/server";
import { OFFICIAL_GRESIK_DATA } from "@/data/gresik-official-stunting";

const RESOURCE_MAP: Record<string, string> = {
  "2025": "b89189c0-0e18-11f1-b0dc-005056016148",
  "2024": "4d8b8c1b-466e-11f0-8b48-005056016148",
  "2023": "c87749c5-6bb2-41af-9d6c-b23a93f34a79",
  "2022": "71b18a17-04ea-4ea3-95f8-495ee156817b",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2026";

  const resourceId = RESOURCE_MAP[year];

  // If resourceId exists on Satu Data Gresik (2022 - 2025)
  if (resourceId) {
    try {
      const apiUrl = `https://satudata.gresikkab.go.id/api/3/action/datastore_search?resource_id=${resourceId}&limit=25`;
      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; GScan/1.0; +https://gresikkab.go.id)",
          "Accept": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.result && json.result.records) {
          const rawRecords = json.result.records;

          // Transform API records into standard format
          const districtRecords = rawRecords
            .filter((r: any) => r.kode_wilayah && r.kode_wilayah !== "35.25")
            .map((r: any, idx: number) => ({
              id: parseInt(r.id) || idx + 1,
              kodeWilayah: r.kode_wilayah,
              kecamatan: r.kecamatan,
              balitaStunting: parseInt(String(r.balita_stunting).replace(/\./g, "")) || 0,
              balitaSembuh: parseInt(String(r.balita_sembuh).replace(/\./g, "")) || 0,
              balitaLulus: parseInt(String(r.balita_lulus).replace(/\./g, "")) || 0,
            }));

          // Calculate totals
          const totalStunting = districtRecords.reduce((acc: number, cur: any) => acc + cur.balitaStunting, 0);
          const totalSembuh = districtRecords.reduce((acc: number, cur: any) => acc + cur.balitaSembuh, 0);
          const totalLulus = districtRecords.reduce((acc: number, cur: any) => acc + cur.balitaLulus, 0);

          return NextResponse.json({
            success: true,
            source: "Dinas Kesehatan Kab. Gresik",
            year,
            totalStunting,
            totalSembuh,
            totalLulus,
            records: districtRecords,
          });
        }
      }
    } catch (err) {
      console.warn("Gagal menghubungi API Satu Data Gresik, beralih ke cache data cadangan", err);
    }
  }

  // Fallback / 2026 data
  const cachedData = OFFICIAL_GRESIK_DATA[year] || OFFICIAL_GRESIK_DATA["2026"];
  return NextResponse.json({
    success: true,
    source: "Dinas Kesehatan Kab. Gresik",
    year,
    totalStunting: cachedData.totalStunting,
    totalSembuh: cachedData.totalSembuh,
    totalLulus: cachedData.totalLulus,
    records: cachedData.records,
  });
}
