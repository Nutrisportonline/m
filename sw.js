
const CACHE_NAME = 'tablas-pro-offline-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/icon-192x192-maskable.png',
  './icons/icon-512x512-maskable.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res=>{
        // Cache external libs (xlsx, jspdf) for offline next time
        if (e.request.url.includes('cdnjs.cloudflare.com')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
