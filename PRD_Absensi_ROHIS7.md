# PRD — Website Absensi ROHIS 7

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Status:** Draft

\---

## 1\. Ringkasan Proyek

Website Absensi ROHIS 7 adalah aplikasi web full-stack untuk mengelola kehadiran anggota organisasi ROHIS (Rohani Islam) dalam setiap kegiatan/pertemuan. Sistem ini memiliki dua peran pengguna: **Admin** (pengelola data) dan **User/Anggota** (peserta kegiatan).

\---

## 2\. Tech Stack

|Layer|Teknologi|
|-|-|
|Backend Framework|Laravel 11|
|Database|MySQL (via XAMPP)|
|Frontend (SPA)|React.js (via Vite atau Inertia.js)|
|Styling|Tailwind CSS|
|Local Server|XAMPP (Apache + MySQL)|
|PDF Export|Laravel DomPDF / Barryvdh|
|QR Code|`simplesoftwareio/simple-qrcode` (Laravel)|
|Auth|Laravel Breeze / Sanctum|

> \*\*Catatan Dev:\*\* Karena developer lebih familiar dengan XAMPP, gunakan XAMPP biasa. Laravel dijalankan via `php artisan serve` atau konfigurasi Virtual Host di Apache XAMPP. MySQL diakses melalui phpMyAdmin.

\---

## 3\. Struktur Database

### 3.1 Tabel `users`

|Kolom|Tipe|Keterangan|
|-|-|-|
|id|BIGINT UNSIGNED (PK, AI)|Primary key internal|
|name|VARCHAR(100)|Nama lengkap|
|email|VARCHAR(100) UNIQUE|Format: `{nama\_depan}.{angkatan}@rohis.id`|
|password|VARCHAR(255)|Bcrypt hash dari `RohisBisa2026`|
|role|ENUM('admin','user')|Default: `user`|
|created\_at|TIMESTAMP||
|updated\_at|TIMESTAMP||

### 3.2 Tabel `anggota`

|Kolom|Tipe|Keterangan|
|-|-|-|
|nisn|VARCHAR(20) (PK)|Primary key, diinput manual|
|nama|VARCHAR(100)|Nama lengkap anggota|
|kelas|VARCHAR(20)|Contoh: `X-IPA-1`, `XI-IPS-2`|
|jabatan|VARCHAR(50)|Contoh: Ketua, Sekretaris, Anggota|
|tanda\_tangan|TEXT (nullable)|Base64 data URL gambar tanda tangan|
|user\_id|BIGINT UNSIGNED (FK → users.id, nullable)|Relasi ke akun login|
|created\_at|TIMESTAMP||
|updated\_at|TIMESTAMP||

### 3.3 Tabel `kegiatan`

|Kolom|Tipe|Keterangan|
|-|-|-|
|id|BIGINT UNSIGNED (PK, AI)||
|nama\_kegiatan|VARCHAR(150)|Nama acara/pertemuan|
|tanggal|DATE|Tanggal pelaksanaan|
|waktu\_mulai|TIME|Jam mulai kegiatan|
|kode\_absen|VARCHAR(10) UNIQUE|Kode 6–8 karakter alfanumerik unik|
|is\_active|BOOLEAN|Default: `true`, nonaktif jika sudah selesai|
|created\_at|TIMESTAMP||
|updated\_at|TIMESTAMP||

### 3.4 Tabel `absensi`

|Kolom|Tipe|Keterangan|
|-|-|-|
|id|BIGINT UNSIGNED (PK, AI)||
|kegiatan\_id|BIGINT UNSIGNED (FK → kegiatan.id)||
|nisn|VARCHAR(20) (FK → anggota.nisn)||
|waktu\_absen|TIMESTAMP|Waktu saat anggota submit absen|
|tanda\_tangan|TEXT|Base64 data URL tanda tangan saat absen|
|created\_at|TIMESTAMP||
|updated\_at|TIMESTAMP||

**Constraint:** `UNIQUE(kegiatan\_id, nisn)` — satu anggota hanya bisa absen sekali per kegiatan.

\---

## 4\. Autentikasi \& Akun

### Format Email Anggota

```
{2\_nama\_depan}.{angkatan}@rohis.id
```

**Contoh:**

* Ahmad Fauzi Akbar, angkatan 2024 → `ahmadfauzi.2024@rohis.id`
* Siti Rahma Wati, angkatan 2025 → `sitirahma.2025@rohis.id`

### Password Default

```
RohisBisa2026
```

Semua akun user menggunakan password ini. **Tidak ada fitur ganti password atau reset password.**

### Akun Admin

* Dibuat manual via seeder Laravel atau phpMyAdmin.
* Email admin: bebas (misal `admin@rohis.id`), role = `admin`.

\---

## 5\. Alur Sistem (Flow)

### 5.1 Flow Admin

```
Login Admin
    ↓
Dashboard Admin
    ├── \[Data Anggota]
    │       ├── Tampil tabel anggota
    │       ├── Tambah anggota (CRUD)
    │       ├── Edit anggota
    │       └── Hapus anggota
    │
    └── \[Daftar Kegiatan]
            ├── Tampil tabel kegiatan
            ├── Tambah kegiatan baru
            ├── Edit kegiatan
            ├── Hapus kegiatan
            └── Detail Kegiatan
                    ├── Info kegiatan (nama, tanggal, waktu)
                    ├── Tampilkan Kode / QR Absen
                    ├── Tabel daftar hadir (NISN, nama, kelas, jabatan, ttd, waktu absen)
                    ├── Hapus entri absen (per baris)
                    └── Export PDF daftar hadir
```

### 5.2 Flow User / Anggota

```
Login User (email + password)
    ↓
Dashboard User
    └── Tombol "Absen Sekarang"
            ↓
        Halaman Input Kode / Scan QR
            ├── Input kode manual (6–8 karakter)
            └── Scan QR via kamera
                    ↓
                Validasi kode → kegiatan ditemukan \& aktif?
                    ├── ❌ Tidak valid → tampilkan pesan error
                    └── ✅ Valid → Halaman Tanda Tangan
                                    ↓
                                Canvas tanda tangan digital
                                    ↓
                                Klik "Hadir" → kirim data ke server
                                    ↓
                                Halaman Sukses / Konfirmasi
```

\---

## 6\. Spesifikasi Halaman \& Komponen

### 6.1 Halaman Login (Shared)

* **Route:** `/login`
* **Komponen:**

  * Logo / nama organisasi ROHIS 7
  * Field email
  * Field password
  * Tombol "Masuk"
  * Tidak ada link register
* **Logika:**

  * Jika role = `admin` → redirect ke `/admin/dashboard`
  * Jika role = `user` → redirect ke `/dashboard`

\---

### 6.2 Admin — Dashboard

* **Route:** `/admin/dashboard`
* **Komponen:**

  * Header: nama organisasi + tombol logout
  * Sidebar/navbar: menu Data Anggota, Daftar Kegiatan
  * Kartu statistik (opsional): jumlah anggota, jumlah kegiatan
  * Shortcut ke kedua menu utama

\---

### 6.3 Admin — Halaman Data Anggota

* **Route:** `/admin/anggota`
* **Komponen:**

  * Tombol "Tambah Anggota" (buka modal/form)
  * Tabel dengan kolom: No, NISN, Nama, Kelas, Jabatan, Tanda Tangan (preview thumbnail), Aksi (Edit | Hapus)
  * Pagination jika data banyak
  * Pencarian/filter nama atau kelas (opsional)

**Form Tambah/Edit Anggota:**

|Field|Input|Validasi|
|-|-|-|
|NISN|Text|Required, unique, max 20 karakter|
|Nama|Text|Required|
|Kelas|Text / Dropdown|Required|
|Jabatan|Text / Dropdown|Required|
|Tanda Tangan|Canvas (draw)|Opsional, bisa dikosongkan|
|Email Login|Text|Auto-generate dari nama+angkatan, bisa diedit|
|Angkatan|Number|Untuk generate email|

> Saat anggota dibuat, sistem otomatis membuat `users` record dengan email dan password default (`RohisBisa2026`), lalu link ke `anggota.user\_id`.

\---

### 6.4 Admin — Halaman Daftar Kegiatan

* **Route:** `/admin/kegiatan`
* **Komponen:**

  * Tombol "Tambah Kegiatan" (buka modal/form)
  * Tabel: No, Nama Kegiatan, Tanggal, Waktu Mulai, Status (Aktif/Selesai), Aksi (Detail | Edit | Hapus)

**Form Tambah/Edit Kegiatan:**

|Field|Input|Validasi|
|-|-|-|
|Nama Kegiatan|Text|Required|
|Tanggal|Date picker|Required|
|Waktu Mulai|Time picker|Required|
|Kode Absen|Text|Auto-generate (bisa diedit), unik|

\---

### 6.5 Admin — Halaman Detail Kegiatan

* **Route:** `/admin/kegiatan/{id}`
* **Layout:**

```
  \[← Kembali]                              \[Export PDF]
  
  Nama Kegiatan: Pertemuan Mingguan #5
  Tanggal: 20 Mei 2026 | Waktu: 08.00 WIB
  
  \[Tampilkan Kode Absen]  \[Tampilkan QR Absen]
  
  ─────────────────────────────────────────
  DAFTAR HADIR
  ┌────┬──────┬───────┬───────┬──────────┬──────────┬────────────┬───────┐
  │ No │ NISN │ Nama  │ Kelas │ Jabatan  │ Ttd      │ Waktu Absen│ Aksi  │
  └────┴──────┴───────┴───────┴──────────┴──────────┴────────────┴───────┘
  ```

**Fitur Tampilkan Kode/QR:**

* Modal/card muncul menampilkan:

  * Kode teks besar (misal: `AB12CD`)
  * QR Code dari kode tersebut
  * Tombol tutup

**Export PDF:**

* Generate PDF berisi header nama kegiatan, tanggal, waktu, dan tabel daftar hadir lengkap dengan kolom tanda tangan.
* Library: `barryvdh/laravel-dompdf`

\---

### 6.6 User — Dashboard

* **Route:** `/dashboard`
* **Komponen:**

  * Header: "Selamat Datang, {Nama}"
  * Kartu profil anggota: Nama, Kelas, Jabatan, foto TTD (jika ada)
  * Tombol besar: **"Absen Sekarang"**
  * Riwayat kehadiran anggota sendiri (opsional, nice-to-have)

\---

### 6.7 User — Halaman Absensi

* **Route:** `/absen`
* **Tahap 1 — Input Kode / QR:**

  * Tab: `Kode Manual` | `Scan QR`
  * Input kode manual: field teks + tombol "Cek Kode"
  * Scan QR: akses kamera browser menggunakan library `html5-qrcode` (JS)
  * Validasi ke endpoint: `POST /api/absen/validasi-kode`
  * Error: "Kode tidak valid" / "Kegiatan tidak aktif" / "Kamu sudah absen"
* **Tahap 2 — Tanda Tangan:**

  * Judul kegiatan yang ditemukan
  * Canvas tanda tangan (bisa dihapus/redo)
  * Tombol: "Hadir" (submit) | "Hapus TTD"
* **Tahap 3 — Sukses:**

  * Pesan konfirmasi: "Kehadiran kamu berhasil dicatat!"
  * Info: nama kegiatan, waktu absen
  * Tombol: "Kembali ke Dashboard"

\---

## 7\. API Endpoints (Laravel Routes)

### Auth

|Method|URL|Keterangan|
|-|-|-|
|POST|`/login`|Login semua role|
|POST|`/logout`|Logout|

### Admin — Anggota

|Method|URL|Keterangan|
|-|-|-|
|GET|`/admin/anggota`|List semua anggota|
|POST|`/admin/anggota`|Tambah anggota + buat user|
|PUT|`/admin/anggota/{nisn}`|Edit anggota|
|DELETE|`/admin/anggota/{nisn}`|Hapus anggota + user-nya|

### Admin — Kegiatan

|Method|URL|Keterangan|
|-|-|-|
|GET|`/admin/kegiatan`|List semua kegiatan|
|POST|`/admin/kegiatan`|Tambah kegiatan|
|PUT|`/admin/kegiatan/{id}`|Edit kegiatan|
|DELETE|`/admin/kegiatan/{id}`|Hapus kegiatan|
|GET|`/admin/kegiatan/{id}`|Detail + list hadir|
|GET|`/admin/kegiatan/{id}/export-pdf`|Download PDF daftar hadir|
|DELETE|`/admin/absensi/{id}`|Hapus satu entri absensi|

### User — Absensi

|Method|URL|Keterangan|
|-|-|-|
|POST|`/api/absen/validasi-kode`|Validasi kode → return info kegiatan|
|POST|`/api/absen/submit`|Submit kehadiran + tanda tangan|

\---

## 8\. Desain UI / Front-End

### 8.1 Palet Warna

|Elemen|Warna|
|-|-|
|Primary|`#008298` (Biru Tosca — Warna utama aplikasi, tombol utama, header, atau ikon aktif)|
|Secondary|`#0f2846` (Biru Dark - background card, Sidebar, footer, background halaman login, atau komponen admin.)|
|Accent|`#F59E0B` (amber, Tombol peringatan, atau penanda token penting.)|
|Danger|`#DC2626` (merah, hapus)|
|Neutral|`#F8FAFC` (background halaman)|
|Text utama|`#1F2937`|
|Text sekunder|`#6B7280`|

### 8.2 Tipografi

* Font: `Inter` (Google Fonts)
* Judul halaman: `text-2xl font-bold`
* Label form: `text-sm font-medium`
* Tabel header: `text-xs uppercase tracking-wider`

### 8.3 Layout Umum

* **Desktop:** Sidebar kiri (240px) + konten utama (flex-grow)
* **Mobile:** Bottom navigation atau hamburger menu
* **Radius kartu:** `rounded-2xl`
* **Shadow kartu:** `shadow-md`

### 8.4 Komponen UI Utama

```
- Navbar/Sidebar Admin
- Card statistik (dashboard)
- Tabel data (striped, hover highlight)
- Modal (form tambah/edit)
- Toast notifikasi (sukses/error)
- Canvas tanda tangan
- QR Code viewer
- QR Code scanner (kamera)
- Badge status (Aktif/Selesai)
```

\---

## 9\. Struktur Folder Laravel

```
rohis-absensi/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/LoginController.php
│   │   │   ├── Admin/AnggotaController.php
│   │   │   ├── Admin/KegiatanController.php
│   │   │   ├── Admin/AbsensiController.php
│   │   │   └── User/AbsenController.php
│   │   └── Middleware/
│   │       └── IsAdmin.php
│   └── Models/
│       ├── User.php
│       ├── Anggota.php
│       ├── Kegiatan.php
│       └── Absensi.php
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── AdminSeeder.php
│       └── AnggotaSeeder.php (data dummy)
├── resources/
│   └── js/              ← React components
│       ├── Pages/
│       │   ├── Auth/Login.jsx
│       │   ├── Admin/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Anggota/Index.jsx
│       │   │   ├── Kegiatan/Index.jsx
│       │   │   └── Kegiatan/Detail.jsx
│       │   └── User/
│       │       ├── Dashboard.jsx
│       │       └── Absen.jsx
│       └── Components/
│           ├── SignatureCanvas.jsx
│           ├── QRScanner.jsx
│           ├── Modal.jsx
│           └── Table.jsx
└── routes/
    └── web.php
```

\---

## 10\. Setup \& Instalasi (Ringkasan Dev)

```bash
# 1. Clone / buat project
composer create-project laravel/laravel rohis-absensi
cd rohis-absensi

# 2. Install package
composer require barryvdh/laravel-dompdf
composer require simplesoftwareio/simple-qrcode
npm install react react-dom @vitejs/plugin-react
npm install tailwindcss @tailwindcss/forms
npm install html5-qrcode react-signature-canvas

# 3. Konfigurasi .env
DB\_CONNECTION=mysql
DB\_HOST=127.0.0.1
DB\_PORT=3306
DB\_DATABASE=rohis\_absensi
DB\_USERNAME=root
DB\_PASSWORD=       # kosong untuk XAMPP default

# 4. Jalankan migrasi dan seeder
php artisan migrate
php artisan db:seed --class=AdminSeeder

# 5. Jalankan server
php artisan serve        # Terminal 1
npm run dev              # Terminal 2
```

\---

## 11\. Fitur Prioritas (MVP vs Nice-to-Have)

### MVP (Harus Ada)

* \[x] Login admin \& user
* \[x] CRUD anggota (admin)
* \[x] CRUD kegiatan (admin)
* \[x] Generate kode \& QR per kegiatan
* \[x] Absensi via kode manual (user)
* \[x] Tanda tangan digital saat absen
* \[x] Detail kegiatan + daftar hadir (admin)
* \[x] Export PDF daftar hadir
* \[x] Hapus entri absen (admin)

### Nice-to-Have (v2)

* \[ ] Scan QR via kamera (user)
* \[ ] Riwayat kehadiran pribadi (user)
* \[ ] Notifikasi/reminder kegiatan
* \[ ] Statistik kehadiran per anggota
* \[ ] Dark mode

\---

## 12\. Catatan Keamanan \& Edge Case

1. **Duplikasi absen:** Cek `UNIQUE(kegiatan\_id, nisn)` di DB. Tampilkan pesan "Kamu sudah melakukan absensi untuk kegiatan ini."
2. **Kode kedaluwarsa:** Kolom `is\_active` pada tabel `kegiatan`. Admin bisa menonaktifkan kegiatan yang sudah selesai sehingga kode tidak bisa digunakan lagi.
3. **Tanda tangan kosong:** Validasi di frontend sebelum submit — canvas tidak boleh kosong.
4. **Middleware role:** Halaman `/admin/\*` dilindungi middleware `IsAdmin`. User biasa yang mengakses akan di-redirect ke `/dashboard`.
5. **Kode absen unik:** Generate dengan `Str::upper(Str::random(6))` + cek keunikan di DB sebelum simpan.

\---

*Dokumen ini adalah patokan pengembangan Website Absensi ROHIS 7. Setiap perubahan fitur selama development sebaiknya dicatat sebagai revisi di bagian atas dokumen.*

