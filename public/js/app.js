/* ============================================================
   WiskarKu — app.js v2
   SPA: routing hash, tema, login siswa & admin, panel admin
   (galeri + pengumuman), command palette (Ctrl+K), countdown
   agenda, jam real-time, share WhatsApp, tautan penting.
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = {
  user: null,      // siswa login
  admin: null,     // admin login
  adminTab: "galeri",
  gallery: [],
  announcements: [],
  students: [],
  grade: 10,
  galeriFilter: "Semua",
  lightboxList: [],
  lightboxIdx: 0,
  pendingImage: null,
  kuis: null,
  anggotaQ: "",
};

const newKuis = () => ({ i: 0, score: 0, picked: null, done: false });

const PAGE_TITLES = {
  beranda: "Beranda",
  mapel: "Mata Pelajaran",
  galeri: "Galeri Kelas",
  profil: "Profil Kelas",
  agenda: "Agenda Kelas",
  kuis: "Kuis Harian",
  piket: "Jadwal Piket",
  anggota: "Anggota Kelas",
  kontak: "Kontak",
  login: "Masuk",
  admin: "Panel Admin",
};

/* ============================================================
   API
   ============================================================ */
async function api(path, options = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan.");
  return data;
}

async function loadGallery() {
  try {
    const d = await api("/api/gallery");
    state.gallery = (d.items || []).sort((a, b) => b.createdAt - a.createdAt);
  } catch { state.gallery = []; }
}
async function loadAnnouncements() {
  try {
    const d = await api("/api/announcements");
    state.announcements = (d.items || []).sort((a, b) => b.createdAt - a.createdAt);
  } catch { state.announcements = []; }
}
async function loadAdmin() {
  try {
    const d = await api("/api/admin/me");
    state.admin = d.ok ? d.admin : null;
  } catch { state.admin = null; }
}
async function loadStudents() {
  try {
    const d = await api("/api/students");
    state.students = d.items || [];
  } catch { state.students = []; }
}

/* ============================================================
   Tema
   ============================================================ */
function initTheme() {
  const saved = localStorage.getItem("wiskar-theme");
  document.documentElement.dataset.theme = saved === "dark" ? "dark" : "light";
  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("wiskar-theme", next);
  });
}

/* ============================================================
   Toast
   ============================================================ */
let toastTimer = null;
function toast(msg, type = "ok") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast"), 3400);
}

/* ============================================================
   Jam real-time & countdown
   ============================================================ */
function nextAgenda() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const a of AGENDA) {
    const d = new Date(a.date + "T00:00:00");
    if (d >= today) return a;
  }
  return null;
}

function updateClock() {
  const el = $("#clockText");
  if (!el) return;
  el.textContent = new Date().toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

function setTile(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = String(val).padStart(2, "0");
  if (el.textContent !== v) {
    el.textContent = v;
    const tile = el.closest(".cd-tile");
    if (tile) { tile.classList.remove("tick"); void tile.offsetWidth; tile.classList.add("tick"); }
  }
}

function updateCountdown() {
  const card = $("#cdCard");
  if (!card) return;
  const next = nextAgenda();
  if (!next) return;
  let diff = new Date(next.date + "T12:00:00") - Date.now();
  const over = diff <= 0;
  diff = Math.max(0, diff);
  setTile("cd-d", Math.floor(diff / 86400000));
  setTile("cd-h", Math.floor(diff / 3600000) % 24);
  setTile("cd-m", Math.floor(diff / 60000) % 60);
  setTile("cd-s", Math.floor(diff / 1000) % 60);
  const lbl = $("#cdStatus");
  if (lbl) lbl.textContent = over ? "🔥 Sedang berlangsung hari ini!" : "";
}

function initLive() {
  updateClock();
  updateCountdown();
  setInterval(updateClock, 1000);
  setInterval(updateCountdown, 1000);
}

/* ============================================================
   Scroll progress & back-to-top
   ============================================================ */
function initScrollFx() {
  const bar = $("#scrollProgress");
  const topFab = $("#topFab");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    topFab.classList.toggle("show", h.scrollTop > 480);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  topFab.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ============================================================
   Share WhatsApp
   ============================================================ */
function updateShare() {
  const base = location.href.split("#")[0];
  const title = PAGE_TITLES[currentRoute()] || "Beranda";
  const text = encodeURIComponent(`⚡ WiskarKu — ${title}\n${base}`);
  const url = "https://wa.me/?text=" + text;
  const fab = $("#shareFab");
  if (fab) fab.dataset.url = url;
  const foot = $("#footerShare");
  if (foot) foot.href = url;
}
function initShare() {
  const fab = $("#shareFab");
  if (fab) fab.addEventListener("click", () => window.open(fab.dataset.url || "https://wa.me/", "_blank", "noopener"));
}

/* ============================================================
   Navbar & user
   ============================================================ */
function initNav() {
  const burger = $("#navBurger");
  burger.addEventListener("click", () => {
    const open = $("#navbar").classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => $("#navbar").classList.remove("open")));
}

function renderUserBox() {
  const box = $("#userBox");
  if (state.user) {
    const initial = state.user.nama.charAt(0).toUpperCase();
    box.innerHTML = `
      <div class="user-menu">
        <button class="user-btn" type="button" aria-haspopup="true" aria-expanded="false">
          <span class="user-avatar">${esc(initial)}</span>
          <span class="u-name">${esc(state.user.nama.split(" ")[0])}</span>
        </button>
        <div class="user-drop">
          <div class="drop-head"><b>${esc(state.user.nama)}</b><span>Absen ${esc(state.user.absen)}</span></div>
          <button type="button" id="logoutBtn">Keluar dari akun</button>
        </div>
      </div>`;
    const menu = $(".user-menu", box);
    $(".user-btn", box).addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
      $(".user-btn", box).setAttribute("aria-expanded", String(menu.classList.contains("open")));
    });
    $("#logoutBtn", box).addEventListener("click", async () => {
      try { await api("/api/logout", { method: "POST" }); } catch { /* abaikan */ }
      state.user = null;
      renderUserBox();
      route();
      toast("Kamu sudah keluar. Sampai jumpa! 👋");
    });
  } else {
    box.innerHTML = `<a class="btn btn-primary btn-sm" href="#/login">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></svg>
      Masuk</a>`;
  }
}
document.addEventListener("click", () => $$(".user-menu.open").forEach((m) => m.classList.remove("open")));

/* ============================================================
   Routing
   ============================================================ */
const PAGES = {
  beranda: renderBeranda,
  mapel: renderMapel,
  galeri: renderGaleri,
  profil: renderProfil,
  agenda: renderAgenda,
  kuis: renderKuis,
  piket: renderPiket,
  anggota: renderAnggota,
  kontak: renderKontak,
  login: renderLogin,
  admin: renderAdmin,
};

function currentRoute() {
  const h = (location.hash || "#/beranda").replace(/^#\//, "").split("?")[0];
  return PAGES[h] ? h : "beranda";
}

function route() {
  const page = currentRoute();
  $$("#navLinks a").forEach((a) => a.classList.toggle("active", a.dataset.route === page));
  const app = $("#app");
  app.classList.remove("enter");
  void app.offsetWidth;
  app.innerHTML = PAGES[page]();
  app.classList.add("enter");
  window.scrollTo({ top: 0 });
  if (page === "galeri") bindGaleri();
  if (page === "mapel") bindMapel();
  if (page === "login") bindLogin();
  if (page === "kontak") bindKontak();
  if (page === "admin") bindAdmin();
  if (page === "beranda") bindBeranda();
  if (page === "kuis") bindKuis();
  if (page === "anggota") bindAnggota();
  updateShare();
  initBlurIn();
  initReveal();
}

window.addEventListener("hashchange", route);

/* ============================================================
   Animasi reveal + counter
   ============================================================ */
function countUp(el) {
  const target = Number(el.dataset.count) || 0;
  const dur = 1100;
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveal() {
  const els = $$("#app [data-reveal]");
  const counts = $$("#app [data-count]");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    counts.forEach((el) => (el.textContent = el.dataset.count));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      $$("[data-count]", e.target).forEach((c) => !c.dataset.done && ((c.dataset.done = 1), countUp(c)));
      if (e.target.matches("[data-count]")) { e.target.dataset.done = 1; countUp(e.target); }
      io.unobserve(e.target);
    }),
    { threshold: 0.08 }
  );
  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
    io.observe(el);
  });
}

/* ============================================================
   Helper konten
   ============================================================ */
function sectionHead(eyebrow, title, desc, center = false) {
  return `<div class="section-head ${center ? "center" : ""}" data-reveal>
    <span class="eyebrow">${esc(eyebrow)}</span>
    <h2>${title}</h2>
    ${desc ? `<p>${desc}</p>` : ""}
  </div>`;
}

function lockOverlay(text = "Masuk untuk melihat") {
  return `<div class="lock-overlay"><div class="lock-box">
    <span class="padlock">🔒</span><b>${esc(text)}</b>
    <a class="btn btn-primary btn-sm" href="#/login">Masuk</a>
  </div></div>`;
}

function relTime(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const days = Math.floor(h / 24);
  if (days === 1) return "kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ============================================================
   Halaman: BERANDA
   ============================================================ */
function renderBeranda() {
  const featured = state.gallery.slice(0, 3);
  const nMapel = Object.values(MATAPELAJARAN).reduce((n, l) => n + l.length, 0);
  const next = nextAgenda();
  const anns = state.announcements.slice(0, 4);

  const countdown = next
    ? `
  <section class="section" style="padding-top:2.4rem; padding-bottom:0.6rem">
    <div class="container">
      <div class="cd-card aurora" id="cdCard" data-reveal>
        <div class="cd-info">
          <div class="cd-label">⏱️ Agenda Terdekat</div>
          <h3>${esc(next.judul)}</h3>
          <div class="cd-date">${esc(next.hari)}, ${esc(next.tanggal)} ${esc(next.bulan)} ${next.date.slice(0, 4)} · ${esc(next.tagLabel)}</div>
          <div class="cd-date" id="cdStatus"></div>
        </div>
        <div class="cd-tiles">
          <div class="cd-tile"><b id="cd-d">--</b><span>Hari</span></div>
          <div class="cd-tile"><b id="cd-h">--</b><span>Jam</span></div>
          <div class="cd-tile"><b id="cd-m">--</b><span>Menit</span></div>
          <div class="cd-tile"><b id="cd-s">--</b><span>Detik</span></div>
        </div>
      </div>
    </div>
  </section>`
    : "";

  return `
  <section class="hero">
    <div class="hero-bg"><img src="images/hero.jpg" alt="Suasana kelas Wiskar" data-blur /></div>
    <div class="hero-blob b1" aria-hidden="true"></div>
    <div class="hero-blob b2" aria-hidden="true"></div>
    <div class="container hero-inner">
      <div style="display:flex; gap:.6rem; flex-wrap:wrap">
        <span class="hero-pill">⚡ Kelas Wiskar · ${esc(KELAS_INFO.jurusan)}</span>
        <span class="hero-pill"><span class="live-dot"></span><span id="clockText">memuat…</span></span>
        <span class="hero-pill" id="weatherChip">🌡️ Jepara · memuat…</span>
      </div>
      <h1>Selamat datang di <span class="grad">Galeri Kelas Wiskar</span></h1>
      <p>Website resmi warga kelas — dokumentasi kegiatan, mata pelajaran kelas 10–12, pengumuman, agenda, dan segala hal seru seputar kelas kita.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#/galeri">📸 Lihat Galeri</a>
        <a class="btn btn-ghost" href="#/mapel">📚 Mata Pelajaran</a>
        <a class="btn btn-ghost" href="#/kuis">🧠 Main Kuis</a>
      </div>
    </div>
    <svg class="hero-wave" viewBox="0 0 1440 72" preserveAspectRatio="none" aria-hidden="true"><path d="M0,48 C240,80 480,8 720,32 C960,56 1200,72 1440,34 L1440,72 L0,72 Z"/></svg>
  </section>

  <div class="container">
    <div class="stats">
      <div class="stat-card" data-reveal><b data-count="${esc(KELAS_INFO.dataKelas[0][1].replace(" siswa", ""))}">0</b><span>Total Siswa</span></div>
      <div class="stat-card" data-reveal><b data-count="${nMapel}">0</b><span>Mata Pelajaran (10–12)</span></div>
      <div class="stat-card" data-reveal><b data-count="${state.gallery.length}">0</b><span>Foto Galeri</span></div>
      <div class="stat-card" data-reveal><b data-count="${AGENDA.length}">0</b><span>Agenda Terdekat</span></div>
    </div>
  </div>

  ${countdown}

  <section class="section">
    <div class="container">
      ${sectionHead("Menu Spesial", "Jelajahi Website Kelas", "Semua kebutuhan kelas ada di sini — tinggal klik menunya.")}
      <div class="menu-grid">
        ${[
          ["📚", "Mata Pelajaran", "Daftar mapel lengkap kelas 10, 11, dan 12 beserta guru pengampu dan materi pokok.", "mapel", "Lihat mapel"],
          ["📸", "Galeri Kelas", "Dokumentasi kegiatan, praktikum, dan momen seru warga kelas.", "galeri", "Buka galeri"],
          ["🗓️", "Agenda Kelas", "Jadwal ulangan, praktikum, dan acara penting kelas.", "agenda", "Lihat agenda"],
          ["🏫", "Profil Kelas", "Visi misi, data kelas, dan jajaran pengurus kelas.", "profil", "Kenali kelas"],
          ["🧠", "Kuis Harian", "Uji wawasanmu dengan 8 soal elektronika. Skor terbaikmu tersimpan!", "kuis", "Main sekarang"],
          ["🧹", "Jadwal Piket", "Pembagian piket harian & kelompoknya. Cek giliran kelompokmu!", "piket", "Lihat piket"],
          ["👥", "Anggota Kelas", "Daftar lengkap 30 warga kelas Wiskar. Masuk dulu untuk melihat.", "anggota", "Kenal warga"],
          ["📮", "Kontak", "Wali kelas, email, grup WA, dan form pesan untuk kelas.", "kontak", "Hubungi kami"],
        ]
          .map(
            ([icon, title, desc, slug, link]) => `
          <a class="card menu-card" href="#/${slug}" data-reveal>
            <span class="m-icon">${icon}</span>
            <h3>${title}</h3>
            <p>${desc}</p>
            <span class="m-link">${link} →</span>
          </a>`
          )
          .join("")}
      </div>

      ${
        state.user
          ? `
      <div class="login-banner aurora" data-reveal>
        <span class="lb-emoji">👋</span>
        <div style="flex:1; min-width: 240px;">
          <h3>Halo, ${esc(state.user.nama)}!</h3>
          <p>Kamu sudah masuk sebagai Absen ${esc(state.user.absen)}. Semua konten kelas kini terbuka untukmu.</p>
        </div>
        <a class="btn" href="#/profil">Lihat Profil Kelas</a>
      </div>`
          : `
      <div class="login-banner aurora" data-reveal>
        <span class="lb-emoji">🔐</span>
        <div style="flex:1; min-width: 240px;">
          <h3>Sedang mencari sesuatu di kelas kita?</h3>
          <p>Masuk dengan nomor absen, nama, dan sandi website untuk membuka semua konten. Atau tekan <b>Ctrl+K</b> untuk cari apa saja.</p>
        </div>
        <a class="btn" href="#/login">Masuk Sekarang</a>
      </div>`
      }
    </div>
  </section>

  <section class="section" style="padding-top:0.5rem">
    <div class="container">
      <div class="widget-row">
        <div class="card widget-card aurora" data-reveal>
          <h3>🧹 Piket Hari Ini</h3>
          <div class="widget-body">
            ${(() => {
              const d = new Date().getDay();
              const p = d >= 1 && d <= 5 ? PIKET[d - 1] : null;
              return p
                ? `<div class="wb-main">${esc(p.grup)}</div>
                   <div class="wb-sub">${esc(p.hari)} · ${esc(p.tugas)}</div>
                   <div class="widget-foot">🕖 Jam piket: <b>${esc(PIKET_JAM)}</b> · Diawasi ketua kelas</div>`
                : `<div class="wb-main">Weekend — bebas piket 🎉</div>
                   <div class="wb-sub">Manfaatkan untuk istirahat dan belajar mandiri.</div>
                   <div class="widget-foot">📅 Piket berikutnya: <b>${esc(PIKET[0].grup)}</b> hari Senin</div>`;
            })()}
          </div>
        </div>
        <div class="card widget-card" data-reveal style="transition-delay:90ms">
          <h3>🎂 Ultah Bulan Ini</h3>
          <div class="widget-body">
            ${(() => {
              const now = new Date();
              const mm = String(now.getMonth() + 1).padStart(2, "0");
              const monthKids = state.students.filter((s) => (s.birthday || "").startsWith(mm + "-"));
              const nextB = nextBirthday();
              const todayMMDD = mm + "-" + String(now.getDate()).padStart(2, "0");
              return monthKids.length
                ? `<div class="bday-list">
                    ${monthKids
                      .slice(0, 3)
                      .map(
                        (s) => `
                    <div class="bday-item ${s.birthday === todayMMDD ? "bday-today" : ""}">
                      <span class="bday-date">${esc(s.birthday.split("-")[1])}</span>
                      <div><b>${esc(s.nama)}</b><span>Absen ${esc(s.absen)}${s.birthday === todayMMDD ? " · 🎉 HARI INI!" : ""}</span></div>
                    </div>`
                      )
                      .join("")}
                  </div>
                  ${
                    nextB
                      ? `<div class="widget-foot">📅 Ultah berikutnya: <b>${esc(nextB.nama)}</b> · ${nextB.days === 0 ? "hari ini 🎉" : nextB.days + " hari lagi"}</div>`
                      : ""
                  }`
                : `<div class="wb-sub">Tidak ada ultah bulan ini. Bulan depan insyaallah ada! ✨</div>`;
            })()}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      ${sectionHead("Info Penting", "Pengumuman Kelas", "Kabar terbaru dari wali kelas dan pengurus kelas.")}
      ${
        anns.length
          ? `<div class="ann-list">
        ${anns
          .map(
            (a, i) => `
          <article class="ann-card p-${a.prioritas}" data-reveal style="transition-delay:${i * 70}ms">
            <span class="ann-icon">${a.prioritas === "penting" ? "📌" : "📣"}</span>
            <div class="ann-body">
              <h3>${esc(a.judul)} <span class="prio-badge prio-${a.prioritas}">${a.prioritas === "penting" ? "Penting" : "Info"}</span></h3>
              ${a.isi ? `<p>${esc(a.isi)}</p>` : ""}
              <div class="ann-meta">🕓 ${relTime(a.createdAt)}</div>
            </div>
          </article>`
          )
          .join("")}
      </div>`
          : `<div class="empty-admin" data-reveal><span class="ea-ico">📭</span>Belum ada pengumuman. Nanti mampir lagi, ya!</div>`
      }
    </div>
  </section>

  ${
    featured.length
      ? `
  <section class="section">
    <div class="container">
      ${sectionHead("Glimpse", "Sampai jumpa di Galeri Kelas", "Sneak peek dokumentasi terbaru kelas Wiskar.")}
      <div class="feature-strip">
        ${featured
          .map(
            (g, i) => `
          <a href="#/galeri" data-reveal style="transition-delay:${i * 70}ms">
            <img src="${esc(g.file)}" alt="${esc(g.judul)}" loading="lazy" data-blur />
            <span class="fs-cap">${esc(g.judul)}</span>
          </a>`
          )
          .join("")}
      </div>
      <div style="text-align:center; margin-top:2rem;" data-reveal>
        <a class="btn btn-primary" href="#/galeri">Lihat Semua Foto →</a>
      </div>
    </div>
  </section>`
      : ""
  }

  <section class="section" style="padding-top:0.5rem">
    <div class="container">
      ${sectionHead("Akses Cepat", "Tautan Penting", "Semua link penting kelas dalam satu tempat — tinggal klik.")}
      <div class="tautan-row">
        ${TAUTAN.map(
          (t, i) => `
          <a class="tautan" href="${esc(t.url)}" target="_blank" rel="noopener" data-reveal style="transition-delay:${i * 50}ms">
            <span class="t-ico">${t.icon}</span>
            <span>${esc(t.label)}</span>
            <span class="t-arrow">↗</span>
          </a>`
        ).join("")}
      </div>
    </div>
  </section>`;
}

/* ============================================================
   Halaman: MATA PELAJARAN
   ============================================================ */
function renderMapel() {
  const tabs = [10, 11, 12];
  const list = MATAPELAJARAN[state.grade] || [];
  const locked = !state.user;
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Kurikulum", "Mata Pelajaran Kelas 10 – 12", "Pilih jenjang untuk melihat daftar mata pelajaran, guru pengampu, dan materi pokoknya.")}
      <div class="grade-tabs" role="tablist">
        ${tabs
          .map(
            (g) => `
          <button class="grade-tab ${g === state.grade ? "active" : ""}" type="button" role="tab" aria-selected="${g === state.grade}" data-grade="${g}">Kelas ${g}</button>`
          )
          .join("")}
      </div>
      ${locked ? `<p data-reveal style="font-size:.85rem; color:var(--muted); margin-bottom:1.2rem;">ℹ️ Detail materi pokok akan tampil setelah kamu <a href="#/login" style="color:var(--primary-strong); font-weight:700;">masuk</a>.</p>` : ""}
      <div class="mapel-grid">
        ${list
          .map(
            (m) => `
          <article class="card mapel-card" data-reveal>
            <div class="mapel-top">
              <span class="mapel-icon">${m.icon}</span>
              <div>
                <h3>${esc(m.nama)}</h3>
                <div class="guru">👤 ${esc(m.guru)}</div>
              </div>
              <span class="badge ${m.jenis === "kompetensi" ? "badge-komp" : "badge-umum"}">${m.jenis === "kompetensi" ? "Kompetensi" : "Umum"}</span>
            </div>
            <div class="locked-wrap">
              <div class="materi ${locked ? "locked-blur" : ""}">
                <div class="materi-label">Materi Pokok</div>
                <ul class="materi-list">
                  ${m.materi.map((x) => `<li>${esc(x)}</li>`).join("")}
                </ul>
              </div>
              ${locked ? lockOverlay(`Masuk untuk melihat materi ${esc(m.nama)}`) : ""}
            </div>
          </article>`
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function bindMapel() {
  $$(".grade-tab").forEach((t) =>
    t.addEventListener("click", () => {
      state.grade = Number(t.dataset.grade);
      route();
    })
  );
}

/* ============================================================
   Halaman: GALERI
   ============================================================ */
function renderGaleri() {
  const items = state.gallery.filter((g) => state.galeriFilter === "Semua" || g.kategori === state.galeriFilter);
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Dokumentasi", "Galeri Kelas Wiskar", "Momen belajar, praktikum, dan kegiatan seru warga kelas. Klik foto untuk melihat lebih dekat.")}
      ${
        state.gallery.length
          ? `<div class="chips">
        ${["Semua", ...GALERI_KATEGORI]
          .map((k) => `<button class="chip ${k === state.galeriFilter ? "active" : ""}" type="button" data-cat="${esc(k)}">${esc(k)}</button>`)
          .join("")}
      </div>`
          : ""
      }
      ${
        items.length
          ? `<div class="galeri-grid">
        ${items
          .map(
            (g, i) => `
          <figure class="g-item" data-reveal data-idx="${i}" tabindex="0" role="button" aria-label="Buka foto ${esc(g.judul)}">
            <img src="${esc(g.file)}" alt="${esc(g.judul)}" loading="lazy" data-blur />
            <span class="g-tag">${esc(g.kategori)}</span>
            <figcaption class="g-cap"><b>${esc(g.judul)}</b><span>${esc(g.desc || "")}</span></figcaption>
          </figure>`
          )
          .join("")}
      </div>`
          : `
      <div class="empty-admin" data-reveal style="padding:3.4rem 1.6rem">
        <span class="ea-ico">📷</span>
        <b style="font-size:1.05rem; color:var(--text); display:block; margin-bottom:.3rem">Galeri masih kosong</b>
        ${
          state.admin
            ? "Kamu sedang login sebagai admin — tambahkan foto pertama dari Panel Admin!"
            : "Foto akan segera ditambahkan oleh admin kelas. Nanti mampir lagi, ya!"
        }
        ${state.admin ? `<div style="margin-top:1.1rem"><a class="btn btn-primary" href="#/admin">➕ Tambah Foto Sekarang</a></div>` : ""}
      </div>`
      }
    </div>
  </section>`;
}

function bindGaleri() {
  $$(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      state.galeriFilter = c.dataset.cat;
      route();
    })
  );
  state.lightboxList = state.gallery.filter((g) => state.galeriFilter === "Semua" || g.kategori === state.galeriFilter);
  $$(".g-item").forEach((el) => {
    const idx = Number(el.dataset.idx);
    const open = () => openLightbox(idx);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => e.key === "Enter" && open());
  });
}

function openLightbox(idx) {
  state.lightboxIdx = idx;
  const g = state.lightboxList[idx];
  if (!g) return;
  $("#lightboxImg").src = g.file;
  $("#lightboxImg").alt = g.judul;
  $("#lightboxCap").textContent = `${g.judul}${g.desc ? " — " + g.desc : ""}`;
  $("#lightbox").classList.add("open");
  $("#lightbox").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  $("#lightbox").classList.remove("open");
  $("#lightbox").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function shiftLightbox(d) {
  const n = state.lightboxList.length;
  state.lightboxIdx = (state.lightboxIdx + d + n) % n;
  openLightbox(state.lightboxIdx);
}
function initLightbox() {
  $("#lightbox").addEventListener("click", (e) => {
    if (e.target === $("#lightbox") || e.target.closest(".lightbox-close")) closeLightbox();
  });
  $("#lightbox .prev").addEventListener("click", (e) => { e.stopPropagation(); shiftLightbox(-1); });
  $("#lightbox .next").addEventListener("click", (e) => { e.stopPropagation(); shiftLightbox(1); });
  document.addEventListener("keydown", (e) => {
    if (!$("#lightbox").classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") shiftLightbox(-1);
    if (e.key === "ArrowRight") shiftLightbox(1);
  });
}

/* ============================================================
   Halaman: PROFIL
   ============================================================ */
function renderProfil() {
  const locked = !state.user;
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Kenalan Dulu", `Profil Kelas ${esc(KELAS_INFO.nama)}`, `Motto: “${esc(KELAS_INFO.motto)}”`)}
      <div class="profil-grid">
        <div class="card panel visi-misi" data-reveal>
          <h3>🎯 Visi &amp; Misi</h3>
          <div class="vm-item">
            <span class="vm-label">Visi</span>
            <p>${esc(KELAS_INFO.visi)}</p>
          </div>
          <div class="vm-item" style="margin-bottom:0">
            <span class="vm-label">Misi</span>
            <ul class="misi-list">
              ${KELAS_INFO.misi.map((m) => `<li>${esc(m)}</li>`).join("")}
            </ul>
          </div>
        </div>
        <div class="card panel" data-reveal>
          <h3>📋 Data Kelas</h3>
          <table class="data-table">
            <thead><tr><th>Keterangan</th><th style="text-align:right">Nilai</th></tr></thead>
            <tbody>
              ${KELAS_INFO.dataKelas.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top:2.2rem;">
        <div class="section-head" data-reveal>
          <span class="eyebrow">Tim Kelas</span>
          <h2>Pengurus Kelas</h2>
        </div>
        <div class="locked-wrap">
          <div class="pamong-grid ${locked ? "locked-blur" : ""}">
            ${KELAS_INFO.pengurus
              .map(
                (p, i) => `
            <div class="card pamong-card" data-reveal style="transition-delay:${i * 70}ms">
              <div class="pamong-avatar">${esc(p.nama.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</div>
              <b>${esc(p.nama)}</b>
              <span>${esc(p.jabatan)}</span>
              <div class="absen-tag">Absen ${esc(p.absen)}</div>
            </div>`
              )
              .join("")}
          </div>
          ${locked ? lockOverlay("Masuk untuk melihat pengurus kelas") : ""}
        </div>
      </div>
    </div>
  </section>`;
}

/* ============================================================
   Halaman: AGENDA
   ============================================================ */
function renderAgenda() {
  const next = nextAgenda();
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Jadwal", "Agenda Kelas", "Catat tanggal pentingnya — jangan sampai ketinggalan!")}
      <div class="timeline">
        ${AGENDA.map(
          (a, i) => `
          <div class="card agenda-item ${next && next.date === a.date ? "next" : ""}" data-reveal style="transition-delay:${i * 60}ms">
            <div class="agenda-date"><b>${esc(a.tanggal)}</b><span>${esc(a.bulan)}</span></div>
            <div class="agenda-body">
              <h3>${esc(a.judul)} <span class="tag tag-${a.tag}">${esc(a.tagLabel)}</span>${next && next.date === a.date ? `<span class="tag tag-next">Terdekat</span>` : ""}</h3>
              <p>${esc(a.hari)} — ${esc(a.desc)}</p>
            </div>
          </div>`
        ).join("")}
      </div>
    </div>
  </section>`;
}

/* ============================================================
   Halaman: KONTAK
   ============================================================ */
function renderKontak() {
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Kontak", "Hubungi Warga Kelas", "Ada pertanyaan, usulan, atau info yang ingin disampaikan? Sampaikan di sini.")}
      <div class="kontak-grid">
        ${KONTAK.map(
          (k, i) => `
          <div class="card kontak-card" data-reveal style="transition-delay:${i * 70}ms">
            <div class="k-icon">${k.icon}</div>
            <b>${esc(k.judul)}</b>
            <p>${k.link ? `<a href="mailto:${esc(k.isi)}">${esc(k.isi)}</a>` : esc(k.isi)}</p>
            <p style="margin-top:.3rem">${esc(k.sub)}</p>
          </div>`
        ).join("")}
      </div>

      <div class="card form-card" data-reveal>
        <h3>✉️ Kirim Pesan</h3>
        <form id="kontakForm" novalidate>
          <div class="field">
            <label for="kNama">Nama</label>
            <input id="kNama" name="nama" type="text" placeholder="Nama lengkapmu" required />
          </div>
          <div class="field">
            <label for="kPesan">Pesan</label>
            <textarea id="kPesan" name="pesan" rows="4" placeholder="Tulis pesanmu di sini..." required></textarea>
          </div>
          <button class="btn btn-primary" type="submit" style="width:100%">Kirim Pesan</button>
        </form>
      </div>
    </div>
  </section>`;
}

function bindKontak() {
  const form = $("#kontakForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = $("#kNama").value.trim();
    const pesan = $("#kPesan").value.trim();
    if (!nama || !pesan) return toast("Isi nama dan pesan dulu, ya.", "err");
    form.reset();
    toast(`Terima kasih, ${nama}! Pesannya sudah dicatat. 💌`);
  });
}

/* ============================================================
   Halaman: LOGIN (siswa)
   ============================================================ */
function renderLogin() {
  if (state.user) {
    return `
    <section class="section">
      <div class="container" style="max-width:560px">
        <div class="card login-card" style="text-align:center" data-reveal>
          <div class="l-head"><span class="brand-badge"><svg viewBox="0 0 24 24" width="27" height="27" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1.5 8.5L18 10.5h-6.5L13 2z"/></svg></span>
          <h2>Kamu sudah masuk 🎉</h2>
          <p>Halo, <b>${esc(state.user.nama)}</b> (Absen ${esc(state.user.absen)}). Selamat menjelajah konten kelas!</p></div>
          <div style="display:flex; gap:.7rem; justify-content:center; flex-wrap:wrap">
            <a class="btn btn-primary" href="#/galeri">Buka Galeri</a>
            <a class="btn btn-ghost" href="#/beranda">Ke Beranda</a>
          </div>
        </div>
      </div>
    </section>`;
  }
  return `
  <section class="section">
    <div class="container" style="max-width:980px">
      <div class="login-wrap">
        <div class="login-side" data-reveal>
          <span class="brand-badge" style="width:54px;height:54px;border-radius:17px"><svg viewBox="0 0 24 24" width="27" height="27" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1.5 8.5L18 10.5h-6.5L13 2z"/></svg></span>
          <h2>Masuk ke Galeri Kelas Wiskar</h2>
          <p>Website ini milik warga kelas. Masuk dengan data dirimu untuk membuka semua konten.</p>
          <ul>
            <li><span class="tick">✓</span> Detail materi pokok mata pelajaran 10–12</li>
            <li><span class="tick">✓</span> Data pengurus &amp; profil kelas lengkap</li>
            <li><span class="tick">✓</span> Semua fitur kelas tanpa batas</li>
          </ul>
        </div>
        <div class="card login-card" data-reveal style="transition-delay:120ms">
          <div class="l-head">
            <h2>Hai, Sobat Wiskar 👋</h2>
            <p>Isi data di bawah untuk masuk.</p>
          </div>
          <form id="loginForm" novalidate>
            <div class="field">
              <label for="absen">Nomor Absen</label>
              <input id="absen" name="absen" type="text" inputmode="numeric" placeholder="mis. 01" maxlength="3" required autocomplete="off" />
            </div>
            <div class="field">
              <label for="nama">Nama Lengkap</label>
              <input id="nama" name="nama" type="text" placeholder="Sesuai data kelas" required autocomplete="name" />
              <div class="hint">Nama harus persis seperti daftar kelas (huruf besar/kecil bebas).</div>
            </div>
            <div class="field">
              <label for="sandi">Sandi Website</label>
              <div class="pwd-row">
                <input id="sandi" name="sandi" type="password" placeholder="Sandi kelas" required autocomplete="current-password" />
                <button type="button" class="pwd-toggle" id="pwdToggle" aria-label="Tampilkan sandi">LIHAT</button>
              </div>
            </div>
            <div class="alert alert-bad" id="loginAlert" role="alert"></div>
            <button class="btn btn-primary" type="submit" id="loginSubmit" style="width:100%">🔓 Masuk</button>
          </form>
          <p class="login-note">Sandi website diberikan oleh <b>wali kelas</b>. Lupa? Hubungi pengurus kelas.</p>
        </div>
      </div>
    </div>
  </section>`;
}

function bindLogin() {
  const form = $("#loginForm");
  if (!form) return;
  $("#pwdToggle").addEventListener("click", () => {
    const inp = $("#sandi");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    $("#pwdToggle").textContent = show ? "SEMBUNYIKAN" : "LIHAT";
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const absen = $("#absen").value.trim();
    const nama = $("#nama").value.trim();
    const sandi = $("#sandi").value.trim();
    const alertEl = $("#loginAlert");
    const btn = $("#loginSubmit");
    alertEl.classList.remove("show");
    if (!absen || !nama || !sandi) {
      alertEl.textContent = "Mohon isi semua kolom: nomor absen, nama, dan sandi.";
      alertEl.classList.add("show");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Memeriksa...";
    try {
      const data = await api("/api/login", { method: "POST", body: JSON.stringify({ absen, nama, sandi }) });
      state.user = data.user;
      renderUserBox();
      toast(`Selamat datang, ${data.user.nama}! 🎉`);
      setTimeout(() => { location.hash = "#/beranda"; }, 450);
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.classList.add("show");
      btn.disabled = false;
      btn.textContent = "🔓 Masuk";
    }
  });
}

/* ============================================================
   Halaman: ADMIN (login + panel: galeri & pengumuman)
   ============================================================ */
function renderAdmin() {
  if (!state.admin) return renderAdminLogin();
  return renderAdminPanel();
}

function renderAdminLogin() {
  return `
  <section class="section">
    <div class="container" style="max-width:480px">
      <div class="card login-card" data-reveal>
        <div class="l-head">
          <div style="width:58px;height:58px;border-radius:19px;margin:0 auto .95rem;display:grid;place-items:center;font-size:1.65rem;background:var(--grad-soft);border:1px solid color-mix(in srgb, var(--primary) 22%, transparent)">🛡️</div>
          <h2>Panel Admin</h2>
          <p>Khusus pengelola website. Masuk dengan akun admin.</p>
        </div>
        <form id="adminLoginForm" novalidate>
          <div class="field">
            <label for="admUser">Username Admin</label>
            <input id="admUser" name="username" type="text" placeholder="admin" required autocomplete="username" />
          </div>
          <div class="field">
            <label for="admPass">Password Admin</label>
            <div class="pwd-row">
              <input id="admPass" name="password" type="password" placeholder="Password" required autocomplete="current-password" />
              <button type="button" class="pwd-toggle" id="admPwdToggle" aria-label="Tampilkan password">LIHAT</button>
            </div>
          </div>
          <div class="alert alert-bad" id="adminAlert" role="alert"></div>
          <button class="btn btn-primary" type="submit" id="admSubmit" style="width:100%">🔓 Masuk Panel</button>
        </form>
        <p class="login-note">Bukan admin? <a href="#/beranda" style="color:var(--primary-strong); font-weight:700;">Kembali ke beranda</a></p>
      </div>
    </div>
  </section>`;
}

function adminPhotoCard(g) {
  return `
  <div class="card admin-photo" data-reveal data-id="${esc(g.id)}">
    <div class="ap-img">
      <img src="${esc(g.file)}" alt="${esc(g.judul)}" loading="lazy" data-blur />
      <span class="ap-cat">${esc(g.kategori)}</span>
    </div>
    <div class="ap-body">
      <b class="ap-title">${esc(g.judul)}</b>
      <p class="ap-desc">${esc(g.desc || "—")}</p>
      <div class="ap-actions">
        <button class="btn btn-ghost btn-sm ap-edit" type="button">✏️ Edit</button>
        <button class="btn btn-danger-ghost btn-sm ap-del" type="button" data-label="🗑️ Hapus">🗑️ Hapus</button>
      </div>
      <div class="ap-edit-form" hidden>
        <input class="ef-judul" type="text" value="${esc(g.judul)}" maxlength="80" placeholder="Judul foto" />
        <select class="ef-kategori">
          ${GALERI_KATEGORI.map((k) => `<option value="${esc(k)}" ${g.kategori === k ? "selected" : ""}>${esc(k)}</option>`).join("")}
        </select>
        <input class="ef-desc" type="text" value="${esc(g.desc || "")}" maxlength="200" placeholder="Deskripsi (opsional)" />
        <div style="display:flex; gap:.5rem">
          <button class="btn btn-primary btn-sm ef-save" type="button">Simpan</button>
          <button class="btn btn-ghost btn-sm ef-cancel" type="button">Batal</button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderAdminPanel() {
  const photos = state.gallery;
  const anns = state.announcements;
  const tab = state.adminTab;
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Panel Admin", "Kelola Kelas", `Halo, <b>${esc(state.admin.username)}</b> 👋 — kelola galeri &amp; pengumuman kelas.`)}
      <div class="admin-topbar" data-reveal>
        <a class="btn btn-ghost btn-sm" href="#/galeri">👁️ Lihat Galeri</a>
        <a class="btn btn-ghost btn-sm" href="#/beranda">🏠 Lihat Beranda</a>
        <button class="btn btn-danger-ghost btn-sm" id="adminLogout" type="button">Keluar Admin</button>
      </div>
      <div class="admin-tabs" data-reveal>
        <button class="admin-tab ${tab === "galeri" ? "active" : ""}" type="button" data-admin-tab="galeri">🖼️ Galeri</button>
        <button class="admin-tab ${tab === "pengumuman" ? "active" : ""}" type="button" data-admin-tab="pengumuman">📢 Pengumuman</button>
      </div>

      ${
        tab === "galeri"
          ? `
      <div class="admin-grid">
        <div class="card panel" data-reveal>
          <h3>📤 Tambah Foto</h3>
          <div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Pilih file foto">
            <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp,image/gif" hidden />
            <div class="dz-empty" id="dzEmpty">
              <span class="dz-ico">📷</span>
              <b>Klik</b> atau seret foto ke sini
              <div><span>JPG, PNG, WEBP, GIF — maksimal 8 MB</span></div>
            </div>
            <div class="dz-preview" id="dzPreview" hidden>
              <img id="dzImg" src="" alt="Pratinjau foto" />
              <div>
                <b id="dzName"></b>
                <span class="dz-meta" id="dzSize"></span>
                <div><button type="button" class="dz-clear" id="dzClear">✕ Ganti foto</button></div>
              </div>
            </div>
          </div>
          <div class="field">
            <label for="upJudul">Judul Foto</label>
            <input id="upJudul" type="text" placeholder="mis. Praktikum Rangkaian Listrik" maxlength="80" />
          </div>
          <div class="field">
            <label for="upKategori">Kategori</label>
            <select id="upKategori">
              ${GALERI_KATEGORI.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="upDesc">Deskripsi <span style="color:var(--muted); font-weight:500">(opsional)</span></label>
            <input id="upDesc" type="text" placeholder="Sedikit cerita di balik foto" maxlength="200" />
          </div>
          <button class="btn btn-primary" id="upSubmit" type="button" style="width:100%">⬆️ Upload ke Galeri</button>
        </div>

        <div data-reveal style="transition-delay:100ms">
          <div style="display:flex; align-items:center; gap:.5rem; margin-bottom:.9rem">
            <h3 style="font-size:1.1rem">🖼️ Foto di Galeri <span class="count-badge">${photos.length}</span></h3>
          </div>
          ${
            photos.length
              ? `<div class="admin-photo-grid">${photos.map(adminPhotoCard).join("")}</div>`
              : `<div class="empty-admin"><span class="ea-ico">🗂️</span>Belum ada foto di galeri.<br>Upload foto pertama lewat panel di samping!</div>`
          }
        </div>
      </div>`
          : `
      <div class="admin-grid">
        <div class="card panel ann-form" data-reveal>
          <h3>📢 Tambah Pengumuman</h3>
          <div class="field">
            <label for="annJudul">Judul</label>
            <input id="annJudul" type="text" placeholder="mis. Ulangan Harian Hari Senin" maxlength="100" />
          </div>
          <div class="field">
            <label for="annIsi">Isi <span style="color:var(--muted); font-weight:500">(opsional)</span></label>
            <textarea id="annIsi" rows="4" placeholder="Detail pengumuman..." maxlength="500"></textarea>
          </div>
          <div class="field">
            <label for="annPrio">Prioritas</label>
            <select id="annPrio">
              <option value="info">ℹ️ Info</option>
              <option value="penting">📌 Penting</option>
            </select>
          </div>
          <button class="btn btn-primary" id="annSubmit" type="button" style="width:100%">📣 Terbitkan Pengumuman</button>
        </div>

        <div data-reveal style="transition-delay:100ms">
          <div style="display:flex; align-items:center; gap:.5rem; margin-bottom:.9rem">
            <h3 style="font-size:1.1rem">📋 Pengumuman Aktif <span class="count-badge">${anns.length}</span></h3>
          </div>
          ${
            anns.length
              ? `<div class="ann-admin-list">
            ${anns
              .map(
                (a) => `
              <div class="ann-card p-${a.prioritas}" data-ann-id="${esc(a.id)}">
                <span class="ann-icon">${a.prioritas === "penting" ? "📌" : "📣"}</span>
                <div class="ann-body">
                  <h3>${esc(a.judul)} <span class="prio-badge prio-${a.prioritas}">${a.prioritas === "penting" ? "Penting" : "Info"}</span></h3>
                  ${a.isi ? `<p>${esc(a.isi)}</p>` : ""}
                  <div class="ann-meta" style="align-items:center; justify-content:space-between">
                    <span>🕓 ${relTime(a.createdAt)}</span>
                    <button class="btn btn-danger-ghost btn-sm ann-del" type="button" data-label="🗑️ Hapus">🗑️ Hapus</button>
                  </div>
                </div>
              </div>`
              )
              .join("")}
          </div>`
              : `<div class="empty-admin"><span class="ea-ico">📭</span>Belum ada pengumuman.<br>Tulis yang pertama lewat form di samping!</div>`
          }
        </div>
      </div>`
      }
    </div>
  </section>`;
}

function bindAdmin() {
  if (!state.admin) return bindAdminLogin();
  bindAdminPanel();
}

function bindAdminLogin() {
  const form = $("#adminLoginForm");
  if (!form) return;
  $("#admPwdToggle").addEventListener("click", () => {
    const inp = $("#admPass");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    $("#admPwdToggle").textContent = show ? "SEMBUNYIKAN" : "LIHAT";
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#admUser").value.trim();
    const password = $("#admPass").value.trim();
    const alertEl = $("#adminAlert");
    const btn = $("#admSubmit");
    alertEl.classList.remove("show");
    if (!username || !password) {
      alertEl.textContent = "Isi username dan password admin.";
      alertEl.classList.add("show");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Memeriksa...";
    try {
      const data = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
      state.admin = data.admin;
      toast("Masuk sebagai admin ✓");
      route();
    } catch (err) {
      alertEl.textContent = err.message;
      alertEl.classList.add("show");
      btn.disabled = false;
      btn.textContent = "🔓 Masuk Panel";
    }
  });
}

function bindAdminPanel() {
  // logout admin
  const logoutBtn = $("#adminLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try { await api("/api/admin/logout", { method: "POST" }); } catch { /* abaikan */ }
      state.admin = null;
      toast("Kamu keluar dari mode admin.");
      route();
    });
  }

  // tab
  $$(".admin-tab").forEach((t) =>
    t.addEventListener("click", () => {
      state.adminTab = t.dataset.adminTab;
      route();
    })
  );

  if (state.adminTab === "pengumuman") return bindAnnAdmin();
  bindGalleryAdmin();
}

function bindGalleryAdmin() {
  // pilih / seret file
  const dz = $("#dropzone");
  const fileInput = $("#fileInput");
  if (!dz || !fileInput) return;

  const showPreview = (img) => {
    state.pendingImage = img;
    $("#dzEmpty").hidden = true;
    $("#dzPreview").hidden = false;
    $("#dzImg").src = img.dataUrl;
    $("#dzName").textContent = img.name;
    $("#dzSize").textContent = `${(img.size / 1024 / 1024).toFixed(2)} MB`;
  };
  const clearPreview = () => {
    state.pendingImage = null;
    fileInput.value = "";
    $("#dzPreview").hidden = true;
    $("#dzEmpty").hidden = false;
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!UPLOAD_MIME[file.type]) return toast("Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.", "err");
    if (file.size > 8 * 1024 * 1024) return toast("Foto terlalu besar. Maksimal 8 MB.", "err");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      showPreview({ dataUrl, base64: dataUrl.split(",")[1], mime: file.type, name: file.name, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  dz.addEventListener("click", (e) => {
    if (e.target.closest("#dzClear")) return;
    fileInput.click();
  });
  dz.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && fileInput.click());
  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
  ["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
  dz.addEventListener("drop", (e) => handleFile(e.dataTransfer?.files?.[0]));
  const dzClear = $("#dzClear");
  if (dzClear) dzClear.addEventListener("click", (e) => { e.stopPropagation(); clearPreview(); });

  // upload
  const upSubmit = $("#upSubmit");
  if (upSubmit) {
    upSubmit.addEventListener("click", async () => {
      if (!state.pendingImage) return toast("Pilih foto dulu, ya.", "err");
      const judul = $("#upJudul").value.trim();
      const kategori = $("#upKategori").value;
      const desc = $("#upDesc").value.trim();
      upSubmit.disabled = true;
      upSubmit.textContent = "Mengupload...";
      try {
        const data = await api("/api/gallery/upload", {
          method: "POST",
          body: JSON.stringify({ judul, kategori, desc, base64: state.pendingImage.base64, mime: state.pendingImage.mime }),
        });
        toast(`Foto "${data.item.judul}" berhasil diupload! 🎉`);
        await loadGallery();
        route();
      } catch (err) {
        toast(err.message, "err");
        upSubmit.disabled = false;
        upSubmit.textContent = "⬆️ Upload ke Galeri";
      }
    });
  }

  // edit & hapus per kartu
  $$(".admin-photo").forEach((card) => {
    const id = card.dataset.id;
    const item = state.gallery.find((g) => g.id === id);
    if (!item) return;

    const editBtn = $(".ap-edit", card);
    const form = $(".ap-edit-form", card);
    editBtn.addEventListener("click", () => {
      form.hidden = false;
      editBtn.hidden = true;
      $(".ef-judul", card).focus();
    });
    $(".ef-cancel", card).addEventListener("click", () => {
      form.hidden = true;
      editBtn.hidden = false;
    });
    $(".ef-save", card).addEventListener("click", async () => {
      const btn = $(".ef-save", card);
      btn.disabled = true;
      btn.textContent = "Menyimpan...";
      try {
        await api(`/api/gallery/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            judul: $(".ef-judul", card).value,
            kategori: $(".ef-kategori", card).value,
            desc: $(".ef-desc", card).value,
          }),
        });
        toast("Perubahan disimpan ✓");
        await loadGallery();
        route();
      } catch (err) {
        toast(err.message, "err");
        btn.disabled = false;
        btn.textContent = "Simpan";
      }
    });

    const delBtn = $(".ap-del", card);
    let armed = null;
    delBtn.addEventListener("click", async () => {
      if (!delBtn.classList.contains("armed")) {
        delBtn.classList.add("armed");
        delBtn.textContent = "⚠️ Yakin? Klik lagi";
        armed = setTimeout(() => {
          delBtn.classList.remove("armed");
          delBtn.textContent = delBtn.dataset.label;
        }, 3000);
        return;
      }
      clearTimeout(armed);
      delBtn.disabled = true;
      delBtn.textContent = "Menghapus...";
      try {
        await api(`/api/gallery/${id}`, { method: "DELETE" });
        toast(`Foto "${item.judul}" dihapus.`);
        await loadGallery();
        route();
      } catch (err) {
        toast(err.message, "err");
        delBtn.disabled = false;
        delBtn.classList.remove("armed");
        delBtn.textContent = delBtn.dataset.label;
      }
    });
  });
}

function bindAnnAdmin() {
  // terbitkan pengumuman
  const submit = $("#annSubmit");
  if (submit) {
    submit.addEventListener("click", async () => {
      const judul = $("#annJudul").value.trim();
      const isi = $("#annIsi").value.trim();
      const prioritas = $("#annPrio").value;
      if (!judul) return toast("Judul pengumuman tidak boleh kosong.", "err");
      submit.disabled = true;
      submit.textContent = "Menerbitkan...";
      try {
        const data = await api("/api/announcements", { method: "POST", body: JSON.stringify({ judul, isi, prioritas }) });
        toast(`Pengumuman "${data.item.judul}" terbit! 📣`);
        await loadAnnouncements();
        buildTicker();
        route();
      } catch (err) {
        toast(err.message, "err");
        submit.disabled = false;
        submit.textContent = "📣 Terbitkan Pengumuman";
      }
    });
  }

  // hapus pengumuman (2 langkah)
  $$(".ann-del").forEach((delBtn) => {
    const card = delBtn.closest("[data-ann-id]");
    const id = card.dataset.annId;
    const item = state.announcements.find((a) => a.id === id);
    let armed = null;
    delBtn.addEventListener("click", async () => {
      if (!delBtn.classList.contains("armed")) {
        delBtn.classList.add("armed");
        delBtn.textContent = "⚠️ Yakin? Klik lagi";
        armed = setTimeout(() => {
          delBtn.classList.remove("armed");
          delBtn.textContent = delBtn.dataset.label;
        }, 3000);
        return;
      }
      clearTimeout(armed);
      delBtn.disabled = true;
      delBtn.textContent = "Menghapus...";
      try {
        await api(`/api/announcements/${id}`, { method: "DELETE" });
        toast(`Pengumuman "${item?.judul || ""}" dihapus.`);
        await loadAnnouncements();
        buildTicker();
        route();
      } catch (err) {
        toast(err.message, "err");
        delBtn.disabled = false;
        delBtn.classList.remove("armed");
        delBtn.textContent = delBtn.dataset.label;
      }
    });
  });
}

const UPLOAD_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/* ============================================================
   Command Palette (Ctrl+K)
   ============================================================ */
let paletteItems = [];
let paletteActive = 0;

function buildPaletteIndex() {
  const idx = [];
  [
    ["🏠", "Beranda", "Home website kelas", "#/beranda", "Halaman"],
    ["📚", "Mata Pelajaran", "Mapel kelas 10–12", "#/mapel", "Halaman"],
    ["📸", "Galeri Kelas", "Dokumentasi kegiatan", "#/galeri", "Halaman"],
    ["🏫", "Profil Kelas", "Visi misi & pengurus", "#/profil", "Halaman"],
    ["🗓️", "Agenda Kelas", "Jadwal & countdown", "#/agenda", "Halaman"],
    ["🧠", "Kuis Harian", "8 soal Fisika & Elektronika", "#/kuis", "Halaman"],
    ["🧹", "Jadwal Piket", "Pembagian piket harian", "#/piket", "Halaman"],
    ["👥", "Anggota Kelas", "Daftar 30 siswa", "#/anggota", "Halaman"],
    ["📮", "Kontak", "Wali kelas & form pesan", "#/kontak", "Halaman"],
    ["🔐", "Masuk / Login", "Login siswa", "#/login", "Halaman"],
    ["🛡️", "Panel Admin", "Kelola galeri & pengumuman", "#/admin", "Halaman"],
  ].forEach(([ico, t, s, href, type]) => idx.push({ ico, t, s, href, type }));

  for (const [grade, list] of Object.entries(MATAPELAJARAN)) {
    list.forEach((m) =>
      idx.push({ ico: m.icon, t: `${m.nama} — Kelas ${grade}`, s: `${m.guru} · ${m.jenis === "kompetensi" ? "Kompetensi" : "Umum"}`, href: "#/mapel", type: "Mapel", grade })
    );
  }
  AGENDA.forEach((a) =>
    idx.push({ ico: "🗓️", t: a.judul, s: `${a.hari}, ${a.tanggal} ${a.bulan} · ${a.tagLabel}`, href: "#/agenda", type: "Agenda" })
  );
  state.gallery.forEach((g) =>
    idx.push({ ico: "📸", t: g.judul, s: `Galeri · ${g.kategori}`, href: "#/galeri", type: "Galeri" })
  );
  state.announcements.forEach((a) =>
    idx.push({ ico: a.prioritas === "penting" ? "📌" : "📣", t: a.judul, s: `Pengumuman · ${relTime(a.createdAt)}`, href: "#/beranda", type: "Pengumuman" })
  );
  return idx;
}

function renderPalette(query) {
  const box = $("#paletteResults");
  const q = query.trim().toLowerCase();
  let items;
  if (!q) {
    items = buildPaletteIndex().filter((i) => i.type === "Halaman").slice(0, 8);
  } else {
    items = buildPaletteIndex()
      .filter((i) => (i.t + " " + i.s + " " + i.type).toLowerCase().includes(q))
      .slice(0, 18);
  }
  paletteItems = items;
  paletteActive = 0;
  if (!items.length) {
    box.innerHTML = `<div class="palette-empty">😕 Tidak ada hasil untuk “${esc(query)}”<br><span style="font-size:.78rem">Coba kata kunci lain, mis. “fisika”, “ulangan”, “galeri”</span></div>`;
    return;
  }
  let lastType = null;
  box.innerHTML = items
    .map((it, i) => {
      const group = it.type !== lastType ? `<div class="pl-group">${esc(it.type)}</div>` : "";
      lastType = it.type;
      return `${group}
      <button class="pl-item ${i === 0 ? "active" : ""}" type="button" data-pi="${i}">
        <span class="pl-ico">${it.ico}</span>
        <span class="pl-txt"><b>${esc(it.t)}</b><span>${esc(it.s)}</span></span>
        <span class="pl-type">${esc(it.type)}</span>
      </button>`;
    })
    .join("");
  $$(".pl-item", box).forEach((el) =>
    el.addEventListener("click", () => pickPalette(Number(el.dataset.pi)))
  );
}

function pickPalette(i) {
  const it = paletteItems[i];
  if (!it) return;
  closePalette();
  if (it.grade) state.grade = Number(it.grade);
  if (location.hash === it.href) route();
  else location.hash = it.href;
}

function openPalette() {
  const p = $("#palette");
  p.classList.add("open");
  p.setAttribute("aria-hidden", "false");
  const inp = $("#paletteInput");
  inp.value = "";
  renderPalette("");
  setTimeout(() => inp.focus(), 60);
}

function closePalette() {
  const p = $("#palette");
  p.classList.remove("open");
  p.setAttribute("aria-hidden", "true");
}

function initPalette() {
  const p = $("#palette");
  const inp = $("#paletteInput");
  $("#paletteOpen").addEventListener("click", openPalette);
  $$("[data-palette-close]").forEach((el) => el.addEventListener("click", closePalette));
  inp.addEventListener("input", () => renderPalette(inp.value));

  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      p.classList.contains("open") ? closePalette() : openPalette();
      return;
    }
    if (!p.classList.contains("open")) return;
    if (e.key === "Escape") closePalette();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!paletteItems.length) return;
      const n = paletteItems.length;
      paletteActive = (paletteActive + (e.key === "ArrowDown" ? 1 : -1) + n) % n;
      $$(".pl-item").forEach((el, i) => el.classList.toggle("active", i === paletteActive));
      const act = $(".pl-item.active");
      if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && !typing) {
      e.preventDefault();
      pickPalette(paletteActive);
    }
  });
}

/* ============================================================
   v3 — Ticker, cuaca, blur-in, ultah
   ============================================================ */
function buildTicker() {
  const t = $("#ticker");
  const track = $("#tickerTrack");
  if (!t || !track) return;
  if (!state.announcements.length) {
    t.style.display = "none";
    return;
  }
  t.style.display = "flex";
  const items = state.announcements
    .map((a) => `<span class="ticker-item">${a.prioritas === "penting" ? "📌" : "📣"} <b>${esc(a.judul)}</b></span>`)
    .join("");
  track.innerHTML = `<span class="ticker-group">${items}</span><span class="ticker-group" aria-hidden="true">${items}</span>`;
}

const WMO = {
  0: ["☀️", "Cerah"], 1: ["🌤️", "Cerah berawan"], 2: ["⛅", "Berawan"], 3: ["☁️", "Mendung"],
  45: ["🌫️", "Berkabut"], 48: ["🌫️", "Kabut es"],
  51: ["🌦️", "Hujan gerimis"], 53: ["🌦️", "Hujan gerimis"], 55: ["🌧️", "Gerimis lebat"],
  61: ["🌦️", "Hujan ringan"], 63: ["🌧️", "Hujan"], 65: ["🌧️", "Hujan lebat"],
  71: ["🌨️", "Hujan salju"], 73: ["🌨️", "Salju"], 75: ["❄️", "Salju lebat"],
  80: ["🌦️", "Hujan rintik"], 81: ["🌧️", "Hujan"], 82: ["⛈️", "Hujan deras"],
  95: ["⛈️", "Petir"], 96: ["⛈️", "Petir + es"], 99: ["⛈️", "Badai"],
};

async function loadWeather() {
  const el = $("#weatherChip");
  if (!el) return;
  try {
    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-6.9349&longitude=110.4193&current=temperature_2m,weather_code&timezone=Asia%2FJakarta"
    );
    if (!r.ok) throw new Error("weather unavailable");
    const d = await r.json();
    const c = d.current;
    const [ico, label] = WMO[c.weather_code] || ["🌡️", "-"];
    el.innerHTML = `${ico} Jepara · ${Math.round(c.temperature_2m)}°C · ${label}`;
  } catch {
    el.remove();
  }
}

function bindBeranda() {
  loadWeather();
}

function initBlurIn() {
  $$("img[data-blur]").forEach((img) => {
    if (img.complete && img.naturalWidth) img.classList.add("loaded");
    else {
      img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
      img.addEventListener("error", () => img.classList.add("loaded"), { once: true });
    }
  });
}

const BULAN_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function nextBirthday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let best = null;
  for (const s of state.students) {
    if (!s.birthday) continue;
    const [mm, dd] = s.birthday.split("-").map(Number);
    let d = new Date(now.getFullYear(), mm - 1, dd);
    if (d < now) d = new Date(now.getFullYear() + 1, mm - 1, dd);
    const days = Math.round((d - now) / 86400000);
    if (!best || days < best.days) best = { nama: s.nama, absen: s.absen, days, label: `${dd} ${BULAN_ID[mm - 1]}` };
  }
  return best;
}

/* ============================================================
   Halaman: KUIS HARIAN
   ============================================================ */
function renderKuis() {
  if (!state.kuis) state.kuis = newKuis();
  const s = state.kuis;
  const best = Number(localStorage.getItem("wiskar-kuis-best") || 0);

  if (s.done) {
    const total = KUIS.length;
    const pct = s.score / total;
    const emoji = pct === 1 ? "🏆" : pct >= 0.7 ? "🎉" : pct >= 0.5 ? "💪" : "📖";
    const msg = pct === 1 ? "SEMPURNA! Kamu jagoan teknik!" : pct >= 0.7 ? "Hebat! Terus pertahankan!" : pct >= 0.5 ? "Bagus, tinggal asah sedikit lagi!" : "Jangan menyerah, belajar lagi ya!";
    return `
    <section class="section">
      <div class="container kuis-wrap">
        <div class="card kuis-result" data-reveal>
          <span class="kr-emoji">${emoji}</span>
          <div class="kr-score">${s.score}/${total}</div>
          <div class="kr-msg">${msg}</div>
          <div class="kr-sub">Skor terbaikmu: <b>${best}/${total}</b> · Materi: Fisika &amp; Elektronika dasar</div>
          <div class="kr-actions">
            <button class="btn btn-primary" id="kuisRestart" type="button">🔄 Main Lagi</button>
            <a class="btn btn-wa" id="kuisShare" href="#" target="_blank" rel="noopener">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.24 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm-4.3 4.36c-.18 0-.47.07-.72.34-.24.27-.94.92-.94 2.24 0 1.32.96 2.59 1.1 2.77.13.18 1.87 2.99 4.62 4.06 2.27.88 2.74.71 3.24.67.5-.05 1.6-.65 1.83-1.28.22-.63.22-1.17.15-1.28-.06-.11-.24-.18-.5-.31-.27-.13-1.6-.79-1.85-.88-.24-.09-.42-.13-.6.13-.18.27-.69.88-.84 1.06-.15.18-.31.2-.57.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.61-1.5-1.87-.15-.27-.01-.41.11-.54.11-.11.27-.31.4-.46.13-.16.18-.27.27-.44.09-.18.04-.34-.02-.47-.07-.13-.6-1.47-.83-2.01-.2-.48-.41-.42-.57-.43-.15-.01-.33-.01-.5-.01z"/></svg>
              Bagikan Skor
            </a>
          </div>
        </div>
      </div>
    </section>`;
  }

  const q = KUIS[s.i];
  const letters = ["A", "B", "C", "D"];
  const answered = s.picked !== null;
  return `
  <section class="section">
    <div class="container kuis-wrap">
      ${sectionHead("Tantangan", "🧠 Kuis Harian Kelas", "8 soal Fisika &amp; Elektronika. Jujur saja, ya! Skor terbaikmu tersimpan di perangkat ini.", true)}
      <div class="card kuis-card" data-reveal>
        <div class="kuis-progress">
          <span class="kp-txt">SOAL ${s.i + 1}/${KUIS.length}</span>
          <div class="kp-bar"><div class="kp-fill" style="width:${((s.i + (answered ? 1 : 0)) / KUIS.length) * 100}%"></div></div>
          <span class="kp-txt">SKOR ${s.score}</span>
        </div>
        <span class="badge badge-umum kuis-mapel">${esc(q.mapel)}</span>
        <h3 class="kuis-q">${esc(q.q)}</h3>
        <div class="kuis-opts">
          ${q.options
            .map(
              (opt, i) => {
                let cls = "kuis-opt";
                if (answered) {
                  if (i === q.a) cls += " correct";
                  else if (i === s.picked) cls += " wrong";
                  else cls += " dim";
                }
                return `<button class="${cls}" type="button" data-opt="${i}" ${answered ? "disabled" : ""}>
                  <span class="ko-letter">${letters[i]}</span><span>${esc(opt)}</span>
                </button>`;
              }
            )
            .join("")}
        </div>
        <div class="kuis-feedback ${answered ? "show" : ""} ${answered ? (s.picked === q.a ? "kf-ok" : "kf-bad") : ""}" id="kuisFb">
          ${answered ? (s.picked === q.a ? `✅ Benar! Kamu paham ${esc(q.mapel)}.` : `❌ Kurang tepat. Jawabannya: <b>${esc(q.options[q.a])}</b>`) : ""}
        </div>
        <button class="btn btn-primary kuis-next ${answered ? "show" : ""}" id="kuisNext" type="button">
          ${s.i === KUIS.length - 1 ? "Lihat Hasil →" : "Soal Berikutnya →"}
        </button>
      </div>
    </div>
  </section>`;
}

function bindKuis() {
  const s = state.kuis;
  if (!s) return;
  if (s.done) {
    const restart = $("#kuisRestart");
    if (restart) restart.addEventListener("click", () => { state.kuis = newKuis(); route(); });
    const share = $("#kuisShare");
    if (share) {
      const best = Number(localStorage.getItem("wiskar-kuis-best") || 0);
      share.href =
        "https://wa.me/?text=" +
        encodeURIComponent(`🧠 Aku baru main Kuis Harian WiskarKu dan dapat skor ${s.score}/${KUIS.length}! Ayo saingan, buka ${location.href.split("#")[0]}#/kuis`);
      void best;
    }
    return;
  }
  $$(".kuis-opt").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (state.kuis.picked !== null) return;
      state.kuis.picked = Number(btn.dataset.opt);
      if (state.kuis.picked === KUIS[state.kuis.i].a) state.kuis.score++;
      route();
    })
  );
  const next = $("#kuisNext");
  if (next)
    next.addEventListener("click", () => {
      const st = state.kuis;
      if (st.picked === null) return;
      if (st.i === KUIS.length - 1) {
        st.done = true;
        const best = Number(localStorage.getItem("wiskar-kuis-best") || 0);
        if (st.score > best) localStorage.setItem("wiskar-kuis-best", String(st.score));
        toast(`Selesai! Skor kamu ${st.score}/${KUIS.length} 🎯`);
      } else {
        st.i++;
        st.picked = null;
      }
      route();
    });
}

/* ============================================================
   Halaman: JADWAL PIKET
   ============================================================ */
function renderPiket() {
  const today = new Date().getDay();
  const todayIdx = today >= 1 && today <= 5 ? today - 1 : -1;
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Tanggung Jawab", "Jadwal Piket Kelas", `Bersih bersama, kelas nyaman bersama. Jam piket: <b>${esc(PIKET_JAM)}</b>.`)}
      <div class="card piket-table-wrap" data-reveal>
        <table class="piket-table">
          <thead><tr><th>Hari</th><th>Kelompok</th><th>Tugas</th></tr></thead>
          <tbody>
            ${PIKET.map(
              (p, i) => `
            <tr class="${i === todayIdx ? "row-today" : ""}">
              <td class="p-hari">${esc(p.hari)}${i === todayIdx ? '<span class="today-badge">Hari Ini</span>' : ""}</td>
              <td class="p-grup">${esc(p.grup)}</td>
              <td>${esc(p.tugas)}</td>
            </tr>`
            )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="card" style="padding:1.2rem 1.4rem; margin-top:1.1rem;" data-reveal>
        <p style="font-size:.9rem; color:var(--muted)">⚠️ Kelompok piket wajib lengkap. Ada yang berhalangan? Ganti dengan teman se-kelompok dan laporkan ke ketua kelas. Kelas berantakan = nilai kebersihan turun!</p>
      </div>
    </div>
  </section>`;
}

/* ============================================================
   Halaman: ANGGOTA KELAS
   ============================================================ */
function renderAnggota() {
  const locked = !state.user;
  const q = state.anggotaQ.trim().toLowerCase();
  const list = locked ? state.students : state.students.filter((s) => s.nama.toLowerCase().includes(q) || s.absen.includes(q));
  const monthB = nextBirthday();
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Warga Kelas", `Anggota Kelas ${esc(KELAS_INFO.nama)}`, `${state.students.length} siswa · ${esc(KELAS_INFO.dataKelas[1][1])} laki-laki, ${esc(KELAS_INFO.dataKelas[2][1])} perempuan`)}
      ${
        locked
          ? `<p data-reveal style="font-size:.85rem; color:var(--muted); margin-bottom:1.4rem;">ℹ️ Daftar anggota terbuka setelah kamu <a href="#/login" style="color:var(--primary-strong); font-weight:700;">masuk</a>.</p>`
          : `<div class="anggota-search" data-reveal>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="flex:none;color:var(--muted)"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.6-4.6"/></svg>
        <input id="anggotaSearch" type="text" placeholder="Cari nama atau nomor absen..." value="${esc(state.anggotaQ)}" />
        <span style="font-size:.78rem; color:var(--muted); font-weight:700; white-space:nowrap">${list.length}/${state.students.length}</span>
      </div>`
      }
      <div class="locked-wrap">
        <div class="anggota-grid ${locked ? "locked-blur" : ""}">
          ${list
            .map(
              (s, i) => `
          <div class="card anggota-card" data-reveal style="transition-delay:${Math.min(i * 25, 250)}ms">
            <span class="ang-avatar">${esc(s.nama.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</span>
            <div class="ang-txt">
              <b>${esc(s.nama)}</b>
              <span>🎂 ${s.birthday ? esc(s.birthday.split("-")[1] + " " + BULAN_ID[Number(s.birthday.split("-")[0]) - 1]) : "—"}</span>
            </div>
            <span class="ang-absen">${esc(s.absen)}</span>
          </div>`
            )
            .join("")}
          ${!locked && list.length === 0 ? `<div class="empty-admin" style="grid-column:1/-1"><span class="ea-ico">🔍</span>Tidak ada siswa dengan kata kunci “${esc(state.anggotaQ)}”.</div>` : ""}
        </div>
        ${locked ? lockOverlay("Masuk untuk melihat daftar anggota") : ""}
      </div>
      ${monthB && !locked ? `<p data-reveal style="margin-top:1.4rem; font-size:.85rem; color:var(--muted)">🎂 Ultah terdekat: <b style="color:var(--text)">${esc(monthB.nama)}</b> (${esc(monthB.label)})${monthB.days === 0 ? " — hari ini!" : ` — ${monthB.days} hari lagi`}</p>` : ""}
    </div>
  </section>`;
}

function bindAnggota() {
  const input = $("#anggotaSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    state.anggotaQ = input.value;
    const q = state.anggotaQ.trim().toLowerCase();
    const filtered = state.students.filter((s) => s.nama.toLowerCase().includes(q) || s.absen.includes(q));
    const grid = $(".anggota-grid");
    if (!grid) return;
    const monthB = nextBirthday();
    grid.innerHTML = filtered
      .map(
        (s) => `
      <div class="card anggota-card">
        <span class="ang-avatar">${esc(s.nama.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</span>
        <div class="ang-txt">
          <b>${esc(s.nama)}</b>
          <span>🎂 ${s.birthday ? esc(s.birthday.split("-")[1] + " " + BULAN_ID[Number(s.birthday.split("-")[0]) - 1]) : "—"}</span>
        </div>
        <span class="ang-absen">${esc(s.absen)}</span>
      </div>`
      )
      .join("") +
      (filtered.length === 0
        ? `<div class="empty-admin" style="grid-column:1/-1"><span class="ea-ico">🔍</span>Tidak ada siswa dengan kata kunci “${esc(state.anggotaQ)}”.</div>`
        : "");
    void monthB;
    const count = $(".anggota-search span");
    if (count) count.textContent = `${filtered.length}/${state.students.length}`;
    input.focus();
  });
}

/* ============================================================
   Init
   ============================================================ */
async function init() {
  initTheme();
  initNav();
  initLightbox();
  initPalette();
  initScrollFx();
  initShare();
  initLive();
  renderUserBox();
  await Promise.all([loadGallery(), loadAnnouncements(), loadAdmin(), loadStudents()]);
  buildTicker();
  route();
  try {
    const data = await api("/api/me");
    if (data.ok && data.user) {
      state.user = data.user;
      renderUserBox();
      route();
    }
  } catch { /* belum login */ }
}
document.addEventListener("DOMContentLoaded", init);
