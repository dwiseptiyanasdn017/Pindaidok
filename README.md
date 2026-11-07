# PindaiDok

Scan dokumen ke PDF A4 / PNG / JPG, dan edit PDF (gabung, pisah, putar, tanda tangan, teks, kompres, PDF ke Word).
Tanpa iklan, tanpa server: semua diproses di HP.

## Deploy ke Vercel
1. Upload folder ini ke repo GitHub baru (atau `vercel deploy` dari folder ini).
2. Di Vercel: Framework Preset = **Other**, tanpa build command, output = root.
3. Buka URL-nya di Chrome HP → menu ⋮ → **Instal aplikasi / Tambahkan ke layar utama**.

## Isi folder
- `index.html` — tab Scan
- `edit.html` — tab Edit PDF
- `riwayat.html` — tab Riwayat (40 file terakhir disimpan di perangkat)
- `common.js` — kode bersama (riwayat, pencarian ukuran maksimal KB)
- `sw.js` — mode offline. **Naikkan `VERSI`** setiap kali `index.html` diubah.
- `vendor/opencv.js` — deteksi tepi kertas (±10 MB, diunduh sekali saat scan pertama lalu tersimpan offline)
- `vendor/jspdf.umd.min.js`, `vendor/jszip.min.js` — pembuat PDF dan ZIP
- `vendor/pdf.min.js` + `pdf.worker.min.js` (membaca PDF), `vendor/pdf-lib.min.js` (menyusun PDF)
- `vendor/docx.umd.js` — pembuat Word
- `vendor/pdf-lib-enc.min.js` — pengunci PDF dengan kata sandi (AES-128)
- `vendor/tess/` — OCR bahasa Indonesia (±5,6 MB, diunduh sekali saat pertama dipakai)

## Catatan
- Halaman tersimpan di perangkat (IndexedDB) dan tetap ada walau aplikasi ditutup, sampai dihapus.
- Ukuran ekspor: Kecil ≈ 1240 px, Sedang ≈ 1754 px, Tinggi ≈ 2400 px (sisi terpanjang).
