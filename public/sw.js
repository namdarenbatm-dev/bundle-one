// __PRECACHE__ و __BUILD_ID__ هنگام Build توسط vite.config.js جایگزین می‌شوند.
const CACHE = 'tosan-bundling-v6-__BUILD_ID__';
const PRECACHE = __PRECACHE__;
const scope = self.registration.scope;
const abs = (p) => new URL(p, scope).href;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE.map(abs)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tosan-bundling-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // صفحه: اول شبکه (نسخه تازه)، در نبود اینترنت نسخه کش‌شده
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(abs('./'), copy)); }
        return res;
      }).catch(() => caches.match(abs('./')).then((r) => r || caches.match(abs('index.html'))))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
