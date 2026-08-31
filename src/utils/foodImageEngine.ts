/**
 * Food Image & Visual Engine for G-Scan / MBG Menu Planner
 * Completely self-contained within the application with zero external Unsplash dependencies.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

// Local, self-hosted food illustrations matching Gov-AI / KCAL design system
const LOCAL_DISH_ASSETS: Record<string, string> = {
  bandeng: "/assets/food/bandeng.svg",
  ayam: "/assets/food/ayam.svg",
  daging: "/assets/food/daging.svg",
  soto: "/assets/food/soto.svg",
  sop: "/assets/food/soto.svg",
  ikan: "/assets/food/bandeng.svg",
  kelor: "/assets/food/bandeng.svg",
  default: "/assets/food/default.svg",
};

/**
 * Resolves an authentic, instant visual representation for any menu item.
 * Instant load (0 seconds), completely self-contained, no external Unsplash URLs.
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null): FoodVisualInfo {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  const lower = ((menuTitle || "") + " " + (composition || "")).toLowerCase();

  let assetUrl = LOCAL_DISH_ASSETS.default;
  let tag = "Paket Lengkap MBG 5 Bintang";
  let category: FoodVisualInfo["category"] = "complete_set";

  if (lower.includes("bandeng")) {
    assetUrl = LOCAL_DISH_ASSETS.bandeng;
    tag = "Ikan Bandeng Gresik (Omega-3)";
    category = "fish";
  } else if (lower.includes("soto")) {
    assetUrl = LOCAL_DISH_ASSETS.soto;
    tag = "Soto Ayam Segar & Telur";
    category = "soup";
  } else if (lower.includes("sop") || lower.includes("sup")) {
    assetUrl = LOCAL_DISH_ASSETS.sop;
    tag = "Sup Bening Kaya Serat";
    category = "soup";
  } else if (lower.includes("ayam")) {
    assetUrl = LOCAL_DISH_ASSETS.ayam;
    tag = "Ayam Protein Tinggi";
    category = "chicken";
  } else if (lower.includes("daging") || lower.includes("rolade") || lower.includes("semur")) {
    assetUrl = LOCAL_DISH_ASSETS.daging;
    tag = "Daging Sapi Zat Besi Tinggi";
    category = "beef";
  } else if (lower.includes("kelor") || lower.includes("bayam") || lower.includes("sayur")) {
    assetUrl = LOCAL_DISH_ASSETS.bandeng;
    tag = "Sayur Kelor Antioksidan";
    category = "vegetable";
  } else if (lower.includes("ikan") || lower.includes("kakap") || lower.includes("tongkol") || lower.includes("gurami")) {
    assetUrl = LOCAL_DISH_ASSETS.bandeng;
    tag = "Ikan Segar Berprotein";
    category = "fish";
  }

  return {
    imageUrl: assetUrl,
    fallbackUrl: LOCAL_DISH_ASSETS.default,
    altText: `Sajian Menu MBG: ${cleanTitle}`,
    category,
    tag,
  };
}
