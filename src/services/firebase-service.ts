import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// Firebase App Config for ginofest-2026
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ginofest-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ginofest-2026",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ginofest-2026.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "19574959170",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:19574959170:web:ca37e18784de2eeb3511db",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KKJMJ66N8Q",
};

// Singleton App & Safe Firestore instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

// 5 DEDICATED TOP-LEVEL COLLECTIONS
export const COLLECTIONS = {
  commodities: "master_komoditas",
  prices: "master_harga_pasar",
  recipes: "master_menu_makanan",
  nutrition: "master_nilai_gizi",
  districts: "master_wilayah",
};

// -------------------------------------------------------------
// 1. STEP 1: MASTER KOMODITAS (Collection: master_komoditas)
// -------------------------------------------------------------
export async function fetchCommoditiesFromFirestore() {
  try {
    const colRef = collection(db, COLLECTIONS.commodities);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      items.sort((a: any, b: any) => (a.no || 0) - (b.no || 0));
      return { success: true, data: items };
    }
    return { success: false, message: "Koleksi kosong" };
  } catch (error: any) {
    console.warn("Gagal load master_komoditas:", error);
    return { success: false, error: error.message };
  }
}

export async function saveCommodityToFirestore(commodity: any) {
  try {
    let docId = commodity.id;
    if (!docId) {
      const colRef = collection(db, COLLECTIONS.commodities);
      const q = query(colRef, where("no", "==", commodity.no));
      const snap = await getDocs(q);
      if (!snap.empty) {
        docId = snap.docs[0].id;
      }
    }

    if (!docId) {
      docId = crypto.randomUUID ? crypto.randomUUID() : `com_${Date.now()}`;
    }

    const docRef = doc(db, COLLECTIONS.commodities, docId);
    await setDoc(docRef, {
      id: docId,
      no: commodity.no,
      name: commodity.name,
      items: commodity.items,
      totalBahan: (commodity.items || []).length,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });

    return { success: true, docId };
  } catch (error: any) {
    console.error("Gagal simpan komoditas ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function syncCommoditiesToFirestore(commodities: any[]) {
  try {
    await Promise.all(commodities.map(c => saveCommodityToFirestore(c)));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal sync master_komoditas:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 2. STEP 2: MASTER HARGA PASAR (Collection: master_harga_pasar)
// -------------------------------------------------------------
export async function fetchPricesFromFirestore() {
  try {
    const colRef = collection(db, COLLECTIONS.prices);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      items.sort((a: any, b: any) => (a.no || 0) - (b.no || 0));
      return { success: true, data: items };
    }
    return { success: false, message: "Koleksi kosong" };
  } catch (error: any) {
    console.warn("Gagal load master_harga_pasar:", error);
    return { success: false, error: error.message };
  }
}

export async function savePriceToFirestore(price: any) {
  try {
    let docId = price.id;
    if (!docId) {
      const colRef = collection(db, COLLECTIONS.prices);
      const q = query(colRef, where("no", "==", price.no));
      const snap = await getDocs(q);
      if (!snap.empty) {
        docId = snap.docs[0].id;
      }
    }

    if (!docId) {
      docId = crypto.randomUUID ? crypto.randomUUID() : `price_${Date.now()}`;
    }

    const docRef = doc(db, COLLECTIONS.prices, docId);
    await setDoc(docRef, {
      id: docId,
      no: price.no,
      item: price.item,
      category: price.category,
      price: price.price,
      districts: price.districts || "18 Kecamatan",
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });

    return { success: true, docId };
  } catch (error: any) {
    console.error("Gagal simpan harga ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function syncPricesToFirestore(prices: any[]) {
  try {
    await Promise.all(prices.map(p => savePriceToFirestore(p)));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal sync master_harga_pasar:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 3. STEP 3: MASTER MENU MAKANAN (Collection: master_menu_makanan)
// -------------------------------------------------------------
export async function fetchRecipesFromFirestore() {
  try {
    const colRef = collection(db, COLLECTIONS.recipes);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      items.sort((a: any, b: any) => (a.no || 0) - (b.no || 0));
      return { success: true, data: items };
    }
    return { success: false, message: "Koleksi kosong" };
  } catch (error: any) {
    console.warn("Gagal load master_menu_makanan:", error);
    return { success: false, error: error.message };
  }
}

export async function saveRecipeToFirestore(recipe: any) {
  try {
    let docId = recipe.id;
    if (!docId) {
      const colRef = collection(db, COLLECTIONS.recipes);
      const q = query(colRef, where("no", "==", recipe.no));
      const snap = await getDocs(q);
      if (!snap.empty) {
        docId = snap.docs[0].id;
      }
    }

    if (!docId) {
      docId = crypto.randomUUID ? crypto.randomUUID() : `menu_${Date.now()}`;
    }

    const docRef = doc(db, COLLECTIONS.recipes, docId);
    await setDoc(docRef, {
      id: docId,
      no: recipe.no,
      name: recipe.name,
      targetGroup: recipe.targetGroup,
      composition: recipe.composition,
      nutritionTarget: recipe.nutritionTarget,
      source: recipe.source || "Standar Menu BGN RI",
      link: recipe.link || "https://badangizi.go.id",
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });

    return { success: true, docId };
  } catch (error: any) {
    console.error("Gagal simpan menu ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function syncRecipesToFirestore(recipes: any[]) {
  try {
    await Promise.all(recipes.map(r => saveRecipeToFirestore(r)));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal sync master_menu_makanan:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 4. STEP 4: MASTER NILAI GIZI (Collection: master_nilai_gizi)
// -------------------------------------------------------------
export async function fetchNutritionFromFirestore() {
  try {
    const colRef = collection(db, COLLECTIONS.nutrition);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      items.sort((a: any, b: any) => (a.no || 0) - (b.no || 0));
      return { success: true, data: items };
    }
    return { success: false, message: "Koleksi kosong" };
  } catch (error: any) {
    console.warn("Gagal load master_nilai_gizi:", error);
    return { success: false, error: error.message };
  }
}

export async function saveNutritionToFirestore(nutrition: any) {
  try {
    let docId = nutrition.id;
    if (!docId) {
      const colRef = collection(db, COLLECTIONS.nutrition);
      const q = query(colRef, where("no", "==", nutrition.no));
      const snap = await getDocs(q);
      if (!snap.empty) {
        docId = snap.docs[0].id;
      }
    }

    if (!docId) {
      docId = crypto.randomUUID ? crypto.randomUUID() : `gizi_${Date.now()}`;
    }

    const docRef = doc(db, COLLECTIONS.nutrition, docId);
    await setDoc(docRef, {
      id: docId,
      no: nutrition.no,
      code: nutrition.code || "-",
      name: nutrition.name || "-",
      category: nutrition.category || "Pangan Lainnya",
      state: nutrition.state || "Mentah",
      water: Number(nutrition.water ?? 0),
      calories: Number(nutrition.calories ?? 0),
      protein: Number(nutrition.protein ?? 0),
      fat: Number(nutrition.fat ?? 0),
      carbs: Number(nutrition.carbs ?? 0),
      fiber: Number(nutrition.fiber ?? 0),
      ash: Number(nutrition.ash ?? 0),
      calcium: Number(nutrition.calcium ?? 0),
      phosphorus: Number(nutrition.phosphorus ?? 0),
      iron: Number(nutrition.iron ?? 0),
      sodium: Number(nutrition.sodium ?? 0),
      potassium: Number(nutrition.potassium ?? 0),
      copper: Number(nutrition.copper ?? 0),
      zinc: Number(nutrition.zinc ?? 0),
      retinol: Number(nutrition.retinol ?? 0),
      bCarotene: Number(nutrition.bCarotene ?? 0),
      totalCarotene: Number(nutrition.totalCarotene ?? 0),
      thiamin: Number(nutrition.thiamin ?? 0),
      riboflavin: Number(nutrition.riboflavin ?? 0),
      niacin: Number(nutrition.niacin ?? 0),
      vitaminC: Number(nutrition.vitaminC ?? 0),
      bdd: Number(nutrition.bdd ?? 100),
      source: nutrition.source || "TKPI 2019 Kemenkes RI",
      link: nutrition.link || "https://www.panganku.org",
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });

    return { success: true, docId };
  } catch (error: any) {
    console.error("Gagal simpan nilai gizi ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function syncNutritionToFirestore(nutrition: any[]) {
  try {
    await Promise.all(nutrition.map(n => saveNutritionToFirestore(n)));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal sync master_nilai_gizi:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 5. STEP 5: MASTER WILAYAH & SASARAN SISWA (Collection: master_wilayah)
// -------------------------------------------------------------
export async function fetchDistrictsFromFirestore() {
  try {
    const colRef = collection(db, COLLECTIONS.districts);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      items.sort((a: any, b: any) => (a.no || 0) - (b.no || 0));
      return { success: true, data: items };
    }
    return { success: false, message: "Koleksi master_wilayah kosong" };
  } catch (error: any) {
    console.warn("Gagal load master_wilayah:", error);
    return { success: false, error: error.message };
  }
}

export async function saveDistrictToFirestore(district: any) {
  try {
    const docId = district.id || district.name?.toLowerCase().replace(/\s+/g, "_") || `dist_${Date.now()}`;
    const docRef = doc(db, COLLECTIONS.districts, docId);
    await setDoc(docRef, {
      id: docId,
      no: Number(district.no) || 1,
      name: district.name,
      targetChildren: Number(district.targetChildren) || 0,
      schoolsCount: Number(district.schoolsCount) || 0,
      posyanduCount: Number(district.posyanduCount) || 0,
      stuntingRate: Number(district.stuntingRate) || 0,
      coverageMBG: Number(district.coverageMBG) || 0,
      localCommodity: district.localCommodity || "",
      deficiencyFocus: district.deficiencyFocus || "",
      riskLevel: district.riskLevel || "Sedang",
      monthlyBudget: Number(district.monthlyBudget) || 0,
      lat: Number(district.lat) || 0,
      lng: Number(district.lng) || 0,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });
    return { success: true, docId };
  } catch (error: any) {
    console.error("Gagal simpan master_wilayah ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function syncDistrictsToFirestore(districts: any[]) {
  try {
    await Promise.all(districts.map(d => saveDistrictToFirestore(d)));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal sync master_wilayah:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 6. DELETE OPERATION
// -------------------------------------------------------------
export async function deleteDocumentFromFirestore(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error(`Gagal menghapus dokumen ${collectionName}/${docId}:`, error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. FETCH ALL 5 TOP-LEVEL COLLECTIONS AT ONCE
// -------------------------------------------------------------
export async function loadMasterDataFromFirestore() {
  try {
    const [comRes, priceRes, recRes, nutRes, distRes] = await Promise.all([
      fetchCommoditiesFromFirestore(),
      fetchPricesFromFirestore(),
      fetchRecipesFromFirestore(),
      fetchNutritionFromFirestore(),
      fetchDistrictsFromFirestore()
    ]);

    return {
      success: true,
      commodities: (comRes.success && Array.isArray(comRes.data) && comRes.data.length > 0 ? comRes.data : null) as any[] | null,
      prices: (priceRes.success && Array.isArray(priceRes.data) && priceRes.data.length > 0 ? priceRes.data : null) as any[] | null,
      recipes: (recRes.success && Array.isArray(recRes.data) && recRes.data.length > 0 ? recRes.data : null) as any[] | null,
      nutrition: (nutRes.success && Array.isArray(nutRes.data) && nutRes.data.length > 0 ? nutRes.data : null) as any[] | null,
      districts: (distRes.success && Array.isArray(distRes.data) && distRes.data.length > 0 ? distRes.data : null) as any[] | null,
    };
  } catch (error: any) {
    console.warn("Gagal load seluruh master koleksi Firestore:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 8. SAVE ALL 5 TOP-LEVEL COLLECTIONS AT ONCE
// -------------------------------------------------------------
export async function saveAllMasterDataToFirestore(dataset: {
  commodities: any[];
  prices: any[];
  recipes: any[];
  nutrition: any[];
  districts?: any[];
}) {
  try {
    const promises = [
      syncCommoditiesToFirestore(dataset.commodities),
      syncPricesToFirestore(dataset.prices),
      syncRecipesToFirestore(dataset.recipes),
      syncNutritionToFirestore(dataset.nutrition)
    ];
    if (dataset.districts && dataset.districts.length > 0) {
      promises.push(syncDistrictsToFirestore(dataset.districts));
    }
    await Promise.all(promises);
    return { success: true };
  } catch (error: any) {
    console.error("Gagal simpan seluruh koleksi ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 8. MBG MENU PLAN PERSISTENCE (Collection: mbg_menu_plans)
// -------------------------------------------------------------
export async function saveMenuPlanToFirestore(districtId: string, period: string, planData: any) {
  try {
    const planDocId = `${districtId}_${period}`;
    const docRef = doc(db, "mbg_menu_plans", planDocId);
    await setDoc(docRef, {
      id: planDocId,
      districtId,
      period,
      includeSaturday: !!planData.includeSaturday,
      monthlyWeeks: planData.monthlyWeeks,
      budgetSummary: planData.budgetSummary || null,
      logisticsBOM: planData.logisticsBOM || [],
      availableGeneratedRecipes: planData.availableGeneratedRecipes || [],
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });

    return { success: true, docId: planDocId };
  } catch (error: any) {
    console.error("Gagal simpan rancangan menu MBG ke Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchMenuPlanFromFirestore(districtId: string, period: string) {
  try {
    const planDocId = `${districtId}_${period}`;
    const docRef = doc(db, "mbg_menu_plans", planDocId);
    const colRef = collection(db, "mbg_menu_plans");
    const q = query(colRef, where("id", "==", planDocId));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      return { success: true, data };
    }
    return { success: false, message: "Belum ada rancangan menu tersimpan" };
  } catch (error: any) {
    console.warn("Gagal fetch rancangan menu MBG dari Firestore:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMenuPlanFromFirestore(districtId: string, period: string) {
  try {
    const planDocId = `${districtId}_${period}`;
    const docRef = doc(db, "mbg_menu_plans", planDocId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error("Gagal hapus rancangan menu MBG dari Firestore:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 9. NOTIFICATIONS (Collection: gscan_notifications)
// -------------------------------------------------------------
export interface FirestoreNotification {
  id: string;
  title: string;
  description: string;
  category: "master" | "generate" | "screening" | "system" | "settings";
  isRead: boolean;
  createdAt?: any;
  createdAtIso?: string;
}

export async function addNotification(notif: Omit<FirestoreNotification, "id" | "isRead" | "createdAt" | "createdAtIso">) {
  try {
    const docId = `notif_${Date.now()}`;
    const docRef = doc(db, "gscan_notifications", docId);
    await setDoc(docRef, {
      id: docId,
      ...notif,
      isRead: false,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
    return { success: true, docId };
  } catch (error: any) {
    console.error("Gagal simpan notifikasi:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchNotifications() {
  try {
    const colRef = collection(db, "gscan_notifications");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => {
        const data = d.data() as any;
        const desc = (data.description || "").replace(/Dr\.\s*Hendra\s*Pratama/gi, "Nizam Setiawan");
        return {
          id: d.id,
          ...data,
          description: desc,
        } as FirestoreNotification;
      });
      items.sort((a: any, b: any) => {
        const ta = a.createdAtIso || "";
        const tb = b.createdAtIso || "";
        return tb.localeCompare(ta);
      });
      return { success: true, data: items };
    }
    return { success: true, data: [] };
  } catch (error: any) {
    console.warn("Gagal load gscan_notifications:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function markNotificationRead(docId: string) {
  try {
    const docRef = doc(db, "gscan_notifications", docId);
    await setDoc(docRef, { isRead: true }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsRead() {
  try {
    const colRef = collection(db, "gscan_notifications");
    const snap = await getDocs(colRef);
    await Promise.all(snap.docs.map(d => setDoc(d.ref, { isRead: true }, { merge: true })));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteNotification(docId: string) {
  try {
    const docRef = doc(db, "gscan_notifications", docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 10. SETTINGS (Collection: gscan_settings)
// -------------------------------------------------------------
export interface GScanSettings {
  defaultCycleDays: 5 | 6;
  paguPerPorsi: number;
  adminId: string;
  authPin?: string;
  // Firebase config
  firebaseApiKey?: string;
  firebaseProjectId?: string;
  firebaseAuthDomain?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  firebaseMeasurementId?: string;
  // Gemini
  geminiApiKey?: string;
  updatedAt?: any;
  updatedAtIso?: string;
}

export async function fetchSettings() {
  try {
    const colRef = collection(db, "gscan_settings");
    const q = query(colRef, where("__name__", "==", "app_config"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { success: true, data: snap.docs[0].data() as GScanSettings };
    }
    return { success: true, data: null };
  } catch (error: any) {
    console.warn("Gagal load gscan_settings:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function saveSettings(settings: Partial<GScanSettings>) {
  try {
    const docRef = doc(db, "gscan_settings", "app_config");
    await setDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Gagal simpan gscan_settings:", error);
    return { success: false, error: error.message };
  }
}

// Seed initial credentials to Firestore (run once)
export async function seedCredentialsToFirestore() {
  try {
    const docRef = doc(db, "gscan_settings", "app_config");
    const snap = await getDocs(query(collection(db, "gscan_settings"), where("__name__", "==", "app_config")));

    const existingData = !snap.empty ? snap.docs[0].data() : {};

    // Always ensure authPin, firebase keys, and settings are present in Firestore
    await setDoc(docRef, {
      defaultCycleDays: existingData.defaultCycleDays || 6,
      paguPerPorsi: existingData.paguPerPorsi || 15000,
      adminId: existingData.adminId || "admin-dinkes",
      authPin: existingData.authPin || "69hagh0d",
      instansi: "ginofest 2026",
      firebaseApiKey: existingData.firebaseApiKey || "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY",
      firebaseProjectId: existingData.firebaseProjectId || "ginofest-2026",
      firebaseAuthDomain: existingData.firebaseAuthDomain || "ginofest-2026.firebaseapp.com",
      firebaseStorageBucket: existingData.firebaseStorageBucket || "ginofest-2026.firebasestorage.app",
      firebaseMessagingSenderId: existingData.firebaseMessagingSenderId || "19574959170",
      firebaseAppId: existingData.firebaseAppId || "1:19574959170:web:ca37e18784de2eeb3511db",
      firebaseMeasurementId: existingData.firebaseMeasurementId || "G-KKJMJ66N8Q",
      geminiApiKey: existingData.geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    }, { merge: true });

    return { success: true, seeded: true };
  } catch (error: any) {
    console.error("Gagal seed credentials:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 11. HELP CHAT Q&A (Collection: gscan_help_qa)
// -------------------------------------------------------------
export interface HelpQA {
  id: string;
  command: string;
  question: string;
  answer: string;
  category: string;
}

export const INITIAL_HELP_QA_SEED: Omit<HelpQA, "id">[] = [
  // 1. Perencana Menu & Anggaran
  { command: "/menu", question: "Bagaimana cara generate menu MBG otomatis?", answer: "Klik menu \"Generate Menu\" di sidebar → pilih kecamatan & bulan target → tekan tombol \"Generate Menu AI\". Sistem akan merancang jadwal menu mingguan otomatis berbasis komoditas lokal dan pagu Rp 15.000. Hasil otomatis tersimpan ke Firestore.", category: "Perencana Menu" },
  { command: "/generate", question: "Langkah-langkah lengkap generate menu MBG AI", answer: "1. Buka halaman Generate Menu\n2. Pilih Kecamatan (misal: Manyar / Kebomas)\n3. Pilih Bulan (Agustus 2026 s/d Juli 2027)\n4. Tentukan siklus (5 atau 6 hari kerja)\n5. Klik 'Generate Menu AI'\n6. AI merancang menu 4 minggu + tabel BOM otomatis.", category: "Perencana Menu" },
  { command: "/bom", question: "Bagaimana cara melihat & download laporan kebutuhan bahan pokok (BOM)?", answer: "Setelah menu di-generate, klik tombol biru \"Laporan Kebutuhan Bahan Pokok\" di bawah jadwal menu. Akan muncul dialog modal berisi rincian tonase bahan pangan dan total anggaran. Klik tombol \"Download Excel (.XLS)\" untuk mengunduh laporan berformat resmi.", category: "Perencana Menu" },
  { command: "/tahunan", question: "Bagaimana cara kerja Kalender Tahunan MBG?", answer: "Di halaman Generate Menu, klik tab \"Tahunan\" di bagian atas. Anda akan melihat kalender 12 bulan (Agustus 2026 – Juli 2027). Setiap bulan memiliki status 'Sudah Dibuat' atau 'Belum Dibuat'. Klik 'Buka Rencana Menu →' untuk mengedit bulan tertentu.", category: "Perencana Menu" },
  { command: "/mingguan", question: "Bagaimana cara navigasi minggu 1 sampai minggu 4?", answer: "Pada tampilan bulanan perencana menu, klik tab Minggu 1, Minggu 2, Minggu 3, atau Minggu 4 di atas tabel. Setiap minggu menampilkan jadwal hari Senin s/d Jumat/Sabtu dengan komposisi gizi dan estimasi biaya per porsi.", category: "Perencana Menu" },
  { command: "/pagu", question: "Berapa standar pagu resmi MBG per porsi?", answer: "Pagu resmi Badan Gizi Nasional (BGN) RI Tahun 2026 adalah Rp 15.000 / porsi / anak / hari kerja. Angka ini digunakan sebagai batas maksimal kalkulasi biaya bahan pangan dan operasional dapur MBG.", category: "Anggaran" },
  { command: "/siklus", question: "Apa perbedaan siklus 5 hari vs 6 hari kerja?", answer: "• Siklus 5 Hari: Senin – Jumat (sekitar 20–22 hari kerja/bulan).\n• Siklus 6 Hari: Senin – Sabtu (sekitar 24–26 hari kerja/bulan).\nPilihan siklus mempengaruhi total hari makan anak dan kalkulasi total tonase bahan pangan di laporan BOM.", category: "Anggaran" },

  // 2. Basis Data RAG
  { command: "/rag", question: "Apa itu Basis Data RAG dan bagaimana cara kerjanya?", answer: "Basis Data RAG (Retrieval-Augmented Generation) adalah repositori 5 master dataset pangan resmi: Komoditas, Harga Pasar SISKAPERBAPO, Menu Standar MBG, Nilai Gizi TKPI 2019, dan Data 18 Wilayah. Data ini menjadi acuan grounding fakta bagi AI untuk merancang menu MBG yang presisi, kaya gizi lokal, dan hemat anggaran.", category: "Basis Data RAG" },
  { command: "/rag_auth", question: "Bagaimana cara verifikasi PIN untuk membuka Basis Data RAG?", answer: "1. Buka menu 'Basis Data RAG' di sidebar.\n2. Masukkan 8 digit PIN otorisasi administrator (default: 69hagh0d).\n3. Kotak PIN akan otomatis memverifikasi dan membuka tabel master data.", category: "Basis Data RAG" },
  { command: "/rag_komoditas", question: "Bagaimana cara mengelola Master Komoditas Pangan Lokal?", answer: "Pilih tab 'Komoditas' di RAG → Anda dapat melihat potensi pangan per kecamatan (seperti Bandeng Manyar, Kupang Sidayu, Kelor Panceng). Klik tombol edit di baris data untuk menambah atau mengubah komoditas unggulan.", category: "Basis Data RAG" },
  { command: "/rag_harga", question: "Bagaimana cara mengelola & update Master Harga Pasar?", answer: "Pilih tab 'Harga Pasar' di RAG. Tabel menampilkan harga eceran/grosir per satuan kg/butir/ikat. Anda dapat mengubah harga secara manual dengan klik tombol Edit atau menggunakan tombol 'Kalibrasi Harga Otomatis'.", category: "Basis Data RAG" },
  { command: "/rag_kalibrasi", question: "Bagaimana cara kerja fitur Kalibrasi Harga Otomatis?", answer: "Di tab Harga Pasar RAG, klik tombol 'Kalibrasi Harga Otomatis'. Sistem akan melakukan kalibrasi estimasi harga terkini berdasarkan inflasi dan data pasar rakyat Jawa Timur, lalu menyimpannya ke Firestore.", category: "Basis Data RAG" },
  { command: "/rag_menu", question: "Bagaimana cara mengelola Master Menu Standar MBG?", answer: "Pilih tab 'Menu Standar' di RAG. Setiap menu terverifikasi memiliki komposisi 5 Bintang (Karbohidrat, Protein Hewani, Nabati, Sayur, Buah), target sasaran, dan estimasi biaya. Anda bisa menambah menu baru atau merevisi gramasi bahan.", category: "Basis Data RAG" },
  { command: "/rag_gizi", question: "Bagaimana cara mengelola Master Nilai Gizi Pangan TKPI?", answer: "Pilih tab 'Nilai Gizi' di RAG. Memuat database gizi lengkap TKPI 2019 (Kalori, Protein, Lemak, Karbohidrat, Kalsium, Zat Besi Fe, Vitamin C, Zinc). Digunakan AI untuk menghitung kecukupan AKG harian siswa.", category: "Basis Data RAG" },
  { command: "/rag_wilayah", question: "Bagaimana cara mengelola Data 18 Kecamatan & Sasaran Siswa?", answer: "Pilih tab 'Data Wilayah' di RAG. Anda dapat melihat dan memperbarui jumlah sasaran siswa MBG, jumlah sekolah, target porsi per hari, dan prevalensi stunting (%) tiap kecamatan di Gresik.", category: "Basis Data RAG" },
  { command: "/rag_upload", question: "Bagaimana cara upload file Excel ke Basis Data RAG?", answer: "1. Buka tab dataset yang ingin di-update di halaman RAG.\n2. Klik tombol 'Upload Excel'.\n3. Pilih file spreadsheet (.xlsx/.xls).\n4. Sistem memvalidasi kolom dan langsung menyinkronkan data baru ke Cloud Firestore.", category: "Basis Data RAG" },
  { command: "/rag_template", question: "Format file Excel apa yang didukung untuk import RAG?", answer: "Gunakan format Excel standar (.xlsx atau .xls) dengan header kolom sesuai dataset:\n• Komoditas: No, Kecamatan, Komoditas Pangan\n• Harga: No, Nama Bahan, Kategori, Harga Satuan\n• Menu: No, Nama Menu, Kelompok Sasaran, Komposisi\n• Gizi: No, Kode, Nama Bahan, Kalori, Protein, Lemak, Fe", category: "Basis Data RAG" },
  { command: "/rag_tambah", question: "Bagaimana cara menambah baris data master baru secara manual?", answer: "Di setiap tab dataset RAG, klik tombol '+ Tambah Data'. Lengkapi formulir pop-up yang muncul, lalu tekan 'Simpan ke Firestore'. Data baru langsung aktif dan digunakan oleh AI Generator.", category: "Basis Data RAG" },
  { command: "/rag_edit", question: "Bagaimana cara mengedit data master langsung di tabel?", answer: "Pada tabel RAG, klik ikon pensil (Edit) di ujung kanan baris data yang ingin diubah. Perbarui nilainya pada modal edit, lalu tekan 'Simpan Perubahan'.", category: "Basis Data RAG" },
  { command: "/rag_hapus", question: "Bagaimana cara menghapus data master dari RAG?", answer: "Klik ikon tempat sampah (Hapus) pada baris data di tabel RAG → konfirmasi penghapusan. Data akan terhapus dari Cloud Firestore secara permanen.", category: "Basis Data RAG" },
  { command: "/rag_search", question: "Bagaimana cara mencari & memfilter data di Basis Data RAG?", answer: "Gunakan kotak pencarian 'Cari komoditas/bahan/kecamatan...' di atas tabel RAG. Anda juga dapat memfilter berdasarkan kategori bahan pangan atau nama kecamatan untuk mempercepat pencarian.", category: "Basis Data RAG" },
  { command: "/rag_export", question: "Bagaimana cara ekspor dataset master ke file Excel?", answer: "Di halaman Basis Data RAG, klik tombol 'Download Excel / Ekspor'. Seluruh tabel master data yang sedang dibuka akan otomatis diunduh dalam format file .XLS resmi.", category: "Basis Data RAG" },
  { command: "/rag_grounding", question: "Bagaimana AI Gemini menggunakan RAG untuk menyusun menu?", answer: "Saat tombol 'Generate Menu AI' ditekan, sistem mengambil (Retrieve) data komoditas lokal dan harga pasar dari RAG, lalu menggabungkannya (Augment) ke dalam prompt AI Gemini. Hasilnya (Generate) berupa menu yang sesuai anggaran Rp 15.000 dan kaya gizi lokal.", category: "Basis Data RAG" },

  // 3. Skrining & Peta
  { command: "/scan", question: "Bagaimana cara menggunakan fitur Scan QR Code?", answer: "Klik 'Scan QR Code' di sidebar → lengkapi data anak (Nama, Kecamatan, Usia, TB, BB) → klik 'Mulai Analisis AI'. Sistem akan menghitung Z-Score WHO dan menyajikan rekomendasi bahan pangan lokal serta rujukan Posyandu.", category: "Skrining" },
  { command: "/zscore", question: "Bagaimana AI menghitung Z-Score antropometri?", answer: "AI mencocokkan Tinggi Badan (TB) dan Berat Badan (BB) terhadap standar baku WHO Multicentre Growth Reference Study berdasarkan usia (bulan). Z-Score < -2 SD diklasifikasikan sebagai indikasi stunting yang membutuhkan intervensi gizi segera.", category: "Skrining" },
  { command: "/peta", question: "Bagaimana cara membaca Peta Prevalensi?", answer: "Buka menu 'Peta Prevalensi'. Peta menampilkan 18 kecamatan dengan indikator risiko warna: Hijau (Risiko Rendah < 10%), Kuning (Risiko Sedang 10-20%), dan Merah (Risiko Tinggi > 20%). Klik kecamatan untuk melihat detail sasaran siswa MBG.", category: "Peta" },
  { command: "/stunting", question: "Apa strategi penanganan stunting di Kcal?", answer: "Kcal memadukan penapisan fisik anak (Scan QR Code) dengan intervensi menu makanan MBG berbasis komoditas kaya mikronutrien lokal (misal: Kupang Sidayu kaya Fe 15.6mg, Ikan Bandeng kaya Omega-3, Kelor kaya kalsium).", category: "Gizi & Stunting" },
  { command: "/ekspor", question: "Format file apa yang didukung untuk ekspor laporan?", answer: "Laporan kebutuhan logistik bahan pokok (BOM) diekspor dalam format Excel Spreadsheet (.XLS) lengkap dengan kop dokumen resmi, ringkasan pagu anggaran, dan rincian tonase belanja komoditas pasar.", category: "Ekspor" },

  // 4. Pengaduan & Layanan
  { command: "/komplain", question: "Kirim keluhan, masukan, atau kendala sistem", answer: "Silakan ketikkan keluhan atau kendala Anda. Laporan akan otomatis tersimpan ke Cloud Firestore dan diteruskan langsung ke kontak pengelola (takathasan82@gmail.com).", category: "Layanan Pengaduan" },

  // 5. Sistem & Pengaturan
  { command: "/notif", question: "Bagaimana cara kerja Pusat Notifikasi?", answer: "Setiap aktivitas (upload master data, generate menu, update settings, skrining anak) otomatis dicatat ke Cloud Firestore (koleksi gscan_notifications). Klik notifikasi untuk melihat rincian tanggal, jam, dan admin eksekutor.", category: "Sistem" },
  { command: "/pengaturan", question: "Apa saja yang dapat dikonfigurasi di Pengaturan?", answer: "Di menu Pengaturan Anda dapat: melihat profil admin aktif, mengatur siklus hari kerja (5/6 hari), membuka & mengedit API Keys (Gemini & Firebase), mengganti PIN otorisasi, dan melihat info perangkat/sistem.", category: "Pengaturan" },
  { command: "/pin", question: "Bagaimana cara verifikasi & ganti PIN akses administrator?", answer: "PIN otorisasi administrator terdiri dari 8 karakter (default: 69hagh0d). Masukkan PIN pada dialog segmented 8-kotak untuk membuka kunci kredensial. Untuk mengubah PIN, gunakan form 'Keamanan & Ubah PIN Akses' di halaman Pengaturan.", category: "Keamanan" },
  { command: "/admin", question: "Bagaimana cara ganti akun administrator wilayah?", answer: "Buka halaman Pengaturan → pada bagian 'Administrator Aktif', klik tombol 'Ganti Akun' → pilih akun administrator (1 Akun Kabupaten, 6 Akun Kecamatan). Data dashboard akan menyesuaikan wilayah yang dipilih.", category: "Sistem" },
  { command: "/firestore", question: "Apa saja 9 koleksi Cloud Firestore yang aktif?", answer: "1. master_komoditas\n2. master_harga_pasar\n3. master_menu_makanan\n4. master_nilai_gizi\n5. master_wilayah\n6. mbg_menu_plans\n7. gscan_notifications\n8. gscan_settings\n9. gscan_help_qa", category: "Basis Data" },
  { command: "/device", question: "Informasi perangkat apa yang dideteksi oleh sistem?", answer: "Sistem mendeteksi: jenis browser, sistem operasi, resolusi layar (DPR), bahasa browser, timezone (WIB), jumlah inti CPU (cores), kapasitas RAM memori perangkat, status koneksi internet, dan User Agent.", category: "Sistem" },
  { command: "/bantuan", question: "Bagaimana cara bertanya ke Asisten AI Gemini di sini?", answer: "Ketik langsung pertanyaan apa saja di kolom chat bawah (tanpa tanda '/'). Asisten AI Gemini akan menjelaskan seluruh fitur, tata cara penggunaan, kalkulasi gizi, maupun kebijakan program MBG di Kabupaten Gresik.", category: "Asisten AI" },
  { command: "/kontak", question: "Kontak helpdesk dan dukungan teknis Kcal", answer: "Dinas Kesehatan Kabupaten Gresik — Tim Teknis Inovasi MBG & Stunting (GinoFest 2026)\n• Alamat: Jl. Dr. Wahidin Sudirohusodo No. 245, Gresik\n• Email: takathasan82@gmail.com\n• Layanan: Senin – Jumat (08:00 – 16:00 WIB)", category: "Dukungan" },
  { command: "/faq", question: "Daftar topik bantuan yang sering ditanyakan", answer: "Gunakan perintah cepat berikut:\n• /menu - Generate Menu MBG\n• /bom - Laporan Kebutuhan Bahan Pokok\n• /rag - Basis Data 5 Master Pangan\n• /scan - Scan QR Code Skrining Anak\n• /pin - Keamanan & Kode Akses 8 Digit\n• /pagu - Standar Anggaran BGN Rp 15.000\n• /komplain - Layanan Pengaduan & Keluhan Sistem", category: "Bantuan" },
];

export async function seedHelpQA(items: Omit<HelpQA, "id">[]) {
  try {
    await Promise.all(items.map((item) => {
      const docId = `cmd_${item.command.replace("/", "")}`;
      const docRef = doc(db, "gscan_help_qa", docId);
      return setDoc(docRef, { id: docId, ...item }, { merge: true });
    }));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal seed gscan_help_qa:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchHelpQA() {
  try {
    const colRef = collection(db, "gscan_help_qa");
    let snap = await getDocs(colRef);

    // Check if /komplain exists in docs, if not reseed
    const hasKomplain = !snap.empty && snap.docs.some(d => d.data()?.command === "/komplain");

    if (snap.empty || !hasKomplain || snap.docs.length < INITIAL_HELP_QA_SEED.length) {
      await seedHelpQA(INITIAL_HELP_QA_SEED);
      snap = await getDocs(colRef);
    }

    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpQA));

      // Deduplicate strictly by command key
      const uniqueMap = new Map<string, HelpQA>();
      for (const item of items) {
        if (item.command && !uniqueMap.has(item.command)) {
          uniqueMap.set(item.command, item);
        }
      }

      const deduplicated = Array.from(uniqueMap.values());
      deduplicated.sort((a: any, b: any) => (a.command || "").localeCompare(b.command || ""));
      return { success: true, data: deduplicated };
    }
    return { success: true, data: [] };
  } catch (error: any) {
    console.warn("Gagal load gscan_help_qa:", error);
    return { success: false, data: [], error: error.message };
  }
}

// -------------------------------------------------------------
// 12. HELP CHAT HISTORY (Collection: gscan_help_history)
// -------------------------------------------------------------
export interface HelpChatMessage {
  id?: string;
  sender: "user" | "bot";
  text: string;
  isAiGenerated?: boolean;
  timestamp?: any;
  createdAtIso?: string;
}

export async function saveHelpChatMessage(msg: Omit<HelpChatMessage, "id">) {
  try {
    const colRef = collection(db, "gscan_help_history");
    const docRef = await addDoc(colRef, {
      ...msg,
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
    return { success: true, docId: docRef.id };
  } catch (error: any) {
    console.error("Gagal simpan help chat message:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchHelpChatHistory() {
  try {
    const colRef = collection(db, "gscan_help_history");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpChatMessage));
      items.sort((a, b) => {
        const ta = a.createdAtIso || "";
        const tb = b.createdAtIso || "";
        return ta.localeCompare(tb);
      });
      return { success: true, data: items };
    }
    return { success: true, data: [] };
  } catch (error: any) {
    console.warn("Gagal load gscan_help_history:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function clearHelpChatHistory() {
  try {
    const colRef = collection(db, "gscan_help_history");
    const snap = await getDocs(colRef);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal hapus gscan_help_history:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 13. COMPLAINTS & FEEDBACK (Collection: gscan_complaints)
// -------------------------------------------------------------
export interface ComplaintRecord {
  id?: string;
  senderName: string;
  senderContact?: string;
  category: string;
  message: string;
  district?: string;
  status?: "baru" | "proses" | "selesai";
  responseNotes?: string;
  createdAtIso?: string;
  timestamp?: any;
}

export async function saveComplaintToFirestore(complaint: Omit<ComplaintRecord, "id">) {
  try {
    const colRef = collection(db, "gscan_complaints");
    const docRef = await addDoc(colRef, {
      ...complaint,
      status: complaint.status || "baru",
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
    return { success: true, docId: docRef.id };
  } catch (error: any) {
    console.error("Gagal simpan komplain:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchComplaintsFromFirestore(): Promise<{ success: boolean; data: ComplaintRecord[] }> {
  try {
    const colRef = collection(db, "gscan_complaints");
    const q = query(colRef, orderBy("createdAtIso", "desc"));
    const snap = await getDocs(q);
    const data: ComplaintRecord[] = [];
    snap.forEach((docSnap) => {
      data.push({ id: docSnap.id, ...docSnap.data() } as ComplaintRecord);
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Gagal ambil komplain:", error);
    // Fallback without orderBy if index not ready
    try {
      const colRef2 = collection(db, "gscan_complaints");
      const snap2 = await getDocs(colRef2);
      const data2: ComplaintRecord[] = [];
      snap2.forEach((docSnap) => {
        data2.push({ id: docSnap.id, ...docSnap.data() } as ComplaintRecord);
      });
      return { success: true, data: data2 };
    } catch {
      return { success: false, data: [] };
    }
  }
}

export async function updateComplaintStatusInFirestore(
  complaintId: string,
  status: "baru" | "proses" | "selesai",
  responseNotes?: string
): Promise<{ success: boolean }> {
  try {
    const docRef = doc(db, "gscan_complaints", complaintId);
    await setDoc(docRef, { status, ...(responseNotes ? { responseNotes } : {}) }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error("Gagal update status komplain:", error);
    return { success: false };
  }
}

// -------------------------------------------------------------
// 10. STEP 10: CITIZEN AUTH & PROFILE SYNC (Collection: kcal_masyarakat)
// -------------------------------------------------------------
export interface CitizenAccountRecord {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  district: string;
  password?: string;
  role: "masyarakat";
  avatarBg?: string;
  createdAtIso: string;
}

export async function registerCitizenToFirestore(account: Omit<CitizenAccountRecord, "id">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const colRef = collection(db, "kcal_masyarakat");
    const cleanEmail = account.email.trim().toLowerCase();
    
    // Check if email already registered
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { success: false, error: "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain." };
    }

    const docRef = await addDoc(colRef, {
      ...account,
      email: cleanEmail,
      createdAtIso: new Date().toISOString(),
      role: "masyarakat",
    });

    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error("Error registering citizen to Firestore:", err);
    return { success: false, error: err.message || "Gagal mendaftarkan akun ke Cloud Firestore" };
  }
}

export async function loginCitizenFromFirestore(
  email: string,
  password?: string,
  district?: string
): Promise<{ success: boolean; user?: { id: string; name: string; email: string; phone?: string; district: string }; error?: string }> {
  try {
    const colRef = collection(db, "kcal_masyarakat");
    const cleanEmail = email.trim().toLowerCase();
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      // Auto-provision in Firestore if not yet recorded
      const newDoc = await addDoc(colRef, {
        fullName: cleanEmail.split("@")[0].toUpperCase(),
        email: cleanEmail,
        phone: "081234567890",
        district: district || "Kebomas",
        password: password || "password123",
        role: "masyarakat",
        createdAtIso: new Date().toISOString(),
      });
      return {
        success: true,
        user: {
          id: newDoc.id,
          name: cleanEmail.split("@")[0].toUpperCase(),
          email: cleanEmail,
          phone: "081234567890",
          district: district || "Kebomas",
        }
      };
    }

    const userData = snap.docs[0].data();
    if (password && userData.password && userData.password !== password) {
      return { success: false, error: "Kata sandi yang Anda masukkan salah. Silakan coba lagi atau gunakan Lupa Kata Sandi." };
    }

    // Update district if user selected a different one
    if (district && district !== userData.district) {
      await setDoc(doc(db, "kcal_masyarakat", snap.docs[0].id), { district }, { merge: true });
    }

    return {
      success: true,
      user: {
        id: snap.docs[0].id,
        name: userData.fullName || cleanEmail.split("@")[0],
        email: userData.email,
        phone: userData.phone,
        district: district || userData.district || "Kebomas",
      }
    };
  } catch (err: any) {
    console.error("Error login citizen from Firestore:", err);
    // Fallback local session
    return {
      success: true,
      user: {
        id: "local_" + Date.now(),
        name: email.split("@")[0],
        email: email,
        district: district || "Kebomas",
      }
    };
  }
}

export async function signInWithGoogleFirebase(
  district?: string
): Promise<{
  success: boolean;
  user?: { id: string; name: string; email: string; phone?: string; district: string; photoURL?: string };
  error?: string;
}> {
  try {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    // Forces Google to always show the real account selector screen
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;
    const cleanEmail = (googleUser.email || "").toLowerCase();
    const fullName = googleUser.displayName || cleanEmail.split("@")[0] || "Warga Gresik";
    const finalDistrict = district || "Gresik";

    // Sync user data to Cloud Firestore (kcal_masyarakat)
    const colRef = collection(db, "kcal_masyarakat");
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    let docId = googleUser.uid;
    if (snap.empty) {
      const newDoc = await addDoc(colRef, {
        uid: googleUser.uid,
        fullName,
        email: cleanEmail,
        district: finalDistrict,
        authProvider: "google",
        photoURL: googleUser.photoURL || "",
        createdAtIso: new Date().toISOString(),
      });
      docId = newDoc.id;
    } else {
      docId = snap.docs[0].id;
      await setDoc(
        doc(db, "kcal_masyarakat", docId),
        {
          fullName,
          lastLoginIso: new Date().toISOString(),
          photoURL: googleUser.photoURL || "",
          ...(district ? { district } : {}),
        },
        { merge: true }
      );
    }

    return {
      success: true,
      user: {
        id: docId,
        name: fullName,
        email: cleanEmail,
        district: finalDistrict,
        photoURL: googleUser.photoURL || undefined,
      },
    };
  } catch (err: any) {
    console.error("Firebase Google Auth error:", err);
    if (err.code === "auth/popup-closed-by-user") {
      return { success: false, error: "Pemilihan akun Google dibatalkan." };
    }
    if (err.code === "auth/popup-blocked") {
      return { success: false, error: "Popup Google terblokir oleh browser HP Anda." };
    }
    if (err.code === "auth/unauthorized-domain") {
      return { success: false, error: "Domain ini belum diotorisasi di Firebase Console Authentication Settings." };
    }
    return { success: false, error: err.message || "Gagal menghubungkan ke akun Google." };
  }
}

export async function triggerGoogleSignInRedirect(district?: string): Promise<void> {
  const { getAuth, GoogleAuthProvider, signInWithRedirect } = await import("firebase/auth");
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  if (district && typeof window !== "undefined") {
    sessionStorage.setItem("kcal_google_login_district", district);
  }
  await signInWithRedirect(auth, provider);
}

export async function checkGoogleRedirectResult(): Promise<{
  success: boolean;
  user?: { id: string; name: string; email: string; phone?: string; district: string; photoURL?: string };
  error?: string;
} | null> {
  try {
    const { getAuth, getRedirectResult } = await import("firebase/auth");
    const auth = getAuth(app);
    const result = await getRedirectResult(auth);
    if (!result || !result.user) return null;

    const googleUser = result.user;
    const cleanEmail = (googleUser.email || "").toLowerCase();
    const fullName = googleUser.displayName || cleanEmail.split("@")[0] || "Warga Gresik";
    const district = (typeof window !== "undefined" && sessionStorage.getItem("kcal_google_login_district")) || "Gresik";

    // Sync user data to Cloud Firestore (kcal_masyarakat)
    const colRef = collection(db, "kcal_masyarakat");
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    let docId = googleUser.uid;
    if (snap.empty) {
      const newDoc = await addDoc(colRef, {
        uid: googleUser.uid,
        fullName,
        email: cleanEmail,
        district,
        authProvider: "google",
        photoURL: googleUser.photoURL || "",
        createdAtIso: new Date().toISOString(),
      });
      docId = newDoc.id;
    } else {
      docId = snap.docs[0].id;
      await setDoc(
        doc(db, "kcal_masyarakat", docId),
        {
          fullName,
          lastLoginIso: new Date().toISOString(),
          photoURL: googleUser.photoURL || "",
        },
        { merge: true }
      );
    }

    return {
      success: true,
      user: {
        id: docId,
        name: fullName,
        email: cleanEmail,
        district,
        photoURL: googleUser.photoURL || undefined,
      },
    };
  } catch (err: any) {
    console.error("getRedirectResult error:", err);
    return { success: false, error: err.message };
  }
}

export async function resetCitizenPasswordInFirestore(
  email: string,
  newPassword: string,
  district?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const colRef = collection(db, "kcal_masyarakat");
    const cleanEmail = email.trim().toLowerCase();
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "Akun dengan alamat email ini tidak ditemukan di database masyarakat." };
    }

    const targetDoc = snap.docs[0];
    await setDoc(doc(db, "kcal_masyarakat", targetDoc.id), {
      password: newPassword,
      updatedAtIso: new Date().toISOString(),
      ...(district ? { district } : {}),
    }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error("Error resetting citizen password in Firestore:", err);
    return { success: false, error: err.message || "Gagal mengatur ulang kata sandi." };
  }
}


