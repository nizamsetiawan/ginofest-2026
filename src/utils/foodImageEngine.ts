/**
 * Food Image Engine for G-Scan / MBG Menu Visuals
 * Provides authentic, appetizing high-resolution food photography for generated Indonesian & Gresik menus.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

// Curated collection of authentic, high-definition Indonesian school lunch and culinary dishes
const CULINARY_VISUAL_MAP: Record<string, string> = {
  // Bandeng & Fish Dishes (Khas Gresik & Pesisir)
  bandeng: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  ikan: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  kakap: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  gurami: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=800&q=80",
  tongkol: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  lele: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  udang: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",

  // Ayam & Daging
  ayam: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  daging: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  rolade: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  semur: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  soto: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=800&q=80",
  rawon: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",

  // Sayur & Kelor
  kelor: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  sayur: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  sop: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  bayam: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
  asem: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
  lodeh: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",

  // Default Complete School Lunch Set (Nasi Kotak / Baki MBG Lengkap)
  default_set: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  mbg_tray: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
};

/**
 * Resolves an authentic, high-quality dish image based on menu title and composition.
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null): FoodVisualInfo {
  const lower = ((menuTitle || "") + " " + (composition || "")).toLowerCase();

  if (lower.includes("bandeng")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
      altText: "Ikan Bandeng Bakar Madu Khas Gresik",
      category: "fish",
      tag: "Ikan Bandeng Gresik (Omega-3)",
    };
  }
  if (lower.includes("soto")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=800&q=80",
      altText: "Soto Ayam Suwir Kuah Bening Gresik",
      category: "soup",
      tag: "Soto Ayam Segar & Telur",
    };
  }
  if (lower.includes("sop") || lower.includes("sup")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
      altText: "Sup Ayam & Sayur Bening BGN",
      category: "soup",
      tag: "Sup Bening Kaya Serat",
    };
  }
  if (lower.includes("ayam")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
      altText: "Ayam Bakar Bumbu Kuning & Nasi Pulen",
      category: "chicken",
      tag: "Ayam Protein Tinggi",
    };
  }
  if (lower.includes("daging") || lower.includes("rolade") || lower.includes("semur")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      altText: "Semur Daging Sapi & Rolade Sayur",
      category: "beef",
      tag: "Daging Sapi Zat Besi Tinggi",
    };
  }
  if (lower.includes("kelor") || lower.includes("bayam") || lower.includes("asem")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      altText: "Sayur Bening Kelor & Jagung Manis",
      category: "vegetable",
      tag: "Sayur Kelor Antioksidan",
    };
  }
  if (lower.includes("tongkol") || lower.includes("kakap") || lower.includes("ikan") || lower.includes("gurami")) {
    return {
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      altText: "Fillet Ikan Segar & Sambal Manis",
      category: "fish",
      tag: "Ikan Laut Segar Berprotein",
    };
  }

  // Default Balanced Indonesian School Lunch Set (Isi Piringku 5 Bintang)
  return {
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    altText: "Paket Makan Bergizi Gratis 5 Bintang Lengkap",
    category: "complete_set",
    tag: "Paket Lengkap MBG 5 Bintang",
  };
}
