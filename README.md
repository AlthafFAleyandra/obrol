# Obrol

Prototipe UI aplikasi chat ala WhatsApp (pesan langsung, grup, gambar, status baca) dengan tata letak gaya Discord.

> **Ini prototipe UI.** Tidak ada backend, API, atau database. Semua data adalah data contoh (12 kontak, 3 grup) dan semua interaksi lawan bicara (membalas, mengetik, membaca, online/offline) disimulasikan di browser. Data tersimpan di `localStorage`.

Setelah Pull Request di-merge ke `main`, aplikasi tersedia di: https://althaffaleyandra.github.io/obrol/

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:5173/obrol/
```

Perintah lain:

```bash
npm test           # tes unit (vitest)
npm run typecheck  # tsc -b (TypeScript strict)
npm run lint       # oxlint
npm run build      # build produksi ke dist/
npm run preview    # jalankan hasil build (http://localhost:4173/obrol/)
```

Butuh Node 20 atau lebih baru.

## Fitur dan cara mencobanya

| Kode | Fitur | Cara mencoba |
| --- | --- | --- |
| F-01 | Login demo | Buka `/login`, isi email, "Kirim kode", lalu ketik atau tempel 6 digit apa saja. Login pertama masuk ke onboarding. Keluar lewat ikon di panel pengguna (kiri bawah). |
| F-02 | Profil | Pengaturan (ikon gerigi) > Profil: ubah nama (1-32), bio (maks 190), foto (JPG/PNG/WebP, diperkecil ke 256 px). |
| F-03 | Mulai DM | Ketik nama atau email di kolom "Cari atau mulai obrolan" (mis. "Maya", yang belum punya DM), klik hasilnya. DM yang sama tidak pernah dibuat dua kali. |
| F-04 | Daftar percakapan | Urut dari pesan terbaru, titik online, preview ("Gambar" jika hanya gambar), waktu relatif, badge belum dibaca ("99+"). |
| F-05 | Kirim pesan teks | Enter kirim, Shift+Enter baris baru, penghitung muncul mendekati 2000 karakter. Aktifkan "Simulasi gagal kirim" di Pengaturan untuk mencoba "Kirim ulang". Tombol "Pesan baru" muncul jika kamu sedang scroll ke atas. |
| F-06 | Terkirim dan dibaca | Ikon di samping waktu: jam (mengirim), satu centang (terkirim), dua centang beraksen (dibaca semua anggota lain). Membuka obrolan menandai pesan sebagai dibaca; garis merah "Pesan baru" menandai pesan belum dibaca pertama. |
| F-07 | Mengetik dan online | Kirim pesan ke kontak online: ia membaca, "sedang mengetik...", lalu membalas. Kontak offline menampilkan "Terakhir aktif ..." dan tidak membaca sampai online lagi. |
| F-08 | Grup | Tombol "+" di rail kiri. Admin bisa menambah/mengeluarkan anggota (menu nama grup, dan ikon di daftar anggota). Semua anggota bisa keluar grup. |
| F-09 | Gambar | Tombol "+" di kotak pesan: JPG/PNG/WebP/GIF maks 5 MB, pratinjau sebelum kirim, diperkecil ke maks 1280 px, klik gambar untuk lightbox. |
| F-10 | Tema | Pengaturan > Tampilan. Gelap default, terang opsional, tersimpan, tanpa kedipan saat dimuat. |

Simulasi (Pengaturan > Simulasi): saklar "Simulasi aktif", saklar "Simulasi gagal kirim" (20% pesan gagal), dan tombol "Reset demo" untuk mengembalikan data contoh.

## Struktur folder

```
src/
  types.ts            model data (User, Conversation, Member, Message) dan batas
  data/seed.ts        data contoh (kontak, DM, grup, riwayat pesan)
  store/              store zustand + persist ke localStorage
  sim/                mesin simulasi (balasan, presence, pesan masuk, pengiriman)
  lib/                fungsi murni: aturan dibaca/belum dibaca, DM unik, pengelompokan,
                      aturan grup, waktu, gambar (semuanya bertes)
  hooks/              hook UI (tema, simulasi, media query, belum dibaca)
  components/
    shell/            rail, sidebar, daftar percakapan, panel pengguna, menu grup
    chat/             header, daftar pesan, baris pesan, kotak pesan, daftar anggota
    groups/           dialog buat grup dan tambah anggota
    ui/               komponen gaya shadcn/ui (radix-ui + Tailwind)
  pages/              Login, Onboarding, Beranda, Chat, Pengaturan
design-system/obrol/  hasil skill ui-ux-pro-max (MASTER.md dan override halaman)
OBROL_UI_BRIEF.md     brief proyek
PROGRESS.md           checklist milestone
DECISIONS.md          keputusan desain dan teknis
```

Stack: Vite, React, TypeScript strict, Tailwind CSS v4, komponen gaya shadcn/ui, lucide-react, react-router (HashRouter), zustand, date-fns (locale `id`), font Inter lewat `@fontsource` (dibundel, tanpa CDN), vitest.

## Deploy ke GitHub Pages

Workflow `.github/workflows/deploy.yml` berjalan setiap push ke `main` (dan bisa dipicu manual lewat `workflow_dispatch`): `npm ci`, `npm test`, `npm run build`, lalu mengunggah `dist/` dan men-deploy dengan `actions/deploy-pages`.

Syarat satu kali: di repo GitHub buka **Settings > Pages** dan pilih **Source: GitHub Actions**. `base` Vite diset ke `/obrol/` dan routing memakai HashRouter, jadi refresh halaman tidak menghasilkan 404.
