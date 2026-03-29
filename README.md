# RecapExpense - React.js Web App

Aplikasi pencatatan keuangan pribadi modern dengan React.js, Tailwind CSS, dan Firebase.

## Fitur
1. **Dashboard Khusus**: Pantau total pemasukan, pengeluaran, saldo berjalan, dan cek chart tren otomatis.
2. **Manajemen Transaksi**: Tambah catat transaksi, pilih jenis (Pemasukan/Pengeluaran).
3. **Upload Bukti Pembayaran**: Sertakan file JPG/PNG nota struk belanja di transaksi.
4. **Laporan & Charts**: Lihat statistik per Harian / Mingguan / Bulanan / Tahunan secara detail dan interaktif.
5. **Autentikasi Aman**: Login, register, forgot password, via platform Firebase Auth.

## Installation & Setup

Karena file project ini sudah memiliki package-package, kamu hanya perlu menjalankan instalasi modulenya. 
Pastikan kamu memiliki **Node.js**:
1. Buka CMD/Terminal lalu masuk ke folder directory project (misalnya disini: `c:\Akhdan\Project\RecapExpense`) 
2. Instal semua packages:
```bash
npm install
```

### Mengatur Konfigurasi Database Firebase (SANGAT PENTING!)
Didalam root project ini terdapat file bernama `.env`. Buka file tersebut lalu masukkan kredensial Firebase yang telah kamu setujui sebelumnya:
```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=yours.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yours
VITE_FIREBASE_STORAGE_BUCKET=yours.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...
VITE_FIREBASE_MEASUREMENT_ID=G-...
```

### Jalankan ke mode Lokal
Setalah selesai, jalankan menggunakan local server (Dev):
```bash
npm run dev
```
Klik URL Localhost dari terminal kamu. Selesai!

## Deployment (Hosting Firebase)
Jika kamu mau pasang aplikasi ini supaya bisa dilihat Internet publik (Production), jalankan ini:

1. Buat versi Build (Proses optimize code): 
```bash
npm run build
```
2. Pastikan sudah login di Firebase CLI (Jalankan `firebase login` jika belum).
3. Jalankan command `firebase init` pilih hosting, centang rules, atau pakai file `firebase.json` yang udah kubikin. 
4. Deploy ke Firebase:
```bash
firebase deploy --only hosting
```
--- 
_App built with care._
