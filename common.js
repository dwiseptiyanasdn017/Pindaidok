/* PindaiDok — kode bersama untuk tab Scan, Edit PDF, dan Riwayat */
'use strict';

/* Riwayat file yang pernah dibuat. Disimpan di perangkat (IndexedDB).
   Dibatasi 40 file terbaru dan total 150 MB; yang paling lama dihapus otomatis. */
const Riwayat = {
  MAX_N: 40, MAX_BYTES: 150 * 1048576, db: null,
  open() {
    if (this.db) return Promise.resolve(true);
    return new Promise(res => { try {
      const r = indexedDB.open('pindaidok-riwayat', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(true); };
      r.onerror = () => res(false);
    } catch (e) { res(false); } });
  },
  _req(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async all() {
    if (!(await this.open())) return [];
    try { const a = await this._req(this.db.transaction('files').objectStore('files').getAll()); return a.sort((x, y) => y.date - x.date); }
    catch (e) { return []; }
  },
  async get(id) { if (!(await this.open())) return null; try { return await this._req(this.db.transaction('files').objectStore('files').get(id)); } catch (e) { return null; } },
  async del(id) { if (!(await this.open())) return; try { await this._req(this.db.transaction('files', 'readwrite').objectStore('files').delete(id)); } catch (e) {} },
  async clear() { if (!(await this.open())) return; try { await this._req(this.db.transaction('files', 'readwrite').objectStore('files').clear()); } catch (e) {} },
  async add(file, asal) {
    if (!(await this.open())) return;
    const rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: file.name, type: file.type, size: file.size, date: Date.now(), asal, blob: file };
    try { await this._req(this.db.transaction('files', 'readwrite').objectStore('files').put(rec)); } catch (e) { console.warn(e); return; }
    const list = await this.all(); let total = 0;
    for (let i = 0; i < list.length; i++) {
      total += list[i].size;
      if (i >= this.MAX_N || (i > 0 && total > this.MAX_BYTES)) await this.del(list[i].id);
    }
  }
};

/* Mencari kualitas terbaik yang hasilnya tidak melebihi batas ukuran.
   build(side, q) → Promise<jumlah byte>. Mengembalikan {side, q, size, ok}. */
const TANGGA = [[2400,.88],[2100,.82],[1900,.78],[1754,.74],[1600,.7],[1450,.65],[1300,.6],[1200,.55],[1100,.5],[1000,.45],[900,.42],[800,.38],[700,.34],[600,.3],[500,.28]];
async function cariUkuranTarget(maxBytes, build, onStep) {
  let lo = 0, hi = TANGGA.length - 1, best = null, cache = new Map();
  const size = async i => { if (!cache.has(i)) { onStep && onStep(); cache.set(i, await build(TANGGA[i][0], TANGGA[i][1])); } return cache.get(i); };
  if (await size(0) <= maxBytes) return { side: TANGGA[0][0], q: TANGGA[0][1], size: await size(0), ok: true };
  while (lo <= hi) {
    const mid = (lo + hi) >> 1, s = await size(mid);
    if (s <= maxBytes) { best = mid; hi = mid - 1; } else lo = mid + 1;
  }
  if (best == null) { const i = TANGGA.length - 1; return { side: TANGGA[i][0], q: TANGGA[i][1], size: await size(i), ok: false }; }
  return { side: TANGGA[best][0], q: TANGGA[best][1], size: await size(best), ok: true };
}

/* Tema tampilan: Otomatis (ikut HP) → Cerah → Gelap */
const Tema = {
  urut: ['auto', 'light', 'dark'],
  nama: { auto: 'Otomatis', light: 'Cerah', dark: 'Gelap' },
  ikon: {
    auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'
  },
  get() { try { const t = localStorage.getItem('pd_theme'); return t === 'light' || t === 'dark' ? t : 'auto'; } catch (e) { return 'auto'; } },
  set(t) {
    try { t === 'auto' ? localStorage.removeItem('pd_theme') : localStorage.setItem('pd_theme', t); } catch (e) {}
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    this.tombol();
  },
  tombol() { const b = document.getElementById('btnTheme'); if (!b) return; const t = this.get(); b.innerHTML = this.ikon[t] + this.nama[t]; b.title = 'Tema: ' + this.nama[t]; },
  pasang() { const b = document.getElementById('btnTheme'); if (!b) return; this.tombol(); b.onclick = () => { const u = this.urut; this.set(u[(u.indexOf(this.get()) + 1) % u.length]); }; }
};
Tema.pasang();
