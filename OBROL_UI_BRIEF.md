# OBROL_UI_BRIEF: Obrol (prototipe UI)

Prototipe UI aplikasi chat ala WhatsApp (DM, grup, gambar, status baca) dengan tata letak gaya Discord.
Ini **frontend saja**: semua data adalah data contoh (mock) dan semua interaksi lawan bicara disimulasikan di browser.
Kamu membangunnya sendiri dari awal sampai online di GitHub Pages, dalam satu kali jalan.

---

## 0. Cara kerja (baca paling awal)

1. Kamu bekerja sendiri sampai selesai. Pemilik proyek TIDAK akan menjawab pertanyaan selama sesi ini. Jangan memakai AskUserQuestion dan jangan berhenti untuk meminta konfirmasi.
2. Jika ada yang ambigu, pilih opsi paling sederhana yang tetap memenuhi brief ini, catat di `DECISIONS.md` (tanggal, keputusan, alasan), lalu lanjut.
3. File ini adalah sumber kebenaran. Jika bertentangan dengan kebiasaanmu atau isi template, ikuti file ini.
4. Di awal, buat `PROGRESS.md` berisi checklist milestone M0 sampai M8 (bagian 9). Centang sebuah milestone hanya setelah gate-nya lolos.
5. Jika sesi terputus, konteks diringkas, atau kamu ragu sedang di mana: baca `PROGRESS.md` dan `DECISIONS.md` lebih dulu, lalu lanjutkan dari milestone pertama yang belum tercentang.
6. Setiap milestone diakhiri gate verifikasi, lalu `git commit` dan `git push` ke branch kerja sesi ini. Pekerjaan yang belum di-push dianggap belum ada.
7. Lingkungan: sesi cloud Claude Code (Ubuntu) yang sudah meng-clone repo GitHub ini. Awalnya repo berisi `README.md`, `.gitignore`, dan file ini.
8. Jangan pernah menyatakan sesuatu berhasil tanpa benar-benar menjalankan verifikasinya.

---

## 1. Lingkup

**Termasuk**
- Semua layar dan interaksi aplikasi chat, berjalan penuh di browser.
- Data contoh: 1 pengguna (kamu), 12 kontak, 3 grup, riwayat pesan yang realistis dalam Bahasa Indonesia.
- Mesin simulasi: lawan bicara membalas, mengetik, membaca pesan, dan online/offline secara otomatis.
- Data tersimpan di `localStorage` agar bertahan setelah refresh, dengan tombol "Reset demo".
- Deploy otomatis ke GitHub Pages lewat GitHub Actions.

**Tidak termasuk (dilarang dibuat)**
- Backend, server, API route, database, Supabase, Firebase, atau layanan pihak ketiga apa pun.
- Login sungguhan, pengiriman email, atau penyimpanan di cloud.
- Request jaringan saat aplikasi berjalan (runtime). Font dan aset harus dibundel lewat npm, bukan dari CDN.

---

## 2. Aturan keras (tidak boleh dilanggar)

1. **Tanpa backend.** Tidak boleh ada `fetch`, WebSocket, atau SDK layanan eksternal di kode aplikasi. Tidak ada environment variable rahasia.
2. **Merek.** Jangan memakai nama, logo, maskot, atau warna merek Discord (blurple `#5865F2` dan variasinya) maupun WhatsApp (`#25D366`, `#00A884`). Tata letak boleh mirip Discord; identitas visual harus milik Obrol.
3. **Git.** Push hanya ke branch kerja sesi ini. Jangan push ke `main`, jangan force push, jangan menghapus branch, jangan mengubah remote. Di akhir, buat satu Pull Request ke `main`.
4. Setelah dipasang di M0, jangan mengubah isi `.claude/skills/`.
5. Tambahkan dependency hanya yang tercantum di bagian 3 atau yang benar-benar perlu; catat setiap tambahan di `DECISIONS.md`.
6. Jangan memakai `// @ts-ignore`, `any` massal, atau `eslint-disable` massal untuk meloloskan gate. Jangan menghapus atau melemahkan tes agar lolos.

---

## 3. Stack (tetap, jangan diganti)

- Vite + React + TypeScript `strict`.
- Tailwind CSS + shadcn/ui + `lucide-react`.
- `react-router` dengan **HashRouter** (agar refresh halaman di GitHub Pages tidak 404).
- `zustand` (state + middleware `persist` ke `localStorage`).
- `date-fns` dengan locale `id` (format waktu).
- Font lewat paket `@fontsource` (dibundel, tanpa CDN). Jika design system tidak menyarankan font, pakai Inter.
- Tes: `vitest`.
- Seluruh teks UI dalam Bahasa Indonesia.

---

## 4. Model data (TypeScript)

Definisikan di `src/types.ts`:

- `User`: `id`, `displayName` (1 sampai 32 karakter), `email`, `bio` (maks 190), `avatarUrl` (opsional; jika kosong tampilkan inisial), `lastSeenAt`.
- `Conversation`: `id`, `type` (`direct` | `group`), `name` (hanya grup), `avatarUrl` (opsional), `createdBy`, `lastMessageAt`.
- `Member`: `conversationId`, `userId`, `role` (`admin` | `member`), `lastReadAt`.
- `Message`: `id`, `conversationId`, `senderId`, `body` (maks 2000), `imageDataUrl` (opsional), `createdAt`, `status` (`sending` | `sent` | `failed`; status "dibaca" dihitung, bukan disimpan).

Aturan turunan (fungsi murni di `src/lib/`, wajib dites):
- **Dibaca:** pesan dianggap dibaca jika `lastReadAt` semua anggota lain lebih baru atau sama dengan `createdAt` pesan.
- **Belum dibaca:** jumlah pesan dari orang lain dengan `createdAt > lastReadAt` milik pengguna.
- **DM unik:** satu pasangan pengguna hanya punya satu percakapan `direct`.
- **Pengelompokan:** pesan beruntun dari pengirim yang sama dalam 5 menit ditampilkan sebagai satu kelompok.

---

## 5. Mesin simulasi (`src/sim/`)

- Semua fungsi simulasi menerima sumber acak dan jam yang bisa disuntikkan (injectable), agar bisa dites secara deterministik.
- **Balasan otomatis:** setelah pengguna mengirim pesan di DM, kontak "membaca" dalam 1 sampai 4 detik (jika online), lalu menampilkan "sedang mengetik" 1 sampai 3 detik, lalu membalas dengan kalimat acak dari daftar balasan santai berbahasa Indonesia (minimal 30 variasi). Di grup, 1 sampai 2 anggota acak yang membalas.
- **Status online:** setiap 30 sampai 90 detik, status online beberapa kontak berubah acak. Kontak offline tidak membaca pesan sampai online lagi.
- **Pesan masuk acak:** setiap 25 sampai 60 detik, satu pesan masuk ke percakapan yang sedang TIDAK dibuka, sehingga badge belum dibaca bertambah.
- **Pengaturan simulasi** (di halaman Pengaturan): saklar "Simulasi aktif" (default nyala), saklar "Simulasi gagal kirim" (default mati; jika nyala, 20% pesan berstatus gagal), dan tombol "Reset demo" (hapus `localStorage`, muat ulang data contoh).
- Semua timer dibersihkan saat komponen dilepas atau simulasi dimatikan; tidak boleh ada timer bocor.

---

## 6. Fitur (semua wajib)

**F-01 Login demo**
- `/login`: input email, tombol "Kirim kode", lalu 6 kotak kode (auto-pindah fokus, bisa paste 6 digit). Kode 6 digit apa pun diterima. Tampilkan catatan kecil "Mode demo: masukkan 6 digit apa saja".
- Login pertama mengarah ke `/onboarding` (isi nama dan avatar opsional). Semua layar lain wajib "login" (redirect ke `/login`).
- Logout dari panel pengguna (data percakapan tetap tersimpan).

**F-02 Profil**
- Ubah nama (1 sampai 32 karakter), bio (maks 190), avatar (JPG/PNG/WebP, diperkecil ke maks 256 px sebelum disimpan).

**F-03 Mulai DM**
- Kolom cari menemukan kontak berdasarkan nama atau email. Klik hasil membuka DM yang sudah ada atau membuat yang baru (tanpa duplikat).

**F-04 Daftar percakapan**
- Urut dari pesan terbaru. Tiap item: avatar dengan titik online, nama, preview pesan terakhir ("Gambar" jika hanya gambar), waktu relatif, badge belum dibaca ("99+" jika lebih dari 99).

**F-05 Kirim pesan teks**
- Maks 2000 karakter dengan penghitung saat mendekati batas. Enter = kirim, Shift+Enter = baris baru. Trim; tolak pesan kosong.
- Pesan langsung tampil dengan status "sedang dikirim", berubah menjadi "terkirim" setelah 300 sampai 800 ms. Pesan gagal menampilkan ikon gagal dan tombol "Kirim ulang".
- Auto-scroll ke bawah hanya jika pengguna sudah di dekat bawah; jika tidak, tampilkan tombol "Pesan baru".

**F-06 Status terkirim dan dibaca**
- Pesan milik sendiri menampilkan ikon kecil di samping waktu: jam (sedang dikirim), 1 centang (terkirim), 2 centang warna aksen (dibaca semua anggota lain).
- Membuka percakapan menandai pesan di dalamnya sebagai sudah dibaca oleh pengguna.

**F-07 Mengetik dan online**
- Indikator "Nama sedang mengetik..." di bawah input dari simulasi.
- Titik hijau di avatar untuk kontak online; jika offline tampilkan "Terakhir aktif {waktu relatif}".

**F-08 Grup**
- Buat grup (nama 1 sampai 50 karakter, avatar opsional) dengan 2 sampai 19 kontak (total maks 20). Pembuat menjadi admin.
- Admin dapat menambah dan mengeluarkan anggota. Setiap anggota dapat keluar sendiri.

**F-09 Gambar**
- Tombol "+" di input. JPG/PNG/WebP/GIF, maks 5 MB. Preview sebelum kirim.
- Gambar diperkecil ke maks 1280 px di sisi terpanjang (canvas) lalu disimpan sebagai data URL. Jika penyimpanan `localStorage` penuh, gambar tetap tampil di sesi ini dan muncul toast "Gambar tidak tersimpan setelah refresh".
- Klik gambar membuka lightbox. Pesan boleh berisi teks saja, gambar saja, atau keduanya.

**F-10 Tema**
- Dark mode default. Light mode bisa dipilih di Pengaturan; pilihan tersimpan; tidak ada kedipan tema saat halaman dimuat.

---

## 7. Desain: tata letak gaya Discord, identitas Obrol

**Langkah**
1. Jalankan skill ui-ux-pro-max (pakai `python3`; jika gagal, `python`):
   - `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "dark community chat app discord-style messaging" --design-system --persist -p "Obrol"`
   - Ulangi dengan `--page "chat"` dan `--page "login"` untuk override halaman.
   - Jalankan `search.py --help`, lalu ambil pedoman stack yang paling cocok untuk React dan shadcn/ui dengan `--stack <slug>`.
2. Gabungkan hasilnya dengan batasan wajib di bawah. Jika rekomendasi skill bertentangan dengan batasan ini, batasan ini yang menang; catat di `DECISIONS.md`.
3. Semua warna menjadi CSS variables (token shadcn) untuk dark dan light. Komponen tidak boleh berisi kode hex langsung.
4. Sebelum membangun halaman apa pun, baca `design-system/obrol/MASTER.md` dan override di `design-system/obrol/pages/` jika ada.

**Tata letak wajib**
- Desktop (1024 px ke atas), 4 kolom:
  1. **Rail** 72 px di paling kiri, warna paling gelap: tombol Beranda (DM) di atas, garis pemisah, ikon grup bulat 48 px (inisial jika tanpa avatar) yang berubah menjadi kotak membulat saat hover atau aktif, pill indikator di sisi kiri untuk yang aktif, titik kecil untuk yang punya pesan belum dibaca, tombol "+" (buat grup) di bawah daftar, tooltip nama grup saat hover.
  2. **Sidebar** 240 px: saat Beranda, kolom cari "Cari atau mulai obrolan" + daftar DM. Saat grup dipilih, header nama grup (menu: tambah anggota, keluar grup) + satu kanal "# obrolan". Di dasar sidebar: panel pengguna (avatar + titik status, nama, tombol pengaturan).
  3. **Area chat**: header (ikon `@` untuk DM atau `#` untuk grup, nama, status), daftar pesan, input di bawah.
  4. **Daftar anggota** 240 px di kanan, hanya untuk grup, dikelompokkan "Online - n" dan "Offline - n"; bisa disembunyikan lewat tombol di header; otomatis tersembunyi di bawah 1280 px.
- Tablet (768 sampai 1023 px): rail + sidebar + chat; daftar anggota menjadi drawer.
- Mobile (di bawah 768 px): layar 1 = rail + sidebar; layar 2 = chat layar penuh dengan tombol kembali; daftar anggota menjadi drawer.

**Gaya pesan (bukan bubble)**
- Baris rata kiri: avatar 40 px, nama tebal + waktu kecil abu-abu, lalu isi pesan.
- Pesan beruntun dari pengirim yang sama dalam 5 menit digabung tanpa avatar dan nama; waktunya muncul saat hover.
- Latar baris sedikit berubah saat hover; action bar kecil di kanan atas saat hover (salin teks).
- Pemisah tanggal di tengah, contoh "Kamis, 15 Oktober 2026".
- Garis "Pesan baru" berwarna merah di posisi pesan belum dibaca pertama saat percakapan dibuka.
- Input: kotak membulat selebar area chat, tombol "+" di kiri untuk lampiran, placeholder "Kirim pesan ke @Nama" atau "Kirim pesan ke #obrolan".

**Palet**
- Dark-first, 3 sampai 4 lapis abu netral (rail paling gelap, lalu sidebar, lalu chat lebih terang). Satu warna aksen yang bukan blurple dan bukan hijau WhatsApp.
- Pakai palet ini jika skill tidak menghasilkan palet yang memenuhi batasan di atas:

| Token | Dark | Light |
| --- | --- | --- |
| rail | #1A1B1E | #E6E7EA |
| sidebar | #222327 | #F0F1F3 |
| chat (background) | #2B2C31 | #FFFFFF |
| input / elevated | #35363C | #F4F4F6 |
| border | #3F4047 | #DCDDE1 |
| text | #E8E8EB | #18191C |
| muted text | #A3A4AB | #5C5E66 |
| accent | #F5A524 (teks di atasnya #1A1B1E) | #A15C00 (teks di atasnya #FFFFFF) |
| danger | #EF4444 | #DC2626 |
| online | #22C55E | #16A34A |

**Aksesibilitas dan kualitas**
- Ikon hanya dari `lucide-react`; tidak ada emoji sebagai ikon.
- Kontras teks minimal 4.5:1 di kedua tema; fokus keyboard terlihat; setiap tombol ikon punya `aria-label`; `prefers-reduced-motion` dihormati; target sentuh minimal 40 px di mobile; `cursor-pointer` pada semua elemen yang bisa diklik.
- Teks panjang (nama, email, URL) tidak boleh merusak tata letak di 375 px.

---

## 8. Deploy ke GitHub Pages

- Tentukan nama repo dari `git remote get-url origin`, lalu set `base: '/<nama-repo>/'` di `vite.config.ts`.
- Buat `.github/workflows/deploy.yml`: jalan saat push ke `main` dan bisa dipicu manual (`workflow_dispatch`); permission `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`; langkah `actions/checkout`, `actions/setup-node` (Node LTS, cache npm), `npm ci`, `npm test`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` (folder `dist`), `actions/deploy-pages`.
- Workflow ini baru berjalan setelah Pull Request di-merge ke `main` oleh pemilik. Pastikan `npm run build` dan `npm run preview` berjalan benar di sesi ini.

---

## 9. Urutan kerja: milestone dan gate

Gate dasar untuk SETIAP milestone sejak M1: `npx tsc --noEmit`, `npm run lint`, `npm test`, dan `npm run build` lulus tanpa error. Lalu centang di `PROGRESS.md`, `git commit -m "feat(mX): ..."`, dan `git push`.

- **M0 Persiapan.** Cek versi Node (minimal 20), git, dan Python 3. Pasang skill dengan `npx ui-ux-pro-max-cli init --ai claude` (jika gagal, catat `BLOCKED` untuk langkah skill di M2, pakai palet bagian 7, dan lanjut). Buat `PROGRESS.md` dan `DECISIONS.md`. Commit dan push.
- **M1 Scaffold.** Buat proyek Vite React TypeScript di root repo (scaffold di folder sementara lalu pindahkan; jangan menimpa `README.md`, `.claude/`, `PROGRESS.md`, `DECISIONS.md`, dan file ini). Pasang dependency bagian 3, siapkan Tailwind dan shadcn/ui (mode non-interaktif), HashRouter, Vitest, `base` di `vite.config.ts`, dan workflow bagian 8.
- **M2 Design system.** Jalankan langkah bagian 7, simpan `MASTER.md` dan override, terapkan token dan font.
- **M3 Data dan simulasi.** Tipe (bagian 4), data contoh, store `zustand` dengan `persist`, mesin simulasi (bagian 5). Gate tambahan: tes unit untuk keempat aturan turunan di bagian 4 dan untuk balasan otomatis (dengan jam dan acak yang disuntikkan).
- **M4 Login, onboarding, profil, tema, pengaturan** (F-01, F-02, F-10, pengaturan simulasi).
- **M5 Shell tata letak Discord, daftar percakapan, DM** (F-03, F-04).
- **M6 Ruang chat** (F-05, F-06, F-07).
- **M7 Grup dan gambar** (F-08, F-09). Gate tambahan: tes unit untuk aturan jumlah anggota grup dan hak admin.
- **M8 Poles dan audit.** Jalankan checklist pre-delivery ui-ux-pro-max di semua layar dan perbaiki temuannya; audit responsif di 375, 768, 1024, 1440 px dengan membaca kode tiap breakpoint; pastikan tidak ada request jaringan di kode aplikasi (cari `fetch(`, `WebSocket`, `http://`, `https://` di `src/`); hapus `console.log`; tulis `README.md`; buat Pull Request ke `main`.

---

## 10. Definition of Done

- Semua milestone tercentang di `PROGRESS.md`, atau ditandai `BLOCKED` dengan alasan dan langkah manual yang persis.
- `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` lulus.
- Semua sudah di-push, dan satu Pull Request ke `main` sudah dibuat berisi ringkasan fitur, hasil gate, dan tautan GitHub Pages yang akan aktif setelah merge (`https://<username>.github.io/<nama-repo>/`).
- `README.md` dalam Bahasa Indonesia berisi: deskripsi singkat (sebutkan bahwa ini prototipe UI dengan data simulasi), cara menjalankan lokal (`npm install`, `npm run dev`), daftar fitur F-01 sampai F-10 beserta cara mencobanya, struktur folder, dan cara kerja deploy GitHub Pages.
- Laporan akhir di chat: fitur yang selesai, hasil setiap gate, keputusan penting dari `DECISIONS.md`, hal yang `BLOCKED`, dan langkah yang harus dilakukan pemilik (review dan merge Pull Request).

---

## 11. Jika menemui kegagalan

- Baca pesan error lengkap dan perbaiki akar masalahnya, bukan gejalanya.
- Maksimal 3 pendekatan berbeda untuk satu masalah. Setelah itu tandai `BLOCKED` di `PROGRESS.md`, jelaskan apa yang sudah dicoba, lalu lanjut ke pekerjaan yang tidak bergantung padanya.
- Jika kamu harus berhenti karena batas penggunaan atau konteks, pastikan milestone terakhir yang lolos sudah di-commit dan di-push, dan `PROGRESS.md` mutakhir, sehingga sesi berikutnya bisa melanjutkan.
