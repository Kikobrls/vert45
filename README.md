# HRIS (Human Resource Information System)

Aplikasi HRIS komprehensif yang dibangun menggunakan **Next.js (App Router)** dan **MySQL**. Fitur utama meliputi:
- Sistem Absensi berbasis Geolokasi (Mobile Only).
- Autentikasi Multi-Role (Admin, Atasan, User).
- Manajemen Cuti & Lembur dengan sistem Persetujuan (Approval).
- Generator Slip Gaji Otomatis (Format PDF).

## Prasyarat (Tools yang perlu diinstall)

Sebelum menjalankan aplikasi ini di laptop/komputer Anda, pastikan Anda telah menginstal 2 hal berikut:

1. **Node.js** (Versi 18.x atau lebih baru)
   - Download di: [https://nodejs.org/](https://nodejs.org/)
   - Cek instalasi: Buka Terminal / CMD dan ketik `node -v` dan `npm -v`.

2. **MySQL Server** (MAMP / XAMPP / MySQL Workbench)
   - Cara termudah: Install [XAMPP](https://www.apachefriends.org/index.html) dan jalankan modul **MySQL**.

## Cara Menjalankan Project

### 1. Kloning & Install Dependencies
Buka terminal (CMD / Git Bash / PowerShell) di folder yang Anda inginkan, lalu jalankan:

```bash
git clone https://github.com/Kikobrls/vert45.git
cd vert45
npm install
```

### 2. Siapkan Database
- Buka aplikasi XAMPP Anda, klik tombol **Start** pada **MySQL**.
- Buka browser dan akses phpMyAdmin di `http://localhost/phpmyadmin`.
- Buat sebuah database baru dengan nama `attendance_db` (atau nama lain yang Anda atur di `.env`).

### 3. Konfigurasi Environment Variables (.env)
Buat sebuah file baru bernama `.env.local` atau `.env` di folder paling luar (root) project, sejajar dengan file `package.json`. Isi file tersebut dengan konfigurasi database Anda:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=attendance_db
JWT_SECRET=rahasia-hris-2026-sangat-aman
```
*(Ganti MYSQL_PASSWORD jika database lokal Anda memakai password. Default XAMPP adalah kosong).*

### 4. Jalankan Aplikasi
Jalankan perintah ini di terminal untuk memulai server (mode development):

```bash
npm run dev
```

### 5. Akses Aplikasi
- Buka browser dan pergi ke: `http://localhost:3000`
- Saat Anda (atau siapapun) mencoba Login untuk **pertama kali**, script di dalam project akan **otomatis membuat semua struktur tabel database** (users, attendance, leave_requests, overtime, dll) dan membuat **1 akun Admin bawaan**.

**Login Admin Default:**
- Email: `admin@hris.com`
- Password: `admin123`

## Struktur Role
- **Admin**: Mengakses panel `/admin` untuk mengatur Konfigurasi Sistem (Lokasi GPS Kantor Latitude & Longitude, Radius Valid Absen, dan Jam Kerja) serta men-generate *Payroll*.
- **Atasan**: Mengakses panel `/atasan` untuk melihat daftar pengajuan cuti & lembur karyawan dan melakukan *Approve / Reject* dengan catatan manager.
- **User (Karyawan)**: Mengakses panel utama (`/dashboard`) untuk melakukan presensi lokasi real-time, mengajukan cuti, dan men-download Slip Gaji PDF.

**(Catatan Penting):** Sesuai dengan permintaan Anda, fitur absensi *hanya* dapat dilakukan menggunakan perangkat seluler (Smartphone/Tablet). Jika Anda membuka halaman web melalui Laptop/Desktop, Anda akan diblokir dengan pesan "Akses Ditolak". Untuk mensimulasikan layar HP di Laptop saat masa Development, klik kanan di Google Chrome -> Inspect Element -> Klik logo *Device Toolbar* (Toggle Device) menjadi ukuran iPhone/Android, lalu Refresh browser.