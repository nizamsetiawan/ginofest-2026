const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";
const serpApiKey = "09cbbde336c59c4a96cfedf9316748e14b546aaa77b39df09680f872e97aeefb";

async function getSerpApiImage(title) {
  try {
    const searchQuery = encodeURIComponent(title + " gizi nutrisi anak indonesia");
    const searchUrl = `https://serpapi.com/search.json?engine=google_images&q=${searchQuery}&gl=id&hl=id&api_key=${serpApiKey}`;
    console.log(`Querying SerpAPI for: "${title}"...`);
    const res = await fetch(searchUrl);
    if (res.ok) {
      const data = await res.json();
      const images = data.images_results || [];
      if (images.length > 0) {
        // Prefer high quality original or thumbnail URL
        const imageUrl = images[0].original || images[0].thumbnail || "";
        console.log(`-> Found SerpAPI image: ${imageUrl.substring(0, 70)}...`);
        return imageUrl;
      } else {
        console.warn(`-> No image results returned for "${title}"`);
      }
    } else {
      console.warn(`-> SerpAPI HTTP Error (${res.status}):`, await res.text());
    }
  } catch (err) {
    console.warn(`-> SerpAPI Error for "${title}":`, err.message);
  }
  return "";
}

async function updateArticlesWithSerpApi() {
  console.log("Fetching documents from Firestore gscan_articles...");
  const listEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/gscan_articles?pageSize=100&key=${apiKey}`;
  const res = await fetch(listEndpoint);
  const data = await res.json();
  const docs = data.documents || [];
  console.log(`Found ${docs.length} documents in Firestore gscan_articles.`);

  let updatedCount = 0;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const docName = doc.name;
    const fields = doc.fields || {};
    const title = fields.title?.stringValue || "";

    if (title) {
      const serpUrl = await getSerpApiImage(title);
      if (serpUrl) {
        console.log(`Updating document ${docName.split("/").pop()} with SerpAPI imageUrl...`);
        const patchEndpoint = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=imageUrl&key=${apiKey}`;
        const patchRes = await fetch(patchEndpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              ...fields,
              imageUrl: { stringValue: serpUrl }
            }
          })
        });

        if (patchRes.ok) {
          updatedCount++;
          console.log(`-> Document ${i + 1}/${docs.length} updated successfully!`);
        } else {
          console.warn(`-> Failed to patch ${docName}:`, await patchRes.text());
        }
      }
    }
    // Small delay between SerpAPI queries to avoid rate limits
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n🎉 Completed! Successfully fetched SerpAPI Google Images and updated ${updatedCount}/${docs.length} articles in Firestore!`);
}

updateArticlesWithSerpApi().catch(console.error);
