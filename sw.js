
const CACHE_NAME = 'radha-v5';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      // Use add instead of addAll to be more resilient to individual failures
      return Promise.allSettled(ASSETS.map(url => c.add(url)));
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests and avoid chrome-extension or other schemes
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        // Fallback or just let it fail if offline and not cached
      });
    })
  );
});
