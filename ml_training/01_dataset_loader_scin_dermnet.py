"""
G-SCAN Dataset Loader & Preprocessing Pipeline
Datasets:
1. SCIN (Skin Condition Image Dataset - Google Research)
   Ref: https://research.google/blog/scin-a-new-resource-for-representative-dermatology-images/
2. DermNet (Dermatology Image Atlas)
   Ref: https://dermnetnz.org/images
3. Wider Face (Facial landmarks & symmetry)
"""

import os
import cv2
import json
import numpy as np
from PIL import Image, ImageEnhance
from tqdm import tqdm

DATASET_ROOT = os.path.join(os.path.dirname(__file__), "datasets")
PROCESSED_ROOT = os.path.join(os.path.dirname(__file__), "processed_data")

CATEGORIES = {
    "conjunctival_pallor_positive": "Mata konjungtiva pucat (indikasi Anemia / Defisiensi Fe)",
    "conjunctival_pallor_negative": "Mata konjungtiva merah muda sehat (Normal)",
    "nailbed_koilonychia": "Kuku sendok / diskolorasi pucat (Defisiensi Zat Besi)",
    "nailbed_normal": "Kuku merah muda sirkulasi kapiler < 2 detik (Normal)",
    "skin_turgor_delayed": "Turgor kulit lambat / dehidrasi gizi kurang",
    "skin_turgor_normal": "Turgor kulit elastis sehat",
    "face_vitality_healthy": "Simetri dan vitalitas wajah normal"
}

def ensure_dirs():
    for cat in CATEGORIES.keys():
        os.makedirs(os.path.join(PROCESSED_ROOT, cat), exist_ok=True)
    os.makedirs(DATASET_ROOT, exist_ok=True)

def apply_medical_clahe(image_np):
    """
    Contrast Limited Adaptive Histogram Equalization (CLAHE)
    Khusus untuk menonjolkan saturasi warna hemoglobin pada konjungtiva dan bantalan kuku.
    """
    lab = cv2.cvtColor(image_np, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

def augment_image(image_pil):
    """
    Augmentasi citra medis untuk mengatasi variasi pencahayaan kamera HP.
    """
    augmented = []
    
    # 1. Original
    augmented.append(image_pil)
    
    # 2. Horizontal Flip
    augmented.append(image_pil.transpose(Image.FLIP_LEFT_RIGHT))
    
    # 3. Brightness variations (+15% & -15%)
    enhancer = ImageEnhance.Brightness(image_pil)
    augmented.append(enhancer.enhance(1.15))
    augmented.append(enhancer.enhance(0.85))
    
    # 4. Contrast enhancement
    contrast = ImageEnhance.Contrast(image_pil)
    augmented.append(contrast.enhance(1.2))
    
    return augmented

def build_sample_manifest():
    """
    Membuat manifest metadata terstruktur untuk upload ke Azure Custom Vision.
    """
    manifest = []
    for cat, desc in CATEGORIES.items():
        cat_dir = os.path.join(PROCESSED_ROOT, cat)
        files = [f for f in os.listdir(cat_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
        for f in files:
            manifest.append({
                "filename": f,
                "filepath": os.path.join(cat_dir, f),
                "tag": cat,
                "description": desc,
                "dataset_source": "SCIN_DERMNET_SYNTHETIC_AUGMENTED"
            })
            
    manifest_path = os.path.join(PROCESSED_ROOT, "dataset_manifest.json")
    with open(manifest_path, "w") as fp:
        json.dump(manifest, fp, indent=2)
        
    print(f"✅ Manifest berhasil dibuat: {manifest_path} ({len(manifest)} sampel)")
    return manifest

if __name__ == "__main__":
    print("🚀 Inisialisasi Dataset Loader SCIN & DermNet...")
    ensure_dirs()
    print("📁 Direktori pemrosesan dataset siap di:", PROCESSED_ROOT)
    build_sample_manifest()
