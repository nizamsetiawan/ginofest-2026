/**
 * Dynamic AI Food Image Engine for G-Scan / MBG Menu Planner
 * Translates Indonesian culinary items into pristine, universal English commercial photography prompts for AI image generation.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

/**
 * Intelligently translates Indonesian culinary menu descriptions into high-precision English food photography prompts.
 */
export function buildPhotorealisticEnglishPrompt(menuTitle: string, composition?: string): string {
  const lower = (menuTitle + " " + (composition || "")).toLowerCase();

  let mainDish = "balanced Indonesian meal with steamed white rice, protein, and vegetables";
  
  if (lower.includes("bandeng")) {
    mainDish = "Indonesian grilled marinated milkfish with steamed white rice, golden fried tempeh, and fresh lime wedge";
  } else if (lower.includes("soto")) {
    mainDish = "Indonesian chicken turmeric soup soto in a ceramic bowl with shredded chicken, boiled egg slices, and celery";
  } else if (lower.includes("ayam")) {
    mainDish = "Indonesian golden spiced fried chicken drumstick with steamed white rice, fried tempeh, and fresh cucumber slices";
  } else if (lower.includes("daging") || lower.includes("semur") || lower.includes("rolade")) {
    mainDish = "Indonesian tender beef stew with sliced carrots and steamed white rice on a clean plate";
  } else if (lower.includes("sop") || lower.includes("sup")) {
    mainDish = "clear Indonesian vegetable soup in a small bowl with carrots, corn, and greens served with steamed rice";
  } else if (lower.includes("ikan") || lower.includes("kakap") || lower.includes("tongkol") || lower.includes("gurami") || lower.includes("lele")) {
    mainDish = "Indonesian crispy fried fish fillet with steamed white rice, tempeh, and fresh vegetables";
  } else if (lower.includes("telur")) {
    mainDish = "Indonesian thick vegetable omelette with steamed white rice and crispy tempeh";
  }

  // Construct commercial photography prompt
  return `Clean top-down centered commercial photography of ${mainDish} served on a clean round ceramic plate, appetizing healthy meal, soft natural studio lighting, ultra-realistic textures, clean background, 4k`;
}

/**
 * Generates a dynamic AI photo URL using the translated English food prompt.
 * Lightweight resolution (600x450) for fast, crisp rendering.
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null): FoodVisualInfo {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  const englishPrompt = buildPhotorealisticEnglishPrompt(cleanTitle, composition || "");

  // Deterministic seed derived from menu title to keep image stable per recipe
  const seed = Math.abs(cleanTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 19);
  
  // Real-time AI Generated Image Endpoint (Lightweight 600x450 with Flux model)
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?width=600&height=450&nologo=true&seed=${seed}&model=flux`;

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
    altText: `AI Generated Food: ${cleanTitle}`,
    category,
    tag,
  };
}
