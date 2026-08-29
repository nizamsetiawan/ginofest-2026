const projectId = "ginofest-2026";
const apiKey = "AIzaSyCqYxL4HM-4dBM8cDfNhu8x-vxX3vOCwQY";

const HELP_QA_DATA = [
  { command: "/menu", question: "Bagaimana cara generate menu MBG otomatis?", answer: "Klik menu \"Generate Menu\" di sidebar → pilih kecamatan & bulan target → tekan tombol \"Generate Menu AI\". Sistem akan merancang jadwal menu mingguan otomatis berbasis komoditas lokal dan pagu Rp 15.000. Hasil otomatis tersimpan ke Firestore.", category: "Perencana Menu" },
  { command: "/generate", question: "Langkah-langkah lengkap generate menu MBG AI", answer: "1. Buka halaman Generate Menu\n2. Pilih Kecamatan (misal: Manyar / Kebomas)\n3. Pilih Bulan (Agustus 2026 s/d Juli 2027)\n4. Tentukan siklus (5 atau 6 hari kerja)\n5. Klik 'Generate Menu AI'\n6. AI merancang menu 4 minggu + tabel BOM otomatis.", category: "Perencana Menu" },
  { command: "/bom", question: "Bagaimana cara melihat & download laporan kebutuhan bahan pokok (BOM)?", answer: "Setelah menu di-generate, klik tombol biru \"Laporan Kebutuhan Bahan Pokok\" di bawah jadwal menu. Akan muncul dialog modal berisi rincian tonase bahan pangan dan total anggaran. Klik tombol \"Download Excel (.XLS)\" untuk mengunduh laporan berformat resmi.", category: "Perencana Menu" },
  { command: "/tahunan", question: "Bagaimana cara kerja Kalender Tahunan MBG?", answer: "Di halaman Generate Menu, klik tab \"Tahunan\" di bagian atas. Anda akan melihat kalender 12 bulan (Agustus 2026 – Juli 2027). Setiap bulan memiliki status 'Sudah Dibuat' atau 'Belum Dibuat'. Klik 'Buka Rencana Menu →' untuk mengedit bulan tertentu.", category: "Perencana Menu" },
  { command: "/mingguan", question: "Bagaimana cara navigasi minggu 1 sampai minggu 4?", answer: "Pada tampilan bulanan perencana menu, klik tab Minggu 1, Minggu 2, Minggu 3, atau Minggu 4 di atas tabel. Setiap minggu menampilkan jadwal hari Senin s/d Jumat/Sabtu dengan komposisi gizi dan estimasi biaya per porsi.", category: "Perencana Menu" },
  { command: "/pagu", question: "Berapa standar pagu resmi MBG per porsi?", answer: "Pagu resmi Badan Gizi Nasional (BGN) RI Tahun 2026 adalah Rp 15.000 / porsi / anak / hari kerja. Angka ini digunakan sebagai batas maksimal kalkulasi biaya bahan pangan dan operasional dapur MBG.", category: "Anggaran" },
  { command: "/siklus", question: "Apa perbedaan siklus 5 hari vs 6 hari kerja?", answer: "• Siklus 5 Hari: Senin – Jumat (sekitar 20–22 hari kerja/bulan).\n• Siklus 6 Hari: Senin – Sabtu (sekitar 24–26 hari kerja/bulan).\nPilihan siklus mempengaruhi total hari makan anak dan kalkulasi total tonase bahan pangan di laporan BOM.", category: "Anggaran" },
  { command: "/komoditas", question: "Apa isi Master Komoditas Pangan Lokal?", answer: "Master Komoditas berisi daftar potensi pangan unggulan tiap 18 kecamatan di Gresik (seperti Bandeng Manyar, Kupang Sidayu, Udang Menganti, Mangga Ujungpangkah, Ikan Tongkol Bawean). AI memprioritaskan bahan ini saat menyusun menu.", category: "Basis Data" },
  { command: "/harga", question: "Dari mana sumber data Master Harga Pasar?", answer: "Data harga bersumber dari SISKAPERBAPO Jawa Timur & pasar rakyat Kabupaten Gresik. Anda dapat mengedit harga secara langsung atau menekan 'Kalibrasi Harga Otomatis' untuk memperbarui estimasi harga pangan terkini.", category: "Basis Data" },
  { command: "/resep", question: "Apa standar resep yang digunakan pada Master Menu?", answer: "Resep makanan mengacu pada Standar Menu Bergizi BGN RI dan Kemenkes. Setiap menu dilengkapi formula Komposisi 5 Bintang (Karbohidrat, Protein Hewani, Protein Nabati, Sayur, Buah) dan estimasi biaya per porsi.", category: "Basis Data" },
  { command: "/gizi", question: "Apa rujukan Master Nilai Gizi?", answer: "Mengacu pada Tabel Komposisi Pangan Indonesia (TKPI 2019) Kemenkes RI, mencakup energi (Kkal), protein, lemak, karbohidrat, zat besi (Fe), kalsium, vitamin C, zinc, dan mikronutrien penting lainnya per 100 gram bahan.", category: "Basis Data" },
  { command: "/wilayah", question: "Data apa saja yang ada di Master Wilayah?", answer: "Data 18 kecamatan di Kabupaten Gresik mencakup: jumlah sasaran siswa penerima MBG, jumlah sekolah, jumlah posyandu, angka prevalensi stunting (%), fokus defisiensi nutrisi, dan titik koordinat GPS.", category: "Basis Data" },
  { command: "/upload", question: "Bagaimana cara upload data master dari Excel?", answer: "1. Buka halaman Basis Data RAG\n2. Masukkan PIN otorisasi administrator (8 digit)\n3. Pilih tab dataset yang ingin diperbarui\n4. Klik tombol 'Upload Excel'\n5. Pilih file .xlsx/.xls. Data akan otomatis diparse dan disimpan ke Cloud Firestore.", category: "Basis Data" },
  { command: "/scan", question: "Bagaimana cara menggunakan fitur Scan QR Code?", answer: "Klik 'Scan QR Code' di sidebar → lengkapi data anak (Nama, Kecamatan, Usia, TB, BB) → klik 'Mulai Analisis AI'. Sistem akan menghitung Z-Score WHO dan menyajikan rekomendasi bahan pangan lokal serta rujukan Posyandu.", category: "Skrining" },
  { command: "/zscore", question: "Bagaimana AI menghitung Z-Score antropometri?", answer: "AI mencocokkan Tinggi Badan (TB) dan Berat Badan (BB) terhadap standar baku WHO Multicentre Growth Reference Study berdasarkan usia (bulan). Z-Score < -2 SD diklasifikasikan sebagai indikasi stunting yang membutuhkan intervensi gizi segera.", category: "Skrining" },
  { command: "/peta", question: "Bagaimana cara membaca Peta Prevalensi?", answer: "Buka menu 'Peta Prevalensi'. Peta menampilkan 18 kecamatan dengan indikator risiko warna: Hijau (Risiko Rendah < 10%), Kuning (Risiko Sedang 10-20%), dan Merah (Risiko Tinggi > 20%). Klik kecamatan untuk melihat detail sasaran siswa MBG.", category: "Peta" },
  { command: "/stunting", question: "Apa strategi penanganan stunting di G-Scan?", answer: "G-Scan memadukan penapisan fisik anak (Scan QR Code) dengan intervensi menu makanan MBG berbasis komoditas kaya mikronutrien lokal (misal: Kupang Sidayu kaya Fe 15.6mg, Ikan Bandeng kaya Omega-3, Kelor kaya kalsium).", category: "Gizi & Stunting" },
  { command: "/ekspor", question: "Format file apa yang didukung untuk ekspor laporan?", answer: "Laporan kebutuhan logistik bahan pokok (BOM) diekspor dalam format Excel Spreadsheet (.XLS) lengkap dengan kop dokumen resmi, ringkasan pagu anggaran, dan rincian tonase belanja komoditas pasar.", category: "Ekspor" },
  { command: "/notif", question: "Bagaimana cara kerja Pusat Notifikasi?", answer: "Setiap aktivitas (upload master data, generate menu, update settings, skrining anak) otomatis dicatat ke Cloud Firestore (koleksi gscan_notifications). Klik notifikasi untuk melihat rincian tanggal, jam, dan admin eksekutor.", category: "Sistem" },
  { command: "/pengaturan", question: "Apa saja yang dapat dikonfigurasi di Pengaturan?", answer: "Di menu Pengaturan Anda dapat: melihat profil admin aktif, mengatur siklus hari kerja (5/6 hari), membuka & mengedit API Keys (Gemini & Firebase), mengganti PIN otorisasi, dan melihat info perangkat/sistem.", category: "Pengaturan" },
  { command: "/pin", question: "Bagaimana cara verifikasi & ganti PIN akses administrator?", answer: "PIN otorisasi administrator terdiri dari 8 karakter (default: 69hagh0d). Masukkan PIN pada dialog segmented 8-kotak untuk membuka kunci kredensial. Untuk mengubah PIN, gunakan form 'Keamanan & Ubah PIN Akses' di halaman Pengaturan.", category: "Keamanan" },
  { command: "/admin", question: "Bagaimana cara ganti akun administrator wilayah?", answer: "Buka halaman Pengaturan → pada bagian 'Administrator Aktif', klik tombol 'Ganti Akun' → pilih akun administrator (1 Akun Kabupaten, 6 Akun Kecamatan). Data dashboard akan menyesuaikan wilayah yang dipilih.", category: "Sistem" },
  { command: "/firestore", question: "Apa saja 9 koleksi Cloud Firestore yang aktif?", answer: "1. master_komoditas\n2. master_harga_pasar\n3. master_menu_makanan\n4. master_nilai_gizi\n5. master_wilayah\n6. mbg_menu_plans\n7. gscan_notifications\n8. gscan_settings\n9. gscan_help_qa", category: "Basis Data" },
  { command: "/device", question: "Informasi perangkat apa yang dideteksi oleh sistem?", answer: "Sistem mendeteksi: jenis browser, sistem operasi, resolusi layar (DPR), bahasa browser, timezone (WIB), jumlah inti CPU (cores), kapasitas RAM memori perangkat, status koneksi internet, dan User Agent.", category: "Sistem" },
  { command: "/bantuan", question: "Bagaimana cara bertanya ke Asisten AI Gemini di sini?", answer: "Ketik langsung pertanyaan apa saja di kolom chat bawah (tanpa tanda '/'). Asisten AI Gemini akan menjelaskan seluruh fitur, tata cara penggunaan, kalkulasi gizi, maupun kebijakan program MBG di Kabupaten Gresik.", category: "Asisten AI" },
  { command: "/kontak", question: "Kontak helpdesk dan dukungan teknis G-Scan", answer: "Dinas Kesehatan Kabupaten Gresik — Tim Teknis Inovasi MBG & Stunting (GinoFest 2026)\n• Alamat: Jl. Dr. Wahidin Sudirohusodo No. 245, Gresik\n• Email: takathasan82@gmail.com\n• Layanan: Senin – Jumat (08:00 – 16:00 WIB)", category: "Dukungan" },
  { command: "/faq", question: "Daftar topik bantuan yang sering ditanyakan", answer: "Gunakan perintah cepat berikut:\n• /menu - Generate Menu MBG\n• /bom - Laporan Kebutuhan Bahan Pokok\n• /rag - Basis Data 5 Master Pangan\n• /scan - Scan QR Code Skrining Anak\n• /pin - Keamanan & Kode Akses 8 Digit\n• /pagu - Standar Anggaran BGN Rp 15.000\n• /komplain - Layanan Pengaduan & Keluhan Sistem", category: "Bantuan" },
  { command: "/komplain", question: "Kirim keluhan, masukan, atau kendala sistem", answer: "Silakan ketikkan keluhan atau kendala Anda. Laporan akan otomatis tersimpan ke Cloud Firestore dan diteruskan langsung ke kontak pengelola (takathasan82@gmail.com).", category: "Layanan Pengaduan" },

  // --- RAG COMMANDS ---
  { command: "/rag", question: "Apa itu Basis Data RAG dan bagaimana cara kerjanya?", answer: "Basis Data RAG (Retrieval-Augmented Generation) adalah repositori 5 master dataset pangan resmi: Komoditas, Harga Pasar SISKAPERBAPO, Menu Standar MBG, Nilai Gizi TKPI 2019, dan Data 18 Wilayah. Data ini menjadi acuan grounding fakta bagi AI untuk merancang menu MBG yang presisi, kaya gizi lokal, dan hemat anggaran.", category: "Basis Data RAG" },
  { command: "/rag_auth", question: "Bagaimana cara verifikasi PIN untuk membuka Basis Data RAG?", answer: "1. Buka menu 'Basis Data RAG' di sidebar.\n2. Masukkan 8 digit PIN otorisasi administrator (default: 69hagh0d).\n3. Kotak PIN akan otomatis memverifikasi dan membuka tabel master data.", category: "Basis Data RAG" },
  { command: "/rag_komoditas", question: "Bagaimana cara mengelola Master Komoditas Pangan Lokal?", answer: "Pilih tab 'Komoditas' di RAG → Anda dapat melihat potensi pangan per kecamatan (seperti Bandeng Manyar, Kupang Sidayu, Kelor Panceng). Klik tombol edit di baris data untuk menambah atau mengubah komoditas unggulan.", category: "Basis Data RAG" },
  { command: "/rag_harga", question: "Bagaimana cara mengelola & update Master Harga Pasar?", answer: "Pilih tab 'Harga Pasar' di RAG. Tabel menampilkan harga eceran/grosir per satuan kg/butir/ikat. Anda dapat mengubah harga secara manual dengan klik tombol Edit atau menggunakan tombol 'Kalibrasi Harga Otomatis'.", category: "Basis Data RAG" },
  { command: "/rag_kalibrasi", question: "Bagaimana cara kerja fitur Kalibrasi Harga Otomatis?", answer: "Di tab Harga Pasar RAG, klik tombol 'Kalibrasi Harga Otomatis'. Sistem akan melakukan kalibrasi estimasi harga terkini berdasarkan inflasi dan data pasar rakyat Jawa Timur, lalu menyimpannya ke Firestore.", category: "Basis Data RAG" },
  { command: "/rag_menu", question: "Bagaimana cara mengelola Master Menu Standar MBG?", answer: "Pilih tab 'Menu Standar' di RAG. Setiap menu terverifikasi memiliki komposisi 5 Bintang (Karbohidrat, Protein Hewani, Nabati, Sayur, Buah), target sasaran, dan estimasi biaya. Anda bisa menambah menu baru atau merevisi gramasi bahan.", category: "Basis Data RAG" },
  { command: "/rag_gizi", question: "Bagaimana cara mengelola Master Nilai Gizi Pangan TKPI?", answer: "Pilih tab 'Nilai Gizi' di RAG. Memuat database gizi lengkap TKPI 2019 (Kalori, Protein, Lemak, Karbohidrat, Kalsium, Zat Besi Fe, Vitamin C, Zinc). Digunakan AI untuk menghitung kecukupan AKG harian siswa.", category: "Basis Data RAG" },
  { command: "/rag_wilayah", question: "Bagaimana cara mengelola Data 18 Kecamatan & Sasaran Siswa?", answer: "Pilih tab 'Data Wilayah' di RAG. Anda dapat melihat dan memperbarui jumlah sasaran siswa MBG, jumlah sekolah, target porsi per hari, dan prevalensi stunting (%) tiap kecamatan di Gresik.", category: "Basis Data RAG" },
  { command: "/rag_upload", question: "Bagaimana cara upload file Excel ke Basis Data RAG?", answer: "1. Buka tab dataset yang ingin di-update di halaman RAG.\n2. Klik tombol 'Upload Excel'.\n3. Pilih file spreadsheet (.xlsx/.xls).\n4. Sistem memvalidasi kolom dan langsung menyinkronkan data baru ke Cloud Firestore.", category: "Basis Data RAG" },
  { command: "/rag_template", question: "Format file Excel apa yang didukung untuk import RAG?", answer: "Gunakan format Excel standar (.xlsx atau .xls) dengan header kolom sesuai dataset:\n• Komoditas: No, Kecamatan, Komoditas Pangan\n• Harga: No, Nama Bahan, Kategori, Harga Satuan\n• Menu: No, Nama Menu, Kelompok Sasaran, Komposisi\n• Gizi: No, Kode, Nama Bahan, Kalori, Protein, Lemak, Fe", category: "Basis Data RAG" },
  { command: "/rag_tambah", question: "Bagaimana cara menambah baris data master baru secara manual?", answer: "Di setiap tab dataset RAG, klik tombol '+ Tambah Data'. Lengkapi formulir pop-up yang muncul, lalu tekan 'Simpan ke Firestore'. Data baru langsung aktif dan digunakan oleh AI Generator.", category: "Basis Data RAG" },
  { command: "/rag_edit", question: "Bagaimana cara mengedit data master langsung di tabel?", answer: "Pada tabel RAG, klik ikon pensil (Edit) di ujung kanan baris data yang ingin diubah. Perbarui nilainya pada modal edit, lalu tekan 'Simpan Perubahan'.", category: "Basis Data RAG" },
  { command: "/rag_hapus", question: "Bagaimana cara menghapus data master dari RAG?", answer: "Klik ikon tempat sampah (Hapus) pada baris data di tabel RAG → konfirmasi penghapusan. Data akan terhapus dari Cloud Firestore secara permanen.", category: "Basis Data RAG" },
  { command: "/rag_search", question: "Bagaimana cara mencari & memfilter data di Basis Data RAG?", answer: "Gunakan kotak pencarian 'Cari komoditas/bahan/kecamatan...' di atas tabel RAG. Anda juga dapat memfilter berdasarkan kategori bahan pangan atau nama kecamatan untuk mempercepat pencarian.", category: "Basis Data RAG" },
  { command: "/rag_export", question: "Bagaimana cara ekspor dataset master ke file Excel?", answer: "Di halaman Basis Data RAG, klik tombol 'Download Excel / Ekspor'. Seluruh tabel master data yang sedang dibuka akan otomatis diunduh dalam format file .XLS resmi.", category: "Basis Data RAG" },
  { command: "/rag_grounding", question: "Bagaimana AI Gemini menggunakan RAG untuk menyusun menu?", answer: "Saat tombol 'Generate Menu AI' ditekan, sistem mengambil (Retrieve) data komoditas lokal dan harga pasar dari RAG, lalu menggabungkannya (Augment) ke dalam prompt AI Gemini. Hasilnya (Generate) berupa menu yang sesuai anggaran Rp 15.000 dan kaya gizi lokal.", category: "Basis Data RAG" },
];

async function seedDoc(docId, data) {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/gscan_help_qa/${docId}?key=${apiKey}`;
  
  const fields = {
    id: { stringValue: docId },
    command: { stringValue: data.command },
    question: { stringValue: data.question },
    answer: { stringValue: data.answer },
    category: { stringValue: data.category },
  };

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });

  return res.status;
}

async function main() {
  console.log(`Starting Firestore sync for ${HELP_QA_DATA.length} Help Q&A commands...`);
  let successCount = 0;

  for (const item of HELP_QA_DATA) {
    const docId = `cmd_${item.command.replace("/", "")}`;
    const status = await seedDoc(docId, item);
    if (status === 200) {
      successCount++;
      console.log(`[OK ${status}] Synced ${item.command} -> gscan_help_qa/${docId}`);
    } else {
      console.error(`[ERR ${status}] Failed ${item.command}`);
    }
  }

  console.log(`\nDONE! Successfully synced ${successCount}/${HELP_QA_DATA.length} commands to Cloud Firestore.`);
}

main().catch(console.error);
