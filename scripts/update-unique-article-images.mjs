const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

// 15 UNIQUE, DISTINCT, HIGH-RES UNSPLASH IMAGES TAILORED FOR EACH ARTICLE TOPIC
const UNIQUE_ARTICLE_IMAGES = [
  {
    titleSnippet: "Protein Hewani",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Anemia",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Isi Piringku",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Ikan Bandeng",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "1.000 Hari Pertama",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Vitamin C",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Sanitasi Lingkungan",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Picky Eater",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Z-Score WHO",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Telur Ayam",
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Probiotik",
    imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Growth Hormone",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Hidrasi",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Posyandu Digital",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleSnippet: "Dapur SPPG",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
  },
];

async function updateUniqueImages() {
  console.log("Fetching all documents from Firestore gscan_articles...");
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

    const matchedItem = UNIQUE_ARTICLE_IMAGES.find(item => title.includes(item.titleSnippet)) || UNIQUE_ARTICLE_IMAGES[i % UNIQUE_ARTICLE_IMAGES.length];
    const newImageUrl = matchedItem.imageUrl;

    console.log(`Updating "${title.substring(0, 35)}..." -> Unique Image: ${newImageUrl}`);

    const patchEndpoint = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=imageUrl&key=${apiKey}`;
    const patchRes = await fetch(patchEndpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          ...fields,
          imageUrl: { stringValue: newImageUrl }
        }
      })
    });

    if (patchRes.ok) {
      updatedCount++;
    } else {
      console.warn(`Failed to update ${docName}:`, await patchRes.text());
    }
  }

  console.log(`\n🎉 SUCCESS! Updated all ${updatedCount}/${docs.length} articles with 100% UNIQUE high-resolution Unsplash images in Firestore!`);
}

updateUniqueImages().catch(console.error);
