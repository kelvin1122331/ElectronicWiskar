# ⚡ WiskarKu — Galeri & Website Kelas

Website resmi **Kelas Wiskar** (Jurusan Teknik) — galeri kelas, menu mata pelajaran kelas 10–12, profil kelas, agenda, kontak, dan sistem login.

![tema](https://img.shields.io/badge/tema-biru%20muda%20%2B%20putih%20%7C%20hitam%20polos-38a4ec) ![stack](https://img.shields.io/badge/stack-Node.js%20(%2B)%20HTML%2FCSS%2FJS-22c55e)

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🏠 **Beranda** | Hero + jam real-time, statistik beranimasi, countdown agenda, menu spesial, pengumuman, sneak peek galeri, tautan penting |
| 🔍 **Command Palette (Ctrl+K)** | Cari seluruh isi website — mapel, guru, agenda, foto, pengumuman, semua halaman. Navigasi keyboard ↑↓ Enter |
| 📢 **Pengumuman Kelas** | Dikelola admin (panel → tab Pengumuman), badge prioritas Penting/Info, waktu relatif, tampil di beranda |
| ⏱️ **Countdown Agenda** | Hitung mundur live (hari:jam:menit:detik) ke agenda terdekat + badge "Terdekat" di halaman agenda |
| 📤 **Share WhatsApp** | Tombol WA mengambang + di footer — share halaman aktif ke grup kelas |
| 🔗 **Tautan Penting** | Link cepat (sekolah, e-learning, grup WA, Dapodik, dll.) — edit di `public/js/data.js` |
| 📅 **Jadwal Piket** | Halaman jadwal piket (5 hari) + kartu "Piket Hari Ini" di beranda, auto-highlight hari aktif |
| 🎂 **Ultah Warga Kelas** | Data ultah di `data/students.json`, widget "Ultah Bulan Ini" + hitung mundur ultah berikutnya di beranda |
| 👥 **Daftar Anggota** | Halaman 30 siswa (terkunci sebelum login) dengan pencarian nama/absen real-time |
| 🧠 **Kuis Harian** | 8 soal Fisika & Elektronika, feedback instan benar/salah, skor + best score tersimpan, share skor via WA |
| 🌤️ **Cuaca Jepara Live** | Widget cuaca real-time via open-meteo (tanpa API key), graceful jika offline |
| 📰 **Ticker Pengumuman** | Marquee berjalan di bawah navbar (jeda saat hover) — selalu update dari pengumuman aktif |
| 🎨 **UI Premium** | Glassmorphism, aurora border animasi, wave divider, image blur-in + skeleton shimmer, scroll progress bar, back-to-top, counter animasi, transisi halaman, mobile menu beranimasi |
| 📚 **Mata Pelajaran** | Tab **Kelas 10 / 11 / 12** — mapel, guru pengampu, badge Umum/Kompetensi, daftar materi pokok (terkunci sebelum login) |
| 📸 **Galeri Kelas** | **Dinamis & kosong dari awal** — diisi lewat Panel Admin. Filter kategori (Kelas, Praktikum, Kegiatan, Acara) + lightbox dengan navigasi keyboard |
| 🛡️ **Panel Admin** | Login admin → **upload** (klik/seret, maks 8 MB), **edit** judul/kategori/deskripsi, **hapus** foto (konfirmasi 2 langkah). Foto tersimpan di `public/images/uploads/` + `data/gallery.json` |
| 🏫 **Profil Kelas** | Visi & misi, tabel data kelas, pengurus kelas (terkunci sebelum login) |
| 🗓️ **Agenda** | Timeline jadwal dengan tag Ujian / Praktikum / Kegiatan / Penting |
| 📮 **Kontak** | Kartu kontak wali kelas, email, WA + form pesan |
| 🔐 **Sistem Login** | Wajib mengisi **Nomor Absen + Nama + Sandi Website** |
| 🎨 **Tema** | Default **biru muda + putih**, bisa di-toggle ke **hitam polos** (tersimpan di browser) |
| 📱 **Responsif** | Rapi di desktop, tablet, dan HP (navbar hamburger di mobile) |

## 🚀 Menjalankan

Tidak butuh `npm install` — server ini ditulis dengan Node.js murni.

```bash
node server.js
# buka http://localhost:3000
```

Port bisa diganti: `PORT=8080 node server.js`

## 🔐 Login

### Login Siswa
- **Sandi website:** `wiskarku01teknik`
- Login mengecek **nomor absen + nama** terhadap `data/students.json`, lalu memverifikasi sandi.
- Sesi login disimpan di cookie `HttpOnly` (berlaku 7 hari, in-memory di server).

### Login Admin (Panel Admin)
- Akses: ikon ⚙ di navbar / menu footer "Panel Admin" / langsung `/#admin`
- **Username:** `admin` · **Password:** `wiskarku01teknik`
- Ganti di `server.js` → `ADMIN_USER` / `ADMIN_PASSWORD` (atau env `ADMIN_USER` / `ADMIN_PASSWORD`)
- Semua endpoint admin (`/api/gallery/upload`, `PUT`/`DELETE /api/gallery/:id`) memverifikasi cookie admin — tanpa login admin hasilnya 403.

### Akun demo (data contoh)

| Absen | Nama |
|---|---|
| 01 | Ahmad Fauzi |
| 02 | Aisyah Nurramadhani |
| 04 | Bella Safitri |
| 09 | Fajar Nugroho |

> **Penting:** ganti data siswa dengan nama asli warga kelas — edit `data/students.json`.

## 🛠️ Kustomisasi

| Yang ingin diubah | File |
|---|---|
| Sandi website | `server.js` → `WEB_PASSWORD` (atau env `WEB_PASSWORD`) |
| Akun admin | `server.js` → `ADMIN_USER` / `ADMIN_PASSWORD` (atau env) |
| Daftar siswa | `data/students.json` |
| Mata pelajaran, agenda, tautan penting, piket, soal kuis, profil, kontak | `public/js/data.js` |
| Pengumuman & foto galeri | lewat **Panel Admin** (tersimpan di `data/announcements.json` & `data/gallery.json`) |
| Warna tema | `public/css/style.css` → bagian `:root` dan `html[data-theme="dark"]` |
| Foto galeri | **upload lewat Panel Admin** (tersimpan otomatis di `public/images/uploads/` + `data/gallery.json`) |
| Foto hero | `public/images/hero.jpg` (path di `public/index.html`) |

## 📂 Struktur

```
├── server.js            # Server Node (API login + file statis), tanpa dependensi
├── package.json
├── data/
│   ├── students.json        # Daftar siswa (absen + nama + birthday)
│   ├── gallery.json         # Foto galeri (diisi otomatis oleh Panel Admin)
│   └── announcements.json   # Pengumuman (dikelola Panel Admin)
└── public/
    ├── index.html       # Skeleton SPA
    ├── css/style.css    # Seluruh gaya + tema terang/gelap
    ├── js/data.js       # Konten: mapel 10-12, kategori galeri, agenda, profil, kontak
    ├── js/app.js        # Routing, tema, login siswa & admin, panel admin, galeri, lightbox
    └── images/
        ├── hero.jpg     # Foto hero beranda
        └── uploads/     # Foto hasil upload Panel Admin
```

