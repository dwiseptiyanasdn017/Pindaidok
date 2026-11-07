# PindaiDok

Scan dokumen ke PDF A4 / PNG / JPG. Tanpa iklan, tanpa server: semua foto diproses di HP.

## Deploy ke Vercel
1. Upload folder ini ke repo GitHub baru (atau `vercel deploy` dari folder ini).
2. Di Vercel: Framework Preset = **Other**, tanpa build command, output = root.
3. Buka URL-nya di Chrome HP → menu ⋮ → **Instal aplikasi / Tambahkan ke layar utama**.

## Isi folder
- `index.html` — seluruh aplikasi (tampilan + logika)
- `sw.js` — mode offline. **Naikkan `VERSI`** setiap kali `index.html` diubah.
- `vendor/opencv.js` — deteksi tepi kertas (±10 MB, diunduh sekali saat scan pertama lalu tersimpan offline)
- `vendor/jspdf.umd.min.js`, `vendor/jszip.min.js` — pembuat PDF dan ZIP

## Catatan
- Halaman tersimpan di perangkat (IndexedDB) dan tetap ada walau aplikasi ditutup, sampai dihapus.
- Ukuran ekspor: Kecil ≈ 1240 px, Sedang ≈ 1754 px, Tinggi ≈ 2400 px (sisi terpanjang).
