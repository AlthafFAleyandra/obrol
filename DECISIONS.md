# DECISIONS

| Tanggal | Keputusan | Alasan |
| --- | --- | --- |
| 2026-10-15 | Skill ui-ux-pro-max sudah terpasang lewat `npx skills add` (di `.agents/skills`, symlink ke `.claude/skills`), jadi `npx ui-ux-pro-max-cli init` dilewati. | Hasil sama, tidak perlu dobel. Node 22, git, Python 3.13 tersedia. |
| 2026-10-15 | Komponen shadcn/ui ditulis manual (gaya shadcn di atas paket `radix-ui`, `class-variance-authority`, `sonner`) di `src/components/ui/`. | Registry `ui.shadcn.com` tidak bisa diakses dari sandbox (CLI `shadcn add` gagal). |
| 2026-10-15 | Dependency tambahan: `radix-ui`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`, `jsdom`, `@testing-library/react`, `tailwindcss` + `@tailwindcss/vite`. | Dibutuhkan oleh shadcn/ui, toast, Tailwind v4, dan tes. |
| 2026-10-15 | Scaffold Vite terbaru memakai `oxlint` (bukan ESLint) dan TypeScript 6; dipakai apa adanya untuk `npm run lint`. `baseUrl` dihapus dari tsconfig (deprecated di TS 6), alias `@/*` lewat `paths`. | Ikuti scaffold resmi; hindari konfigurasi usang. |
| 2026-10-15 | `base` Vite = `/obrol/` (dari remote `AlthafFAleyandra/obrol`). | Sesuai bagian 8 brief. |
| 2026-10-15 | Rekomendasi skill (pola landing "Product Demo", warna biru `#2563EB`) diabaikan; palet brief bagian 7 dan tata letak 4 kolom dipakai. Font Inter tetap (sama dengan rekomendasi skill), dibundel lewat `@fontsource-variable/inter`. | Aturan brief: batasan wajib menang atas skill. Catatan override ditulis di atas `design-system/obrol/MASTER.md`. |
| 2026-10-15 | Tema: kelas `dark` di `<html>`, disetel oleh skrip inline di `index.html` dari `localStorage['obrol-theme']` (default dark). | Mencegah kedipan tema saat dimuat. |
