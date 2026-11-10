# ANTIGRAVITY MASTER WORKSPACE PLAYBOOK & DIRECTIVES

> **Universal Template for Antigravity App, CLI, and IDE**  
> File ini dimuat secara otomatis (`always_on`) di seluruh cakupan proyek. Seluruh pengerjaan kode dan antarmuka **WAJIB** tunduk pada instruksi di bawah ini tanpa pengecualian.

---

## 1. CORE OPERATING PRINCIPLES (Filosofi & Arsitektur 3 Lapis)

Sistem bekerja dengan memisahkan 3 layer untuk memastikan eksekusi deterministik dan bebas eror:

1. **Layer 1: Directive (Instruksi Baku & Standard Operating Procedures):**
   - Dikelola terpusat di **aturan global** (`~/.gemini/config/rules/`: `anti-slop.md`, `clean-code.md`, `plan-first.md`, `context7.md`, `superpowers.md`).
   - Mengatur standar kualitas kode, pedoman visual anti-slop, larangan mutlak, verifikasi dokumentasi, dan disiplin rekayasa.
2. **Layer 2: Orchestration (Manajemen Keputusan & Perencanaan):**
   - Hidup di `.agents/plan/PLAN.md` dan `.agents/plan/TASK.md`.
   - Mengatur rincian spesifik proyek, pemetaan token desain, arsitektur data, roadmap, dan pelacakan tugas per giliran (*step-by-step*).
3. **Layer 3: Execution (Implementasi Bersih & Teruji):**
   - Menulis kode modular yang *clean*, *self-documenting*, bebas dead code, dan terverifikasi visual pada 60 FPS.
4. **Self-Annealing Loop (Penyempurnaan Mandiri):**
   - Jika terjadi kendala/error (build failure, layout break, API deprecation, atau runtime warning):
     1. Analisis akar masalah (*root cause*) secara objektif tanpa asumsi serampangan (`systematic-debugging`).
     2. Verifikasi dokumentasi resmi terkini via `context7` (`npx ctx7`).
     3. Terapkan perbaikan langsung pada intinya dan uji ulang (`verification-before-completion`).

---

## 2. THE SEVEN NON-NEGOTIABLE INVARIANTS (7 Hukum Mutlak)

### 🛡️ Hukum 1: Wajib Plan-First (Dilarang Langsung Menulis Kode)
- Setiap kali memulai proyek baru atau fitur baru, **DILARANG KERAS langsung menulis kode aplikasi**.
- Gunakan skill `brainstorming` untuk klarifikasi kebutuhan, lalu susun rencana kerja dengan `writing-plans` di `.agents/plan/PLAN.md` & `TASK.md`.
- Implementasi kode baru boleh dimulai **SETELAH** rencana disepakati bersama pengguna.

### 🛡️ Hukum 2: Anti-Rushing Pacing (Satu Section / Milestone Per Turn)
- Kualitas tinggi membutuhkan ketelitian. Jangan memborong banyak pekerjaan sekaligus.
- Kerjakan tepat **SATU fase atau satu section** dalam satu iterasi interaksi (`executing-plans`).
- Lakukan verifikasi menyeluruh (tampilan responsif, performa 60 FPS) sebelum meminta persetujuan pengguna untuk melanjutkan ke fase berikutnya.

### 🛡️ Hukum 3: Clean Code & Zero Comment Policy
- **Dilarang menyertakan komentar dalam kode:** Tanpa komentar penjelas yang sudah jelas dari kode (*"// handle submit"*, *"// state definition"*), tanpa penanda section (*"// ====================="*), dan tanpa kode mati (*commented-out code*).
- Kode wajib **self-documenting**: gunakan penamaan variabel, fungsi, hook, dan komponen yang deskriptif dan ekspresif.
- **Struktur modular:** Pecah komponen per file (anjuran: 100–250 baris). Dilarang membuat file monolitik raksasa.
- **Lifecycle & Memory Leak Prevention:** Seluruh listener (scroll, mouse, resize) dan instance animasi (GSAP ScrollTrigger, timeline, interval) wajib dibersihkan (*cleanup/revert*) saat komponen unmount.

### 🛡️ Hukum 4: Desain Anti-Slop & Bespoke Craft
Patuhi standar dari skill `taste-skill`, `impeccable`, dan `ui-ux-pro-max`:
- **🚫 DILARANG:** Kartu 3-kolom SaaS generik dengan ikon dalam kotak pastel membulat di atasnya.
- **🚫 DILARANG:** Gradien ungu-ke-pink bot atau rainbow mud tanpa sumber cahaya logis.
- **🚫 DILARANG:** Pill badge / decorative eyebrow spam berlebihan di atas setiap judul.
- **🚫 DILARANG:** Foto terpotong atau terdistorsi menjadi bangun geometris aneh.
- **🚫 DILARANG:** Animasi properti pemicu layout browser (`width`, `height`, `top`, `left`, `margin`) saat scroll aktif.
- **🚫 DILARANG:** Teks placeholder *Lorem Ipsum* atau data statistik rekayasa.
- **✅ WAJIB:** Tata letak bespoke (curved radial arcs, floating perspective clusters, layered showcases, asymmetric timelines).
- **✅ WAJIB:** Pencahayaan fisik realistis (backlit squircles, neon rim-light borders, OLED pure black void).
- **✅ WAJIB:** Tipografi disiplin (maksimal 2 font, headline maksimal 2 baris, paragraf ringkas <= 25 kata).
- **✅ WAJIB:** Performa animasi 60 FPS (hanya menganimasikan GPU `transform` dan `opacity`).
- **✅ WAJIB The "One Live Thing":** Minimal satu elemen interaktif nyata yang hidup dan dapat disentuh oleh pengguna.

### 🛡️ Hukum 5: Maksimalkan Skill Lokal di `.agents/skills/`
- Jangan mengarang solusi dari nol jika sudah tersedia intelligence di skill lokal:
  - `brainstorming` — Brainstorming, user alignment, and requirements clarity.
  - `writing-plans` & `executing-plans` — Structured implementation planning & step-by-step execution.
  - `systematic-debugging` — Root-cause debugging without guessing.
  - `verification-before-completion` — Empirical verification (tests, linter, build) before claiming completion.
  - `context7` — Live documentation lookup (`npx ctx7`).
  - `ui-ux-pro-max` — Design systems, color palettes, typography, GSAP motion presets.
  - `taste-skill` — Curated Awwwards art directions & no-slop browser inspector.
  - `impeccable` — Surface craft modes & quality polish.
  - `design-system` & `ui-styling` — 3-layer tokens (*primitive → semantic → component*).
  - `skill-creator` — Define new specialized workflow skills.

### 🛡️ Hukum 6: Verifikasi Dokumentasi Terkini dengan Context7 (`npx ctx7`)
- Sebelum menulis kode yang memanfaatkan pustaka eksternal, SDK, atau API pihak ketiga, verifikasi sintaks dan status pembaruan menggunakan `npx ctx7 library <name>` dan `npx ctx7 docs <libraryId> <query>`. Dilarang mengarang fungsi atau menggunakan model usang/terdepresiasi.

### 🛡️ Hukum 7: Disiplin Rekayasa Superpowers
- Terapkan protokol rekayasa bertahap: eksplorasi alternatif sebelum coding, investigasi sistematis saat terjadi bug, dan pembuktian empiris sebelum menandai pekerjaan selesai.

---

## 3. FIRST CONVERSATION PROTOCOL (Saat Memulai Proyek Baru)

Ketika pengguna menyalin (*copy-paste*) template ini ke folder proyek baru dan membuka percakapan baru di Antigravity:

1. **Step 1: Intake & Discovery (`brainstorming`)**
   - Sambut pengguna, konfirmasi nama dan fokus proyek yang ingin dibuat.
   - Ajukan 2–3 pertanyaan terfokus mengenai nilai utama brand, visual benchmark, dan ketersediaan aset.
2. **Step 2: Penyusunan PLAN.md & TASK.md (`writing-plans`)**
   - Isi file `.agents/plan/PLAN.md` dengan lengkap (Misi, Palet Warna, Tipografi, One Live Thing, 6 Fase Roadmap).
   - Isi file `.agents/plan/TASK.md` dengan checklist tugas atomik.
3. **Step 3: Konfirmasi Rencana**
   - Sajikan rangkuman rencana kepada pengguna untuk konfirmasi.
4. **Step 4: Eksekusi Berjenjang (`executing-plans`)**
   - Jalankan Fase 1 (Setup Foundation & Tokens).
   - Verifikasi hasil (`verification-before-completion`), perbarui `TASK.md`, dan minta persetujuan sebelum melangkah ke Fase 2.

---

## 4. SKILLS QUICK-COMMAND CHEAT-SHEET

0. **Skills Router (Fast Matcher & Token Saver):**
   ```bash
   python .agents/skills/skills-router/scripts/route.py "<query atau intent>"
   python .agents/skills/skills-router/scripts/route.py --list
   ```

1. **Context7 (Live Docs & Snippet Retrieval):**
   ```bash
   npx ctx7 library <name> "[query]"
   npx ctx7 docs <libraryId> "<query>"
   ```

2. **Design & UI Intelligence (`ui-ux-pro-max`):**
   ```bash
   python .agents/skills/ui-ux-pro-max/scripts/search.py "<product_type>" --design-system -p "<Project>"
   ```

3. **Art Direction & Browser Inspector (`taste-skill`):**
   ```bash
   node .agents/skills/taste-skill/scripts/draw.mjs --brief "<brief>"
   node .agents/skills/taste-skill/scripts/inspect.mjs <url-or-file>
   ```

4. **Surface Craft Polish (`impeccable`):**
   ```cmd
   .agents\skills\impeccable\scripts\impeccable.cmd context
   ```

---

## 5. WORKSPACE REFERENCES

- **Aturan Global:** `~/.gemini/config/rules/` (`anti-slop.md`, `clean-code.md`, `plan-first.md`, `context7.md`, `superpowers.md`)
- **Perencanaan:** `.agents/plan/PLAN.md` & `.agents/plan/TASK.md`
- **Skill Lokal:** `.agents/skills/` (17 skill terpasang siap pakai, dipandu terpusat oleh `skills-router`)
