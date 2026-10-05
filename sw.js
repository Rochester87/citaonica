// Čuva aplikaciju za rad bez interneta. Za novu verziju dovoljno je postaviti nove fajlove.
const CACHE = 'citaonica-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
const put = (req, res) => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin) {
    // prvo mreža (da uvek dobiješ najnoviju verziju), keš ako nema interneta
    e.respondWith(fetch(e.request).then(r => r.ok ? put(e.request, r) : r).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
  } else if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.host)) {
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => put(e.request, r))));
  }
});
