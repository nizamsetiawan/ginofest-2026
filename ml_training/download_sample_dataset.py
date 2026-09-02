"""
Automated Medical Biometric Dataset Downloader for G-SCAN
Downloads curated medical sample images for:
1. Conjunctival Pallor (Anemia / Fe deficiency detection)
2. Healthy Conjunctiva
3. Nailbed Koilonychia & Discoloration
4. Healthy Nailbeds
5. Skin Turgor & Hydration
"""

import os
import urllib.request
import json

DATASET_DIR = os.path.join(os.path.dirname(__file__), "datasets")

# Curated high-yield clinical sample images from public medical archives (DermNet, Wikimedia Health, Public Health Repos)
SAMPLE_SOURCES = {
    "conjunctival_pallor": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Conjunctival_pallor.jpg/320px-Conjunctival_pallor.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Anemia_eye.jpg/320px-Anemia_eye.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Severe_anemia_conjunctiva.jpg/320px-Severe_anemia_conjunctiva.jpg"
    ],
    "conjunctival_normal": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Human_eye_with_blood_vessels.jpg/320px-Human_eye_with_blood_vessels.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Normal_eye_pink_conjunctiva.jpg/320px-Normal_eye_pink_conjunctiva.jpg"
    ],
    "nailbed_koilonychia": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Koilonychia_-_spoon_nails.jpg/320px-Koilonychia_-_spoon_nails.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Pale_nailbeds_anemia.jpg/320px-Pale_nailbeds_anemia.jpg"
    ],
    "nailbed_normal": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Healthy_human_fingernails.jpg/320px-Healthy_human_fingernails.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Normal_pink_nail_capillary.jpg/320px-Normal_pink_nail_capillary.jpg"
    ],
    "skin_turgor_delayed": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Dehydration_skin_pinch_test.jpg/320px-Dehydration_skin_pinch_test.jpg"
    ],
    "skin_turgor_normal": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Normal_hydrated_skin_pinch.jpg/320px-Normal_hydrated_skin_pinch.jpg"
    ]
}

def download_sample_dataset():
    print("📦 Memulai download dataset sampel terkurasi (SCIN / DermNet / Clinical)...")
    os.makedirs(DATASET_DIR, exist_ok=True)
    
    total_downloaded = 0
    for category, urls in SAMPLE_SOURCES.items():
        cat_dir = os.path.join(DATASET_DIR, category)
        os.makedirs(cat_dir, exist_ok=True)
        
        print(f"\n📂 Mengunduh kategori: {category} ({len(urls)} gambar)")
        for idx, url in enumerate(urls):
            dest_file = os.path.join(cat_dir, f"{category}_{idx + 1}.jpg")
            try:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response, open(dest_file, "wb") as out_f:
                    out_f.write(response.read())
                print(f"   ✓ Tersimpan: {os.path.basename(dest_file)}")
                total_downloaded += 1
            except Exception as err:
                print(f"   ⚠️ Gagal download {url}: {err}")
                
    print(f"\n🎉 Selesai! Total {total_downloaded} gambar tersimpan di folder:\n   📁 {DATASET_DIR}")
    print("\n💡 Langkah berikutnya: Buka customvision.ai -> Klik 'Add images' -> Pilih gambar dari folder tersebut!")

if __name__ == "__main__":
    download_sample_dataset()
