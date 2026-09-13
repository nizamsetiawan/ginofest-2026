import os
import io
from PIL import Image, ImageDraw

def create_real_binary_jpeg(title, subtitle, badge_text, bg_color, accent_color):
    width, height = 600, 600
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([20, 20, 580, 580], outline=accent_color, width=10)

    # Inner target frame box
    draw.rectangle([80, 80, 520, 520], outline="#ffffff", width=4)

    # Center target circle
    draw.ellipse([200, 240, 400, 440], fill=accent_color, outline="#ffffff", width=4)

    # Text rendering (simple default font)
    draw.text((300, 120), title, fill="#ffffff", anchor="mm")
    draw.text((300, 170), subtitle, fill="#cbd5e1", anchor="mm")
    draw.text((300, 340), badge_text, fill="#ffffff", anchor="mm")

    # Bottom Pill
    draw.rectangle([120, 480, 480, 540], fill="#0284c7")
    draw.text((300, 510), "KCAL BIOMETRIC SCAN VERIFIED", fill="#ffffff", anchor="mm")

    return img

output_dir = os.path.join(os.path.dirname(__file__), "temp_jpegs")
os.makedirs(output_dir, exist_ok=True)

face_img = create_real_binary_jpeg("FRAME 1: WAJAH", "Deteksi Vitalitas & Rona Fisik Anak", "VITALITAS 73%", "#1e293b", "#0284c7")
eye_img = create_real_binary_jpeg("FRAME 2: MATA", "Analisis Konjungtiva & Pallor Anemia", "KONJUNGTIVA SEHAT", "#0f172a", "#16a34a")
hand_img = create_real_binary_jpeg("FRAME 3: TANGAN", "Uji Turgor & Dehidrasi Kulit Tangan", "TURGOR ELASTIS", "#1e1b4b", "#4f46e5")
nail_img = create_real_binary_jpeg("FRAME 4: KUKU", "Uji Capillary Refill & Sianosis Kuku", "CAPILLARY 80%", "#172554", "#e11d48")

face_img.save(os.path.join(output_dir, "01_wajah.jpg"), "JPEG", quality=95)
eye_img.save(os.path.join(output_dir, "02_mata_konjungtiva.jpg"), "JPEG", quality=95)
hand_img.save(os.path.join(output_dir, "03_tangan_turgor.jpg"), "JPEG", quality=95)
nail_img.save(os.path.join(output_dir, "04_kuku_capillary.jpg"), "JPEG", quality=95)

print(f"✅ Generated 4 real JPEG files in {output_dir}")

