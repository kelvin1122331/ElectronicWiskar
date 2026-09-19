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

/* ---------- Agenda ---------- */
const AGENDA = [
  { tanggal: "25", bulan: "Sep", hari: "Kamis", judul: "Ulangan Harian Fisika", tag: "uji", tagLabel: "Ujian", desc: "Materi: Hukum Ohm dan rangkaian sederhana. Bawa alat tulis lengkap." },
  { tanggal: "02", bulan: "Okt", hari: "Rabu", judul: "Praktikum Rangkaian Seri-Paralel", tag: "prak", tagLabel: "Praktikum", desc: "Diaboratorium elektronika. Ikuti instruksi K3 dari Pak Hendra." },
  { tanggal: "15", bulan: "Okt", hari: "Selasa", judul: "Festival & Class Meeting", tag: "keg", tagLabel: "Kegiatan", desc: "Pentas seni dan lomba antar-kelompok. Setiap kelompok wajib tampil!" },
  { tanggal: "30", bulan: "Okt", hari: "Rabu", judul: "Ujian Tengah Semester", tag: "uji", tagLabel: "Ujian", desc: "UTS semua mata pelajaran umum dan kompetensi." },
  { tanggal: "05", bulan: "Nov", hari: "Selasa", judul: "Kunjungan Industri", tag: "keg", tagLabel: "Kegiatan", desc: "Outing class ke fasilitas industri. Bawa seragam lengkap + helm disediakan." },
  { tanggal: "18", bulan: "Nov", hari: "Senin", judul: "Ujian Praktik Kompetensi", tag: "penting", tagLabel: "Penting", desc: "Ujian praktik akhir: merangkai dan menguji rangkaian kendali." },
];

/* ---------- Kontak ---------- */
const KONTAK = [
  { icon: "👩‍🏫", judul: "Wali Kelas", isi: "Ibu Rina Wulandari, S.Pd.", sub: "Hubungi melalui buku kontak / kantor guru" },
  { icon: "📧", judul: "Email Kelas", isi: "wiskarku.teknik@gmail.com", sub: "Untuk surat-menyurat & pengumuman", link: true },
  { icon: "💬", judul: "Grup WhatsApp", isi: "08xx-xxxx-xxxx (Ketua Kelas)", sub: "Kontak ketua kelas untuk info cepat" },
];
