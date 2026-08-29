import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
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

// Singleton App & Firestore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 4 DEDICATED TOP-LEVEL COLLECTIONS
export const COLLECTIONS = {
  commodities: "master_komoditas",
  prices: "master_harga_pasar",
  recipes: "master_menu_makanan",
  nutrition: "master_nilai_gizi",
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
// 5. DELETE OPERATION
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
// 6. FETCH ALL 4 TOP-LEVEL COLLECTIONS AT ONCE
// -------------------------------------------------------------
export async function loadMasterDataFromFirestore() {
  try {
    const [comRes, priceRes, recRes, nutRes] = await Promise.all([
      fetchCommoditiesFromFirestore(),
      fetchPricesFromFirestore(),
      fetchRecipesFromFirestore(),
      fetchNutritionFromFirestore()
    ]);

    return {
      success: true,
      commodities: (comRes.success && Array.isArray(comRes.data) && comRes.data.length > 0 ? comRes.data : null) as any[] | null,
      prices: (priceRes.success && Array.isArray(priceRes.data) && priceRes.data.length > 0 ? priceRes.data : null) as any[] | null,
      recipes: (recRes.success && Array.isArray(recRes.data) && recRes.data.length > 0 ? recRes.data : null) as any[] | null,
      nutrition: (nutRes.success && Array.isArray(nutRes.data) && nutRes.data.length > 0 ? nutRes.data : null) as any[] | null,
    };
  } catch (error: any) {
    console.warn("Gagal load seluruh master koleksi Firestore:", error);
    return { success: false, error: error.message };
  }
}

// -------------------------------------------------------------
// 7. SAVE ALL 4 TOP-LEVEL COLLECTIONS AT ONCE
// -------------------------------------------------------------
export async function saveAllMasterDataToFirestore(dataset: {
  commodities: any[];
  prices: any[];
  recipes: any[];
  nutrition: any[];
}) {
  try {
    await Promise.all([
      syncCommoditiesToFirestore(dataset.commodities),
      syncPricesToFirestore(dataset.prices),
      syncRecipesToFirestore(dataset.recipes),
      syncNutritionToFirestore(dataset.nutrition)
    ]);
    return { success: true };
  } catch (error: any) {
    console.error("Gagal simpan seluruh koleksi ke Firestore:", error);
    return { success: false, error: error.message };
  }
}
