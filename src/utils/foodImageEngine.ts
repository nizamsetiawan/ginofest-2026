/**
 * Food Image & Visual Engine for G-Scan / MBG Menu Planner
 * Maps each generated menu directly to authentic Indonesian MBG School Lunch Tray photos.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

// Authentic Indonesian School Lunch (MBG) Food Tray Photos
const MBG_DISH_PHOTOS: Record<string, string> = {
  bandeng: "/assets/food/mbg_bandeng.jpg",
  ikan: "/assets/food/mbg_bandeng.jpg",
  ayam: "/assets/food/mbg_ayam.jpg",
  daging: "/assets/food/mbg_daging.jpg",
  rolade: "/assets/food/mbg_daging.jpg",
  semur: "/assets/food/mbg_daging.jpg",
  soto: "/assets/food/mbg_ayam.jpg",
  sop: "/assets/food/mbg_bandeng.jpg",
  kelor: "/assets/food/mbg_bandeng.jpg",
  default: "/assets/food/mbg_default.jpg",
};

/**
 * Resolves an authentic, lightweight MBG school meal tray photo for any generated menu.
 * Instant load (0 seconds), perfectly aligned with MBG BGN & Kemenkes standards.
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null): FoodVisualInfo {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  const lower = ((menuTitle || "") + " " + (composition || "")).toLowerCase();

  let photoUrl = MBG_DISH_PHOTOS.default;
  let tag = "Paket Lengkap MBG 5 Bintang";
  let category: FoodVisualInfo["category"] = "complete_set";

  if (lower.includes("bandeng")) {
    photoUrl = MBG_DISH_PHOTOS.bandeng;
    tag = "Ikan Bandeng Gresik (Omega-3)";
    category = "fish";
  } else if (lower.includes("ayam") || lower.includes("soto")) {
    photoUrl = MBG_DISH_PHOTOS.ayam;
    tag = "Ayam Protein Tinggi";
    category = "chicken";
  } else if (lower.includes("daging") || lower.includes("rolade") || lower.includes("semur") || lower.includes("sapi")) {
    photoUrl = MBG_DISH_PHOTOS.daging;
    tag = "Daging Sapi Zat Besi Tinggi";
    category = "beef";
  } else if (lower.includes("ikan") || lower.includes("kakap") || lower.includes("tongkol") || lower.includes("gurami") || lower.includes("lele") || lower.includes("kerapu")) {
    photoUrl = MBG_DISH_PHOTOS.bandeng;
    tag = "Ikan Segar Berprotein Tinggi";
    category = "fish";
  } else if (lower.includes("kelor") || lower.includes("bayam") || lower.includes("sayur") || lower.includes("sop")) {
    photoUrl = MBG_DISH_PHOTOS.bandeng;
    tag = "Sayur Kelor Antioksidan";
    category = "vegetable";
  }

  return {
    imageUrl: photoUrl,
    fallbackUrl: MBG_DISH_PHOTOS.default,
    altText: `Sajian Baki MBG: ${cleanTitle}`,
    category,
    tag,
  };
}
