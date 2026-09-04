#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 *  G-SCAN — MedQA Pediatric Knowledge Base Enrichment Script
 *  Referensi: https://huggingface.co/datasets/medalpaca/medical_meadow_medqa
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Pipeline:
 *  1. Fetch rows dari HuggingFace Datasets Server API (paginasi 100/req)
 *  2. Filter kasus relevan: Pediatri, Anemia, Gizi, Defisiensi Vitamin/Mineral
 *  3. Kategorikan ke klaster klinis G-SCAN
 *  4. Transform soal USMLE → konteks klinis untuk Gemini prompt enrichment
 *  5. Simpan ke src/data/medqa-real-cases.json (±50-100 kasus)
 *  6. Generate src/data/medqa-enriched-kb.ts siap import
 *
 *  Cara pakai:
 *    npm run fetch-medqa
 *
 *  Frekuensi: Jalankan sekali, atau ketika dataset diupdate (~monthly).
 * ═══════════════════════════════════════════════════════════════════
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── KONFIGURASI ────────────────────────────────────────────────────────────

const HUGGINGFACE_API_BASE = "https://datasets-server.huggingface.co/rows";
const DATASET = "medalpaca%2Fmedical_meadow_medqa";
const BATCH_SIZE = 100;
const MAX_CASES_PER_CLUSTER = 20;
const OUTPUT_JSON = path.join(__dirname, "../src/data/medqa-real-cases.json");
const OUTPUT_TS   = path.join(__dirname, "../src/data/medqa-enriched-kb.ts");

// ─── KLASTER & KEYWORD FILTER ────────────────────────────────────────────────

const CLUSTERS = {
  HEMATOLOGY_ANEMIA: {
    label: "Anemia & Defisiensi Besi",
    keywords: [
      "iron deficiency", "iron deficiency anemia", "hemoglobin",
      "ferritin", "pallor", "pale conjunctiva", "conjunctival pallor",
      "microcytic", "hypochromic", "sideropenia", "transferrin",
      "fatigue anemia", "koilonychia", "iron deficiency anemia",
    ],
    organTrigger: "eye_conjunctiva",
  },
  MICRONUTRIENT_DEFICIT: {
    label: "Defisiensi Vitamin & Mineral",
    keywords: [
      "vitamin a deficiency", "vitamin d deficiency", "vitamin b12",
      "zinc deficiency", "folate deficiency", "micronutrient",
      "rickets", "scurvy", "pellagra", "beriberi", "xerophthalmia",
      "night blindness", "kwashiorkor", "bitot spot",
      "glossitis", "cheilosis", "angular stomatitis",
    ],
    organTrigger: "nail_nailbed",
  },
  HYDRATION_TURGOR: {
    label: "Dehidrasi & Turgor Kulit",
    keywords: [
      "dehydration", "skin turgor", "sunken eyes", "dry mucous",
      "oliguria", "water intake", "fluid intake",
      "electrolyte imbalance", "hypernatremia", "diarrhea dehydration",
    ],
    organTrigger: "skin_turgor",
  },
  MALNUTRITION_STUNTING: {
    label: "Malnutrisi & Stunting",
    keywords: [
      "malnutrition", "stunting", "failure to thrive", "underweight",
      "wasting", "growth retardation", "undernutrition",
      "kwashiorkor", "marasmus", "protein energy malnutrition",
      "low weight for height", "growth chart",
    ],
    organTrigger: "face_vitality",
  },
  PEDIATRIC_ALLERGEN: {
    label: "Alergi & Keamanan Pangan Anak",
    keywords: [
      "food allergy", "allergic reaction", "anaphylaxis",
      "milk allergy", "egg allergy", "seafood allergy", "fish allergy",
      "nut allergy", "peanut allergy", "urticaria food",
      "elimination diet", "food intolerance", "atopic dermatitis food",
    ],
    organTrigger: "normal_baseline",
  },
} as const;

type ClusterKey = keyof typeof CLUSTERS;

// ─── TIPE DATA ────────────────────────────────────────────────────────────────

interface MedQARawRow {
  row_idx: number;
  row: { input: string; instruction: string; output: string };
}

interface MedQARealCase {
  idx: number;
  cluster: ClusterKey;
  organTrigger: string;
  clinicalContext: string;
  correctAnswer: string;
  keyFindings: string[];
  anamnesisHint: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractClinicalContext(input: string): string {
  const cleaned = input
    .replace(/\{[^}]+\}/g, "")
    .replace(/Q:/i, "")
    .replace(/\??\s*$/, "")
    .trim();
  return cleaned.length > 300 ? cleaned.substring(0, 300) + "..." : cleaned;
}

function extractKeyFindings(input: string): string[] {
  const text = input.toLowerCase();
  const patterns: [string, string][] = [
    ["pale conjunctiva|conjunctival pallor|pale palpebral", "Konjungtiva Pucat (Pallor)"],
    ["hemoglobin|hb \\d|hgb \\d", "Kadar Hemoglobin Rendah"],
    ["ferritin|serum iron|transferrin", "Cadangan Besi Rendah (Ferritin)"],
    ["fatigue|weakness|lethargy", "Kelelahan & Lesu"],
    ["koilonychia|spoon nail", "Kuku Sendok (Koilonychia)"],
    ["vitamin a|xerophthalmia|night blind", "Defisiensi Vitamin A"],
    ["vitamin d|rickets|bowing", "Defisiensi Vitamin D / Rikets"],
    ["zinc|growth retard|stunted", "Defisiensi Zinc & Hambatan Tumbuh"],
    ["dehydrat|skin turgor|sunken", "Dehidrasi / Turgor Kulit Buruk"],
    ["food allerg|anaphylax|urticaria", "Riwayat Alergi Makanan"],
    ["failure to thrive|underweight|wasting", "Gagal Tumbuh / Underweight"],
    ["kwashiorkor|marasmus|protein energy", "Malnutrisi Protein-Energi"],
  ];
  const found: string[] = [];
  for (const [pat, label] of patterns) {
    if (new RegExp(pat).test(text)) found.push(label);
  }
  return found.length > 0 ? found : ["Temuan Klinis Gizi Umum"];
}

function generateAnamnesisHint(cluster: ClusterKey): string {
  const hints: Record<ClusterKey, string> = {
    HEMATOLOGY_ANEMIA: "Tanyakan: apakah anak sering lelah/lesu, pusing saat berdiri, atau terlihat pucat. Riwayat asupan daging merah & sayuran hijau.",
    MICRONUTRIENT_DEFICIT: "Tanyakan: pola makan & keberagaman makanan (5 kelompok pangan). Gejala spesifik: sariawan, rambut rontok, penglihatan malam, pertumbuhan terhambat.",
    HYDRATION_TURGOR: "Tanyakan: jumlah minum air per hari (gelas), frekuensi BAK & warna urin, aktivitas fisik & paparan panas.",
    MALNUTRITION_STUNTING: "Tanyakan: riwayat berat badan lahir, pola pertumbuhan (KMS), frekuensi sakit, asupan kalori & protein harian.",
    PEDIATRIC_ALLERGEN: "Tanyakan: riwayat reaksi alergi setelah makan (apa makanannya, kapan, gejalanya). Alergen spesifik: seafood, telur, susu sapi, kacang.",
  };
  return hints[cluster];
}

function classifyCluster(input: string): ClusterKey | null {
  const text = input.toLowerCase();
  let best: ClusterKey | null = null;
  let bestScore = 0;
  for (const [key, config] of Object.entries(CLUSTERS) as [ClusterKey, typeof CLUSTERS[ClusterKey]][]) {
    const score = config.keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = key; }
  }
  return bestScore >= 1 ? best : null;
}

// ─── MAIN FETCH ───────────────────────────────────────────────────────────────

async function fetchCases(): Promise<MedQARealCase[]> {
  console.log("\n🔬 G-SCAN MedQA Pediatric Enrichment Script");
  console.log("═".repeat(55));
  console.log("📡 Fetching dari HuggingFace Datasets Server API...\n");

  // Cek total rows
  const firstRes = await fetch(
    `${HUGGINGFACE_API_BASE}?dataset=${DATASET}&config=default&split=train&offset=0&length=1`
  );
  const firstData = await firstRes.json() as { num_rows_total: number };
  const totalRows = firstData.num_rows_total;
  console.log(`📈 Total rows: ${totalRows.toLocaleString()}`);
  console.log(`🎯 Target: ${MAX_CASES_PER_CLUSTER} kasus × ${Object.keys(CLUSTERS).length} klaster\n`);

  const results: MedQARealCase[] = [];
  const counts: Record<string, number> = {};
  for (const k of Object.keys(CLUSTERS)) counts[k] = 0;

  let offset = 0;
  let batch = 0;
  let scanned = 0;

  while (offset < totalRows) {
    const allFull = Object.keys(CLUSTERS).every((k) => counts[k] >= MAX_CASES_PER_CLUSTER);
    if (allFull) {
      console.log(`\n✅ Semua klaster terpenuhi!`);
      break;
    }

    batch++;
    process.stdout.write(`\r📥 Batch ${batch}: scanning offset ${offset.toLocaleString()} | Ditemukan: ${results.length} kasus`);

    try {
      const url = `${HUGGINGFACE_API_BASE}?dataset=${DATASET}&config=default&split=train&offset=${offset}&length=${BATCH_SIZE}`;
      const res = await fetch(url);
      if (!res.ok) {
        offset += BATCH_SIZE;
        await sleep(2000);
        continue;
      }
      const data = await res.json() as { rows: MedQARawRow[] };

      for (const row of data.rows) {
        scanned++;
        const cluster = classifyCluster(row.row.input);
        if (!cluster || counts[cluster] >= MAX_CASES_PER_CLUSTER) continue;

        results.push({
          idx: row.row_idx,
          cluster,
          organTrigger: CLUSTERS[cluster].organTrigger,
          clinicalContext: extractClinicalContext(row.row.input),
          correctAnswer: row.row.output,
          keyFindings: extractKeyFindings(row.row.input),
          anamnesisHint: generateAnamnesisHint(cluster),
        });
        counts[cluster]++;
      }

      offset += BATCH_SIZE;
      await sleep(150);
    } catch {
      offset += BATCH_SIZE;
      await sleep(1000);
    }
  }

  console.log(`\n\n📊 Hasil:`);
  for (const [k, n] of Object.entries(counts)) {
    const bar = "█".repeat(n) + "░".repeat(MAX_CASES_PER_CLUSTER - n);
    console.log(`  ${CLUSTERS[k as ClusterKey].label.padEnd(38)} [${bar}] ${n}/${MAX_CASES_PER_CLUSTER}`);
  }
  console.log(`  ${"TOTAL".padEnd(38)} : ${results.length} kasus`);
  return results;
}

// ─── OUTPUT JSON ──────────────────────────────────────────────────────────────

function saveJson(cases: MedQARealCase[]): void {
  const out = {
    meta: {
      source: "medalpaca/medical_meadow_medqa",
      fetchedAt: new Date().toISOString(),
      totalCases: cases.length,
      description: "Kasus klinis MedQA terfilter untuk pediatri & gizi anak — G-SCAN Enriched KB",
      huggingfaceUrl: "https://huggingface.co/datasets/medalpaca/medical_meadow_medqa",
    },
    clusters: Object.fromEntries(
      Object.keys(CLUSTERS).map((k) => [k, cases.filter((c) => c.cluster === k)])
    ),
    allCases: cases,
  };
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(out, null, 2), "utf-8");
  const kb = (fs.statSync(OUTPUT_JSON).size / 1024).toFixed(1);
  console.log(`\n💾 JSON: ${OUTPUT_JSON} (${kb} KB)`);
}

// ─── OUTPUT TYPESCRIPT KB ─────────────────────────────────────────────────────

function generateTS(cases: MedQARealCase[]): void {
  const groups: Record<string, MedQARealCase[]> = {};
  for (const k of Object.keys(CLUSTERS)) groups[k] = cases.filter((c) => c.cluster === k);

  const entries = Object.entries(groups)
    .map(([k, cls]) => {
      const findings = [...new Set(cls.flatMap((c) => c.keyFindings))];
      const samples = cls.slice(0, 3).map((c) => ({
        finding: c.keyFindings[0] || "",
        context: c.clinicalContext.substring(0, 150) + "...",
        answer: c.correctAnswer,
      }));
      const hint = cls[0]?.anamnesisHint || "";
      return `  {
    cluster: "${k}" as const,
    label: "${CLUSTERS[k as ClusterKey].label}",
    organTrigger: "${CLUSTERS[k as ClusterKey].organTrigger}" as const,
    realCaseCount: ${cls.length},
    evidenceLevel: "MedQA-USMLE (${cls.length} kasus)",
    clinicalFindings: ${JSON.stringify(findings)},
    anamnesisGuidance: ${JSON.stringify(hint)},
    sampleContexts: ${JSON.stringify(samples, null, 4).split("\n").join("\n    ")},
  }`;
    })
    .join(",\n");

  const ts = `/**
 * AUTO-GENERATED — Jangan edit manual!
 * Jalankan: npm run fetch-medqa
 * Source: medalpaca/medical_meadow_medqa
 * Fetched: ${new Date().toISOString()}
 * Cases: ${cases.length} kasus terfilter
 */

export interface MedQAEnrichedCluster {
  cluster: "HEMATOLOGY_ANEMIA" | "MICRONUTRIENT_DEFICIT" | "HYDRATION_TURGOR" | "MALNUTRITION_STUNTING" | "PEDIATRIC_ALLERGEN";
  label: string;
  organTrigger: string;
  realCaseCount: number;
  evidenceLevel: string;
  clinicalFindings: string[];
  anamnesisGuidance: string;
  sampleContexts: Array<{ finding: string; context: string; answer: string }>;
}

/** Enriched KB dari real MedQA cases — inject ke Gemini prompt untuk akurasi lebih tinggi. */
export const MEDQA_ENRICHED_CLUSTERS: MedQAEnrichedCluster[] = [
${entries}
];

/**
 * Fungsi utilitas: ringkasan kompak (~300 token) untuk di-inject ke Gemini prompt.
 * Gunakan di azure-vision-service.ts sebagai tambahan konteks klinis.
 */
export function getMedQAEnrichedPromptContext(): string {
  return MEDQA_ENRICHED_CLUSTERS.map((c) => {
    const findings = c.clinicalFindings.slice(0, 4).join(", ");
    const samples = c.sampleContexts
      .slice(0, 2)
      .map((s) => \`  → [Temuan: \${s.finding}] Jawaban: \${s.answer}\`)
      .join("\\n");
    return \`[\${c.cluster}] \${c.label} | \${c.realCaseCount} Kasus MedQA Verified
  Temuan: \${findings}
  Panduan: \${c.anamnesisGuidance.substring(0, 100)}...
  Contoh:\n\${samples}\`;
  }).join("\\n\\n");
}
`;

  fs.writeFileSync(OUTPUT_TS, ts, "utf-8");
  const kb = (fs.statSync(OUTPUT_TS).size / 1024).toFixed(1);
  console.log(`💾 TypeScript KB: ${OUTPUT_TS} (${kb} KB)`);
}

// ─── ENTRY ────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now();
  const cases = await fetchCases();
  if (cases.length === 0) {
    console.error("\n❌ Tidak ada kasus ditemukan.");
    process.exit(1);
  }
  console.log("\n⚙️  Menyimpan output...");
  saveJson(cases);
  generateTS(cases);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅ Selesai dalam ${elapsed} detik!`);
  console.log(`\n📌 Langkah selanjutnya:`);
  console.log(`   1. Import getMedQAEnrichedPromptContext() di azure-vision-service.ts`);
  console.log(`   2. Inject ke Gemini prompt sebagai tambahan konteks klinis`);
  console.log(`   3. Commit kedua file output ke repo\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
