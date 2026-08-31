import { NextRequest, NextResponse } from "next/server";

// Fallback high quality culinary photos if offline or rate limited
const VERIFIED_CULINARY_FALLBACKS: Record<string, string> = {
  bandeng: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bandeng_Bakar_01.jpg/800px-Bandeng_Bakar_01.jpg",
  ikan: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bandeng_Bakar_01.jpg/800px-Bandeng_Bakar_01.jpg",
  soto: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Soto_Ayam_Semarang.jpg/800px-Soto_Ayam_Semarang.jpg",
  ayam: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Ayam_Goreng_Kalasan_01.jpg/800px-Ayam_Goreng_Kalasan_01.jpg",
  daging: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Semur_Daging_Sapi_01.jpg/800px-Semur_Daging_Sapi_01.jpg",
  semur: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Semur_Daging_Sapi_01.jpg/800px-Semur_Daging_Sapi_01.jpg",
  telur: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Telur_Dadar_Padang.jpg/800px-Telur_Dadar_Padang.jpg",
  sayur: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Sayur_Bening_Bayam_Jagung.jpg/800px-Sayur_Bening_Bayam_Jagung.jpg",
  sop: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sayur_Sop_Bening.jpg/800px-Sayur_Sop_Bening.jpg",
  default: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Nasi_Campur_Bali.jpg/800px-Nasi_Campur_Bali.jpg"
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
    const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query + " kuliner piring")}&gl=id&hl=id&api_key=${apiKey}`;
    
    const response = await fetch(searchUrl, {
      next: { revalidate: 86400 } // Cache results for 24 hours
    });

    if (!response.ok) {
      console.warn(`[SerpApi] Search failed status ${response.status}, using verified fallback`);
      return NextResponse.json({
        success: true,
        imageUrl: getFallbackPhoto(query),
        source: "verified_fallback"
      });
    }

    const data = await response.json();
    const images = data.images_results || [];

    if (images.length > 0) {
      // Pick first valid image with high quality thumbnail
      const best = images[0];
      const imageUrl = best.thumbnail || best.original || getFallbackPhoto(query);
      
      return NextResponse.json({
        success: true,
        imageUrl,
        title: best.title || query,
        source: "google_images_serpapi"
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl: getFallbackPhoto(query),
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
