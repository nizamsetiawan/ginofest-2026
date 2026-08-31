/**
 * AI Food Visual Generator for G-Scan / MBG Menu Planner
 * Generates bespoke, high-definition AI food photography in real-time based on Gemini's exact menu & recipe composition.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

// Fallback high-definition curated imagery for zero-network delay
const FALLBACK_DISH_IMAGES: Record<string, string> = {
  bandeng: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  ayam: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  daging: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  soto: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=800&q=80",
  sop: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  ikan: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  kelor: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
};

/**
 * Generates an AI-driven visual representation of the menu.
 * Constructs an AI prompt and returns a real-time generated AI image matching the recipe ingredients.
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null): FoodVisualInfo {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  const cleanComp = (composition || "Nasi Putih, Lauk Hewani, Tempe/Tahu, Sayuran Hijau, Buah Segar, Susu UHT").trim();

  // Create prompt for AI Generative Vision Model
  const promptDescription = `Professional top-down commercial food photography of ${cleanTitle}, authentic Indonesian school lunch bento tray featuring ${cleanComp}, colorful healthy balanced meal, appetizing presentation, soft natural studio lighting, ultra-detailed 4K`;
  
  // Consistent deterministic seed from title
  const seed = Math.abs(cleanTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 17);
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptDescription)}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;

  // Determine fallback image & nutrition tag
  const lower = cleanTitle.toLowerCase();
  let fallback = FALLBACK_DISH_IMAGES.default;
  let tag = "Paket Lengkap MBG 5 Bintang";
  let category: FoodVisualInfo["category"] = "complete_set";

  if (lower.includes("bandeng")) {
    fallback = FALLBACK_DISH_IMAGES.bandeng;
    tag = "Ikan Bandeng Gresik (Omega-3)";
    category = "fish";
  } else if (lower.includes("soto")) {
    fallback = FALLBACK_DISH_IMAGES.soto;
    tag = "Soto Ayam Segar & Telur";
    category = "soup";
  } else if (lower.includes("sop") || lower.includes("sup")) {
    fallback = FALLBACK_DISH_IMAGES.sop;
    tag = "Sup Bening Kaya Serat";
    category = "soup";
  } else if (lower.includes("ayam")) {
    fallback = FALLBACK_DISH_IMAGES.ayam;
    tag = "Ayam Protein Tinggi";
    category = "chicken";
  } else if (lower.includes("daging") || lower.includes("rolade") || lower.includes("semur")) {
    fallback = FALLBACK_DISH_IMAGES.daging;
    tag = "Daging Sapi Zat Besi Tinggi";
    category = "beef";
  } else if (lower.includes("kelor") || lower.includes("bayam") || lower.includes("sayur")) {
    fallback = FALLBACK_DISH_IMAGES.kelor;
    tag = "Sayur Kelor Antioksidan";
    category = "vegetable";
  } else if (lower.includes("ikan") || lower.includes("kakap") || lower.includes("tongkol") || lower.includes("gurami")) {
    fallback = FALLBACK_DISH_IMAGES.ikan;
    tag = "Ikan Segar Berprotein";
    category = "fish";
  }

  return {
    imageUrl: aiImageUrl,
    fallbackUrl: fallback,
    altText: `AI Generated Food: ${cleanTitle}`,
    category,
    tag,
  };
}
