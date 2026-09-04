/**
 * AUTO-GENERATED — Jangan edit manual!
 * Jalankan: npm run fetch-medqa
 * Source: medalpaca/medical_meadow_medqa
 * Fetched: 2026-09-02T12:50:18.326Z
 * Cases: 89 kasus terfilter
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
  {
    cluster: "HEMATOLOGY_ANEMIA" as const,
    label: "Anemia & Defisiensi Besi",
    organTrigger: "eye_conjunctiva" as const,
    realCaseCount: 20,
    evidenceLevel: "MedQA-USMLE (20 kasus)",
    clinicalFindings: ["Kadar Hemoglobin Rendah","Kelelahan & Lesu","Cadangan Besi Rendah (Ferritin)","Defisiensi Vitamin D / Rikets","Temuan Klinis Gizi Umum","Konjungtiva Pucat (Pallor)"],
    anamnesisGuidance: "Tanyakan: apakah anak sering lelah/lesu, pusing saat berdiri, atau terlihat pucat. Riwayat asupan daging merah & sayuran hijau.",
    sampleContexts: [
        {
            "finding": "Kadar Hemoglobin Rendah",
            "context": "A 52-year-old woman comes to the physician because of a 6-month history of generalized fatigue, low-grade fever, and a 10-kg (22-lb) weight loss. Phys...",
            "answer": "E: Unregulated expression of the ABL1 gene"
        },
        {
            "finding": "Cadangan Besi Rendah (Ferritin)",
            "context": "A 48-year-old woman comes to the emergency department because of a photosensitive blistering rash on her hands, forearms, and face for 3 weeks. The le...",
            "answer": "C: Begin phlebotomy therapy"
        },
        {
            "finding": "Kadar Hemoglobin Rendah",
            "context": "A 19-year-old woman, accompanied by her parents, presents after a one-week history of abnormal behavior, delusions, and unusual aggression. She denies...",
            "answer": "D: Stop risperidone"
        }
    ],
  },
  {
    cluster: "MICRONUTRIENT_DEFICIT" as const,
    label: "Defisiensi Vitamin & Mineral",
    organTrigger: "nail_nailbed" as const,
    realCaseCount: 20,
    evidenceLevel: "MedQA-USMLE (20 kasus)",
    clinicalFindings: ["Kelelahan & Lesu","Defisiensi Vitamin A","Defisiensi Vitamin D / Rikets","Temuan Klinis Gizi Umum","Kadar Hemoglobin Rendah","Cadangan Besi Rendah (Ferritin)"],
    anamnesisGuidance: "Tanyakan: pola makan & keberagaman makanan (5 kelompok pangan). Gejala spesifik: sariawan, rambut rontok, penglihatan malam, pertumbuhan terhambat.",
    sampleContexts: [
        {
            "finding": "Kelelahan & Lesu",
            "context": "A 17-year-old male is diagnosed with acne vulgaris during a visit to a dermatologist. He is prescribed a therapy that is a derivative of vitamin A. He...",
            "answer": "B: Hyperlipidemia"
        },
        {
            "finding": "Defisiensi Vitamin D / Rikets",
            "context": "A 19-year-old male with cystic fibrosis is evaluated in the clinic for regular health maintenance. He is compliant with his respiratory therapy, but s...",
            "answer": "D: Decreased calcium and decreased phosphate"
        },
        {
            "finding": "Defisiensi Vitamin D / Rikets",
            "context": "A 50-year-old woman presents with a severe headache and vomiting. She says that symptoms onset after attending a wine tasting at the local brewery. Sh...",
            "answer": "D: Blood pressure"
        }
    ],
  },
  {
    cluster: "HYDRATION_TURGOR" as const,
    label: "Dehidrasi & Turgor Kulit",
    organTrigger: "skin_turgor" as const,
    realCaseCount: 20,
    evidenceLevel: "MedQA-USMLE (20 kasus)",
    clinicalFindings: ["Kelelahan & Lesu","Temuan Klinis Gizi Umum","Defisiensi Vitamin D / Rikets","Dehidrasi / Turgor Kulit Buruk","Kadar Hemoglobin Rendah","Defisiensi Vitamin A"],
    anamnesisGuidance: "Tanyakan: jumlah minum air per hari (gelas), frekuensi BAK & warna urin, aktivitas fisik & paparan panas.",
    sampleContexts: [
        {
            "finding": "Kelelahan & Lesu",
            "context": "A 3-week-old boy is brought to the emergency department by his parents because of a 3-day history of progressive lethargy and difficulty feeding. He w...",
            "answer": "D: Intraosseous cannulation"
        },
        {
            "finding": "Temuan Klinis Gizi Umum",
            "context": "A previously healthy 10-year-old boy is brought to the emergency room by his mother 5 hours after the onset of abdominal pain and nausea. Over the pas...",
            "answer": "A: Decreased total body potassium"
        },
        {
            "finding": "Kelelahan & Lesu",
            "context": "A 45-year-old woman comes to the physician because of a 2-week history of fatigue and excessive thirst. During this period, she has not been able to s...",
            "answer": "D: Hydrochlorothiazide therapy"
        }
    ],
  },
  {
    cluster: "MALNUTRITION_STUNTING" as const,
    label: "Malnutrisi & Stunting",
    organTrigger: "face_vitality" as const,
    realCaseCount: 20,
    evidenceLevel: "MedQA-USMLE (20 kasus)",
    clinicalFindings: ["Temuan Klinis Gizi Umum","Kelelahan & Lesu","Gagal Tumbuh / Underweight","Dehidrasi / Turgor Kulit Buruk","Malnutrisi Protein-Energi"],
    anamnesisGuidance: "Tanyakan: riwayat berat badan lahir, pola pertumbuhan (KMS), frekuensi sakit, asupan kalori & protein harian.",
    sampleContexts: [
        {
            "finding": "Temuan Klinis Gizi Umum",
            "context": "A 21-year-old woman is admitted to the hospital for severe malnutrition with a BMI of 15 kg/m2. Past medical history is significant for chronic anorex...",
            "answer": "C: Measure electrolytes"
        },
        {
            "finding": "Kelelahan & Lesu",
            "context": "A 2-month-old Middle Eastern female infant from a consanguinous marriage presents with seizures, anorexia, failure to thrive, developmental delay, and...",
            "answer": "C: Methylmalonyl-CoA --> Succinyl-CoA"
        },
        {
            "finding": "Gagal Tumbuh / Underweight",
            "context": "A 14-month-old boy is brought in by his parents with an 8-month history of diarrhea, abdominal tenderness and concomitant failure to thrive. The pedia...",
            "answer": "A: 2.5%"
        }
    ],
  },
  {
    cluster: "PEDIATRIC_ALLERGEN" as const,
    label: "Alergi & Keamanan Pangan Anak",
    organTrigger: "normal_baseline" as const,
    realCaseCount: 9,
    evidenceLevel: "MedQA-USMLE (9 kasus)",
    clinicalFindings: ["Temuan Klinis Gizi Umum","Kelelahan & Lesu"],
    anamnesisGuidance: "Tanyakan: riwayat reaksi alergi setelah makan (apa makanannya, kapan, gejalanya). Alergen spesifik: seafood, telur, susu sapi, kacang.",
    sampleContexts: [
        {
            "finding": "Temuan Klinis Gizi Umum",
            "context": "A 12-month-old boy presents for a routine checkup. The patient immigrated from the Philippines with his parents a few months ago. No prior immunizatio...",
            "answer": "B: Intramuscular influenza vaccine"
        },
        {
            "finding": "Temuan Klinis Gizi Umum",
            "context": "A 30-year-old man comes to the emergency department because of a painful rash for 2 days. The rash initially appeared on his left lower abdomen and ha...",
            "answer": "D: Inpatient treatment with intravenous acyclovir"
        },
        {
            "finding": "Temuan Klinis Gizi Umum",
            "context": "A 47-year-old woman presents to the emergency department in a frantic state and demands immediate treatment for an allergic reaction, which started so...",
            "answer": "D: Prostaglandin release"
        }
    ],
  }
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
      .map((s) => `  → [Temuan: ${s.finding}] Jawaban: ${s.answer}`)
      .join("\n");
    return `[${c.cluster}] ${c.label} | ${c.realCaseCount} Kasus MedQA Verified
  Temuan: ${findings}
  Panduan: ${c.anamnesisGuidance.substring(0, 100)}...
  Contoh:
${samples}`;
  }).join("\n\n");
}
