"""
Azure Custom Vision Training & Model Publishing Automation
Dataset: SCIN, DermNet, Wider Face
Output: Model Prediction Endpoint for G-SCAN Web & Mobile Application
"""

import os
import time
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

try:
    from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
    from azure.cognitiveservices.vision.customvision.training.models import ImageFileCreateBatch, ImageFileCreateEntry
    from msrest.authentication import ApiKeyCredentials
except ImportError:
    CustomVisionTrainingClient = None

TRAINING_ENDPOINT = os.getenv("AZURE_CUSTOM_VISION_TRAINING_ENDPOINT", "https://southeastasia.api.cognitive.microsoft.com/")
TRAINING_KEY = os.getenv("AZURE_CUSTOM_VISION_TRAINING_KEY", "")
PREDICTION_RESOURCE_ID = os.getenv("AZURE_CUSTOM_VISION_PREDICTION_RESOURCE_ID", "")
PROJECT_NAME = "GSCAN-Biometric-Nutrition-Classifier"
PUBLISH_ITERATION_NAME = "Iteration-SCIN-DermNet-v2.6"

def run_training_pipeline():
    if not CustomVisionTrainingClient:
        print("❌ Library azure-cognitiveservices-vision-customvision belum terpasang.")
        print("💡 Jalankan: pip install -r ml_training/requirements.txt")
        return

    if not TRAINING_KEY or TRAINING_KEY == "your_training_key_here":
        print("⚠️ Variabel AZURE_CUSTOM_VISION_TRAINING_KEY belum diset di .env")
        print("💡 Silakan isi Training Key dari Azure Portal untuk mengeksekusi training cloud langsung.")
        return

    credentials = ApiKeyCredentials(in_headers={"Training-key": TRAINING_KEY})
    trainer = CustomVisionTrainingClient(TRAINING_ENDPOINT, credentials)

    print(f"🔗 Menghubungkan ke Azure Custom Vision ({TRAINING_ENDPOINT})...")
    
    # 1. Cari atau buat project baru
    projects = trainer.get_projects()
    project = next((p for p in projects if p.name == PROJECT_NAME), None)
    
    if not project:
        print(f"📦 Membuat project baru: '{PROJECT_NAME}'...")
        # Domain Multiclass Classification (General / Medical)
        project = trainer.create_project(PROJECT_NAME, classification_type="Multiclass")
    else:
        print(f"✓ Menggunakan project yang sudah ada: {project.name} (ID: {project.id})")

    # 2. Buat Tags di Azure
    manifest_path = os.path.join(os.path.dirname(__file__), "processed_data", "dataset_manifest.json")
    if not os.path.exists(manifest_path):
        print("⚠️ Jalankan 01_dataset_loader_scin_dermnet.py terlebih dahulu untuk menyiapkan dataset.")
        return

    with open(manifest_path, "r") as fp:
        manifest = json.load(fp)

    existing_tags = {t.name: t for t in trainer.get_tags(project.id)}
    tags_map = {}
    
    unique_tags = list(set([item["tag"] for item in manifest]))
    for tag_name in unique_tags:
        if tag_name not in existing_tags:
            print(f"🏷️ Membuat tag baru di Azure: {tag_name}")
            tags_map[tag_name] = trainer.create_tag(project.id, tag_name)
        else:
            tags_map[tag_name] = existing_tags[tag_name]

    # 3. Upload batch gambar
    print(f"📤 Mengunggah {len(manifest)} citra berlabel ke Azure Cloud...")
    images_entries = []
    for item in manifest:
        if os.path.exists(item["filepath"]):
            with open(item["filepath"], "rb") as img_f:
                images_entries.append(
                    ImageFileCreateEntry(
                        name=item["filename"],
                        contents=img_f.read(),
                        tag_ids=[tags_map[item["tag"]].id]
                    )
                )

    # Batch upload max 64 images per request
    for i in range(0, len(images_entries), 64):
        batch = ImageFileCreateBatch(images=images_entries[i:i + 64])
        trainer.create_images_from_files(project.id, batch)
        print(f"   ✓ Batch {i // 64 + 1} terunggah")

    # 4. Trigger Training
    print("⏳ Memulai training model di GPU Azure Cluster (General [Compact] / High Precision)...")
    iteration = trainer.train_project(project.id)
    
    while iteration.status == "Training":
        time.sleep(10)
        iteration = trainer.get_iteration(project.id, iteration.id)
        print(f"   Status iterasi: {iteration.status}...")

    print(f"🎉 Training Selesai! Iteration ID: {iteration.id}")

    # 5. Publish Model ke Prediction Endpoint
    if PREDICTION_RESOURCE_ID:
        print(f"🚀 Mem-publish model ke endpoint: '{PUBLISH_ITERATION_NAME}'...")
        trainer.publish_iteration(project.id, iteration.id, PUBLISH_ITERATION_NAME, PREDICTION_RESOURCE_ID)
        print("✅ Model LIVE & Siap Dikonsumsi oleh G-SCAN App!")
        print(f"📋 Parameter untuk .env:")
        print(f"   AZURE_CUSTOM_VISION_PROJECT_ID={project.id}")
        print(f"   AZURE_CUSTOM_VISION_ITERATION_NAME={PUBLISH_ITERATION_NAME}")

if __name__ == "__main__":
    run_training_pipeline()
