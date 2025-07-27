const CACHE_NAME = 'hghome-cache-v1';
const urlsToCache = [
  '/main/index.html',
  '/main/style.css',
  '/main/main.js',
  '/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
