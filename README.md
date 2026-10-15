# Gema Belajar — Pameran Siswa SMAS Kristen Harapan

> **Proyek Kokulikuler: Gema Belajar**  
> *"Belajar dari Penglipuran: Menjelajah, Meneliti, Berkarya, dan Berbagi"*  
> Website pameran galeri karya siswa SMAS Kristen Harapan (Bali), menampilkan proyek game berbasis AI dan poster karya setiap kelompok.

---

## 🎨 Ringkasan Implementasi Desain

Implementasi dibuat presisi berdasarkan draft Figma (`designs / design a`):
1. **Layar Pembuka (Intro Splash)**:
   - Menampilkan judul kurasi selama ~2 detik sesuai catatan desain Figma, lalu otomatis beralih ke indeks kelas (dapat langsung diklik untuk lewati).
2. **Indeks Kelas (Galeri Kelas)**:
   - Header editorial *"Ruang untuk setiap suara."*
   - Kartu kelas dengan pratinjau tumpukan 8 karya (*stacked artwork deck*) dan tombol panah buka galeri (`↗`).
   - Penghitung dinamis kelas dan total karya.
3. **Detail Karya Siswa**:
   - Header metadata format (`PNG`) dan nomor urut karya (`Karya 01 / 08`) diposisikan rapi di atas bingkai poster.
   - Tampilan poster beresolusi tinggi dengan mode perbesar (*lightbox*).
   - Navigasi karya sebelumnya & berikutnya dalam kelas.
   - Tombol **Suka** interaktif (tersimpan secara lokal & database).
   - **Diskusi Komentar Real-time (Live)** dengan dukungan balasan resmi pembuat (*creator badge*).
   - Tombol tautan eksternal game AI siswa (`Buka tautan karya XX ↗`).
4. **Panel Pengelola Terpisah (`/admin`)**:
   - Terisolasi penuh di rute terpisah (`/admin`) dan tidak dapat dilihat dari halaman publik.
   - Terlindungi kode sandi pengelola (default: `gema2026`).
   - **Kelola Kelas**: Tambah kelas baru atau hapus kelas yang sudah tidak digunakan.
   - **Kelola Karya & Game**: Tambah, edit, atau hapus detail proyek, kelompok, dan URL game.
   - **Kontrol Penuh Interaksi**:
     - Ubah jumlah suka/likes secara langsung untuk tiap karya.
     - Moderasi komentar: edit isi komentar, ubah nama pengirim, pasang/lepas tanda kreator, dan hapus komentar.
   - **Impor Massal Spreadsheet & Google Drive**: Salin dan tempel data dari Google Sheets / Excel, secara otomatis mengonversi tautan poster Google Drive menjadi gambar CDN yang langsung tampil.
   - Pengaturan Supabase & tombol reset data demo.

---

## ⚡ Ringan & Responsif

Dibangun menggunakan **Vite + React** dengan **Vanilla CSS murni** tanpa pustaka CSS berat:
- Ukuran bundel CSS terkompresi hanya **~3.4 kB**!
- Ukuran total aset sangat minim sehingga lancar diakses di semua perangkat ponsel, tablet, maupun laptop.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server lokal
npm run dev

# Buka http://localhost:5173 di browser Anda.
```

---

## 🔐 Akses & Fitur Panel Admin

Untuk menjaga kemurnian dan estetika pameran publik, panel pengelola diletakkan pada halaman rute tersendiri:

- **Alamat URL Admin**: Akses langsung ke [`http://localhost:5173/admin`](http://localhost:5173/admin) (atau `/#admin`).
- **Kata Sandi Default**: `gema2026` (dapat diubah melalui variabel `VITE_ADMIN_PASSCODE`).
- **Tampilan Publik Bersih**: Navigasi utama dan footer tidak menampilkan tombol maupun tautan admin.

### 📋 Cara Impor Data Spreadsheet & Google Drive
Ketika Anda menerima spreadsheet berisi daftar karya siswa:
1. Masuk ke halaman `/admin` &rarr; buka tab **"Impor Spreadsheet & Drive"**.
2. Salin baris data dari Google Sheets / Excel (format kolom: `Kelas | Judul | Pembuat | Link Drive Poster | Link Game | Deskripsi`).
3. Tempelkan ke kotak teks impor dan klik **"Proses & Simpan Semua Karya"**.
4. Sistem otomatis mendeteksi ID berkas dari tautan Google Drive dan mengubahnya menjadi format CDN langsung (`https://lh3.googleusercontent.com/d/...`), sekaligus otomatis mendaftarkan kelas yang belum ada.

---

## ☁️ Konfigurasi Supabase & Vercel

Aplikasi dirancang **langsung berjalan seketika** (dengan *Local Storage* + *BroadcastChannel* untuk sinkronisasi antar-tab). Ketika ingin menghubungkan ke Supabase di cloud:

### 1. Jalankan Skema Database di Supabase
Buka **Supabase Dashboard** &rarr; **SQL Editor** &rarr; salin dan jalankan seluruh isi berkas [`supabase/schema.sql`](file:///d:/work/gallery_events/supabase/schema.sql).

Skema ini membuat:
- Tabel `classes`
- Tabel `projects`
- Tabel `comments`
- Kebijakan keamanan RLS (*Row Level Security*)
- Publikasi Supabase Realtime untuk komentar langsung

### 2. Konfigurasi Variabel Lingkungan
Buat berkas `.env` (atau isi di pengaturan Environment Variables Vercel):
```env
VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=kunci-anon-anda
VITE_ADMIN_PASSCODE=gema2026
```

### 3. Deploy ke Vercel
1. Hubungkan repositori GitHub ini ke [Vercel](https://vercel.com/new).
2. Framework preset: **Vite**.
3. Masukkan variabel lingkungan di atas pada bagian **Environment Variables**.
4. Klik **Deploy**!
Berkas `vercel.json` sudah tersedia untuk menjamin rute SPA (termasuk `/admin`) berfungsi mulus tanpa galat 404.
