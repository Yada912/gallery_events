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
   - Terlindungi kode sandi pengelola rahasia (dikonfigurasi via `VITE_ADMIN_PASSCODE`).
   - **Kelola Kelas**: Tambah kelas baru atau hapus kelas yang sudah tidak digunakan.
   - **Kelola Karya & Game**: Tambah, edit, atau hapus detail proyek, kelompok, dan URL game.
   - **Generator Kunci Akses Siswa (Single-Use Keys)**: Hasilkan 10 kunci 6-digit acak sekali pakai dengan 1 klik untuk diberikan ke siswa jika perlu mengedit saat acara live.
   - **Kontrol Penuh Interaksi**:
     - Ubah jumlah suka/likes secara langsung untuk tiap karya.
     - Moderasi komentar: edit isi komentar, ubah nama pengirim, pasang/lepas tanda kreator, dan hapus komentar.
   - **Impor Massal Spreadsheet & Google Drive**: Salin dan tempel data dari Google Sheets / Excel, secara otomatis mengonversi tautan poster Google Drive menjadi gambar CDN yang langsung tampil.
   - **Bersihkan Data Demo**: Hapus data mock/demo dengan 1 klik untuk mengosongkan database galeri.
5. **Portal Mandiri Siswa (`/edit` atau Tombol "Input / Edit Karya")**:
   - Khusus untuk kelompok siswa yang ingin mengunggah atau menyesuaikan poster dan tautan game mereka saat acara pameran berlangsung.
   - Terlindungi sistem **Kunci Akses 6-Digit Sekali Pakai** yang dibagikan oleh panitia/administrator.
   - Setelah kunci terverifikasi, siswa dapat mengubah judul, nama kelompok, poster (mendukung Google Drive otomatis), tautan game, dan deskripsi.
   - **Keamanan terjamin**: Siswa tidak memiliki izin untuk mengubah likes, memoderasi komentar, maupun menghapus proyek.

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
- **Kata Sandi Admin**: Dikonfigurasi secara aman melalui variabel lingkungan `VITE_ADMIN_PASSCODE` di berkas `.env` atau pengaturan Vercel.
- **Tampilan Publik Bersih**: Navigasi utama dan footer tidak menampilkan tombol maupun tautan admin.

### 🔑 Sistem Kunci Akses Kelompok & Kurasi Siswa (Single-Use Group Tokens)
Setiap kelompok memiliki **1 token 6-digit unik** dan **hanya 1 kesempatan** untuk menginput karya mereka:
1. Buka panel admin di `/admin` &rarr; tab **"Kunci Akses Siswa"**.
2. **Pilihan Pembuatan Token**:
   - **⚡ 1-Klik Buat Token Semua Kelas**: Otomatis menghasilkan 10 token untuk masing-masing kelas (Kelompok 1 s.d. 10 x seluruh kelas = ~70 token).
   - **+ Tambah Satu Kelompok**: Pilih kelas dan masukkan nama kelompok spesifik (misal: *Kelompok 3 - Tim Wayan*).
   - **📋 Daftarkan Banyak Kelompok**: Paste daftar nama kelompok dari catatan/spreadsheet baris per baris.
   - **🔑 Kunci Standalone / Bebas (Susulan / Darurat)**: Menghasilkan kunci darurat/bebas yang tidak terikat ke kelompok tertentu. Siswa pemegang kunci ini dapat memilih kelas mereka sendiri, serta memilih untuk menambah karya baru (susulan) atau memperbaiki karya yang ada jika ada perubahan yang terlewat.
3. **Fitur Salin Cepat Admin**:
   - **"Salin Semua Token untuk Pengumuman Grup"**: Menghasilkan pesan berformat WhatsApp/Telegram yang rapi, dikelompokkan per kelas dengan tautan portal dan token masing-masing kelompok, siap dibagikan ke grup publik peserta.
   - **"Salin Daftar Kunci Saja (List)"**: Menghasilkan daftar tabular (`Kunci \t Kelas \t Kelompok \t Status`) siap ditempel ke Google Sheets/Excel.
4. **Alur Siswa di Portal Mandiri (`/edit`)**:
   - Siswa memasukkan 6-digit token kelompok mereka.
   - Sistem memverifikasi token dan **secara otomatis mengarahkan siswa ke formulir kelas dan kelompoknya** (tanpa perlu mencari/memilih manual).
   - Siswa mengisi: Judul Karya, Nama Anggota, Poster (bisa unggah berkas langsung dengan **kompresi otomatis WebP** ~150KB agar hemat kuota atau via link Google Drive), Link Game AI (opsional), dan Deskripsi (opsional).
   - Nomor urut karya (*01, 02, dst.*) dan format media ditentukan secara otomatis oleh sistem.
   - Begitu karya disimpan, token kelompok langsung **hangus permanen (1 kali kesempatan)** untuk mencegah manipulasi berulang.

### 📋 Cara Impor Data Spreadsheet & Google Drive
Ketika Anda menerima spreadsheet berisi daftar karya siswa:
1. Masuk ke halaman `/admin` &rarr; buka tab **"Impor Spreadsheet & Drive"**.
2. Salin baris data dari Google Sheets / Excel (format kolom: `Kelas | Judul | Pembuat | Link Drive Poster | Link Game | Deskripsi`).
3. Tempelkan ke kotak teks impor dan klik **"Proses & Simpan Semua Karya"**.
4. Sistem otomatis mendeteksi ID berkas dari tautan Google Drive dan mengubahnya menjadi format CDN langsung (`https://lh3.googleusercontent.com/d/...`), sekaligus otomatis mendaftarkan kelas yang belum ada.

---

## ☁️ Konfigurasi Supabase & Vercel

Aplikasi terhubung langsung ke database Supabase PostgreSQL:

### 1. Jalankan Skema Database di Supabase
Buka **Supabase Dashboard** &rarr; **SQL Editor** &rarr; salin dan jalankan seluruh isi berkas [`supabase/schema.sql`](file:///d:/work/gallery_events/supabase/schema.sql).

Skema ini membuat:
- Tabel `classes`
- Tabel `projects`
- Tabel `comments`
- Tabel `access_keys` (untuk kunci sekali pakai siswa)
- Kebijakan keamanan RLS (*Row Level Security*)
- Publikasi Supabase Realtime untuk komentar langsung

### 2. Konfigurasi Variabel Lingkungan
Buat berkas `.env` (atau isi di pengaturan Environment Variables Vercel):
```env
VITE_SUPABASE_URL=https://tcdijrqpfllpmqzyfmat.supabase.co
VITE_SUPABASE_ANON_KEY=kunci-anon-anda
VITE_ADMIN_PASSCODE=kata_sandi_rahasia_anda
```

### 3. Deploy ke Vercel
1. Hubungkan repositori GitHub ini ke [Vercel](https://vercel.com/new).
2. Framework preset: **Vite**.
3. Masukkan variabel lingkungan di atas pada bagian **Environment Variables**.
4. Klik **Deploy**!
Berkas `vercel.json` sudah tersedia untuk menjamin rute SPA (termasuk `/admin` dan `/edit`) berfungsi mulus tanpa galat 404.
