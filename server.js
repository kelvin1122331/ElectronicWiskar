/**
 * WiskarKu — Galeri & Website Kelas
 * Server Node.js murni (tanpa dependensi npm).
 *
 * Fitur:
 *  - Menyajikan file statis dari folder /public
 *  - API login  : POST /api/login  (nomor absen + nama + sandi website)
 *  - API logout : POST /api/logout
 *  - API sesikan: GET  /api/me
 *
 * Jalankan:  node server.js   (default http://localhost:3000)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Sandi website (bisa diganti di sini atau lewat env WEB_PASSWORD)
const WEB_PASSWORD = process.env.WEB_PASSWORD || 'wiskarku01teknik';

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'students.json');

// Daftar siswa: data/students.json  ->  [{ "absen": "01", "nama": "..." }, ...]
let students = [];
try {
  students = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`✓ Data siswa dimuat: ${students.length} siswa`);
} catch (err) {
  console.error('✗ Gagal membaca data/students.json:', err.message);
  process.exit(1);
}

// Sesi login (in-memory): token -> { absen, nama, createdAt }
const sessions = new Map();
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

function sessionCookie(token, maxAge) {
  const base = `session=${token}; Path=/; HttpOnly; SameSite=Lax`;
  return maxAge > 0 ? `${base}; Max-Age=${maxAge}` : `${base}; Max-Age=0`;
}

function normalizeNama(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function findStudent(absen, nama) {
  const a = String(absen || '').trim();
  const n = normalizeNama(nama);
  return students.find((s) => String(s.absen) === a && normalizeNama(s.nama) === n) || null;
}

/* ---------- API ---------- */

async function handleApi(req, res, url) {
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
      'Set-Cookie': sessionCookie(token, SESSION_MAX_AGE),
    });
  }

  if (url.pathname === '/api/logout' && req.method === 'POST') {
    const token = getCookie(req, 'session');
    if (token) sessions.delete(token);
    return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
  }

  if (url.pathname === '/api/me' && req.method === 'GET') {
    const token = getCookie(req, 'session');
    const s = token && sessions.get(token);
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
