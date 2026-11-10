# 🚀 ANTIGRAVITY GOLDEN PROJECT TEMPLATE

> **Master Template untuk Antigravity App, CLI, dan IDE**  
> Folder ini dirancang khusus sebagai cetak biru (*golden template*) untuk memulai proyek baru dengan jaminan: **kode bersih (clean code)**, **eksekusi terencana & tidak terburu-buru (anti-rushing)**, **dokumentasi Plan & Task sebelum mulai**, **maksimalisasi skill lokal**, dan **standar desain ANTI-SLOP kelas dunia (Awwwards level)**.

---

## 🌟 Mengapa Menggunakan Template Ini?

Seringkali AI menghasilkan kode yang terburu-buru, menumpuk ratusan baris kode monolitik, menggunakan template kartu SaaS 3-kolom yang membosankan (*AI Slop*), dan mengabaikan perencanaan.

Template ini menyelesaikan masalah tersebut dengan **Sistem 3 Lapis (The 3-Layer Architecture)**:
1. **Layer 1: Directive (Aturan Baku):** Tersimpan di `AGENTS.md`, `GEMINI.md`, dan `.agents/rules/`.
2. **Layer 2: Orchestration (Perencanaan & Pelacakan):** Tersimpan di `.agents/plan/PLAN.md` dan `.agents/plan/TASK.md`.
3. **Layer 3: Execution (Pengerjaan Bersih):** Menulis kode modular, *self-documenting*, bebas dead code, dan terverifikasi pada 60 FPS.

---

## 🛠️ Cara Menggunakan Template untuk Proyek Baru

Setiap kali Anda ingin membuat proyek baru, ikuti 3 langkah mudah berikut:

### Langkah 1: Duplikasi & Ganti Nama Folder
Salin (*copy-paste*) seluruh folder `template` ini ke direktori kerja Anda, lalu ganti namanya sesuai nama proyek baru Anda:
```bash
# Contoh di terminal / File Explorer:
# Dari: d:\Coding\Gabut\template
# Ke:   d:\Coding\Gabut\proyek-keren-saya
```

### Langkah 2: Buka Folder di Antigravity
Buka folder baru tersebut di Antigravity IDE, Antigravity App, atau jalankan via Antigravity CLI. Antigravity akan otomatis mendeteksi dan mengaktifkan seluruh aturan di `AGENTS.md` dan `.agents/rules/`.

### Langkah 3: Mulai Sesi Percakapan Baru (First Prompt)
Buka sesi chat baru dan kirimkan prompt pembuka seperti ini:

```text
Halo Antigravity, saya ingin membuat proyek baru bernama "[Nama Proyek]". 
Fokus proyek ini adalah [jelaskan singkat ide/aplikasi yang diinginkan]. 

Tolong ikuti panduan di AGENTS.md:
1. Lakukan discovery/intake dan jangan langsung menulis kode aplikasi.
2. Isi dokumen perencanaan di .agents/plan/PLAN.md (termasuk pemilihan token, tipografi, dan One Live Thing).
3. Susun checklist tugas di .agents/plan/TASK.md.
4. Manfaatkan skill lokal seperti ui-ux-pro-max, taste-skill, dan impeccable untuk menentukan arah visual anti-slop.
5. Tunggu persetujuan saya terhadap PLAN.md sebelum memulai penulisan kode Fase 1.
```

---

## 📁 Struktur Minimalis Berkas Template

```text
├── AGENTS.md                  # Master Workspace Playbook & Skills Cheat-Sheet
├── README.md                  # Dokumentasi template (file ini)
├── .gitignore                 # Git ignore standar web modern
│
└── .agents/
    ├── plan/                  # Layer 2: Orchestration
    │   ├── PLAN.md            # Template spesifikasi proyek, tema visual & roadmap
    │   └── TASK.md            # Template pelacak tugas live (live task workboard)
    │
    └── skills/                # Layer 1: Specialized Intelligence Repositories
        ├── skills-router/     # Master Quick-Lookup Index & Token Saver CLI (route.py)
        ├── ui-ux-pro-max/     # 79 gaya desain, 192 palet, 74 font pairing, 17 preset GSAP
        ├── taste-skill/       # Kurasi galeri Awwwards, draw.mjs, browser inspector
        ├── impeccable/        # Craft floor, surface modes (Persuade/Operate), visual polish
        ├── skill-creator/     # Alat pembuat & penyempurna skill baru
        ├── design-system/     # Arsitektur token 3 lapis (primitive -> semantic -> component)
        ├── ui-styling/        # Canvas styling & visual utilities
        ├── brand/             # Tone of voice & konsistensi identitas brand
        ├── banner-design/     # Komposisi banner ads, hero, dan visual grafis
        └── slides/            # Presentasi interaktif HTML dengan Chart.js
```

---

## 🛡️ Standar Kualitas Utama yang Dijamin

### 1. Zero Comment & Clean Code Architecture
- Kode **100% self-documenting**. Bebas komentar sepele (*"// handle click"*), bebas penanda panjang (*"// ===="*), dan bebas kode mati.
- File modular (100–250 baris). Pemisahan data, komponen, dan utilitas.
- Teardown & memory safety: Semua listener dan animasi GSAP wajib dibersihkan saat unmount (`ctx.revert()`).

### 2. Anti-Rushing Pacing Protocol
- Agen mengerjakan tepat **1 section / 1 fase per giliran**.
- Setiap tahapan melewati **Verification Gate** (uji responsif mobile/tablet/desktop, audit 60 FPS, inspeksi visual).
- Agen meminta konfirmasi pengguna sebelum melompat ke section berikutnya.

### 3. Desain ANTI-SLOP (Visual Craft Floor)
- 🚫 **Dilarang:** Kartu 3-kolom generik dengan ikon pastel membulat di atasnya.
- 🚫 **Dilarang:** Gradien ungu bot tanpa sumber cahaya fisik logis.
- 🚫 **Dilarang:** Pill badge / eyebrow spam berlebihan di atas setiap judul.
- 🚫 **Dilarang:** Teks *Lorem Ipsum* atau statistik rekayasa.
- ✅ **Wajib:** Bentuk bespoke (curved radial arcs, floating perspective clusters, asymmetric timelines).
- ✅ **Wajib:** Pencahayaan terarah (*backlit squircle*, *neon rim-light borders*, *OLED pure black void*).
- ✅ **Wajib Disiplin Tipografi:** Maksimal 2 font per proyek, headline maksimal 2 baris di semua resolusi layar, paragraf ringkas (<= 25 kata per blok).
- ✅ **Wajib 60 FPS Motion:** Animasi scroll hanya menggunakan GPU transform dan opacity.
- ✅ **Wajib "One Live Thing":** Minimal satu elemen interaktif taktil yang hidup (pemutar suara interaktif, kanvas usap/reveal, perspektif 3D, atau simulator).

---

## 🌐 Aturan Global Workstation

Aturan global telah terpasang permanen di komputer Anda di:
- `~/.gemini/AGENTS.md` & `GEMINI.md`
- `~/.gemini/config/rules/anti-slop.md`
- `~/.gemini/config/rules/clean-code.md`
- `~/.gemini/config/rules/plan-first.md`

Sehingga proyek baru apapun yang dibuat dari template ini akan otomatis sinkron 100% dengan standar workstation Anda!

    Halo Antigravity, saya ingin membuat proyek baru bernama "[Nama Proyek]". 
    Fokus proyek ini adalah [jelaskan singkat ide/aplikasi]. 

    Tolong ikuti panduan di AGENTS.md:
    1. Lakukan discovery/intake dan jangan langsung menulis kode aplikasi.
    2. Isi dokumen perencanaan di .agents/plan/PLAN.md (termasuk pemilihan token, tipografi, dan One Live Thing).
    3. Susun checklist tugas di .agents/plan/TASK.md.
    4. Manfaatkan skill lokal seperti ui-ux-pro-max, taste-skill, dan impeccable untuk menentukan arah visual anti-slop.
    5. Tunggu persetujuan saya terhadap PLAN.md sebelum memulai penulisan kode Fase 1
