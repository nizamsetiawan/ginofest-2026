/**
 * Biometric Synchronization & Storage Bridge Service
 * Integrates:
 * 1. Azure Blob Storage (Image Hosting)
 * 2. Azure AI Vision (Clinical Metrics)
 * 3. Gemini AI Engine (Nutritional Reasoning & Menu Recommendation)
 * 4. Firebase Firestore (Realtime DB Sync & Historical Audit)
 */

import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db, fetchMenuPlanFromFirestore, saveMenuPlanToFirestore } from "./firebase-service";
import { generateMenuWithSinglePrompt } from "./gemini-rag-service";
import { AzureBlobService, BiometricPhotoPayload, AzureBlobUploadedUrls } from "./azure-blob-service";
import { AzureVisionService, AzureVisionClinicalMetrics } from "./azure-vision-service";

export interface CompleteBiometricScanRecord {
  scanId: string;
  claimId: string;
  userId: string;
  userName: string;
  userDistrict: string;
  userAge: number;
  userEmail?: string;
  photos?: BiometricPhotoPayload;
  blobUrls: AzureBlobUploadedUrls;
  azureVisionMetrics: AzureVisionClinicalMetrics;
  questionnaireAnswers: {
    nafsuMakan: string;
    aktivitasFisik: string;
    alergi: string;
    catatanTambahan?: string;
  };
  recommendedMenu: {
    menuId: string;
    menuTitle: string;
    calories: number;
    proteinGram: number;
    ironMg: number;
    portionDesc: string;
    akgPercentage: number;
  };
  qrCodePayloadString: string;
  createdAt: string;
  status: "SCANNING_IN_PROGRESS" | "CANCELLED" | "VALID" | "CLAIMED" | "EXPIRED";
  lastCapturedStep?: string;
}

export class BiometricSyncService {
  private static readonly COLLECTION_SCANS = "biometric_scans_history";
  private static readonly COLLECTION_PROFILES = "biometric_student_profiles";

  /**
   * Complete End-to-End Execution Pipeline:
   * 1. Upload photos to Azure Blob Storage
   * 2. Analyze photos with Azure Vision
   * 3. Compute menu recommendation with Gemini logic
   * 4. Save entire synced record to Firebase Firestore
   */
  static async processAndSyncBiometricScan(params: {
    userId: string;
    userName: string;
    userDistrict: string;
    userAge?: number;
    userEmail?: string;
    photos: BiometricPhotoPayload;
    questionnaire: {
      nafsuMakan: string;
      aktivitasFisik: string;
      alergi: string;
      catatanTambahan?: string;
    };
    preferredMenuType?: "ayam" | "bandeng";
    existingScanId?: string;
  }): Promise<CompleteBiometricScanRecord> {
    const timestamp = Date.now();
    const scanId = params.existingScanId || `SCAN-${timestamp}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const claimId = `MBG-${timestamp}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1 & 2. Execute Azure Blob Upload and Azure/Gemini AI Vision concurrently in parallel
    const sanitizedUser = params.userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const container = process.env.AZURE_STORAGE_CONTAINER_NAME || "gscan-media";
    const account = process.env.AZURE_STORAGE_ACCOUNT_NAME || "stgscanginofest26";
    const baseBlobUrl = `https://${account}.blob.core.windows.net/${container}/users/${sanitizedUser}/${scanId}`;

    const [blobUrls, azureMetrics] = await Promise.all([
      AzureBlobService.uploadBiometricSessionPhotos(
        params.userId,
        scanId,
        params.photos
      ),
      AzureVisionService.analyzeBiometricSession(
        {
          faceBlobUrl: `${baseBlobUrl}/01_wajah.jpg`,
          eyeBlobUrl: `${baseBlobUrl}/02_mata_konjungtiva.jpg`,
          handBlobUrl: `${baseBlobUrl}/03_tangan_turgor.jpg`,
          nailBlobUrl: `${baseBlobUrl}/04_kuku_capillary.jpg`,
          uploadedAt: new Date().toISOString(),
          storageProvider: "AZURE_BLOB_STORAGE",
          containerName: container,
          blobPrefix: `users/${sanitizedUser}/${scanId}`,
        },
        params.userAge || 9,
        {
          face: params.photos.faceBase64,
          eye: params.photos.eyeBase64,
          hand: params.photos.handBase64,
          nail: params.photos.nailBase64,
        }
      )
    ]);

    // 3. Determine menu via Gemini reasoning (taking allergen into account)
    // RAG Integration: Fetch real dynamic menus from district's generated plan
    const d = new Date();
    const currentPeriod = `${d.getFullYear()}-${d.getMonth() + 1}`;
    
    // Default fallback menu jika RAG belum siap di kecamatan ini
    let selectedMenuId: string = params.preferredMenuType || "ayam";
    let menuTitle = selectedMenuId === "ayam" ? "Nasi Ayam Kari & Sayur" : "Nasi Bandeng Bakar Madu";
    let finalCalories = 680;
    let finalProtein = 31;
    let finalIron = 6;
    let menuSource = "FALLBACK_NASIONAL";

    try {
      const planRes = await fetchMenuPlanFromFirestore(params.userDistrict, currentPeriod);
      let availableMenus: any[] = [];

      if (planRes.success && planRes.data && planRes.data.availableGeneratedRecipes?.length > 0) {
        availableMenus = planRes.data.availableGeneratedRecipes;
      } else {
        // AUTO GENERATE ON THE FLY!
        console.log(`[RAG Auto-Gen] No menu plan found for ${params.userDistrict}. Generating on the fly...`);
        const ragRes = await generateMenuWithSinglePrompt({
          districtName: params.userDistrict,
          districtId: params.userDistrict
        });

        if (ragRes.success && ragRes.weeklyPlan && ragRes.weeklyPlan.length > 0) {
          availableMenus = ragRes.weeklyPlan;
          
          // Simpan ke Firestore (background process) agar bisa dipakai anak lain
          saveMenuPlanToFirestore(params.userDistrict, currentPeriod, {
            monthlyWeeks: [{ week: 1, days: ragRes.weeklyPlan }],
            budgetSummary: ragRes.budgetSummary,
            availableGeneratedRecipes: ragRes.weeklyPlan
          }).catch(e => console.warn("Background save RAG failed", e));
        }
      }

      if (availableMenus.length > 0) {
        // ─── FILTER 1: Alergi ─────────────────────────────────────────────────
        const alergi = params.questionnaire.alergi.toLowerCase();
        if (alergi.includes("seafood") || alergi.includes("ikan")) {
          availableMenus = availableMenus.filter(m =>
            !m.proteinSource?.toLowerCase().includes("ikan") &&
            !m.menuTitle?.toLowerCase().includes("ikan") &&
            !m.proteinSource?.toLowerCase().includes("bandeng") &&
            !m.menuTitle?.toLowerCase().includes("bandeng")
          );
        }
        if (alergi.includes("telur")) {
          availableMenus = availableMenus.filter(m =>
            !m.proteinSource?.toLowerCase().includes("telur") &&
            !m.menuTitle?.toLowerCase().includes("telur")
          );
        }
        if (alergi.includes("kacang") || alergi.includes("kedelai")) {
          availableMenus = availableMenus.filter(m =>
            !m.proteinSource?.toLowerCase().includes("tempe") &&
            !m.proteinSource?.toLowerCase().includes("tahu") &&
            !m.menuTitle?.toLowerCase().includes("tempe") &&
            !m.menuTitle?.toLowerCase().includes("tahu")
          );
        }

        if (availableMenus.length > 0) {
          // ─── FILTER 2: Precision Multi-Metric Clinical Scoring ──────────────
          // Setiap metrik klinis berkontribusi ke skor "kebutuhan gizi" menu
          //
          // eyePallorScore       → kebutuhan Zat Besi (Fe)
          // nailCapillaryScore   → kebutuhan Fe + Protein (sirkulasi)
          // skinTurgorScore      → kebutuhan cairan & Energi (Kalori)
          // facialVitalityScore  → kebutuhan Protein & Kalori overall
          //
          // Nilai score 0.0 = normal, 1.0 = defisiensi parah
          const eye   = azureMetrics.eyePallorScore   || 0;
          const nail  = azureMetrics.nailCapillaryScore || 0;
          const turgor = azureMetrics.skinTurgorScore  || 0;
          const vitality = azureMetrics.facialVitalityScore || 0;

          // Hitung bobot kebutuhan per nutrisi (0.0 - 1.0)
          const ironNeed    = (eye * 0.50) + (nail * 0.35) + (vitality * 0.15);
          const proteinNeed = (vitality * 0.45) + (nail * 0.35) + (turgor * 0.20);
          const calorieNeed = (turgor * 0.55) + (vitality * 0.30) + (eye * 0.15);

          // Tentukan nutrisi mana yang paling dibutuhkan
          const dominant = ironNeed >= proteinNeed && ironNeed >= calorieNeed
            ? "IRON"
            : proteinNeed >= calorieNeed
            ? "PROTEIN"
            : "CALORIE";

          // Scoring setiap menu kandidat berdasarkan kebutuhan dominan
          const scored = availableMenus.map(m => {
            const mIron    = (m.iron    || 0) / 10;   // normalise ~10mg max
            const mProtein = (m.protein || 0) / 40;   // normalise ~40g max
            const mCal     = (m.calories || 0) / 700; // normalise ~700 kcal max

            let score = 0;
            if (dominant === "IRON") {
              score = (mIron * 0.60) + (mProtein * 0.25) + (mCal * 0.15);
            } else if (dominant === "PROTEIN") {
              score = (mProtein * 0.60) + (mIron * 0.20) + (mCal * 0.20);
            } else {
              score = (mCal * 0.50) + (mProtein * 0.30) + (mIron * 0.20);
            }

            return { ...m, _clinicalScore: score };
          });

          // Pilih menu dengan skor klinis tertinggi
          const bestMenu = scored.reduce((prev, curr) =>
            curr._clinicalScore > prev._clinicalScore ? curr : prev
          );

          if (params.preferredMenuType) {
            const p = params.preferredMenuType.toLowerCase();
            if (p.includes("bandeng") || p === "bandeng") {
              menuTitle = "Nasi Bandeng Bakar Madu & Sayur Sop";
              selectedMenuId = "bandeng";
              finalCalories = 710;
              finalProtein = 34;
              finalIron = 7;
            } else if (p.includes("ayam") || p === "ayam") {
              menuTitle = "Nasi Ayam Kari & Sayur Sop";
              selectedMenuId = "ayam";
              finalCalories = 680;
              finalProtein = 31;
              finalIron = 6;
            } else {
              menuTitle = params.preferredMenuType;
            }
            menuSource = "USER_PREFERRED_SELECTION";
          } else {
            selectedMenuId = `rag-${bestMenu.day?.toLowerCase() || 'dynamic'}`;
            menuTitle      = bestMenu.menuTitle;
            finalCalories  = bestMenu.calories || 680;
            finalProtein   = bestMenu.protein  || 31;
            finalIron      = bestMenu.iron     || 6;
            menuSource     = "AI_RAG_PRECISION_CLINICAL";
          }

          console.log(`[Clinical Score] dominant=${dominant} ironNeed=${ironNeed.toFixed(2)} proteinNeed=${proteinNeed.toFixed(2)} calorieNeed=${calorieNeed.toFixed(2)} → selected="${menuTitle}"`);
        }
      }
    } catch (e) {
      console.warn("Gagal fetch atau generate menu RAG untuk integrasi scanner:", e);
    }

    const recommendedMenu = {
      menuId: selectedMenuId,
      menuTitle,
      calories: finalCalories,
      proteinGram: finalProtein,
      ironMg: finalIron,
      portionDesc: "1x Porsi MBG Sesuai Anggaran (Rp15.000)",
      akgPercentage: 45,
      source: menuSource,
    };

    // 4. Generate structured QR Claim JSON
    const qrPayload = {
      claimId,
      scanId,
      type: "MBG_FOOD_CLAIM",
      version: "2.0_HYBRID_AZURE_GEMINI",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      beneficiary: {
        id: params.userId,
        name: params.userName,
        district: params.userDistrict,
        age: params.userAge || 9,
      },
      menu: {
        id: selectedMenuId,
        name: menuTitle,
        calories: finalCalories,
        portion: "1x Makan Siang",
      },
      clinicalSummary: {
        deficiencyRisk: azureMetrics.detectedDeficiencyRisk,
        eyePallor: azureMetrics.eyeConjunctivaStatus,
        model: "AZURE_VISION_SCIN_DERMNET",
      },
      storage: {
        provider: "AZURE_BLOB_STORAGE",
        faceUrl: blobUrls.faceBlobUrl,
        eyeUrl: blobUrls.eyeBlobUrl,
      },
      status: "VALID",
    };

    const record: CompleteBiometricScanRecord = {
      scanId,
      claimId,
      userId: params.userId,
      userName: params.userName,
      userDistrict: params.userDistrict,
      userAge: params.userAge || 9,
      userEmail: params.userEmail,
      blobUrls,
      azureVisionMetrics: azureMetrics,
      questionnaireAnswers: params.questionnaire,
      recommendedMenu,
      qrCodePayloadString: JSON.stringify(qrPayload),
      createdAt: new Date().toISOString(),
      status: "VALID",
    };

    // 5. Sync to Firebase Firestore asynchronously
    try {
      const docRef = doc(db, this.COLLECTION_SCANS, scanId);
      await setDoc(docRef, {
        ...record,
        syncedToFirebaseAt: serverTimestamp(),
      });

      // Update / Upsert latest user biometric profile in Firestore
      const profileRef = doc(db, this.COLLECTION_PROFILES, params.userId);
      await setDoc(
        profileRef,
        {
          userId: params.userId,
          name: params.userName,
          district: params.userDistrict,
          lastScanId: scanId,
          lastClaimId: claimId,
          lastScanAt: record.createdAt,
          lastDeficiencyRisk: azureMetrics.detectedDeficiencyRisk,
          lastBlobUrls: blobUrls,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 6. Dual-write: Backup to Azure Blob Storage as JSON
      // This allows bypassing Firestore 1MB limits and keeps historical backups cheap
      try {
        const azureSaveResponse = await AzureBlobService.saveScanResultToAzure(
          record as unknown as Record<string, unknown>
        );
        if (azureSaveResponse.success) {
          console.log(`[Dual-Write] Scan ${scanId} successfully backed up to Azure Blob: ${azureSaveResponse.blobName}`);
        } else {
          console.warn(`[Dual-Write] Azure Blob backup failed for ${scanId}:`, azureSaveResponse.error);
        }
      } catch (azureErr) {
        console.warn("[Dual-Write] Unexpected error saving to Azure Blob:", azureErr);
      }

    } catch (dbErr) {
      console.warn("Firestore sync warning (offline caching active):", dbErr);
    }

    return record;

  }

  /**
   * Fetch historical biometric scans for a user from Firebase Firestore
   */
  static async fetchUserScansFromFirebase(userId: string): Promise<CompleteBiometricScanRecord[]> {
    try {
      const colRef = collection(db, this.COLLECTION_SCANS);
      const q = query(colRef, where("userId", "==", userId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as CompleteBiometricScanRecord);
      }
    } catch (err) {
      console.warn("Gagal mengambil data dari Firebase:", err);
    }
    return [];
  }

  /**
   * Syncs intermediate photo capture step in real-time to Firestore during Step 1 scanning
   */
  static async syncLiveBiometricFrame(params: {
    scanId: string;
    userId: string;
    userName: string;
    userDistrict: string;
    userAge?: number;
    capturedStep: "wajah" | "mata" | "tangan" | "kuku";
    photos: BiometricPhotoPayload;
  }): Promise<void> {
    try {
      if (!db) return;

      const docRef = doc(db, this.COLLECTION_SCANS, params.scanId);
      const sanitizedUser = params.userId.replace(/[^a-zA-Z0-9_-]/g, "_");
      const container = process.env.AZURE_STORAGE_CONTAINER_NAME || "gscan-media";
      const account = process.env.AZURE_STORAGE_ACCOUNT_NAME || "stgscanginofest26";
      const baseBlobUrl = `https://${account}.blob.core.windows.net/${container}/users/${sanitizedUser}/${params.scanId}`;

      const partialBlobUrls: AzureBlobUploadedUrls = {
        faceBlobUrl: params.photos.faceBase64 || `${baseBlobUrl}/01_wajah.jpg`,
        eyeBlobUrl: params.photos.eyeBase64 || `${baseBlobUrl}/02_mata_konjungtiva.jpg`,
        handBlobUrl: params.photos.handBase64 || `${baseBlobUrl}/03_tangan_turgor.jpg`,
        nailBlobUrl: params.photos.nailBase64 || `${baseBlobUrl}/04_kuku_capillary.jpg`,
        uploadedAt: new Date().toISOString(),
        storageProvider: "AZURE_BLOB_STORAGE",
        containerName: container,
        blobPrefix: `users/${sanitizedUser}/${params.scanId}`,
      };

      await setDoc(
        docRef,
        {
          scanId: params.scanId,
          claimId: `MBG-${Date.now()}`,
          userId: params.userId,
          userName: params.userName,
          userDistrict: params.userDistrict,
          userAge: params.userAge || 9,
          status: "SCANNING_IN_PROGRESS",
          lastCapturedStep: params.capturedStep,
          photos: params.photos,
          blobUrls: partialBlobUrls,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Realtime frame sync notice:", e);
    }
  }

  /**
   * Cancels/removes live scan progress in Firestore if user aborts/deletes scan
   */
  static async cancelLiveBiometricScan(scanId: string): Promise<void> {
    try {
      if (!db) return;
      const docRef = doc(db, this.COLLECTION_SCANS, scanId);
      await setDoc(docRef, { status: "CANCELLED", updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn("Realtime cancel sync notice:", e);
    }
  }

  /**
   * Clears/wipes all scan history documents from Firestore
   */
  static async clearAllScanHistory(): Promise<{ success: boolean; deletedCount: number }> {
    try {
      if (!db) return { success: false, deletedCount: 0 };

      // 1. Delete all scan history docs
      const scansSnap = await getDocs(collection(db, this.COLLECTION_SCANS));
      const scanDeletePromises: Promise<void>[] = [];
      scansSnap.forEach((docSnap) => {
        scanDeletePromises.push(deleteDoc(doc(db, this.COLLECTION_SCANS, docSnap.id)));
      });
      await Promise.all(scanDeletePromises);

      // 2. Delete all student biometric profile docs
      const profilesSnap = await getDocs(collection(db, this.COLLECTION_PROFILES));
      const profileDeletePromises: Promise<void>[] = [];
      profilesSnap.forEach((docSnap) => {
        profileDeletePromises.push(deleteDoc(doc(db, this.COLLECTION_PROFILES, docSnap.id)));
      });
      await Promise.all(profileDeletePromises);

      return { success: true, deletedCount: scansSnap.size };
    } catch (e) {
      console.error("Gagal mengosongkan riwayat Firestore:", e);
      return { success: false, deletedCount: 0 };
    }
  }
}
