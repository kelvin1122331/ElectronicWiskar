# ⚡ WiskarKu — Galeri & Website Kelas

Website resmi **Kelas Wiskar** (Jurusan Teknik) — galeri kelas, menu mata pelajaran kelas 10–12, profil kelas, agenda, kontak, dan sistem login.

![tema](https://img.shields.io/badge/tema-biru%20muda%20%2B%20putih%20%7C%20hitam%20polos-38a4ec) ![stack](https://img.shields.io/badge/stack-Node.js%20(%2B)%20HTML%2FCSS%2FJS-22c55e)

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🏠 **Beranda** | Hero, statistik kelas, menu spesial, banner login, sneak peek galeri |
| 📚 **Mata Pelajaran** | Tab **Kelas 10 / 11 / 12** — mapel, guru pengampu, badge Umum/Kompetensi, daftar materi pokok (terkunci sebelum login) |
| 📸 **Galeri Kelas** | Filter kategori (Kelas, Praktikum, Kegiatan, Acara) + lightbox dengan navigasi keyboard |
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

- **Sandi website:** `wiskarku01teknik`
- Login mengecek **nomor absen + nama** terhadap `data/students.json`, lalu memverifikasi sandi.
- Sesi login disimpan di cookie `HttpOnly` (berlaku 7 hari, in-memory di server).

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
| Daftar siswa | `data/students.json` |
| Mata pelajaran, galeri, agenda, profil, kontak | `public/js/data.js` |
| Warna tema | `public/css/style.css` → bagian `:root` dan `html[data-theme="dark"]` |
| Foto | letakkan di `public/images/`, lalu ubah path di `public/js/data.js` |

## 📂 Struktur

```
├── server.js            # Server Node (API login + file statis), tanpa dependensi
├── package.json
├── data/
│   └── students.json    # Daftar siswa (absen + nama)
└── public/
    ├── index.html       # Skeleton SPA
    ├── css/style.css    # Seluruh gaya + tema terang/gelap
    ├── js/data.js       # Konten: mapel 10-12, galeri, agenda, profil, kontak
    ├── js/app.js        # Routing, tema, login, galeri, lightbox
    └── images/          # Foto hero & galeri
```
