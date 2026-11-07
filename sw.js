// PindaiDok service worker — offline-first.
// Naikkan VERSI setiap kali file aplikasi diubah agar pengguna mendapat versi baru.
const VERSI = 'pindaidok-v5';
const SHELL = ['./', './index.html', './edit.html', './riwayat.html', './common.js', './manifest.webmanifest', './icon-192.png', './icon-512.png',
               './vendor/jspdf.umd.min.js', './vendor/jszip.min.js',
               './vendor/pdf.min.js', './vendor/pdf.worker.min.js', './vendor/pdf-lib.min.js'];
// File besar disimpan ke cache saat pertama kali dipakai, bukan saat instal:
// vendor/opencv.js (deteksi tepi ±10 MB), vendor/docx.umd.js (Word), vendor/tess/* (OCR ±5,6 MB),
// vendor/pdf-lib-enc.min.js (kunci kata sandi).

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSI).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
