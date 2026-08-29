import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
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
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreNotification));
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

// -------------------------------------------------------------
// 10. SETTINGS (Collection: gscan_settings)
// -------------------------------------------------------------
export interface GScanSettings {
  defaultCycleDays: 5 | 6;
  paguPerPorsi: number;
  adminId: string;
  updatedAt?: any;
  updatedAtIso?: string;
}

export async function fetchSettings() {
  try {
    const docRef = doc(db, "gscan_settings", "app_config");
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

export async function fetchHelpQA() {
  try {
    const colRef = collection(db, "gscan_help_qa");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpQA));
      items.sort((a: any, b: any) => (a.command || "").localeCompare(b.command || ""));
      return { success: true, data: items };
    }
    return { success: true, data: [] };
  } catch (error: any) {
    console.warn("Gagal load gscan_help_qa:", error);
    return { success: false, data: [], error: error.message };
  }
}

export async function seedHelpQA(items: Omit<HelpQA, "id">[]) {
  try {
    await Promise.all(items.map((item, idx) => {
      const docId = `help_${idx + 1}`;
      const docRef = doc(db, "gscan_help_qa", docId);
      return setDoc(docRef, { id: docId, ...item }, { merge: true });
    }));
    return { success: true };
  } catch (error: any) {
    console.error("Gagal seed gscan_help_qa:", error);
    return { success: false, error: error.message };
  }
}

