/* ============================================================
   WiskarKu — data.js
   Semua konten website diatur di file ini.
   Tambah/edit mata pelajaran, galeri, agenda, profil di sini.
   ============================================================ */

const KELAS_INFO = {
  nama: "Wiskar",
  jurusan: "Teknik Elektro",
  sekolah: "SMK",
  tahunAjaran: "2026 / 2027",
  waliKelas: "Ibu Rina Wulandari, S.Pd.",
  motto: "Belajar bersama, berkarya bersama, berkesan bersama.",
  visi: "Terwujudnya generasi teknik yang unggul, terampil, dan berakhlak mulia.",
  misi: [
    "Menumbuhkan semangat belajar dan rasa ingin tahu di setiap mata pelajaran.",
    "Membiasakan kerja sama, disiplin, dan tanggung jawab dalam setiap kegiatan kelas.",
    "Mengasah keterampilan teknis melalui praktikum dan proyek elektronik.",
    "Menjaga kebersihan, kerukunan, dan kekompakan kelas.",
  ],
  dataKelas: [
    ["Total Siswa", "30 siswa"],
    ["Laki-laki", "16 siswa"],
    ["Perempuan", "14 siswa"],
    ["Wali Kelas", "Ibu Rina Wulandari, S.Pd."],
    ["Tahun Ajaran", "2026 / 2027"],
  ],
  pengurus: [
    { absen: "01", nama: "Ahmad Fauzi", jabatan: "Ketua Kelas" },
    { absen: "02", nama: "Aisyah Nurramadhani", jabatan: "Wakil Ketua" },
    { absen: "04", nama: "Bella Safitri", jabatan: "Sekretaris" },
    { absen: "09", nama: "Fajar Nugroho", jabatan: "Bendahara" },
  ],
};

/* ---------- Mata Pelajaran (Kelas 10 - 12) ---------- */
const MATAPELAJARAN = {
  10: [
    {
      icon: "📖", nama: "Bahasa Indonesia", guru: "Rina Wulandari, S.Pd.", jenis: "umum",
      materi: ["Teks prosedur dan eksplanasi", "Menulis laporan praktikum", "Menyunting teks dan ejaan (PUEBI)"],
    },
    {
      icon: "📐", nama: "Matematika", guru: "Dedi Kurniawan, S.Pd.", jenis: "umum",
      materi: ["Aljabar dan fungsi", "Trigonometri dasar", "Barisan dan deret"],
    },
    {
      icon: "🗣️", nama: "Bahasa Inggris", guru: "Maya Anjani, S.Pd.", jenis: "umum",
      materi: ["Technical reading", "Vocabulary dunia kerja", "Speaking untuk presentasi sederhana"],
    },
    {
      icon: "⚛️", nama: "Fisika", guru: "Anton Pratama, S.Pd.", jenis: "umum",
      materi: ["Hukum Newton dan penerapannya", "Hukum Ohm dan rangkaian sederhana", "Energi listrik"],
    },
    {
      icon: "🔌", nama: "Dasar-Dasar Teknik Listrik", guru: "Hendra Gunawan, S.T.", jenis: "kompetensi",
      materi: ["Konsep kelistrikan dasar", "Penggunaan alat ukur (multimeter)", "Keselamatan dan kesehatan kerja (K3)"],
    },
    {
      icon: "✏️", nama: "Gambar Teknik", guru: "Sari Melati, S.Pd.T.", jenis: "kompetensi",
      materi: ["Garis, proyeksi, dan skala", "Menggambar komponen elektronika", "Sketsa rangkaian listrik"],
    },
  ],
  11: [
    {
      icon: "📐", nama: "Matematika", guru: "Dedi Kurniawan, S.Pd.", jenis: "umum",
      materi: ["Statistika dan peluang", "Fungsi eksponen dan logaritma", "Diferensial fungsi"],
    },
    {
      icon: "🗣️", nama: "Bahasa Inggris", guru: "Maya Anjani, S.Pd.", jenis: "umum",
      materi: ["Membaca dokumen teknis", "Menulis email profesional", "Interview simulation"],
    },
    {
      icon: "⚛️", nama: "Fisika", guru: "Anton Pratama, S.Pd.", jenis: "umum",
      materi: ["Rangkaian arus searah (DC)", "Induksi elektromagnetik", "Daya dan tenaga listrik"],
    },
    {
      icon: "🔋", nama: "Elektronika Dasar", guru: "Hendra Gunawan, S.T.", jenis: "kompetensi",
      materi: ["Dioda dan transistor", "Rangkaian penguat sederhana", "Teknik soldering dan troubleshooting"],
    },
    {
      icon: "🛠️", nama: "Perakitan dan Pemasangan", guru: "Sari Melati, S.Pd.T.", jenis: "kompetensi",
      materi: ["Merakit rangkaian kontrol", "Instalasi panel listrik", "Pengoperasian PLC sederhana"],
    },
    {
      icon: "💼", nama: "Kewirausahaan", guru: "Budi Santoso, S.Kom.", jenis: "umum",
      materi: ["Riset pasar sederhana", "Menghitung HPP dan laba", "Presentasi produk"],
    },
  ],
  12: [
    {
      icon: "📖", nama: "Bahasa Indonesia", guru: "Rina Wulandari, S.Pd.", jenis: "umum",
      materi: ["Teks argumentasi dan eksposisi", "Menulis karya ilmiah sederhana", "Berpidato dan diskusi"],
    },
    {
      icon: "📐", nama: "Matematika", guru: "Dedi Kurniawan, S.Pd.", jenis: "umum",
      materi: ["Integral", "Program linier", "Matematika lanjutan untuk teknis"],
    },
    {
      icon: "⚛️", nama: "Fisika", guru: "Anton Pratama, S.Pd.", jenis: "umum",
      materi: ["Arus bolak-balik (AC)", "Transformator", "Fisika terapan industri"],
    },
    {
      icon: "📟", nama: "Instrumentasi Listrik Industri", guru: "Hendra Gunawan, S.T.", jenis: "kompetensi",
      materi: ["Sensor dan aktuator", "PLC industri", "Pemeliharaan motor listrik"],
    },
    {
      icon: "🎛️", nama: "Sistem Kendali Otomatis", guru: "Sari Melati, S.Pd.T.", jenis: "kompetensi",
      materi: ["Rangkaian pengendali motor", "Interlock dan timer", "Pengantar SCADA"],
    },
    {
      icon: "🎓", nama: "Wirausaha & PKL", guru: "Budi Santoso, S.Kom.", jenis: "kompetensi",
      materi: ["Persiapan Praktik Kerja Lapangan", "Penyusunan laporan magang", "Portofolio dan wawancara kerja"],
    },
  ],
};

/* ---------- Galeri Kelas ----------
   Konten galeri DINAMIS: dikelola lewat Panel Admin (/#admin)
   dan disimpan di data/gallery.json. Kategori tersedia: */
const GALERI_KATEGORI = ["Kelas", "Praktikum", "Kegiatan", "Acara"];

/* ---------- Agenda ----------
   date = ISO (YYYY-MM-DD) untuk hitung mundur otomatis.
   tanggal/bulan/hari diisi manual agar rapi. */
const AGENDA = [
  { date: "2026-09-25", tanggal: "25", bulan: "Sep", hari: "Kamis", judul: "Ulangan Harian Fisika", tag: "uji", tagLabel: "Ujian", desc: "Materi: Hukum Ohm dan rangkaian sederhana. Bawa alat tulis lengkap." },
  { date: "2026-10-02", tanggal: "02", bulan: "Okt", hari: "Rabu", judul: "Praktikum Rangkaian Seri-Paralel", tag: "prak", tagLabel: "Praktikum", desc: "Di laboratorium elektronika. Ikuti instruksi K3 dari Pak Hendra." },
  { date: "2026-10-15", tanggal: "15", bulan: "Okt", hari: "Selasa", judul: "Festival & Class Meeting", tag: "keg", tagLabel: "Kegiatan", desc: "Pentas seni dan lomba antar-kelompok. Setiap kelompok wajib tampil!" },
  { date: "2026-10-30", tanggal: "30", bulan: "Okt", hari: "Rabu", judul: "Ujian Tengah Semester", tag: "uji", tagLabel: "Ujian", desc: "UTS semua mata pelajaran umum dan kompetensi." },
  { date: "2026-11-05", tanggal: "05", bulan: "Nov", hari: "Selasa", judul: "Kunjungan Industri", tag: "keg", tagLabel: "Kegiatan", desc: "Outing class ke fasilitas industri. Bawa seragam lengkap + helm disediakan." },
  { date: "2026-11-18", tanggal: "18", bulan: "Nov", hari: "Senin", judul: "Ujian Praktik Kompetensi", tag: "penting", tagLabel: "Penting", desc: "Ujian praktik akhir: merangkai dan menguji rangkaian kendali." },
];

/* ---------- Jadwal Piket Kelas ----------
   Edit sesuai pembagian kelompok di kelas. */
const PIKET = [
  { hari: "Senin", grup: "Kelompok 1 · Absen 01–06", tugas: "Bersih papan tulis, sapu & mop area depan" },
  { hari: "Selasa", grup: "Kelompok 2 · Absen 07–12", tugas: "Sapu & mop lantai, buang sampah kelas" },
  { hari: "Rabu", grup: "Kelompok 3 · Absen 13–18", tugas: "Bersih jendela, lap meja & kursi guru" },
  { hari: "Kamis", grup: "Kelompok 4 · Absen 19–24", tugas: "Sapu & mop lantai, rapikan kursi siswa" },
  { hari: "Jumat", grup: "Kelompok 5 · Absen 25–30", tugas: "Jumat bersih: sapu, mop, dan jemur kelas" },
];
const PIKET_JAM = "07.15 – 07.45";

/* ---------- Kuis Harian ----------
   Tambah soal sesukamu: q = pertanyaan, options = 4 pilihan, a = indeks jawaban benar. */
const KUIS = [
  { mapel: "Fisika", q: "Apa satuan hambatan listrik?", options: ["Volt", "Ampere", "Ohm", "Watt"], a: 2 },
  { mapel: "Fisika", q: "Bunyi Hukum Ohm yang benar adalah...", options: ["V = I × R", "V = R / I", "I = V × R", "R = V × I"], a: 0 },
  { mapel: "Elektronika", q: "Komponen yang hanya mengizinkan arus mengalir satu arah adalah...", options: ["Resistor", "Induktor", "Dioda", "Kapasitor"], a: 2 },
  { mapel: "Elektronika", q: "Simbol kapasitor pada rangkaian elektronik adalah huruf...", options: ["R", "C", "L", "D"], a: 1 },
  { mapel: "Fisika", q: "Satuan daya listrik dalam SI adalah...", options: ["Joule", "Watt", "Newton", "Pascal"], a: 1 },
  { mapel: "Elektronika", q: "Fungsi resistor dalam suatu rangkaian adalah...", options: ["Meningkatkan tegangan", "Menyimpan energi", "Membatasi arus", "Memutus arus"], a: 2 },
  { mapel: "Fisika", q: "Rangkaian tiga resistor yang disusun seri memiliki total hambatan...", options: ["Terkecil dari ketiganya", "Terbesar dari ketiganya", "Jumlah ketiganya", "Selisih ketiganya"], a: 2 },
  { mapel: "Elektronika", q: "Alat ukur untuk mengukur tegangan pada suatu titik rangkaian adalah...", options: ["Ammeter", "Ohmmeter", "Multimeter (mode volt)", "Tang ampere"], a: 2 },
];

/* ---------- Tautan Penting ----------
   Ganti URL sesuai sekolahmu. Icon = emoji. */
const TAUTAN = [
  { icon: "🏫", label: "Website Sekolah", url: "https://smknegeri.sch.id" },
  { icon: "💻", label: "E-Learning", url: "https://elearning.smknegeri.sch.id" },
  { icon: "💬", label: "Grup WA Kelas", url: "https://chat.whatsapp.com/WiskarKu" },
  { icon: "📧", label: "Email Kelas", url: "mailto:wiskarku.teknik@gmail.com" },
  { icon: "📚", label: "Perpustakaan Digital", url: "https://perpusnas.go.id" },
  { icon: "📊", label: "Dapodik", url: "https://dapo.dikdasmen.kemdikbud.go.id" },
];

/* ---------- Kontak ---------- */
const KONTAK = [
  { icon: "👩‍🏫", judul: "Wali Kelas", isi: "Ibu Rina Wulandari, S.Pd.", sub: "Hubungi melalui buku kontak / kantor guru" },
  { icon: "📧", judul: "Email Kelas", isi: "wiskarku.teknik@gmail.com", sub: "Untuk surat-menyurat & pengumuman", link: true },
  { icon: "💬", judul: "Grup WhatsApp", isi: "08xx-xxxx-xxxx (Ketua Kelas)", sub: "Kontak ketua kelas untuk info cepat" },
];
