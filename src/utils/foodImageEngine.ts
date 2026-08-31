/**
 * Dynamic AI Food Image Engine for G-Scan / MBG Menu Planner
 * 100% Dynamic AI-driven image generation with zero local static image dependencies.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

/**
 * Generates a dynamic AI photo URL specifically created for the unique Gemini menu output.
 * Pure dynamic real-time AI generation (600x450).
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null): FoodVisualInfo {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  const cleanComp = (composition || "Nasi Putih, Lauk Hewani, Tempe/Tahu, Sayuran Hijau, Buah Segar, Susu UHT").trim();

  // Dynamic Prompt tailored specifically to the unique generated recipe
  const promptDescription = `Clean top-down centered commercial photography of an Indonesian MBG school lunch tray: ${cleanTitle}, containing ${cleanComp}, stainless steel bento compartment tray on clean school table, healthy school nutrition, vibrant appetizing meal, photorealistic`;

  // Deterministic seed derived from menu title to keep image stable
  const seed = Math.abs(cleanTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 19);
  
  // Real-time AI Generated Image Endpoint (Lightweight 600x450)
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptDescription)}?width=600&height=450&nologo=true&seed=${seed}&model=flux`;

  const lower = cleanTitle.toLowerCase();
  let tag = "Menu MBG AI (Dinamis)";
  let category: FoodVisualInfo["category"] = "complete_set";

  if (lower.includes("bandeng") || lower.includes("ikan") || lower.includes("kakap")) {
    tag = "Ikan Bergizi Tinggi (AI Generated)";
    category = "fish";
  } else if (lower.includes("ayam") || lower.includes("soto")) {
    tag = "Ayam Protein Tinggi (AI Generated)";
    category = "chicken";
  } else if (lower.includes("daging") || lower.includes("rolade") || lower.includes("semur")) {
    tag = "Daging Sapi Zat Besi (AI Generated)";
    category = "beef";
  }

  return {
    imageUrl: aiImageUrl,
    fallbackUrl: aiImageUrl,
    altText: `AI Generated MBG Tray: ${cleanTitle}`,
    category,
    tag,
  };
}
