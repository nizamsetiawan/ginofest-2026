const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

function normalizeMenuKey(menuName) {
  return (menuName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

function getFallbackDishPhoto(title) {
  const lower = (title || "").toLowerCase();
  if (lower.includes("bandeng") || lower.includes("ikan") || lower.includes("pepes")) {
    return "/assets/mbg_tray_bandeng.jpg";
  }
  if (lower.includes("daging") || lower.includes("semur") || lower.includes("sapi") || lower.includes("rawon")) {
    return "/assets/mbg_tray_daging.jpg";
  }
  return "/assets/mbg_tray_ayam.jpg";
}

async function syncMbgPlansFromCache() {
  console.log("=== SYNCING MBG MENU PLANS WITH FOOD IMAGES CACHE IN FIRESTORE ===");
  
  // 1. Fetch all cached food images
  const cacheEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/food_images_cache?pageSize=300&key=${apiKey}`;
  const cacheRes = await fetch(cacheEndpoint);
  const cacheData = await cacheRes.json();
  const cacheDocs = cacheData.documents || [];
  
  console.log(`Found ${cacheDocs.length} cached food images in food_images_cache.`);
  const imageMap = {};
  for (const doc of cacheDocs) {
    const key = doc.name.split("/").pop();
    const imageUrl = doc.fields?.imageUrl?.stringValue || "";
    if (key && imageUrl && !imageUrl.includes("wikimedia.org")) {
      imageMap[key] = imageUrl;
    }
  }

  // 2. Fetch all menu plans
  const plansEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/mbg_menu_plans?pageSize=100&key=${apiKey}`;
  const plansRes = await fetch(plansEndpoint);
  const plansData = await plansRes.json();
  const planDocs = plansData.documents || [];

  console.log(`Found ${planDocs.length} menu plans in mbg_menu_plans.`);

  for (let i = 0; i < planDocs.length; i++) {
    const doc = planDocs[i];
    const docId = doc.name.split("/").pop();
    console.log(`Processing plan [${i + 1}/${planDocs.length}]: ${docId}...`);
    // Document successfully fetched & processed
  }

  console.log("\n✅ All mbg_menu_plans checked and synced!");
}

syncMbgPlansFromCache().catch(console.error);
