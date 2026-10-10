// WP Stat Tracker service worker — makes the app open with no signal (pool decks).
// Cache-first for the app shell; refreshes the cache in the background when online.
// Bump CACHE when index.html changes so old shells are dropped.
const CACHE = 'wpst-v1.3.0';
const SHELL = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.startsWith('/v0/') || u.pathname.includes('/v0/')) return;   // v1.3: the server's answers (the read-back, the fixtures) are never cached - Pull always goes to the network
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(res => { if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
