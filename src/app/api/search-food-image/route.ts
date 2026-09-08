import { NextRequest, NextResponse } from "next/server";
import { getCachedFoodImageFromFirestore, saveCachedFoodImageToFirestore } from "@/services/firebase-service";

// Fallback high quality culinary photos if offline or rate limited
const VERIFIED_CULINARY_FALLBACKS: Record<string, string> = {
  bandeng: "/assets/mbg_tray_bandeng.jpg",
  ikan: "/assets/mbg_tray_bandeng.jpg",
  daging: "/assets/mbg_tray_daging.jpg",
  semur: "/assets/mbg_tray_daging.jpg",
  sapi: "/assets/mbg_tray_daging.jpg",
  ayam: "/assets/mbg_tray_ayam.jpg",
  default: "/assets/mbg_tray_ayam.jpg"
};

function getFallbackPhoto(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, url] of Object.entries(VERIFIED_CULINARY_FALLBACKS)) {
    if (lower.includes(key)) return url;
  }
  return VERIFIED_CULINARY_FALLBACKS.default;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "Nasi Bandeng Bakar Gresik";
  const apiKey = process.env.SERPAPI_API_KEY || "09cbbde336c59c4a96cfedf9316748e14b546aaa77b39df09680f872e97aeefb";

  try {
    // 1. Check Cloud Firestore Persistent Cache first (Saves 100% API Quota!)
    const cloudCached = await getCachedFoodImageFromFirestore(query);
    if (cloudCached && cloudCached.imageUrl) {
      return NextResponse.json({
        success: true,
        imageUrl: cloudCached.imageUrl,
        title: cloudCached.title || query,
        source: "firestore_persistent_cache"
      });
    }

    // 2. If not found in Firestore, search Google Images via SerpApi
    const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query + " kuliner piring")}&gl=id&hl=id&api_key=${apiKey}`;
    
    const response = await fetch(searchUrl, {
      next: { revalidate: 86400 } // Edge Cache for 24 hours
    });

    if (!response.ok) {
      console.warn(`[SerpApi] Search failed status ${response.status}, using verified fallback`);
      const fallbackUrl = getFallbackPhoto(query);
      return NextResponse.json({
        success: true,
        imageUrl: fallbackUrl,
        source: "verified_fallback"
      });
    }

    const data = await response.json();
    const images = data.images_results || [];

    if (images.length > 0) {
      // Pick first valid image with high quality thumbnail
      const best = images[0];
      const imageUrl = best.thumbnail || best.original || getFallbackPhoto(query);
      const title = best.title || query;

      // 3. Persist to Firestore cache for all users permanently
      await saveCachedFoodImageToFirestore(query, imageUrl, title);
      
      return NextResponse.json({
        success: true,
        imageUrl,
        title,
        source: "google_images_serpapi"
      });
    }

    const fallbackUrl = getFallbackPhoto(query);
    await saveCachedFoodImageToFirestore(query, fallbackUrl, query);

    return NextResponse.json({
      success: true,
      imageUrl: fallbackUrl,
      source: "verified_fallback"
    });
  } catch (error) {
    console.error("[SerpApi] Error fetching Google Image:", error);
    return NextResponse.json({
      success: true,
      imageUrl: getFallbackPhoto(query),
      source: "verified_fallback"
    });
  }
}
