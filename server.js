/**
 * WiskarKu — Galeri & Website Kelas
 * Server Node.js murni (tanpa dependensi npm).
 *
 * Fitur:
 *  - Menyajikan file statis dari folder /public
 *  - API login siswa : POST /api/login  (nomor absen + nama + sandi website)
 *  - API logout      : POST /api/logout
 *  - API sesikan     : GET  /api/me
 *  - API galeri      : GET  /api/gallery                 (publik)
 *  - API admin login : POST /api/admin/login             (username + password)
 *  - API admin logout: POST /api/admin/logout
 *  - API admin sesikan: GET /api/admin/me
 *  - API admin foto  : POST /api/gallery/upload          (admin)
 *  -                 : PUT  /api/gallery/:id             (admin)
 *  -                 : DELETE /api/gallery/:id           (admin)
 *
 * Jalankan:  node server.js   (default http://localhost:3000)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Sandi website siswa (bisa diganti lewat env WEB_PASSWORD)
const WEB_PASSWORD = process.env.WEB_PASSWORD || 'wiskarku01teknik';

// Kredensial ADMIN (bisa diganti lewat env ADMIN_USER / ADMIN_PASSWORD)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wiskarku01teknik';

const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'images', 'uploads');
const DATA_FILE = path.join(__dirname, 'data', 'students.json');
const GALLERY_FILE = path.join(__dirname, 'data', 'gallery.json');
const ANNOUNCEMENTS_FILE = path.join(__dirname, 'data', 'announcements.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Daftar siswa: data/students.json  ->  [{ "absen": "01", "nama": "..." }, ...]
let students = [];
try {
  students = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`✓ Data siswa dimuat: ${students.length} siswa`);
} catch (err) {
  console.error('✗ Gagal membaca data/students.json:', err.message);
  process.exit(1);
}

// Galeri: data/gallery.json -> [{ id, file, judul, kategori, desc, createdAt }]
let gallery = [];
try {
  gallery = JSON.parse(fs.readFileSync(GALLERY_FILE, 'utf8'));
  console.log(`✓ Data galeri dimuat: ${gallery.length} foto`);
} catch {
  gallery = [];
  fs.writeFileSync(GALLERY_FILE, '[]');
}
function saveGallery() {
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(gallery, null, 2));
}

// Pengumuman: data/announcements.json -> [{ id, judul, isi, prioritas, createdAt }]
let announcements = [];
try {
  announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
  console.log(`✓ Pengumuman dimuat: ${announcements.length} item`);
} catch {
  announcements = [];
  fs.writeFileSync(ANNOUNCEMENTS_FILE, '[]');
}
function saveAnnouncements() {
  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
}

// Sesi login (in-memory)
const sessions = new Map(); // token -> { absen, nama, createdAt }
const adminSessions = new Map(); // token -> { username, createdAt }
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari (detik)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// MIME yang boleh di-upload
const UPLOADABLE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/* ---------- util ---------- */

function sendJSON(res, code, obj, extraHeaders = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(body);
}

function readBody(req, limit = 10 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('payload terlalu besar'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) {
      return decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  return null;
}

function sessionCookie(name, token, maxAge) {
  const base = `${name}=${token}; Path=/; HttpOnly; SameSite=Lax`;
  return maxAge > 0 ? `${base}; Max-Age=${maxAge}` : `${base}; Max-Age=0`;
}

function normalizeNama(s) {
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function findStudent(absen, nama) {
  const a = String(absen || '').trim();
  const n = normalizeNama(nama);
  return students.find((s) => String(s.absen) === a && normalizeNama(s.nama) === n) || null;
}

function isStudent(req) {
  const token = getCookie(req, 'session');
  const s = token && sessions.get(token);
  return s || null;
}
function isAdmin(req) {
  const token = getCookie(req, 'admin_session');
  return !!(token && adminSessions.get(token));
}

function clip(s, max) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

/* ---------- API ---------- */

async function handleApi(req, res, url) {
  // ===== Pengumuman (publik) =====
  if (url.pathname === '/api/announcements' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, items: announcements });
  }

  // ===== Admin: tambah pengumuman =====
  if (url.pathname === '/api/announcements' && req.method === 'POST') {
    if (!isAdmin(req)) return sendJSON(res, 403, { ok: false, error: 'Khusus admin. Silakan masuk dulu.' });
    const body = await readBody(req, 512 * 1024);
    const judul = clip(body.judul, 100);
    if (!judul) return sendJSON(res, 400, { ok: false, error: 'Judul pengumuman tidak boleh kosong.' });
    const item = {
      id: Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
      judul,
      isi: clip(body.isi, 500),
      prioritas: body.prioritas === 'penting' ? 'penting' : 'info',
      createdAt: Date.now(),
    };
    announcements.unshift(item);
    saveAnnouncements();
    console.log(`+ Pengumuman: ${judul}`);
    return sendJSON(res, 200, { ok: true, item });
  }

  // ===== Admin: hapus pengumuman =====
  const annMatch = url.pathname.match(/^\/api\/announcements\/([\w-]+)$/);
  if (annMatch && req.method === 'DELETE') {
    if (!isAdmin(req)) return sendJSON(res, 403, { ok: false, error: 'Khusus admin. Silakan masuk dulu.' });
    const before = announcements.length;
    announcements = announcements.filter((a) => a.id !== annMatch[1]);
    if (announcements.length === before) return sendJSON(res, 404, { ok: false, error: 'Pengumuman tidak ditemukan.' });
    saveAnnouncements();
    return sendJSON(res, 200, { ok: true });
  }

  // ===== Galeri (publik) =====
  if (url.pathname === '/api/gallery' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, items: gallery });
  }

  // ===== Admin: sesiku =====
  if (url.pathname === '/api/admin/me' && req.method === 'GET') {
    const token = getCookie(req, 'admin_session');
    const s = token && adminSessions.get(token);
    if (!s) return sendJSON(res, 401, { ok: false, admin: null });
    return sendJSON(res, 200, { ok: true, admin: { username: s.username } });
  }

  // ===== Admin: login / logout =====
  if (url.pathname === '/api/admin/login' && req.method === 'POST') {
    const { username, password } = await readBody(req);
    if (!username || !password) {
      return sendJSON(res, 400, { ok: false, error: 'Isi username dan password admin.' });
    }
    if (String(username).trim() !== ADMIN_USER || String(password).trim() !== ADMIN_PASSWORD) {
      return sendJSON(res, 401, { ok: false, error: 'Username atau password admin salah.' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    adminSessions.set(token, { username: ADMIN_USER, createdAt: Date.now() });
    return sendJSON(res, 200, { ok: true, admin: { username: ADMIN_USER } }, {
      'Set-Cookie': sessionCookie('admin_session', token, SESSION_MAX_AGE),
    });
  }

  if (url.pathname === '/api/admin/logout' && req.method === 'POST') {
    const token = getCookie(req, 'admin_session');
    if (token) adminSessions.delete(token);
    return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('admin_session', '', 0) });
  }

  // ===== Admin: upload foto =====
  if (url.pathname === '/api/gallery/upload' && req.method === 'POST') {
    if (!isAdmin(req)) return sendJSON(res, 403, { ok: false, error: 'Khusus admin. Silakan masuk dulu.' });
    const body = await readBody(req, 15 * 1024 * 1024); // base64 inflasi ~33%
    const { judul, kategori, desc, base64, mime } = body;

    if (!base64 || typeof base64 !== 'string') {
      return sendJSON(res, 400, { ok: false, error: 'File foto tidak ditemukan.' });
    }
    const ext = UPLOADABLE[mime];
    if (!ext) {
      return sendJSON(res, 400, { ok: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.' });
    }
    let buf;
    try {
      buf = Buffer.from(base64.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
    } catch {
      return sendJSON(res, 400, { ok: false, error: 'File foto rusak.' });
    }
    if (!buf.length) return sendJSON(res, 400, { ok: false, error: 'File foto kosong.' });
    if (buf.length > MAX_UPLOAD_BYTES) {
      return sendJSON(res, 400, { ok: false, error: 'Ukuran foto terlalu besar. Maksimal 8 MB.' });
    }

    const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
    const file = `images/uploads/${id}${ext}`;
    fs.writeFileSync(path.join(PUBLIC_DIR, file), buf);

    const item = {
      id,
      file,
      judul: clip(judul, 80) || 'Foto Kelas Wiskar',
      kategori: clip(kategori, 30) || 'Kelas',
      desc: clip(desc, 200),
      createdAt: Date.now(),
    };
    gallery.unshift(item);
    saveGallery();
    console.log(`+ Foto ditambahkan: ${file}`);
    return sendJSON(res, 200, { ok: true, item });
  }

  // ===== Admin: ubah / hapus foto =====
  const match = url.pathname.match(/^\/api\/gallery\/([\w-]+)$/);
  if (match) {
    if (!isAdmin(req)) return sendJSON(res, 403, { ok: false, error: 'Khusus admin. Silakan masuk dulu.' });
    const item = gallery.find((g) => g.id === match[1]);
    if (!item) return sendJSON(res, 404, { ok: false, error: 'Foto tidak ditemukan.' });

    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (body.judul !== undefined) item.judul = clip(body.judul, 80) || item.judul;
      if (body.kategori !== undefined) item.kategori = clip(body.kategori, 30) || item.kategori;
      if (body.desc !== undefined) item.desc = clip(body.desc, 200);
      saveGallery();
      return sendJSON(res, 200, { ok: true, item });
    }

    if (req.method === 'DELETE') {
      gallery = gallery.filter((g) => g.id !== item.id);
      saveGallery();
      fs.promises.unlink(path.join(PUBLIC_DIR, item.file)).catch(() => {});
      console.log(`- Foto dihapus: ${item.file}`);
      return sendJSON(res, 200, { ok: true });
    }
  }

  // ===== Login siswa =====
  if (url.pathname === '/api/login' && req.method === 'POST') {
    const { absen, nama, sandi } = await readBody(req);
    if (!absen || !nama || !sandi) {
      return sendJSON(res, 400, { ok: false, error: 'Mohon isi semua kolom: nomor absen, nama, dan sandi.' });
    }
    const student = findStudent(absen, nama);
    if (!student) {
      return sendJSON(res, 401, {
        ok: false,
        error: 'Nomor absen atau nama tidak cocok dengan data kelas. Periksa kembali.',
      });
    }
    if (String(sandi).trim() !== WEB_PASSWORD) {
      return sendJSON(res, 401, { ok: false, error: 'Sandi website salah.' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, { absen: String(student.absen), nama: student.nama, createdAt: Date.now() });
    return sendJSON(res, 200, { ok: true, user: { absen: String(student.absen), nama: student.nama } }, {
      'Set-Cookie': sessionCookie('session', token, SESSION_MAX_AGE),
    });
  }

  if (url.pathname === '/api/logout' && req.method === 'POST') {
    const token = getCookie(req, 'session');
    if (token) sessions.delete(token);
    return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('session', '', 0) });
  }

  if (url.pathname === '/api/me' && req.method === 'GET') {
    const s = isStudent(req);
    if (!s) return sendJSON(res, 401, { ok: false, user: null });
    return sendJSON(res, 200, { ok: true, user: { absen: s.absen, nama: s.nama } });
  }

  return sendJSON(res, 404, { ok: false, error: 'Endpoint tidak ditemukan' });
}

/* ---------- statis ---------- */

function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, p));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }
  fs.stat(filePath, (err, stat) => {
    let target = filePath;
    if (!err && stat.isDirectory()) target = path.join(filePath, 'index.html');
    if (err || !fs.existsSync(target)) {
      // SPA fallback: GET tanpa ekstensi -> index.html
      if (req.method === 'GET' && !path.extname(p)) {
        target = path.join(PUBLIC_DIR, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 — file tidak ditemukan');
      }
    }
    const ext = path.extname(target).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    fs.createReadStream(target).pipe(res);
  });
}

/* ---------- server ---------- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Bersihkan sesi mati
  const now = Date.now();
  for (const [t, s] of sessions) if (now - s.createdAt > SESSION_MAX_AGE * 1000) sessions.delete(t);
  for (const [t, s] of adminSessions) if (now - s.createdAt > SESSION_MAX_AGE * 1000) adminSessions.delete(t);

  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJSON(res, 500, { ok: false, error: 'Terjadi kesalahan pada server.' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`⚡ WiskarKu berjalan di http://${HOST}:${PORT}`);
});
