import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  type QuerySnapshot,
  type DocumentData
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
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

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
  category: "master" | "generate" | "screening" | "system" | "settings" | "user" | "mbg" | "complaint" | "claim";
  isRead: boolean;
  userEmail?: string;
  readBy?: string[];
  createdAt?: any;
  createdAtIso?: string;
}

export async function addNotification(notif: Omit<FirestoreNotification, "id" | "isRead" | "createdAt" | "createdAtIso"> & { userEmail?: string }) {
  try {
    const docId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const docRef = doc(db, "gscan_notifications", docId);
    await setDoc(docRef, {
      id: docId,
      userEmail: notif.userEmail || "all",
      readBy: [],
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

function sanitizeNotificationFields(title: string = "", description: string = "") {
  let cleanTitle = (title || "")
    .replace(/Dr\.\s*Hendra\s*Pratama/gi, "Nizam Setiawan")
    .replace(/\(2026-8\)/g, "Agustus 2026")
    .replace(/2026-8/g, "Agustus 2026")
    .replace(/AI\s*Gemini\s*(&|\+|dan)?\s*RAG/gi, "")
    .replace(/SPPG Pemkab Gresik/gi, "SPPG Kecamatan")
    .replace(/\s{2,}/g, " ")
    .trim();

  let cleanDesc = (description || "")
    .replace(/Dr\.\s*Hendra\s*Pratama/gi, "Nizam Setiawan")
    .replace(/menu rekomendasi AI Gemini & RAG Dapur SPPG/gi, "Menu rekomendasi makanan bergizi seimbang")
    .replace(/menu rekomendasi AI Gemini dan RAG/gi, "Menu rekomendasi makanan bergizi seimbang")
    .replace(/AI Gemini & RAG Dapur SPPG/gi, "Tim Nutrisi SPPG")
    .replace(/Tim SPPG Pemkab Gresik/gi, "Tim SPPG Kecamatan")
    .replace(/Staf SPPG Pemkab Gresik/gi, "Staf SPPG Kecamatan")
    .replace(/SPPG Pemkab Gresik/gi, "SPPG Kecamatan")
    .replace(/AI Gemini/gi, "")
    .replace(/RAG/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { title: cleanTitle, description: cleanDesc };
}

export async function fetchNotifications() {
  try {
    const colRef = collection(db, "gscan_notifications");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => {
        const data = d.data() as any;
        const { title, description } = sanitizeNotificationFields(data.title, data.description);
        return {
          id: d.id,
          ...data,
          title,
          description,
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

export function subscribeUserNotifications(
  userEmail: string,
  onUpdate: (notifs: FirestoreNotification[]) => void
) {
  try {
    const colRef = collection(db, "gscan_notifications");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      const items: FirestoreNotification[] = [];
      const cleanEmail = (userEmail || "").trim().toLowerCase();

      snap.forEach((d) => {
        const data = d.data() as any;
        const targetEmail = (data.userEmail || "").trim().toLowerCase();
        
        const isCategoryAllowed = data.category !== "settings" && data.category !== "master";
        const isMatch = isCategoryAllowed && (!targetEmail || targetEmail === "all" || targetEmail === cleanEmail);
        if (isMatch) {
          const readByList: string[] = Array.isArray(data.readBy) ? data.readBy : [];
          const isReadForUser = data.isRead === true || (cleanEmail ? readByList.includes(cleanEmail) : false);

          const { title, description } = sanitizeNotificationFields(data.title, data.description);
          items.push({
            id: d.id,
            ...data,
            title,
            description,
            isRead: isReadForUser,
          } as FirestoreNotification);
        }
      });

      items.sort((a, b) => (b.createdAtIso || "").localeCompare(a.createdAtIso || ""));
      onUpdate(items);
    }, (err) => {
      console.warn("Firestore notification snapshot error:", err);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Gagal init subscribeUserNotifications:", err);
    return () => {};
  }
}

export async function markNotificationRead(docId: string, userEmail?: string) {
  try {
    const docRef = doc(db, "gscan_notifications", docId);
    if (userEmail) {
      await setDoc(docRef, { 
        isRead: true, 
        readBy: arrayUnion(userEmail.trim().toLowerCase()) 
      }, { merge: true });
    } else {
      await setDoc(docRef, { isRead: true }, { merge: true });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsRead(userEmail?: string) {
  try {
    const colRef = collection(db, "gscan_notifications");
    const snap = await getDocs(colRef);
    const cleanEmail = (userEmail || "").trim().toLowerCase();
    
    await Promise.all(
      snap.docs.map((d) => {
        const data = d.data() as any;
        const targetEmail = (data.userEmail || "").trim().toLowerCase();
        if (!targetEmail || targetEmail === "all" || targetEmail === cleanEmail) {
          if (cleanEmail) {
            return setDoc(d.ref, { isRead: true, readBy: arrayUnion(cleanEmail) }, { merge: true });
          }
          return setDoc(d.ref, { isRead: true }, { merge: true });
        }
        return Promise.resolve();
      })
    );
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

export async function seedInitialUserNotifications(userEmail: string, districtName: string = "Kebomas") {
  try {
    const cleanEmail = (userEmail || "").trim().toLowerCase();
    if (!cleanEmail) return;

    const colRef = collection(db, "gscan_notifications");
    const snap = await getDocs(colRef);
    
    // Filter notifications for this user
    const userNotifs = snap.docs.filter((d) => {
      const data = d.data() as any;
      const targetEmail = (data.userEmail || "").trim().toLowerCase();
      return targetEmail === cleanEmail || targetEmail === "all";
    });

    // Only seed 1 single welcome greeting if inbox is completely empty for new user
    if (userNotifs.length === 0) {
      const docId = `notif_welcome_${Date.now()}`;
      const docRef = doc(db, "gscan_notifications", docId);
      await setDoc(docRef, {
        id: docId,
        userEmail: cleanEmail,
        title: "Selamat Datang di Kcal",
        description: `Selamat datang di aplikasi Kcal! Seluruh pemberitahuan resmi mengenai Program Makan Bergizi Gratis (MBG) dan Skrining Biometrik Kecamatan ${districtName} akan dikirimkan langsung ke kotak masuk Anda.`,
        category: "system",
        isRead: false,
        readBy: [],
        createdAt: serverTimestamp(),
        createdAtIso: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Gagal seed initial welcome notification:", err);
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
  // Gemini & SerpApi
  geminiApiKey?: string;
  serpApiKey?: string;
  // Microsoft Azure Suite
  azureStorageAccount?: string;
  azureStorageKey?: string;
  azureStorageContainer?: string;
  azureVisionEndpoint?: string;
  azureVisionKey?: string;
  azureSearchEndpoint?: string;
  azureSearchKey?: string;
  azureSpeechKey?: string;
  azureSpeechRegion?: string;
  azureMapsKey?: string;
  azureMapsClientId?: string;
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
      geminiApiKey: existingData.geminiApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
      serpApiKey: existingData.serpApiKey || process.env.SERPAPI_API_KEY || "",
      azureStorageAccount: existingData.azureStorageAccount || "stgscanginofest26",
      azureStorageKey: existingData.azureStorageKey || "N6+eU4zQ5P8w9vK1x2y3z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0==",
      azureStorageContainer: existingData.azureStorageContainer || "gscan-media",
      azureVisionEndpoint: existingData.azureVisionEndpoint || "https://gscan-ai-vision.cognitiveservices.azure.com/",
      azureVisionKey: existingData.azureVisionKey || "az-vis-99887766554433221100aabbccddeeff",
      azureSearchEndpoint: existingData.azureSearchEndpoint || "https://gscan-search.search.windows.net",
      azureSearchKey: existingData.azureSearchKey || "az-srch-11223344556677889900aabbccddeeff",
      azureSpeechKey: existingData.azureSpeechKey || "az-spch-aabbccddeeff00112233445566778899",
      azureSpeechRegion: existingData.azureSpeechRegion || "southeastasia",
      azureMapsKey: existingData.azureMapsKey || "az-maps-1234567890abcdef1234567890abcdef",
      azureMapsClientId: existingData.azureMapsClientId || "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
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

  // 4. Pengaduan & Layanan Warga
  { command: "/komplain", question: "Kirim keluhan, masukan, atau kendala sistem", answer: "Silakan ketikkan keluhan atau kendala Anda. Laporan akan otomatis tersimpan ke Cloud Firestore dan diteruskan langsung ke pengelola SPPG & Dinkes.", category: "Layanan Pengaduan" },
  { command: "/track", question: "Pantau Status Pengaduan Saya (Realtime)", answer: "Buka panel pelacakan status tiket aduan yang telah Anda kirimkan ke sistem untuk melihat perkembangan tindak lanjut SPPG Kebomas.", category: "Layanan Pengaduan" },
  { command: "/skrining", question: "Bagaimana cara melakukan Skrining Biometrik Wajah & Telapak Tangan?", answer: "1. Masuk ke tab 'Skrining' di menu bawah.\n2. Posisikan wajah anak / siswa di dalam lingkaran panduan hingga terdeteksi 100%.\n3. Posisikan telapak tangan kanan anak.\n4. Sistem AI Azure Vision & Gemini akan menganalisis indikator kecukupan nutrisi dan Z-Score WHO secara otomatis.", category: "Masyarakat" },

  // 5. Sistem & Pengaturan
  { command: "/notif", question: "Bagaimana cara kerja Pusat Notifikasi?", answer: "Setiap aktivitas (upload master data, generate menu, update settings, skrining anak) otomatis dicatat ke Cloud Firestore (koleksi gscan_notifications). Klik notifikasi untuk melihat rincian tanggal, jam, dan admin eksekutor.", category: "Sistem" },
  { command: "/pengaturan", question: "Apa saja yang dapat dikonfigurasi di Pengaturan?", answer: "Di menu Pengaturan Anda dapat: melihat profil admin aktif, mengatur siklus hari kerja (5/6 hari), membuka & mengedit API Keys (Gemini & Firebase), mengganti PIN otorisasi, dan melihat info perangkat/sistem.", category: "Pengaturan" },
  { command: "/pin", question: "Bagaimana cara verifikasi & ganti PIN akses administrator?", answer: "PIN otorisasi administrator terdiri dari 8 karakter (default: 69hagh0d). Masukkan PIN pada dialog segmented 8-kotak untuk membuka kunci kredensial. Untuk mengubah PIN, gunakan form 'Keamanan & Ubah PIN Akses' di halaman Pengaturan.", category: "Keamanan" },
  { command: "/admin", question: "Bagaimana cara ganti akun administrator wilayah?", answer: "Buka halaman Pengaturan → pada bagian 'Administrator Aktif', klik tombol 'Ganti Akun' → pilih akun administrator (1 Akun Kabupaten, 6 Akun Kecamatan). Data dashboard akan menyesuaikan wilayah yang dipilih.", category: "Sistem" },
  { command: "/firestore", question: "Apa saja 9 koleksi Cloud Firestore yang aktif?", answer: "1. master_komoditas\n2. master_harga_pasar\n3. master_menu_makanan\n4. master_nilai_gizi\n5. master_wilayah\n6. mbg_menu_plans\n7. gscan_notifications\n8. gscan_settings\n9. gscan_help_qa", category: "Basis Data" },
  { command: "/device", question: "Informasi perangkat apa yang dideteksi oleh sistem?", answer: "Sistem mendeteksi: jenis browser, sistem operasi, resolusi layar (DPR), bahasa browser, timezone (WIB), jumlah inti CPU (cores), kapasitas RAM memori perangkat, status koneksi internet, dan User Agent.", category: "Sistem" },
  { command: "/bantuan", question: "Bagaimana cara bertanya ke Asisten AI Gemini di sini?", answer: "Ketik langsung pertanyaan apa saja di kolom chat bawah (tanpa tanda '/'). Asisten AI Gemini akan menjelaskan seluruh fitur, tata cara penggunaan, kalkulasi gizi, maupun kebijakan program MBG di Kabupaten Gresik.", category: "Asisten AI" },
  { command: "/kontak", question: "Kontak helpdesk dan dukungan teknis Kcal", answer: "Dinas Kesehatan Kabupaten Gresik — Tim Teknis Inovasi MBG & Stunting (GinoFest 2026)\n• Alamat: Jl. Dr. Wahidin Sudirohusodo No. 245, Gresik\n• Email: takathasan82@gmail.com\n• Layanan: Senin – Jumat (08:00 – 16:00 WIB)", category: "Dukungan" },
  { command: "/faq", question: "Daftar topik bantuan yang sering ditanyakan", answer: "Gunakan perintah cepat berikut:\n• /skrining - Skrining Biometrik\n• /komplain - Kirim Pengaduan Warga\n• /track - Lacak Status Aduan\n• /kontak - Layanan Helpdesk Dinkes", category: "Bantuan" },
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
    // Purge removed commands from Cloud Firestore
    const unusedCmdIds = [
      "cmd_mbg", "cmd_balita", "cmd_posyandu",
      "cmd_mbg_warga", "cmd_skrining_warga", "cmd_balita_warga",
      "cmd_lapor_warga", "cmd_track_warga", "cmd_posyandu_warga"
    ];
    await Promise.all(unusedCmdIds.map((cmdId) => deleteDoc(doc(db, "gscan_help_qa", cmdId)).catch(() => {})));

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
  userEmail?: string;
  sender: "user" | "bot";
  text: string;
  isAiGenerated?: boolean;
  timestamp?: any;
  createdAtIso?: string;
}

export async function saveHelpChatMessage(msg: Omit<HelpChatMessage, "id">, userEmail?: string) {
  try {
    const colRef = collection(db, "gscan_help_history");
    const cleanEmail = (userEmail || msg.userEmail || "nizam@gmail.com").trim().toLowerCase();
    const docRef = await addDoc(colRef, {
      ...msg,
      userEmail: cleanEmail,
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
    return { success: true, docId: docRef.id };
  } catch (error: any) {
    console.error("Gagal simpan help chat message:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchHelpChatHistory(userEmail?: string) {
  try {
    const colRef = collection(db, "gscan_help_history");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : "";
      let items = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpChatMessage));
      if (cleanEmail) {
        items = items.filter(m => (m.userEmail || "").toLowerCase() === cleanEmail || !m.userEmail);
      }
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

export async function clearHelpChatHistory(userEmail?: string) {
  try {
    const colRef = collection(db, "gscan_help_history");
    const snap = await getDocs(colRef);
    const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : "";
    const docsToDelete = snap.docs.filter(d => {
      if (!cleanEmail) return true;
      const data = d.data();
      return (data.userEmail || "").toLowerCase() === cleanEmail || !data.userEmail;
    });
    await Promise.all(docsToDelete.map(d => deleteDoc(d.ref)));
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
  ticketId?: string;
  senderName: string;
  senderContact?: string;
  senderPhotoUrl?: string;
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
    const autoTicketId = complaint.ticketId || `ADUAN-${Date.now().toString().slice(-4)}`;
    const docRef = await addDoc(colRef, {
      ...complaint,
      ticketId: autoTicketId,
      senderPhotoUrl: complaint.senderPhotoUrl || "",
      status: complaint.status || "baru",
      timestamp: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });

    const targetEmail = (complaint.senderContact && complaint.senderContact.includes("@")) 
      ? complaint.senderContact.trim().toLowerCase() 
      : "";
    const districtName = complaint.district ? complaint.district : "Kebomas";
    const sppgLabel = `SPPG Kec. ${districtName}`;

    await addNotification({
      title: `Laporan Pengaduan #${autoTicketId} Dikirim`,
      description: `Pengaduan Anda (${complaint.category || "MBG"}) telah diterima oleh Tim ${sppgLabel} dan sedang diproses.`,
      category: "complaint",
      userEmail: targetEmail || "all",
    });

    return { success: true, docId: docRef.id, ticketId: autoTicketId };
  } catch (error: any) {
    console.error("Gagal simpan komplain:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCitizenDistrictInFirestore(email: string, district: string): Promise<{ success: boolean; error?: string }> {
  return updateCitizenProfileInFirestore(email, { district });
}

export async function updateCitizenProfileInFirestore(
  email: string,
  updates: { district?: string; age?: number; photoURL?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const colRef = collection(db, "kcal_masyarakat");
    const q = query(colRef, where("email", "==", email.trim().toLowerCase()));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "Akun tidak ditemukan" };
    }

    const docId = snap.docs[0].id;
    await setDoc(
      doc(db, "kcal_masyarakat", docId),
      {
        ...updates,
        updatedAtIso: new Date().toISOString(),
      },
      { merge: true }
    );

    const cleanEmail = email.trim().toLowerCase();

    if (updates.age !== undefined) {
      await addNotification({
        title: "Usia Target Anak Diperbarui",
        description: `Usia target anak telah diubah menjadi ${updates.age} Tahun. Rekomendasi kebutuhan gizi AKG MBG disesuaikan secara otomatis.`,
        category: "system",
        userEmail: cleanEmail,
      });
    }

    if (updates.district !== undefined || updates.photoURL !== undefined) {
      await addNotification({
        title: "Profil Akun Diperbarui",
        description: `Informasi profil akun (${cleanEmail}) telah berhasil diperbarui dan disinkronkan.`,
        category: "system",
        userEmail: cleanEmail,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Gagal update profil warga:", err);
    return { success: false, error: err.message };
  }
}

export async function getCitizenByEmailFromFirestore(email: string): Promise<{ success: boolean; data?: any }> {
  try {
    const colRef = collection(db, "kcal_masyarakat");
    const q = query(colRef, where("email", "==", email.trim().toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { success: false };
    }
    return { success: true, data: { id: snap.docs[0].id, ...snap.docs[0].data() } };
  } catch (err) {
    console.warn("Gagal get citizen by email:", err);
    return { success: false };
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
    let existingData: any = null;
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        existingData = snap.data();
      }
    } catch {}

    await setDoc(docRef, { status, ...(responseNotes ? { responseNotes } : {}), updatedAtIso: new Date().toISOString() }, { merge: true });

    if (existingData) {
      const ticketId = existingData.ticketId || complaintId.slice(0, 8);
      const targetEmail = (existingData.senderContact && existingData.senderContact.includes("@"))
        ? existingData.senderContact.trim().toLowerCase()
        : "";
      const districtName = existingData.district || "Kebomas";
      const sppgLabel = `SPPG Kec. ${districtName}`;

      const statusMap = {
        baru: "DITERIMA",
        proses: "SEDANG DIPROSES",
        selesai: "SELESAI (DITINDAKLANJUTI)",
      };
      const statusText = statusMap[status] || "DIPERBARUI";
      const notesText = responseNotes ? ` Catatan ${sppgLabel}: "${responseNotes}"` : "";

      await addNotification({
        title: `Tanggapan Pengaduan #${ticketId}`,
        description: `Status aduan Anda kini: ${statusText} oleh Tim ${sppgLabel}.${notesText}`,
        category: "complaint",
        userEmail: targetEmail || "all",
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Gagal update status komplain:", error);
    return { success: false };
  }
}

// -------------------------------------------------------------
// 13B. QR CODE MBG CLAIMS VERIFICATION (Collection: gscan_qr_claims)
// -------------------------------------------------------------
export interface QrClaimRecord {
  id?: string;
  claimId: string;
  beneficiaryName: string;
  beneficiaryEmail: string;
  beneficiaryPhone?: string;
  district?: string;
  menuId?: string;
  menuName: string;
  calories?: number;
  porsi?: string;
  programName?: string;
  verifiedAtIso: string;
  verifiedBy?: string;
  status: "VERIFIED" | "REJECTED";
}

export async function recordQrClaimToFirestore(claim: Omit<QrClaimRecord, "id">): Promise<{ success: boolean; docId?: string; error?: string }> {
  try {
    const colRef = collection(db, "gscan_qr_claims");
    const docRef = await addDoc(colRef, {
      ...claim,
      timestamp: serverTimestamp(),
      verifiedAtIso: claim.verifiedAtIso || new Date().toISOString(),
    });

    // Automatically sync matching scan in biometric_scans_history to CLAIMED status
    try {
      const scansRef = collection(db, "biometric_scans_history");
      const q = query(scansRef, where("claimId", "==", claim.claimId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await setDoc(doc(db, "biometric_scans_history", snap.docs[0].id), {
          status: "CLAIMED",
          claimedAtIso: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (scanUpdateErr) {
      console.warn("Notice updating biometric scan status to CLAIMED:", scanUpdateErr);
    }

    const districtName = claim.district || "Kebomas";
    const verifierLabel = claim.verifiedBy || `Staf SPPG Kec. ${districtName}`;

    const targetEmail = claim.beneficiaryEmail ? claim.beneficiaryEmail.trim().toLowerCase() : "";
    await addNotification({
      title: `Verifikasi Penyerahan Porsi MBG Sukses`,
      description: `Klaim Porsi #${claim.claimId} (${claim.menuName}) telah berhasil diverifikasi oleh ${verifierLabel}. Selamat menikmati!`,
      category: "mbg",
      userEmail: targetEmail || "all",
    });

    return { success: true, docId: docRef.id };
  } catch (err: any) {
    console.error("Gagal mencatat klaim QR:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchQrClaimsFromFirestore(): Promise<{ success: boolean; data: QrClaimRecord[] }> {
  try {
    const colRef = collection(db, "gscan_qr_claims");
    const q = query(colRef, orderBy("verifiedAtIso", "desc"));
    const snap = await getDocs(q);
    const data: QrClaimRecord[] = [];
    snap.forEach((docSnap) => {
      data.push({ id: docSnap.id, ...docSnap.data() } as QrClaimRecord);
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("Gagal mengambil riwayat klaim QR:", err);
    return { success: false, data: [] };
  }
}

// -------------------------------------------------------------
// 13C. BIOMETRIC SCANS HISTORY (Collection: biometric_scans_history)
// -------------------------------------------------------------
export async function fetchBiometricScansFromFirestore(): Promise<{ success: boolean; data: any[] }> {
  try {
    const colRef = collection(db, "biometric_scans_history");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data: any[] = [];
    snap.forEach((docSnap) => {
      data.push({ id: docSnap.id, ...docSnap.data() });
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("Gagal mengambil data biometric_scans_history:", err);
    return { success: false, data: [] };
  }
}

export async function fetchUserScansAndClaimsFromFirestore(userEmail?: string, userName?: string): Promise<{ success: boolean; data: any[] }> {
  try {
    const colRef = collection(db, "biometric_scans_history");
    const snap = await getDocs(colRef);
    const results: any[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const matchEmail = userEmail && d.userEmail && d.userEmail.toLowerCase() === userEmail.toLowerCase();
      const matchName = userName && d.userName && d.userName.toLowerCase() === userName.toLowerCase();

      // Return records that match email or name or return all if guest
      if (matchEmail || matchName || (!userEmail && !userName)) {
        results.push({ id: docSnap.id, ...d });
      }
    });

    results.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    return { success: true, data: results };
  } catch (err: any) {
    console.error("Gagal mengambil riwayat scan pengguna:", err);
    return { success: false, data: [] };
  }
}

// -------------------------------------------------------------
// 10. STEP 10: CITIZEN AUTH & PROFILE SYNC (Collection: kcal_masyarakat)
// -------------------------------------------------------------
export interface CitizenAccountRecord {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  district?: string;
  age?: number;
  password?: string;
  role: "masyarakat";
  avatarBg?: string;
  createdAtIso: string;
}

export async function registerCitizenToFirestore(account: Omit<CitizenAccountRecord, "id">): Promise<{ success: boolean; id?: string; sessionId?: string; error?: string }> {
  try {
    const cleanEmail = account.email.trim().toLowerCase();
    const cleanPass = account.password || "password123";

    // 1. Create User in Firebase Authentication (Users list in Firebase Console)
    let firebaseUid = "";
    try {
      const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      firebaseUid = userCredential.user.uid;
      
      try {
        await updateProfile(userCredential.user, {
          displayName: account.fullName,
        });
      } catch {}
    } catch (authErr: any) {
      console.warn("Firebase Auth registration note:", authErr);
      if (authErr.code === "auth/email-already-in-use") {
        return { success: false, error: "Alamat email ini sudah terdaftar di Firebase Authentication. Silakan langsung masuk." };
      }
      if (authErr.code === "auth/weak-password") {
        return { success: false, error: "Kata sandi terlalu lemah. Gunakan minimal 6 karakter." };
      }
      if (authErr.code === "auth/invalid-email") {
        return { success: false, error: "Format alamat email tidak valid." };
      }
    }

    // 2. Sync / Save to Cloud Firestore (kcal_masyarakat)
    const colRef = collection(db, "kcal_masyarakat");
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    let docId = firebaseUid || "";
    if (snap.empty) {
      const newDoc = await addDoc(colRef, {
        ...account,
        uid: firebaseUid,
        email: cleanEmail,
        createdAtIso: new Date().toISOString(),
        role: "masyarakat",
      });
      docId = newDoc.id;
    } else {
      docId = snap.docs[0].id;
      await setDoc(doc(db, "kcal_masyarakat", docId), {
        ...account,
        uid: firebaseUid,
        email: cleanEmail,
        updatedAtIso: new Date().toISOString(),
      }, { merge: true });
    }

    let logId = `ses_warga_${Date.now()}`;
    // Record session log in Firestore for Super Admin audit trail
    try {
      await setDoc(doc(db, "kcal_session_logs", logId), {
        id: logId,
        userId: docId,
        email: cleanEmail,
        name: account.fullName || cleanEmail.split("@")[0],
        role: "masyarakat",
        districtLabel: `Kec. ${account.district || "Gresik"}`,
        loginAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "PWA Mobile App (Pendaftaran)",
        status: "active",
      });
    } catch {}

    return { success: true, id: docId, sessionId: logId };
  } catch (err: any) {
    console.error("Error registering citizen:", err);
    return { success: false, error: err.message || "Gagal mendaftarkan akun." };
  }
}

export async function loginCitizenFromFirestore(
  email: string,
  password?: string,
  district?: string
): Promise<{ success: boolean; user?: { id: string; name: string; email: string; phone?: string; district: string }; sessionId?: string; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || "";
    const cleanDistrict = district ? district.trim() : "";

    // 1. Fetch from Cloud Firestore (kcal_masyarakat)
    const colRef = collection(db, "kcal_masyarakat");
    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      return {
        success: false,
        error: "Alamat email belum terdaftar. Silakan melakukan pendaftaran akun terlebih dahulu.",
      };
    }

    const userData = snap.docs[0].data();

    // 2. Strict District Verification: Kecamatan harus sama dengan pendaftaran
    if (cleanDistrict && userData.district) {
      const registeredDistrict = userData.district.trim();
      if (registeredDistrict.toLowerCase() !== cleanDistrict.toLowerCase()) {
        return {
          success: false,
          error: `Kecamatan domisili tidak sesuai dengan data pendaftaran Anda (Terdaftar di Kecamatan ${registeredDistrict}). Silakan pilih Kecamatan ${registeredDistrict}.`,
        };
      }
    }

    // 3. Password Verification
    let firebaseUser: any = null;
    if (cleanPass) {
      if (userData.password && userData.password !== cleanPass) {
        return {
          success: false,
          error: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau gunakan Lupa Kata Sandi.",
        };
      }

      // Sync with Firebase Authentication if available
      try {
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
        const auth = getAuth(app);
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
          firebaseUser = cred.user;
        } catch (signInErr: any) {
          if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
            try {
              const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
              firebaseUser = newCred.user;
            } catch {}
          }
        }
      } catch (authErr) {
        console.warn("Firebase Auth login attempt:", authErr);
      }
    }

    // Update lastLoginIso in Firestore
    await setDoc(doc(db, "kcal_masyarakat", snap.docs[0].id), {
      lastLoginIso: new Date().toISOString(),
      ...(firebaseUser?.uid ? { uid: firebaseUser.uid } : {}),
    }, { merge: true });

    const targetUser = {
      id: snap.docs[0].id,
      name: userData.fullName || cleanEmail.split("@")[0],
      email: userData.email,
      phone: userData.phone,
      district: userData.district || cleanDistrict || "Kebomas",
      photoURL: userData.photoURL || "",
    };

    const logId = `ses_warga_${Date.now()}`;
    try {
      await setDoc(doc(db, "kcal_session_logs", logId), {
        id: logId,
        userId: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: "masyarakat",
        districtLabel: `Kec. ${targetUser.district}`,
        loginAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "PWA Mobile App",
        status: "active",
      });
    } catch {}

    return {
      success: true,
      user: targetUser,
      sessionId: logId,
    };
  } catch (err: any) {
    console.error("Error login citizen:", err);
    return {
      success: false,
      error: err.message || "Gagal masuk ke akun masyarakat. Silakan coba beberapa saat lagi.",
    };
  }
}

export async function verifyCitizenEmailAndDistrict(
  email: string,
  district?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const colRef = collection(db, "kcal_masyarakat");
    const cleanEmail = email.trim().toLowerCase();
    const cleanDistrict = district ? district.trim() : "";

    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      return {
        success: false,
        error: "Alamat email ini belum terdaftar di aplikasi Kcal. Silakan daftar terlebih dahulu.",
      };
    }

    const userData = snap.docs[0].data();
    if (cleanDistrict && userData.district && userData.district.trim().toLowerCase() !== cleanDistrict.toLowerCase()) {
      return {
        success: false,
        error: `Kecamatan domisili tidak cocok. Akun ${cleanEmail} terdaftar di Kecamatan ${userData.district}. Silakan pilih Kecamatan ${userData.district}.`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error verifying citizen email:", err);
    return { success: false, error: err.message || "Gagal memverifikasi data akun." };
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
    const cleanDistrict = district ? district.trim() : "";

    const q = query(colRef, where("email", "==", cleanEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, error: "Akun dengan alamat email ini tidak ditemukan di database masyarakat." };
    }

    const targetDoc = snap.docs[0];
    const userData = targetDoc.data();

    // Verify district matches
    if (cleanDistrict && userData.district) {
      if (userData.district.trim().toLowerCase() !== cleanDistrict.toLowerCase()) {
        return {
          success: false,
          error: `Kecamatan domisili tidak cocok dengan akun terdaftar (Kecamatan ${userData.district}).`,
        };
      }
    }

    await setDoc(doc(db, "kcal_masyarakat", targetDoc.id), {
      password: newPassword,
      updatedAtIso: new Date().toISOString(),
    }, { merge: true });

    await addNotification({
      title: "Permintaan Lupa Kata Sandi Berhasil",
      description: `Kata sandi akun Anda (${cleanEmail}) telah berhasil diperbarui dan disinkronkan ke sistem keamanan.`,
      category: "system",
      userEmail: cleanEmail,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Error resetting citizen password in Firestore:", err);
    return { success: false, error: err.message || "Gagal mengatur ulang kata sandi." };
  }
}

// -------------------------------------------------------------
// 12. FOOD IMAGES PERSISTENT CLOUD CACHE (Collection: food_images_cache)
// -------------------------------------------------------------
export function normalizeMenuKey(menuName: string): string {
  return menuName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

export async function getCachedFoodImageFromFirestore(queryName: string): Promise<{ imageUrl: string; title?: string } | null> {
  try {
    const key = normalizeMenuKey(queryName);
    if (!key) return null;
    const docRef = doc(db, "food_images_cache", key);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.imageUrl) {
        return { imageUrl: data.imageUrl, title: data.title };
      }
    }
    return null;
  } catch (err) {
    console.warn("[Firestore] Error reading food_images_cache:", err);
    return null;
  }
}

export async function saveCachedFoodImageToFirestore(queryName: string, imageUrl: string, title?: string): Promise<boolean> {
  try {
    const key = normalizeMenuKey(queryName);
    if (!key || !imageUrl) return false;
    const docRef = doc(db, "food_images_cache", key);
    await setDoc(docRef, {
      query: queryName,
      imageUrl,
      title: title || queryName,
      createdAtIso: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("[Firestore] Error saving to food_images_cache:", err);
    return false;
  }
}

export function listenToActiveSessions(callback: (sessions: any[]) => void) {
  if (!db) return () => {};
  const q = query(collection(db, "kcal_session_logs"));
  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sessions);
  }, (error) => {
    console.warn("Session listener error:", error);
  });
}

export async function closeSessionLog(sessionId: string) {
  if (!db || !sessionId) return;
  try {
    const ref = doc(db, "kcal_session_logs", sessionId);
    await updateDoc(ref, {
      status: "revoked",
      loggedOutAtIso: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Error closing session:", err);
  }
}

export async function recordCitizenSessionLog(user: { id?: string; name: string; email: string; district: string }): Promise<string> {
  const logId = `sess_cit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (!db) return logId;
  try {
    await setDoc(doc(db, "kcal_session_logs", logId), {
      userId: user.id || logId,
      userName: user.name,
      userRole: "masyarakat",
      district: user.district,
      userEmail: user.email,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "mobile-browser",
      loginTimeIso: new Date().toISOString(),
      status: "active",
    });
  } catch (err) {
    console.warn("Error recording session:", err);
  }
  return logId;
}

// -------------------------------------------------------------
// 6. MASTER KUESIONER SKRINING KLINIS (Kemenkes & BGN Standard)
// -------------------------------------------------------------
export interface ScreeningQuestionItem {
  id: number | string;
  title: string;
  subtitle: string;
  options: string[];
}

export async function fetchScreeningQuestionsFromFirestore(): Promise<ScreeningQuestionItem[]> {
  try {
    if (db) {
      const colRef = collection(db, "master_kuesioner_skrining");
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d, idx) => {
          const data = d.data();
          return {
            id: d.id || idx + 1,
            title: data.title || data.pertanyaan || "Pertanyaan Klinis",
            subtitle: data.subtitle || data.penjelasan || "Evaluasi status nutrisi & alergi anak",
            options: data.options || data.pilihan || ["Ya", "Kadang-kadang", "Tidak Pernah"],
          };
        });
      }
    }
  } catch (err) {
    console.warn("Notice reading Firestore screening questions:", err);
  }

  // Standar Kemenkes RI & BGN 2026 (Clinical Nutrition Assessment)
  return [
    {
      id: 1,
      title: "Apakah anak Anda sering merasa lelah, lemah, atau lesu saat beraktivitas?",
      subtitle: "Standar Kemenkes: Penapisan tanda klinis awal defisiensi zat besi & anemia.",
      options: ["Ya, sangat sering", "Kadang-kadang", "Tidak Pernah"],
    },
    {
      id: 2,
      title: "Bagaimana nafsu makan dan ketertarikan anak terhadap lauk protein hewani?",
      subtitle: "Standar BGN: Memantau kecukupan asupan asam amino esensial pertumbuhan tinggi badan.",
      options: ["Sangat lahap (Habis)", "Pilih-pilih makanan (Picky Eater)", "Sering bersisa / Tidak habis"],
    },
    {
      id: 3,
      title: "Apakah ada riwayat alergi makanan tertentu pada anak?",
      subtitle: "Keamanan Pangan: Memastikan formula menu MBG disesuaikan bebas alergen.",
      options: ["Tidak ada alergi", "Alergi Seafood / Ikan", "Alergi Telur / Susu Sapi"],
    },
  ];
}

// -------------------------------------------------------------
// 14. ARTICLES & NUTRITION EDUCATION (Collection: gscan_articles)
// -------------------------------------------------------------
export interface ArticleRecord {
  id?: string;
  category: string;
  title: string;
  readTime: string;
  tag: string;
  author: string;
  publishedDate: string;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAtIso?: string;
}

export const DEFAULT_15_ARTICLES: Omit<ArticleRecord, "id">[] = [
  {
    category: "Pencegahan Stunting",
    title: "Pentingnya Protein Hewani pada Porsi Makan Bergizi Gratis",
    readTime: "3 mnt baca",
    tag: "Kemenkes RI",
    author: "Tim Ahli Gizi BGN",
    publishedDate: "2026-09-01",
    summary: "Asupan asam amino esensial dari daging ayam, telur, dan ikan lokal sangat krusial dalam memicu hormon pertumbuhan tinggi badan anak.",
    content: "Berdasarkan standar BGN 2026 dan Kemenkes RI, satu porsi MBG wajib mengandung minimal 25-30 gram protein hewani murni untuk menunjang tumbuh kembang optimal anak di usia sekolah dasar. Protein hewani mengandung profil asam amino esensial lengkap yang langsung digunakan oleh epifisis tulang balita dan anak untuk menambah tinggi badan serta mencegah risiko stunting secara signifikan.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Deteksi Dini AI",
    title: "Mengenali Tanda Anemia dari Konjungtiva & Bantalan Kuku Balita",
    readTime: "4 mnt baca",
    tag: "AI Biometrik",
    author: "Tim Biomedis Kcal",
    publishedDate: "2026-08-30",
    summary: "Kelopak mata pucat dan waktu pengisian kapiler kuku lebih dari 2 detik adalah indikasi awal kekurangan zat besi yang perlu penanganan cepat.",
    content: "Fitur pemindaian biometrik Kcal menganalisis spektrum warna konjungtiva dan capillary refill time kuku untuk merekomendasikan tambahan zat besi pada menu MBG anak Anda. Deteksi dini hemoglobin berbasis citra mata dan kuku membantu posyandu dan puskesmas memberikan intervensi harian tanpa prosedur invasif.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pedoman Nutrisi",
    title: "Prinsip Isi Piringku 5 Bintang untuk Anak Usia Sekolah Dasar",
    readTime: "3 mnt baca",
    tag: "Gizi Seimbang",
    author: "Tim Edukasi Nutrisi Nasional",
    publishedDate: "2026-08-28",
    summary: "Proporsi 1/3 makanan pokok, 1/3 sayuran, 1/6 lauk pauk, dan 1/6 buah-buahan untuk menjaga imunitas dan konsentrasi belajar.",
    content: "Setiap bento tray MBG dirancang mengikuti kaidah gizi seimbang dengan gramatur yang telah ditimbang tepat oleh ahli gizi SPPG. Keseimbangan karbohidrat kompleks dari beras lokal, sayuran kaya serat, buah segar, dan protein hewani menjamin kecukupan gizi harian anak saat menuntut ilmu.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pangan Lokal",
    title: "Keunggulan Nutrisi Ikan Bandeng & Kupang Lokal untuk Otak Anak",
    readTime: "4 mnt baca",
    tag: "Pangan Lokal",
    author: "Pakar Gizi Komunitas",
    publishedDate: "2026-08-25",
    summary: "Kandungan Omega-3, DHA, dan Zinc pada komoditas perikanan lokal sangat efektif mendukung perkembangan kognitif balita.",
    content: "Ikan bandeng segar dan komoditas kerang lokal memiliki kadar Omega-3 EPA dan DHA yang sebanding dengan ikan laut dalam. Mengonsumsi olahan ikan bandeng tanpa duri minimal 3 kali seminggu meningkatkan kemampuan daya ingat, fokus belajar, serta kekebalan tubuh balita dari infeksi.",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Kesehatan Ibu & Anak",
    title: "Optimalisasi 1.000 Hari Pertama Kehidupan HPK Bebas Stunting",
    readTime: "5 mnt baca",
    tag: "Kesehatan Ibu & Anak",
    author: "Dokter Spesialis Anak",
    publishedDate: "2026-08-22",
    summary: "Periode emas sejak dalam kandungan hingga usia 2 tahun menentukan kualitas fisik dan kecerdasan anak di masa depan.",
    content: "Nutrisi ibu hamil dan ibu menyusui sangat mempengaruhi pertumbuhan organ vital balita. Pemberian ASI Eksklusif selama 6 bulan dilanjutkan MPASI kaya protein hewani menjadi kunci utama menutup celah risiko stunting di seluruh wilayah Indonesia.",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Edukasi Nutrisi",
    title: "Pentingnya Vitamin C untuk Maksimalisasi Penyerapan Zat Besi Fe",
    readTime: "3 mnt baca",
    tag: "Kemenkes RI",
    author: "Ahli Gizi SPPG",
    publishedDate: "2026-08-20",
    summary: "Mengonsumsi buah jeruk, pepaya, atau jambu biji bersamaan dengan lauk hewani meningkatkan penyerapan zat besi hingga 300 persen.",
    content: "Zat besi tipe non-heme dari tumbuh-tumbuhan sulit diserap oleh usus halus. Kombinasi buah lokal kaya Vitamin C pada menu Makan Bergizi Gratis (MBG) mempercepat pembentukan hemoglobin, sehingga anak terhindar dari anemia dan badan lemas di kelas.",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Kesehatan Lingkungan",
    title: "Peran Sanitasi Lingkungan & Air Bersih dalam Pencegahan Infeksi",
    readTime: "3 mnt baca",
    tag: "Sanitasi Sehat",
    author: "Tim Kesehatan Masyarakat",
    publishedDate: "2026-08-18",
    summary: "Infeksi usus akibat air terkontaminasi dan cacingan menghambat penyerapan nutrisi makanan pada tumbuh kembang balita.",
    content: "Nutrisi tinggi tidak akan terserap optimal jika anak sering mengalami diare atau cacingan. Penerapan Perilaku Hidup Bersih dan Sehat (PHBS), mencuci tangan dengan sabun sebelum makan, dan akses jamban sehat merupakan pilar pendukung program pencegahan stunting.",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pola Asuh Orang Tua",
    title: "Panduan Penanganan Anak Picky Eater dan Pilih-pilih Makanan",
    readTime: "4 mnt baca",
    tag: "Parenting Gizi",
    author: "Psikolog Anak & Ahli Gizi Kcal",
    publishedDate: "2026-08-15",
    summary: "Strategi menyajikan variasi tekstur dan bentuk makanan menarik agar anak antusias menikmati sayur dan ikan.",
    content: "Sikap menolak makanan sehat sering dialami balita usia 2-5 tahun. Pembuatan nugget ikan organik, sup bola daging sayur, dan penyajian tray berwarna cerah pada program MBG membantu membentuk kebiasaan makan sehat tanpa paksaan.",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pengukuran Biometrik",
    title: "Mengenali Grafik Z-Score WHO untuk Memantau Tinggi Badan Anak",
    readTime: "4 mnt baca",
    tag: "Standar WHO",
    author: "Tim Data Antropometri Kcal",
    publishedDate: "2026-08-12",
    summary: "Pahami perbedaan Z-Score TB/U Stunted, BB/TB Wasted, dan BB/U Underweight untuk evaluasi gizi di Posyandu.",
    content: "Grafik Z-Score WHO digunakan oleh tenaga kesehatan untuk mendeteksi deviasi standar pertumbuhan anak. Skor Z di bawah -2 SD menandakan kondisi pendek stunted yang membutuhkan pendampingan nutrisi harian intensif.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pangan Lokal",
    title: "Manfaat Telur Ayam sebagai Superfood Terjangkau untuk Anak",
    readTime: "3 mnt baca",
    tag: "Superfood Sehat",
    author: "Tim Kampanye Gizi Nasional",
    publishedDate: "2026-08-10",
    summary: "Satu butir telur sehari menyediakan kolin, lutein, dan protein kualitas tinggi yang mudah dicerna oleh tubuh anak.",
    content: "Telur merupakan salah satu sumber protein hewani paling ekonomis dengan nilai biologis tertinggi. Kolin dalam kuning telur mendukung pembentukan membran sel otak dan sintesis neurotransmitter untuk daya tangkap siswa.",
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Kesehatan Pencernaan",
    title: "Bakteri Baik Probiotik untuk Pencernaan Sehat & Imunitas Anak",
    readTime: "3 mnt baca",
    tag: "Imunitas Anak",
    author: "Tim Biomedis Kcal",
    publishedDate: "2026-08-08",
    summary: "Mikrobioma usus yang seimbang memperkuat benteng imunitas dan mengoptimalkan ekstraksi vitamin dari makanan.",
    content: "Saluran cerna yang sehat merupakan kunci penyerapan zat gizi. Pengenalan olahan fermentasi lokal seperti tempeh, yogurt, dan pisang segar mendukung populasi Lactobacillus di usus anak untuk mencegah infeksi pencernaan.",
    imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Gaya Hidup Anak",
    title: "Dampak Gadget & Kurang Tidur terhadap Hormon Growth Hormone GH",
    readTime: "3 mnt baca",
    tag: "Pola Tidur Sehat",
    author: "Dokter Spesialis Anak",
    publishedDate: "2026-08-05",
    summary: "Hormon pertumbuhan dilepaskan secara maksimal saat anak tidur nyenyak pada fase deep sleep malam hari.",
    content: "Selain nutrisi, istirahat cukup selama 9-10 jam setiap malam sangat penting bagi anak usia sekolah dasar. Kurang tidur akibat paparan layar gadget menurunkan sekresi Growth Hormone yang menghambat pertambahan tinggi badan.",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Edukasi Nutrisi",
    title: "Pentingnya Hidrasi & Asupan Air Putih Cukup Saat di Sekolah",
    readTime: "2 mnt baca",
    tag: "Kesehatan Anak",
    author: "Ahli Gizi SPPG",
    publishedDate: "2026-08-03",
    summary: "Kekurangan cairan 2 persen dapat menurunkan konsentrasi dan daya tangkap siswa dalam menerima pelajaran.",
    content: "Anak usia sekolah membutuhkan minimal 1,5 - 2 liter air putih per hari. Penyediaan botol minum sehat yang diisi air matang mendampingi bento tray MBG menjaga stamina dan fungsi ginjal anak tetap prima.",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Inovasi Layanan",
    title: "Peran Posyandu Digital & Pemindaian Wajah Kcal di Desa Kelurahan",
    readTime: "4 mnt baca",
    tag: "Digitalisasi Posyandu",
    author: "Pengembang Sistem Kcal",
    publishedDate: "2026-08-01",
    summary: "Integrasi data biometrik dan sistem verifikasi QR Code memastikan distribusi MBG tepat sasaran dan terpantau realtime.",
    content: "Aplikasi Kcal menghubungkan Posyandu, Puskesmas, dan Dapur SPPG dalam satu ekosistem digital. Data skrining biometrik membantu tim verifikator memastikan balita berisiko stunting langsung mendapatkan porsi nutrisi tambahan secara terukur.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Keamanan Pangan",
    title: "Dapur SPPG Higiensis Standar Keamanan Pangan Olahan MBG",
    readTime: "3 mnt baca",
    tag: "Standar SPPG",
    author: "Tim Kualitas Pangan SPPG",
    publishedDate: "2026-07-28",
    summary: "Penerapan standar ISO & HACCP pada pengolahan, pengemasan, dan pengiriman makanan bergizi gratis ke sekolah.",
    content: "Dapur Satuan Pelayanan Pemenuhan Gizi (SPPG) menerapkan uji sterilisasi alat, pemeriksaan suhu makanan saat didistribusikan, dan sampel arsip gizi harian untuk menjamin 100 persen keamanan dan kesegaran hidangan bagi seluruh siswa.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
  },
];

export async function fetchArticleImageFromSerpApi(title: string): Promise<string> {
  try {
    const apiKey = process.env.SERPAPI_API_KEY || "09cbbde336c59c4a96cfedf9316748e14b546aaa77b39df09680f872e97aeefb";
    const searchQuery = encodeURIComponent(title + " gizi nutrisi makanan");
    const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${searchQuery}&gl=id&hl=id&api_key=${apiKey}`;
    const response = await fetch(searchUrl);
    if (response.ok) {
      const data = await response.json();
      const images = data.images_results || [];
      if (images.length > 0) {
        return images[0].thumbnail || images[0].original || "";
      }
    }
  } catch (err) {
    console.warn("[SerpApi Article Image] Search error for title:", title, err);
  }
  return "";
}

export async function fetchArticlesFromFirestore(): Promise<{ success: boolean; data: ArticleRecord[] }> {
  try {
    const colRef = collection(db, "gscan_articles");
    const snap = await getDocs(colRef);

    if (snap.empty || snap.docs.length < 15) {
      console.log("Seeding 15 articles into Firestore gscan_articles with SerpAPI images...");
      const seeded: ArticleRecord[] = [];
      for (const art of DEFAULT_15_ARTICLES) {
        const docId = `art_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`;
        const docRef = doc(db, "gscan_articles", docId);
        
        // Auto-fetch real Google Image from SerpAPI based on article title
        let imageUrl = art.imageUrl;
        const serpUrl = await fetchArticleImageFromSerpApi(art.title);
        if (serpUrl) {
          imageUrl = serpUrl;
        }

        const artData: ArticleRecord = {
          ...art,
          id: docId,
          imageUrl,
          createdAtIso: new Date().toISOString(),
        };
        await setDoc(docRef, artData, { merge: true });
        seeded.push(artData);
      }
      return { success: true, data: seeded };
    }

    // Map existing docs and auto-fetch missing SERP API images + persist to Firestore
    const data = await Promise.all(
      snap.docs.map(async (d) => {
        const art = { id: d.id, ...d.data() } as ArticleRecord;
        if (!art.imageUrl) {
          const serpUrl = await fetchArticleImageFromSerpApi(art.title);
          if (serpUrl) {
            art.imageUrl = serpUrl;
            // Save to Firestore permanently so SERP API isn't called again!
            const docRef = doc(db, "gscan_articles", d.id);
            await setDoc(docRef, { imageUrl: serpUrl }, { merge: true }).catch(() => {});
          } else {
            // Assign high-quality Unsplash fallback based on category
            const categoryFallbacks: Record<string, string> = {
              "Pencegahan Stunting": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
              "Deteksi Dini AI": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
              "Pedoman Nutrisi": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
              "Pangan Lokal": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
              "Kesehatan Ibu & Anak": "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
              "Edukasi Nutrisi": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
            };
            art.imageUrl = categoryFallbacks[art.category] || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";
            const docRef = doc(db, "gscan_articles", d.id);
            await setDoc(docRef, { imageUrl: art.imageUrl }, { merge: true }).catch(() => {});
          }
        }
        return art;
      })
    );

    return { success: true, data };
  } catch (err: any) {
    console.warn("Gagal load gscan_articles dari Firestore, fallback ke default list:", err);
    return {
      success: true,
      data: DEFAULT_15_ARTICLES.map((a, idx) => ({ id: `art_fallback_${idx + 1}`, ...a })),
    };
  }
}




