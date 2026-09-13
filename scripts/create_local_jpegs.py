import io
import os
from PIL import Image, ImageDraw

def create_real_binary_jpeg(filepath, title, subtitle, badge_text, bg_color, accent_color):
    width, height = 600, 600
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([20, 20, 580, 580], outline=accent_color, width=10)

    # Inner target frame box
    draw.rectangle([80, 80, 520, 520], outline="#ffffff", width=4)

    # Center target circle
    draw.ellipse([200, 240, 400, 440], fill=accent_color, outline="#ffffff", width=4)

    # Title & Subtitle Text
    draw.text((300, 120), title, fill="#ffffff", anchor="mm")
    draw.text((300, 170), subtitle, fill="#cbd5e1", anchor="mm")
    draw.text((300, 340), badge_text, fill="#ffffff", anchor="mm")

    # Bottom Pill
    draw.rectangle([120, 480, 480, 540], fill="#0284c7")
    draw.text((300, 510), "KCAL BIOMETRIC SCAN VERIFIED", fill="#ffffff", anchor="mm")

    img.save(filepath, format="JPEG", quality=95)
    print(f"✅ Created real binary JPEG: {filepath}")

os.makedirs("scripts/temp_jpegs", exist_ok=True)
create_real_binary_jpeg("scripts/temp_jpegs/01_wajah.jpg", "FRAME 1: WAJAH", "Deteksi Vitalitas & Rona Fisik Anak", "VITALITAS 73%", "#1e293b", "#0284c7")
create_real_binary_jpeg("scripts/temp_jpegs/02_mata_konjungtiva.jpg", "FRAME 2: MATA", "Analisis Konjungtiva & Pallor Anemia", "KONJUNGTIVA SEHAT", "#0f172a", "#16a34a")
create_real_binary_jpeg("scripts/temp_jpegs/03_tangan_turgor.jpg", "FRAME 3: TANGAN", "Uji Turgor & Dehidrasi Kulit Tangan", "TURGOR ELASTIS", "#1e1b4b", "#4f46e5")
create_real_binary_jpeg("scripts/temp_jpegs/04_kuku_capillary.jpg", "FRAME 4: KUKU", "Uji Capillary Refill & Sianosis Kuku", "CAPILLARY 80%", "#172554", "#e11d48")
