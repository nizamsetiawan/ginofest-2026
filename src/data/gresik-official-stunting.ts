/**
 * Data Resmi Akumulasi Kasus Stunting Kabupaten Gresik (2022 - 2026)
 * Sumber Data: 
 * - Satu Data Gresik (Dinkes Kab. Gresik - CKAN Datastore API)
 * - Pemkab Gresik (gus.gresikkab.go.id per 12 Juni 2026)
 */

export interface DistrictStuntingYearRecord {
  id: number;
  kodeWilayah: string;
  kecamatan: string;
  balitaStunting: number;
  balitaSembuh: number;
  balitaLulus: number;
}

export interface GresikYearlySummary {
  year: string;
  resourceId?: string;
  source: string;
  totalStunting: number;
  totalSembuh: number;
  totalLulus: number;
  records: DistrictStuntingYearRecord[];
}

export const OFFICIAL_GRESIK_DATA: Record<string, GresikYearlySummary> = {
  "2026": {
    year: "2026",
    source: "Pemkab Gresik (gus.gresikkab.go.id per 12 Juni 2026)",
    totalStunting: 3403,
    totalSembuh: 7049,
    totalLulus: 3608,
    records: [
      { id: 1, kodeWilayah: "35.25.01", kecamatan: "Dukun", balitaStunting: 133, balitaSembuh: 345, balitaLulus: 132 },
      { id: 2, kodeWilayah: "35.25.02", kecamatan: "Balongpanggang", balitaStunting: 135, balitaSembuh: 361, balitaLulus: 220 },
      { id: 3, kodeWilayah: "35.25.03", kecamatan: "Panceng", balitaStunting: 66, balitaSembuh: 284, balitaLulus: 70 },
      { id: 4, kodeWilayah: "35.25.04", kecamatan: "Benjeng", balitaStunting: 86, balitaSembuh: 273, balitaLulus: 75 },
      { id: 5, kodeWilayah: "35.25.05", kecamatan: "Duduksampeyan", balitaStunting: 26, balitaSembuh: 104, balitaLulus: 164 },
      { id: 6, kodeWilayah: "35.25.06", kecamatan: "Wringinanom", balitaStunting: 359, balitaSembuh: 287, balitaLulus: 254 },
      { id: 7, kodeWilayah: "35.25.07", kecamatan: "Ujungpangkah", balitaStunting: 168, balitaSembuh: 404, balitaLulus: 127 },
      { id: 8, kodeWilayah: "35.25.08", kecamatan: "Kedamean", balitaStunting: 229, balitaSembuh: 292, balitaLulus: 244 },
      { id: 9, kodeWilayah: "35.25.09", kecamatan: "Sidayu", balitaStunting: 158, balitaSembuh: 444, balitaLulus: 143 },
      { id: 10, kodeWilayah: "35.25.10", kecamatan: "Manyar", balitaStunting: 380, balitaSembuh: 688, balitaLulus: 238 },
      { id: 11, kodeWilayah: "35.25.11", kecamatan: "Cerme", balitaStunting: 91, balitaSembuh: 495, balitaLulus: 201 },
      { id: 12, kodeWilayah: "35.25.12", kecamatan: "Bungah", balitaStunting: 137, balitaSembuh: 47, balitaLulus: 31 },
      { id: 13, kodeWilayah: "35.25.13", kecamatan: "Menganti", balitaStunting: 122, balitaSembuh: 718, balitaLulus: 126 },
      { id: 14, kodeWilayah: "35.25.14", kecamatan: "Kebomas", balitaStunting: 343, balitaSembuh: 379, balitaLulus: 318 },
      { id: 15, kodeWilayah: "35.25.15", kecamatan: "Driyorejo", balitaStunting: 438, balitaSembuh: 903, balitaLulus: 380 },
      { id: 16, kodeWilayah: "35.25.16", kecamatan: "Gresik", balitaStunting: 184, balitaSembuh: 574, balitaLulus: 175 },
      { id: 17, kodeWilayah: "35.25.17", kecamatan: "Sangkapura", balitaStunting: 280, balitaSembuh: 65, balitaLulus: 609 },
      { id: 18, kodeWilayah: "35.25.18", kecamatan: "Tambak", balitaStunting: 68, balitaSembuh: 386, balitaLulus: 101 },
    ],
  },
  "2025": {
    year: "2025",
    resourceId: "b89189c0-0e18-11f1-b0dc-005056016148",
    source: "Satu Data Gresik - Dinas Kesehatan (API CKAN)",
    totalStunting: 1121,
    totalSembuh: 273,
    totalLulus: 52,
    records: [
      { id: 1, kodeWilayah: "35.25.06", kecamatan: "Wringinanom", balitaStunting: 118, balitaSembuh: 3, balitaLulus: 8 },
      { id: 2, kodeWilayah: "35.25.15", kecamatan: "Driyorejo", balitaStunting: 52, balitaSembuh: 39, balitaLulus: 0 },
      { id: 3, kodeWilayah: "35.25.08", kecamatan: "Kedamean", balitaStunting: 41, balitaSembuh: 0, balitaLulus: 0 },
      { id: 4, kodeWilayah: "35.25.13", kecamatan: "Menganti", balitaStunting: 42, balitaSembuh: 14, balitaLulus: 2 },
      { id: 5, kodeWilayah: "35.25.11", kecamatan: "Cerme", balitaStunting: 18, balitaSembuh: 1, balitaLulus: 0 },
      { id: 6, kodeWilayah: "35.25.04", kecamatan: "Benjeng", balitaStunting: 42, balitaSembuh: 11, balitaLulus: 0 },
      { id: 7, kodeWilayah: "35.25.02", kecamatan: "Balongpanggang", balitaStunting: 42, balitaSembuh: 2, balitaLulus: 0 },
      { id: 8, kodeWilayah: "35.25.05", kecamatan: "Duduksampeyan", balitaStunting: 10, balitaSembuh: 1, balitaLulus: 3 },
      { id: 9, kodeWilayah: "35.25.14", kecamatan: "Kebomas", balitaStunting: 137, balitaSembuh: 19, balitaLulus: 9 },
      { id: 10, kodeWilayah: "35.25.16", kecamatan: "Gresik", balitaStunting: 137, balitaSembuh: 31, balitaLulus: 7 },
      { id: 11, kodeWilayah: "35.25.10", kecamatan: "Manyar", balitaStunting: 176, balitaSembuh: 36, balitaLulus: 9 },
      { id: 12, kodeWilayah: "35.25.12", kecamatan: "Bungah", balitaStunting: 40, balitaSembuh: 1, balitaLulus: 1 },
      { id: 13, kodeWilayah: "35.25.09", kecamatan: "Sidayu", balitaStunting: 52, balitaSembuh: 74, balitaLulus: 9 },
      { id: 14, kodeWilayah: "35.25.01", kecamatan: "Dukun", balitaStunting: 40, balitaSembuh: 17, balitaLulus: 0 },
      { id: 15, kodeWilayah: "35.25.03", kecamatan: "Panceng", balitaStunting: 30, balitaSembuh: 1, balitaLulus: 0 },
      { id: 16, kodeWilayah: "35.25.07", kecamatan: "Ujungpangkah", balitaStunting: 100, balitaSembuh: 1, balitaLulus: 0 },
      { id: 17, kodeWilayah: "35.25.17", kecamatan: "Sangkapura", balitaStunting: 0, balitaSembuh: 0, balitaLulus: 0 },
      { id: 18, kodeWilayah: "35.25.18", kecamatan: "Tambak", balitaStunting: 44, balitaSembuh: 22, balitaLulus: 4 },
    ],
  },
  "2024": {
    year: "2024",
    resourceId: "4d8b8c1b-466e-11f0-8b48-005056016148",
    source: "Satu Data Gresik - Dinas Kesehatan (API CKAN)",
    totalStunting: 1156,
    totalSembuh: 678,
    totalLulus: 144,
    records: [
      { id: 1, kodeWilayah: "35.25.06", kecamatan: "Wringinanom", balitaStunting: 103, balitaSembuh: 22, balitaLulus: 15 },
      { id: 2, kodeWilayah: "35.25.15", kecamatan: "Driyorejo", balitaStunting: 216, balitaSembuh: 95, balitaLulus: 12 },
      { id: 3, kodeWilayah: "35.25.08", kecamatan: "Kedamean", balitaStunting: 114, balitaSembuh: 37, balitaLulus: 11 },
      { id: 4, kodeWilayah: "35.25.13", kecamatan: "Menganti", balitaStunting: 45, balitaSembuh: 77, balitaLulus: 8 },
      { id: 5, kodeWilayah: "35.25.11", kecamatan: "Cerme", balitaStunting: 51, balitaSembuh: 39, balitaLulus: 9 },
      { id: 6, kodeWilayah: "35.25.04", kecamatan: "Benjeng", balitaStunting: 20, balitaSembuh: 21, balitaLulus: 6 },
      { id: 7, kodeWilayah: "35.25.02", kecamatan: "Balongpanggang", balitaStunting: 60, balitaSembuh: 31, balitaLulus: 10 },
      { id: 8, kodeWilayah: "35.25.05", kecamatan: "Duduksampeyan", balitaStunting: 10, balitaSembuh: 13, balitaLulus: 5 },
      { id: 9, kodeWilayah: "35.25.14", kecamatan: "Kebomas", balitaStunting: 78, balitaSembuh: 18, balitaLulus: 7 },
      { id: 10, kodeWilayah: "35.25.16", kecamatan: "Gresik", balitaStunting: 46, balitaSembuh: 34, balitaLulus: 2 },
      { id: 11, kodeWilayah: "35.25.10", kecamatan: "Manyar", balitaStunting: 116, balitaSembuh: 109, balitaLulus: 32 },
      { id: 12, kodeWilayah: "35.25.12", kecamatan: "Bungah", balitaStunting: 46, balitaSembuh: 7, balitaLulus: 2 },
      { id: 13, kodeWilayah: "35.25.09", kecamatan: "Sidayu", balitaStunting: 39, balitaSembuh: 56, balitaLulus: 14 },
      { id: 14, kodeWilayah: "35.25.01", kecamatan: "Dukun", balitaStunting: 38, balitaSembuh: 59, balitaLulus: 3 },
      { id: 15, kodeWilayah: "35.25.03", kecamatan: "Panceng", balitaStunting: 25, balitaSembuh: 9, balitaLulus: 1 },
      { id: 16, kodeWilayah: "35.25.07", kecamatan: "Ujungpangkah", balitaStunting: 33, balitaSembuh: 25, balitaLulus: 2 },
      { id: 17, kodeWilayah: "35.25.17", kecamatan: "Sangkapura", balitaStunting: 95, balitaSembuh: 0, balitaLulus: 1 },
      { id: 18, kodeWilayah: "35.25.18", kecamatan: "Tambak", balitaStunting: 21, balitaSembuh: 26, balitaLulus: 4 },
    ],
  },
  "2023": {
    year: "2023",
    resourceId: "c87749c5-6bb2-41af-9d6c-b23a93f34a79",
    source: "Satu Data Gresik - Dinas Kesehatan (API CKAN)",
    totalStunting: 1506,
    totalSembuh: 1212,
    totalLulus: 243,
    records: [
      { id: 1, kodeWilayah: "35.25.06", kecamatan: "Wringinanom", balitaStunting: 66, balitaSembuh: 6, balitaLulus: 6 },
      { id: 2, kodeWilayah: "35.25.15", kecamatan: "Driyorejo", balitaStunting: 260, balitaSembuh: 212, balitaLulus: 31 },
      { id: 3, kodeWilayah: "35.25.08", kecamatan: "Kedamean", balitaStunting: 71, balitaSembuh: 32, balitaLulus: 7 },
      { id: 4, kodeWilayah: "35.25.13", kecamatan: "Menganti", balitaStunting: 139, balitaSembuh: 133, balitaLulus: 7 },
      { id: 5, kodeWilayah: "35.25.11", kecamatan: "Cerme", balitaStunting: 98, balitaSembuh: 86, balitaLulus: 27 },
      { id: 6, kodeWilayah: "35.25.04", kecamatan: "Benjeng", balitaStunting: 42, balitaSembuh: 58, balitaLulus: 5 },
      { id: 7, kodeWilayah: "35.25.02", kecamatan: "Balongpanggang", balitaStunting: 92, balitaSembuh: 65, balitaLulus: 8 },
      { id: 8, kodeWilayah: "35.25.05", kecamatan: "Duduksampeyan", balitaStunting: 43, balitaSembuh: 73, balitaLulus: 17 },
      { id: 9, kodeWilayah: "35.25.14", kecamatan: "Kebomas", balitaStunting: 125, balitaSembuh: 19, balitaLulus: 9 },
      { id: 10, kodeWilayah: "35.25.16", kecamatan: "Gresik", balitaStunting: 61, balitaSembuh: 129, balitaLulus: 16 },
      { id: 11, kodeWilayah: "35.25.10", kecamatan: "Manyar", balitaStunting: 64, balitaSembuh: 36, balitaLulus: 8 },
      { id: 12, kodeWilayah: "35.25.12", kecamatan: "Bungah", balitaStunting: 72, balitaSembuh: 7, balitaLulus: 4 },
      { id: 13, kodeWilayah: "35.25.09", kecamatan: "Sidayu", balitaStunting: 40, balitaSembuh: 86, balitaLulus: 11 },
      { id: 14, kodeWilayah: "35.25.01", kecamatan: "Dukun", balitaStunting: 36, balitaSembuh: 67, balitaLulus: 4 },
      { id: 15, kodeWilayah: "35.25.03", kecamatan: "Panceng", balitaStunting: 60, balitaSembuh: 21, balitaLulus: 3 },
      { id: 16, kodeWilayah: "35.25.07", kecamatan: "Ujungpangkah", balitaStunting: 78, balitaSembuh: 88, balitaLulus: 4 },
      { id: 17, kodeWilayah: "35.25.17", kecamatan: "Sangkapura", balitaStunting: 105, balitaSembuh: 29, balitaLulus: 56 },
      { id: 18, kodeWilayah: "35.25.18", kecamatan: "Tambak", balitaStunting: 54, balitaSembuh: 65, balitaLulus: 20 },
    ],
  },
  "2022": {
    year: "2022",
    resourceId: "71b18a17-04ea-4ea3-95f8-495ee156817b",
    source: "Satu Data Gresik - Dinas Kesehatan (API CKAN)",
    totalStunting: 1401,
    totalSembuh: 3814,
    totalLulus: 2242,
    records: [
      { id: 1, kodeWilayah: "35.25.06", kecamatan: "Wringinanom", balitaStunting: 132, balitaSembuh: 188, balitaLulus: 145 },
      { id: 2, kodeWilayah: "35.25.15", kecamatan: "Driyorejo", balitaStunting: 181, balitaSembuh: 419, balitaLulus: 227 },
      { id: 3, kodeWilayah: "35.25.08", kecamatan: "Kedamean", balitaStunting: 129, balitaSembuh: 177, balitaLulus: 145 },
      { id: 4, kodeWilayah: "35.25.13", kecamatan: "Menganti", balitaStunting: 40, balitaSembuh: 375, balitaLulus: 104 },
      { id: 5, kodeWilayah: "35.25.11", kecamatan: "Cerme", balitaStunting: 69, balitaSembuh: 262, balitaLulus: 113 },
      { id: 6, kodeWilayah: "35.25.04", kecamatan: "Benjeng", balitaStunting: 20, balitaSembuh: 138, balitaLulus: 49 },
      { id: 7, kodeWilayah: "35.25.02", kecamatan: "Balongpanggang", balitaStunting: 87, balitaSembuh: 185, balitaLulus: 115 },
      { id: 8, kodeWilayah: "35.25.05", kecamatan: "Duduksampeyan", balitaStunting: 10, balitaSembuh: 38, balitaLulus: 72 },
      { id: 9, kodeWilayah: "35.25.14", kecamatan: "Kebomas", balitaStunting: 183, balitaSembuh: 264, balitaLulus: 179 },
      { id: 10, kodeWilayah: "35.25.16", kecamatan: "Gresik", balitaStunting: 66, balitaSembuh: 290, balitaLulus: 119 },
      { id: 11, kodeWilayah: "35.25.10", kecamatan: "Manyar", balitaStunting: 149, balitaSembuh: 386, balitaLulus: 116 },
      { id: 12, kodeWilayah: "35.25.12", kecamatan: "Bungah", balitaStunting: 11, balitaSembuh: 19, balitaLulus: 7 },
      { id: 13, kodeWilayah: "35.25.09", kecamatan: "Sidayu", balitaStunting: 48, balitaSembuh: 190, balitaLulus: 62 },
      { id: 14, kodeWilayah: "35.25.01", kecamatan: "Dukun", balitaStunting: 49, balitaSembuh: 188, balitaLulus: 104 },
      { id: 15, kodeWilayah: "35.25.03", kecamatan: "Panceng", balitaStunting: 22, balitaSembuh: 203, balitaLulus: 36 },
      { id: 16, kodeWilayah: "35.25.07", kecamatan: "Ujungpangkah", balitaStunting: 68, balitaSembuh: 228, balitaLulus: 70 },
      { id: 17, kodeWilayah: "35.25.17", kecamatan: "Sangkapura", balitaStunting: 103, balitaSembuh: 35, balitaLulus: 541 },
      { id: 18, kodeWilayah: "35.25.18", kecamatan: "Tambak", balitaStunting: 34, balitaSembuh: 229, balitaLulus: 38 },
    ],
  },
};

export const MULTI_YEAR_TREND_DATA = [
  { year: "2022", totalStunting: 1401, totalSembuh: 3814, totalLulus: 2242 },
  { year: "2023", totalStunting: 1506, totalSembuh: 1212, totalLulus: 243 },
  { year: "2024", totalStunting: 1156, totalSembuh: 678, totalLulus: 144 },
  { year: "2025", totalStunting: 1121, totalSembuh: 273, totalLulus: 52 },
  { year: "2026", totalStunting: 3403, totalSembuh: 7049, totalLulus: 3608 },
];
