# Arsip Nota Digital — Buana Karya

Web app pengganti Google Form + Sheet. Fitur:
- Halaman **Input Nota** (form, mirip nota fisik)
- Halaman **Dashboard** (KPI, grafik tren bulanan, grafik status pembayaran, list nota dengan search & tap-to-toggle status Lunas/Belum Lunas)
- Password gate sederhana biar gak sembarang orang bisa akses link-nya

Stack: **Next.js 14 + Prisma + SQLite** (lokal) → **Postgres (Neon)** untuk production.

---

## 1. Jalankan di Antigravity IDE (lokal)

1. Extract folder project ini, buka foldernya di Antigravity IDE.
2. Buka terminal di dalam IDE, jalankan:
   ```bash
   npm install
   ```
3. Copy file environment:
   ```bash
   cp .env.example .env
   ```
   Buka `.env`, ganti `ADMIN_PASSWORD` dengan password sendiri.
4. Buat database SQLite lokal:
   ```bash
   npx prisma db push
   ```
5. Jalankan servernya:
   ```bash
   npm run dev
   ```
6. Buka `http://localhost:3000` di browser → akan diarahkan ke halaman login → masukkan password dari `.env`.

Kalau langkah-langkah ini dijalankan lewat AI agent di Antigravity, tinggal bilang: *"install dependencies, setup database, lalu jalankan npm run dev"* — agent-nya bisa eksekusi langsung.

---

## 2. Supaya Bisa Diakses Link Selamanya (Deploy)

SQLite di laptop cuma jalan pas laptop nyala. Biar ada **link permanen** yang bisa dibuka dari HP kapan saja, deploy ke hosting gratis:

### Langkah A — Buat database online gratis (Neon)
1. Buka [neon.tech](https://neon.tech) → daftar gratis pakai akun Google.
2. Buat project baru, kasih nama misal `nota-bk`.
3. Copy **connection string** yang diberikan (bentuknya `postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`).

### Langkah B — Ubah schema ke Postgres
Buka `prisma/schema.prisma`, ganti baris:
```prisma
provider = "sqlite"
```
jadi:
```prisma
provider = "postgresql"
```

### Langkah C — Push project ke GitHub
1. Buat repository baru di GitHub (gratis, boleh private).
2. Dari terminal di folder project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Arsip Nota BK"
   git branch -M main
   git remote add origin https://github.com/USERNAME/nota-digital-bk.git
   git push -u origin main
   ```

### Langkah D — Deploy ke Vercel (gratis, link permanen)
1. Buka [vercel.com](https://vercel.com) → daftar/login pakai akun GitHub.
2. Klik **"Add New Project"** → pilih repo `nota-digital-bk` yang barusan di-push.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` → paste connection string dari Neon (Langkah A)
   - `ADMIN_PASSWORD` → password admin pilihan lu
4. Klik **Deploy**. Tunggu 1-2 menit.
5. Selesai — Vercel kasih link permanen seperti `nota-digital-bk.vercel.app`. Ini yang dipakai admin & owner selamanya, gak akan mati selama Vercel & Neon masih aktif (keduanya gratis untuk skala UMKM seperti ini).
6. Setelah deploy pertama sukses, jalankan sekali migrasi tabel ke Neon dari laptop:
   ```bash
   npx prisma db push
   ```
   (pastikan `.env` lokal sudah diarahkan ke `DATABASE_URL` Neon saat menjalankan perintah ini)

### Langkah E — Tambah ke Homescreen HP
Buka link Vercel dari Chrome HP → titik tiga → **"Add to Home screen"** → jadi kayak aplikasi native.

---

## 3. Struktur Project

```
app/
  login/page.tsx        -> halaman login password
  input/page.tsx         -> form input nota
  dashboard/page.tsx     -> dashboard KPI + grafik + list
  dashboard/Chart.tsx    -> komponen grafik (recharts)
  dashboard/NotaList.tsx -> list nota + search + toggle status
  api/nota/route.ts      -> API create & list nota
  api/nota/[id]/route.ts -> API update/hapus nota
  api/login/route.ts     -> API cek password
middleware.ts             -> proteksi semua halaman pakai password
prisma/schema.prisma      -> struktur tabel database
```

## 4. Rekomendasi Pengembangan Lanjutan
- **Upload foto nota beneran** (bukan link teks): tambah [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) atau Cloudinary — gratis untuk skala kecil.
- **Multi-user dengan role** (admin vs owner, akses beda): tambah tabel `User` + auth library seperti NextAuth/Clerk (Clerk juga yang lu pakai di Finora).
- **Notifikasi WhatsApp otomatis** tiap nota baru masuk: pakai Fonnte/WhatsApp Business API.
- **Export laporan PDF/Excel** bulanan otomatis dari data di dashboard.
- **Nomor nota otomatis increment** biar admin gak perlu isi manual.
