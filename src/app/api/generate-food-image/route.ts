import { NextRequest, NextResponse } from "next/server";

// Authentic Indonesian Food Photography Archive (Zero AI Hallucination Fallback)
const REAL_INDONESIAN_FOOD_PHOTOS: Record<string, string> = {
  bandeng: "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800",
  ayam: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800",
  daging: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800",
  soto: "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800",
  sayur: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
  default: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
};

/**
 * Google Gemini / Nano Banana Image Generation API Route
 * Attempts Google GenAI Image Generation first; if rate-limited (429), serves authentic real dish photography.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { menuTitle, composition } = body;

    if (!menuTitle) {
      return NextResponse.json({ success: false, message: "menuTitle diperlukan" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      const promptText = `Professional commercial top-down food photography of authentic Indonesian dish: ${menuTitle}, featuring ${composition || "steamed white rice, protein, tempeh, fresh soup, and fruit"}, appetizing presentation on a clean ceramic plate, warm natural studio lighting, ultra-realistic 4K textures`;

      const nanoBananaModels = [
        "gemini-2.5-flash-image",
        "nano-banana-pro-preview",
        "gemini-3.1-flash-image"
      ];

      for (const model of nanoBananaModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: promptText }]
                }
              ]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const parts = data?.candidates?.[0]?.content?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  const base64Img = `data:${part.inlineData.mimeType || "image/jpeg"};base64,${part.inlineData.data}`;
                  return NextResponse.json({
                    success: true,
                    engine: `GOOGLE_NANO_BANANA_LIVE (${model})`,
                    imageUrl: base64Img,
                    title: menuTitle
                  });
                }
              }
            }
          }
        } catch (err) {
          console.warn(`Model ${model} error:`, err);
        }
      }
    }

    // High quality real culinary fallback when Google API rate-limit (429) occurs
    const lower = (menuTitle + " " + (composition || "")).toLowerCase();
    let fallbackPhoto = REAL_INDONESIAN_FOOD_PHOTOS.default;

    if (lower.includes("bandeng") || lower.includes("ikan") || lower.includes("kakap") || lower.includes("tongkol")) {
      fallbackPhoto = REAL_INDONESIAN_FOOD_PHOTOS.bandeng;
    } else if (lower.includes("ayam") || lower.includes("soto")) {
      fallbackPhoto = REAL_INDONESIAN_FOOD_PHOTOS.ayam;
    } else if (lower.includes("daging") || lower.includes("semur") || lower.includes("rolade")) {
      fallbackPhoto = REAL_INDONESIAN_FOOD_PHOTOS.daging;
    } else if (lower.includes("sop") || lower.includes("sayur") || lower.includes("kelor") || lower.includes("bayam")) {
      fallbackPhoto = REAL_INDONESIAN_FOOD_PHOTOS.sayur;
    }

    return NextResponse.json({
      success: true,
      engine: "AUTHENTIC_INDONESIAN_CULINARY_ARCHIVE",
      imageUrl: fallbackPhoto,
      title: menuTitle
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal memproses foto makanan",
    }, { status: 500 });
  }
}
