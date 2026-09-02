"""
Data Komoditas dan Harga Pangan Daerah (Badan Pangan Nasional / Bapanas)
Source: https://panelharga.badanpangan.go.id/#
Function: Sinkronisasi data komoditas pangan lokal & harga pasar ke Firebase RAG Knowledge Base.
"""

import os
import json
from datetime import datetime

SAMPLE_BAPANAS_COMMODITIES = [
    {
        "id": "kom_ayam_ras",
        "name": "Daging Ayam Ras Segar",
        "category": "Protein Hewani",
        "standard_price_per_kg": 34500,
        "region": "Kabupaten Gresik",
        "protein_per_100g": 27.0,
        "iron_mg_per_100g": 1.3,
        "calories_per_100g": 165,
        "availability_status": "Melimpah (Panen Daerah)",
        "source": "Bapanas Panel Harga 2026"
    },
    {
        "id": "kom_ikan_bandeng",
        "name": "Ikan Bandeng Tambak Segar (Manyar)",
        "category": "Protein Hewani & Omega-3",
        "standard_price_per_kg": 28000,
        "region": "Kabupaten Gresik",
        "protein_per_100g": 20.0,
        "iron_mg_per_100g": 2.0,
        "calories_per_100g": 128,
        "availability_status": "Sangat Melimpah (Komoditas Utama)",
        "source": "Dinas Kelautan & Perikanan Gresik / Bapanas"
    },
    {
        "id": "kom_telur_ayam",
        "name": "Telur Ayam Ras Segar",
        "category": "Protein Hewani",
        "standard_price_per_kg": 27000,
        "region": "Kabupaten Gresik",
        "protein_per_100g": 12.6,
        "iron_mg_per_100g": 1.8,
        "calories_per_100g": 143,
        "availability_status": "Stabil",
        "source": "Bapanas Panel Harga 2026"
    },
    {
        "id": "kom_sayur_bayam_kelor",
        "name": "Bayam Hijau & Daun Kelor (Moringa)",
        "category": "Sayuran & Mikronutrien",
        "standard_price_per_kg": 12000,
        "region": "Kabupaten Gresik",
        "protein_per_100g": 3.5,
        "iron_mg_per_100g": 4.5,
        "calories_per_100g": 35,
        "availability_status": "Melimpah",
        "source": "Bapanas Panel Harga 2026"
    }
]

def export_bapanas_knowledge_base():
    output_path = os.path.join(os.path.dirname(__file__), "processed_data", "bapanas_commodities_rag.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as fp:
        json.dump({
            "updatedAt": datetime.now().isoformat(),
            "region": "Kabupaten Gresik (Kec. Kebomas & Sekitarnya)",
            "source": "Badan Pangan Nasional (Bapanas) 2026",
            "commodities": SAMPLE_BAPANAS_COMMODITIES
        }, fp, indent=2)
        
    print(f"✅ RAG Database Bapanas berhasil diekspor: {output_path}")
    return output_path

if __name__ == "__main__":
    print("🌾 Menyiapkan Knowledge Base Data Pangan Bapanas...")
    export_bapanas_knowledge_base()
