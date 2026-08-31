/**
 * Dynamic AI Food Image Engine for G-Scan / MBG Menu Planner
 * 100% Dynamic - Generates prompts directly from actual Master Data composition & Gemini reasoning without static if-else mappings.
 */

export interface FoodVisualInfo {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  category: "fish" | "chicken" | "beef" | "soup" | "vegetable" | "complete_set";
  tag: string;
}

/**
 * Dynamically extracts dish ingredients from actual Master Data composition string
 * and builds a clean, photorealistic commercial food photography prompt.
 */
export function buildPhotorealisticEnglishPrompt(menuTitle: string, composition?: string): string {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  
  // Parse ingredients directly from the dynamic composition string (e.g. "Karbohidrat: Nasi | Protein: ...")
  let dishDetails = cleanTitle;
  if (composition && composition.trim().length > 5) {
    // Remove technical labels and keep pure food items
    dishDetails = composition
      .replace(/Karbohidrat:\s*/gi, "")
      .replace(/Protein Hewani:\s*/gi, "")
      .replace(/Protein Nabati:\s*/gi, "")
      .replace(/Sayuran:\s*/gi, "")
      .replace(/Buah:\s*/gi, "")
      .replace(/Susu:\s*/gi, "")
      .replace(/\|\s*/g, ", ")
      .replace(/\(\d+g\)/g, "")
      .replace(/\(\d+ml\)/g, "")
      .trim();
  }

  // Construct universal commercial food photography prompt dynamically
  return `Clean top-down centered commercial photography of authentic Indonesian dish: ${cleanTitle}, featuring ${dishDetails}, served on a clean round ceramic plate, appetizing healthy meal, soft natural studio lighting, ultra-realistic textures, 4k`;
}

/**
 * Generates dynamic AI photo URL using actual Gemini output & Master Data composition.
 */
export function getMenuFoodImage(menuTitle?: string | null, composition?: string | null, customPrompt?: string | null): FoodVisualInfo {
  const cleanTitle = (menuTitle || "Paket Makan Bergizi Gratis 5 Bintang").trim();
  
  // Use Gemini's custom AI image prompt if provided, otherwise dynamically derive from composition
  const englishPrompt = (customPrompt && customPrompt.length > 15) 
    ? customPrompt 
    : buildPhotorealisticEnglishPrompt(cleanTitle, composition || "");

  // Deterministic seed derived from menu title to keep image rendering stable
  const seed = Math.abs(cleanTitle.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 19);
  
  // Real-time dynamic AI generation URL (600x450)
  const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?width=600&height=450&nologo=true&seed=${seed}&model=flux`;

  return {
    imageUrl: aiImageUrl,
    fallbackUrl: aiImageUrl,
    altText: `Sajian Menu MBG: ${cleanTitle}`,
    category: "complete_set",
    tag: "Menu MBG Dinamis (AI Generated)",
  };
}
