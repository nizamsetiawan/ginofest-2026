const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

const ARTICLES_DATA = [
  {
    category: "Pencegahan Stunting",
    title: "Pentingnya Protein Hewani pada Porsi Makan Bergizi Gratis",
    readTime: "3 mnt baca",
    tag: "Kemenkes RI",
    author: "Tim Ahli Gizi BGN",
    publishedDate: "2026-09-01",
    summary: "Asupan asam amino esensial dari daging ayam, telur, dan ikan lokal sangat krusial dalam memicu hormon pertumbuhan tinggi badan anak.",
    content: "Berdasarkan standar BGN 2026 dan Kemenkes RI, satu porsi MBG wajib mengandung minimal 25-30 gram protein hewani murni untuk menunjang tumbuh kembang optimal anak di usia sekolah dasar. Protein hewani mengandung profil asam amino esensial lengkap yang langsung digunakan oleh epifisis tulang balita dan anak untuk menambah tinggi badan serta mencegah risiko stunting secara signifikan.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Deteksi Dini AI",
    title: "Mengenali Tanda Anemia dari Konjungtiva & Bantalan Kuku Balita",
    readTime: "4 mnt baca",
    tag: "AI Biometrik",
    author: "Tim Biomedis Kcal",
    publishedDate: "2026-08-30",
    summary: "Kelopak mata pucat dan waktu pengisian kapiler kuku lebih dari 2 detik adalah indikasi awal kekurangan zat besi yang perlu penanganan cepat.",
    content: "Fitur pemindaian biometrik Kcal menganalisis spektrum warna konjungtiva dan capillary refill time kuku untuk merekomendasikan tambahan zat besi pada menu MBG anak Anda. Deteksi dini hemoglobin berbasis citra mata dan kuku membantu posyandu dan puskesmas memberikan intervensi harian tanpa prosedur invasif.",
    imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pedoman Nutrisi",
    title: "Prinsip Isi Piringku 5 Bintang untuk Anak Usia Sekolah Dasar",
    readTime: "3 mnt baca",
    tag: "Gizi Seimbang",
    author: "Tim Edukasi Nutrisi Nasional",
    publishedDate: "2026-08-28",
    summary: "Proporsi 1/3 makanan pokok, 1/3 sayuran, 1/6 lauk pauk, dan 1/6 buah-buahan untuk menjaga imunitas dan konsentrasi belajar.",
    content: "Setiap bento tray MBG dirancang mengikuti kaidah gizi seimbang dengan gramatur yang telah ditimbang tepat oleh ahli gizi SPPG. Keseimbangan karbohidrat kompleks dari beras lokal, sayuran kaya serat, buah segar, dan protein hewani menjamin kecukupan gizi harian anak saat menuntut ilmu.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pangan Lokal",
    title: "Keunggulan Nutrisi Ikan Bandeng & Kupang Lokal untuk Otak Anak",
    readTime: "4 mnt baca",
    tag: "Pangan Lokal",
    author: "Pakar Gizi Komunitas",
    publishedDate: "2026-08-25",
    summary: "Kandungan Omega-3, DHA, dan Zinc pada komoditas perikanan lokal sangat efektif mendukung perkembangan kognitif balita.",
    content: "Ikan bandeng segar dan komoditas kerang lokal memiliki kadar Omega-3 EPA dan DHA yang sebanding dengan ikan laut dalam. Mengonsumsi olahan ikan bandeng tanpa duri minimal 3 kali seminggu meningkatkan kemampuan daya ingat, fokus belajar, serta kekebalan tubuh balita dari infeksi.",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Kesehatan Ibu & Anak",
    title: "Optimalisasi 1.000 Hari Pertama Kehidupan HPK Bebas Stunting",
    readTime: "5 mnt baca",
    tag: "Kesehatan Ibu & Anak",
    author: "Dokter Spesialis Anak",
    publishedDate: "2026-08-22",
    summary: "Periode emas sejak dalam kandungan hingga usia 2 tahun menentukan kualitas fisik dan kecerdasan anak di masa depan.",
    content: "Nutrisi ibu hamil dan ibu menyusui sangat mempengaruhi pertumbuhan organ vital balita. Pemberian ASI Eksklusif selama 6 bulan dilanjutkan MPASI kaya protein hewani menjadi kunci utama menutup celah risiko stunting di seluruh wilayah Indonesia.",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Edukasi Nutrisi",
    title: "Pentingnya Vitamin C untuk Maksimalisasi Penyerapan Zat Besi Fe",
    readTime: "3 mnt baca",
    tag: "Kemenkes RI",
    author: "Ahli Gizi SPPG",
    publishedDate: "2026-08-20",
    summary: "Mengonsumsi buah jeruk, pepaya, atau jambu biji bersamaan dengan lauk hewani meningkatkan penyerapan zat besi hingga 300 persen.",
    content: "Zat besi tipe non-heme dari tumbuh-tumbuhan sulit diserap oleh usus halus. Kombinasi buah lokal kaya Vitamin C pada menu Makan Bergizi Gratis (MBG) mempercepat pembentukan hemoglobin, sehingga anak terhindar dari anemia dan badan lemas di kelas.",
    imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Kesehatan Lingkungan",
    title: "Peran Sanitasi Lingkungan & Air Bersih dalam Pencegahan Infeksi",
    readTime: "3 mnt baca",
    tag: "Sanitasi Sehat",
    author: "Tim Kesehatan Masyarakat",
    publishedDate: "2026-08-18",
    summary: "Infeksi usus akibat air terkontaminasi dan cacingan menghambat penyerapan nutrisi makanan pada tumbuh kembang balita.",
    content: "Nutrisi tinggi tidak akan terserap optimal jika anak sering mengalami diare atau cacingan. Penerapan Perilaku Hidup Bersih dan Sehat (PHBS), mencuci tangan dengan sabun sebelum makan, dan akses jamban sehat merupakan pilar pendukung program pencegahan stunting.",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pola Asuh Orang Tua",
    title: "Panduan Penanganan Anak Picky Eater dan Pilih-pilih Makanan",
    readTime: "4 mnt baca",
    tag: "Parenting Gizi",
    author: "Psikolog Anak & Ahli Gizi Kcal",
    publishedDate: "2026-08-15",
    summary: "Strategi menyajikan variasi tekstur dan bentuk makanan menarik agar anak antusias menikmati sayur dan ikan.",
    content: "Sikap menolak makanan sehat sering dialami balita usia 2-5 tahun. Pembuatan nugget ikan organik, sup bola daging sayur, dan penyajian tray berwarna cerah pada program MBG membantu membentuk kebiasaan makan sehat tanpa paksaan.",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pengukuran Biometrik",
    title: "Mengenali Grafik Z-Score WHO untuk Memantau Tinggi Badan Anak",
    readTime: "4 mnt baca",
    tag: "Standar WHO",
    author: "Tim Data Antropometri Kcal",
    publishedDate: "2026-08-12",
    summary: "Pahami perbedaan Z-Score TB/U Stunted, BB/TB Wasted, dan BB/U Underweight untuk evaluasi gizi di Posyandu.",
    content: "Grafik Z-Score WHO digunakan oleh tenaga kesehatan untuk mendeteksi deviasi standar pertumbuhan anak. Skor Z di bawah -2 SD menandakan kondisi pendek stunted yang membutuhkan pendampingan nutrisi harian intensif.",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Pangan Lokal",
    title: "Manfaat Telur Ayam sebagai Superfood Terjangkau untuk Anak",
    readTime: "3 mnt baca",
    tag: "Superfood Sehat",
    author: "Tim Kampanye Gizi Nasional",
    publishedDate: "2026-08-10",
    summary: "Satu butir telur sehari menyediakan kolin, lutein, dan protein kualitas tinggi yang mudah dicerna oleh tubuh anak.",
    content: "Telur merupakan salah satu sumber protein hewani paling ekonomis dengan nilai biologis tertinggi. Kolin dalam kuning telur mendukung pembentukan membran sel otak dan sintesis neurotransmitter untuk daya tangkap siswa.",
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Kesehatan Pencernaan",
    title: "Bakteri Baik Probiotik untuk Pencernaan Sehat & Imunitas Anak",
    readTime: "3 mnt baca",
    tag: "Imunitas Anak",
    author: "Tim Biomedis Kcal",
    publishedDate: "2026-08-08",
    summary: "Mikrobioma usus yang seimbang memperkuat benteng imunitas dan mengoptimalkan ekstraksi vitamin dari makanan.",
    content: "Saluran cerna yang sehat merupakan kunci penyerapan zat gizi. Pengenalan olahan fermentasi lokal seperti tempeh, yogurt, dan pisang segar mendukung populasi Lactobacillus di usus anak untuk mencegah infeksi pencernaan.",
    imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Gaya Hidup Anak",
    title: "Dampak Gadget & Kurang Tidur terhadap Hormon Growth Hormone GH",
    readTime: "3 mnt baca",
    tag: "Pola Tidur Sehat",
    author: "Dokter Spesialis Anak",
    publishedDate: "2026-08-05",
    summary: "Hormon pertumbuhan dilepaskan secara maksimal saat anak tidur nyenyak pada fase deep sleep malam hari.",
    content: "Selain nutrisi, istirahat cukup selama 9-10 jam setiap malam sangat penting bagi anak usia sekolah dasar. Kurang tidur akibat paparan layar gadget menurunkan sekresi Growth Hormone yang menghambat pertambahan tinggi badan.",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Edukasi Nutrisi",
    title: "Pentingnya Hidrasi & Asupan Air Putih Cukup Saat di Sekolah",
    readTime: "2 mnt baca",
    tag: "Kesehatan Anak",
    author: "Ahli Gizi SPPG",
    publishedDate: "2026-08-03",
    summary: "Kekurangan cairan 2 persen dapat menurunkan konsentrasi dan daya tangkap siswa dalam menerima pelajaran.",
    content: "Anak usia sekolah membutuhkan minimal 1,5 - 2 liter air putih per hari. Penyediaan botol minum sehat yang diisi air matang mendampingi bento tray MBG menjaga stamina dan fungsi ginjal anak tetap prima.",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Inovasi Layanan",
    title: "Peran Posyandu Digital & Pemindaian Wajah Kcal di Desa Kelurahan",
    readTime: "4 mnt baca",
    tag: "Digitalisasi Posyandu",
    author: "Pengembang Sistem Kcal",
    publishedDate: "2026-08-01",
    summary: "Integrasi data biometrik dan sistem verifikasi QR Code memastikan distribusi MBG tepat sasaran dan terpantau realtime.",
    content: "Aplikasi Kcal menghubungkan Posyandu, Puskesmas, dan Dapur SPPG dalam satu ekosistem digital. Data skrining biometrik membantu tim verifikator memastikan balita berisiko stunting langsung mendapatkan porsi nutrisi tambahan secara terukur.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  },
  {
    category: "Keamanan Pangan",
    title: "Dapur SPPG Higiensis Standar Keamanan Pangan Olahan MBG",
    readTime: "3 mnt baca",
    tag: "Standar SPPG",
    author: "Tim Kualitas Pangan SPPG",
    publishedDate: "2026-07-28",
    summary: "Penerapan standar ISO & HACCP pada pengolahan, pengemasan, dan pengiriman makanan bergizi gratis ke sekolah.",
    content: "Dapur Satuan Pelayanan Pemenuhan Gizi (SPPG) menerapkan uji sterilisasi alat, pemeriksaan suhu makanan saat didistribusikan, dan sampel arsip gizi harian untuk menjamin 100 persen keamanan dan kesegaran hidangan bagi seluruh siswa.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
  },
];

async function syncArticles() {
  console.log("Fetching existing documents in gscan_articles...");
  const listEndpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/gscan_articles?pageSize=100&key=${apiKey}`;
  const res = await fetch(listEndpoint);
  const data = await res.json();
  const docs = data.documents || [];
  console.log(`Found ${docs.length} documents in Firestore gscan_articles.`);

  let updatedCount = 0;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const docName = doc.name; // Full path
    const fields = doc.fields || {};
    const existingImageUrl = fields.imageUrl?.stringValue || "";

    // If imageUrl is empty, assign from ARTICLES_DATA matching by title or index
    if (!existingImageUrl || existingImageUrl.trim() === "") {
      const title = fields.title?.stringValue || "";
      const match = ARTICLES_DATA.find(a => a.title === title) || ARTICLES_DATA[i % ARTICLES_DATA.length];
      const newImageUrl = match.imageUrl;

      console.log(`Updating document ${docName.split("/").pop()} with imageUrl: ${newImageUrl}`);

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
  }

  console.log(`Successfully synced ${updatedCount} articles with imageUrl into Firestore!`);
}

syncArticles().catch(console.error);
