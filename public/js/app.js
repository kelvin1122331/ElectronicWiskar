/* ============================================================
   WiskarKu — app.js
   SPA ringan: routing hash, tema, login, galeri + lightbox.
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const state = {
  user: null,
  grade: 10,
  galeriFilter: "Semua",
  lightboxList: [],
  lightboxIdx: 0,
};

/* ============================================================
   API
   ============================================================ */
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan.");
  return data;
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
  toastTimer = setTimeout(() => (t.className = "toast"), 3200);
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
      try {
        await api("/api/logout", { method: "POST" });
      } catch { /* abaikan */ }
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
  kontak: renderKontak,
  login: renderLogin,
};

function currentRoute() {
  const h = (location.hash || "#/beranda").replace(/^#\//, "").split("?")[0];
  return PAGES[h] ? h : "beranda";
}

function route() {
  const page = currentRoute();
  $$("#navLinks a").forEach((a) => a.classList.toggle("active", a.dataset.route === page));
  $("#app").innerHTML = PAGES[page]();
  window.scrollTo({ top: 0 });
  if (page === "galeri") bindGaleri();
  if (page === "mapel") bindMapel();
  if (page === "login") bindLogin();
  if (page === "kontak") bindKontak();
  initReveal();
}

window.addEventListener("hashchange", route);

/* ============================================================
   Animasi reveal
   ============================================================ */
function initReveal() {
  const els = $$("#app [data-reveal]");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("visible"), io.unobserve(e.target))),
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

/* ============================================================
   Halaman: BERANDA
   ============================================================ */
function renderBeranda() {
  const featured = GALERI.slice(0, 3);
  return `
  <section class="hero">
    <div class="hero-bg"><img src="images/hero.jpg" alt="Suasana kelas Wiskar" /></div>
    <div class="container hero-inner">
      <span class="hero-pill">⚡ Kelas Wiskar · ${esc(KELAS_INFO.jurusan)}</span>
      <h1>Selamat datang di <span class="grad">Galeri Kelas Wiskar</span></h1>
      <p>Website resmi warga kelas — tempat berjalannya dokumentasi kegiatan, informasi mata pelajaran kelas 10–12, agenda, dan segala hal seru seputar kelas kita.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#/galeri">📸 Lihat Galeri</a>
        <a class="btn btn-ghost" href="#/mapel">📚 Mata Pelajaran</a>
      </div>
    </div>
  </section>

  <div class="container">
    <div class="stats">
      <div class="stat-card" data-reveal><b>${KELAS_INFO.dataKelas[0][1].replace(" siswa", "")}</b><span>Total Siswa</span></div>
      <div class="stat-card" data-reveal><b>18</b><span>Mata Pelajaran (10–12)</span></div>
      <div class="stat-card" data-reveal><b>${GALERI.length}</b><span>Foto Galeri</span></div>
      <div class="stat-card" data-reveal><b>${AGENDA.length}</b><span>Agenda Terdekat</span></div>
    </div>
  </div>

  <section class="section">
    <div class="container">
      ${sectionHead("Menu Spesial", "Jelajahi Website Kelas", "Semua kebutuhan kelas ada di sini — tinggal klik menunya.")}
      <div class="menu-grid">
        ${[
          ["📚", "Mata Pelajaran", "Daftar mapel lengkap kelas 10, 11, dan 12 beserta guru pengampu dan materi pokok.", "mapel", "Lihat mapel"],
          ["📸", "Galeri Kelas", "Dokumentasi kegiatan, praktikum, dan momen seru warga kelas.", "galeri", "Buka galeri"],
          ["🗓️", "Agenda Kelas", "Jadwal ulangan, praktikum, dan acara penting kelas.", "agenda", "Lihat agenda"],
          ["🏫", "Profil Kelas", "Visi misi, data kelas, dan jajaran pengurus kelas.", "profil", "Kenali kelas"],
        ]
          .map(
            ([icon, title, desc, slug, link], i) => `
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
      <div class="login-banner" data-reveal>
        <span class="lb-emoji">👋</span>
        <div style="flex:1; min-width: 240px;">
          <h3>Halo, ${esc(state.user.nama)}!</h3>
          <p>Kamu sudah masuk sebagai Absen ${esc(state.user.absen)}. Semua konten kelas kini terbuka untukmu.</p>
        </div>
        <a class="btn" href="#/profil">Lihat Profil Kelas</a>
      </div>`
          : `
      <div class="login-banner" data-reveal>
        <span class="lb-emoji">🔐</span>
        <div style="flex:1; min-width: 240px;">
          <h3>Sedang mencari sesuatu di kelas kita?</h3>
          <p>Masuk dengan nomor absen, nama, dan sandi website untuk membuka semua konten — pengurus kelas, detail materi, dan lainnya.</p>
        </div>
        <a class="btn" href="#/login">Masuk Sekarang</a>
      </div>`
      }
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      ${sectionHead("Glimpse", "Sampai jumpa di Galeri Kelas", "Sneak peek beberapa dokumentasi terbaru kelas Wiskar.")}
      <div class="feature-strip">
        ${featured
          .map(
            (g, i) => `
          <a class="g-preview" href="#/galeri" data-reveal data-idx="${i}">
            <img src="${g.img}" alt="${esc(g.judul)}" loading="lazy" />
            <span class="fs-cap">${esc(g.judul)}</span>
          </a>`
          )
          .join("")}
      </div>
      <div style="text-align:center; margin-top:2rem;" data-reveal>
        <a class="btn btn-primary" href="#/galeri">Lihat Semua Foto →</a>
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
            (m, i) => `
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
  const items = GALERI.filter((g) => state.galeriFilter === "Semua" || g.kategori === state.galeriFilter);
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Dokumentasi", "Galeri Kelas Wiskar", "Momen belajar, praktikum, dan kegiatan seru warga kelas. Klik foto untuk melihat lebih dekat.")}
      <div class="chips">
        ${GALERI_KATEGORI.map(
          (k) => `<button class="chip ${k === state.galeriFilter ? "active" : ""}" type="button" data-cat="${esc(k)}">${esc(k)}</button>`
        ).join("")}
      </div>
      ${
        items.length
          ? `<div class="galeri-grid">
        ${items
          .map(
            (g, i) => `
          <figure class="g-item" data-reveal data-idx="${i}" tabindex="0" role="button" aria-label="Buka foto ${esc(g.judul)}">
            <img src="${g.img}" alt="${esc(g.judul)}" loading="lazy" />
            <span class="g-tag">${esc(g.kategori)}</span>
            <figcaption class="g-cap"><b>${esc(g.judul)}</b><span>${esc(g.desc)}</span></figcaption>
          </figure>`
          )
          .join("")}
      </div>`
          : `<div class="card" style="padding:3rem; text-align:center;" data-reveal><p style="color:var(--muted)">Belum ada foto pada kategori ini.</p></div>`
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
  state.lightboxList = GALERI.filter((g) => state.galeriFilter === "Semua" || g.kategori === state.galeriFilter);
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
  $("#lightboxImg").src = g.img;
  $("#lightboxImg").alt = g.judul;
  $("#lightboxCap").textContent = `${g.judul} — ${g.desc}`;
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
  return `
  <section class="section">
    <div class="container">
      ${sectionHead("Jadwal", "Agenda Kelas", "Catat tanggal pentingnya — jangan sampai ketinggalan!")}
      <div class="timeline">
        ${AGENDA.map(
          (a, i) => `
          <div class="card agenda-item" data-reveal style="transition-delay:${i * 60}ms">
            <div class="agenda-date"><b>${esc(a.tanggal)}</b><span>${esc(a.bulan)}</span></div>
            <div class="agenda-body">
              <h3>${esc(a.judul)} <span class="tag tag-${a.tag}">${esc(a.tagLabel)}</span></h3>
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
   Halaman: LOGIN
   ============================================================ */
function renderLogin() {
  if (state.user) {
    return `
    <section class="section">
      <div class="container" style="max-width:560px">
        <div class="card login-card" style="text-align:center" data-reveal>
          <div class="l-head"><span class="brand-badge"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1.5 8.5L18 10.5h-6.5L13 2z"/></svg></span>
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
          <span class="brand-badge" style="width:52px;height:52px;border-radius:16px"><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M13 2 4.5 13.5H11l-1.5 8.5L18 10.5h-6.5L13 2z"/></svg></span>
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
  const pwdToggle = $("#pwdToggle");
  pwdToggle.addEventListener("click", () => {
    const inp = $("#sandi");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    pwdToggle.textContent = show ? "SEMBUNYIKAN" : "LIHAT";
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
   Init
   ============================================================ */
async function init() {
  initTheme();
  initNav();
  initLightbox();
  renderUserBox();
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
