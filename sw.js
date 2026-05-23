// Forge Service Worker v2 — skips non-http(s) schemes (chrome-extension, etc.)
const CACHE = 'forge-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(ASSETS).catch(err => console.warn('SW cache failed:', err))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // Only handle GET requests — POST/PUT/DELETE go straight to network
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return;
  }

  // Only handle http(s) — skip chrome-extension://, moz-extension://, file://, data:, blob:, etc.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Never cache Firebase / Google APIs — must be live for auth and data
  if (
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebasestorage.app') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('accounts.google.com')
  ) {
    return;
  }

  // Network-first for HTML
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for static assets (same-origin only)
  if (url.origin !== self.location.origin) {
    return; // let browser handle cross-origin fetches
  }

  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const respClone = resp.clone();
          caches.open(CACHE).then(c => {
            try {
              c.put(req, respClone);
            } catch (err) {
              // Some requests can't be cached (e.g. partial responses) — ignore
            }
          });
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
