const CACHE_NAME = 'organizer-v2';
const BASE = '/organaizer24';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/main.css',
  BASE + '/app.js',
  BASE + '/firebase-config.js',
  BASE + '/db.js',
  BASE + '/navigation.js',
  BASE + '/savings.js',
  BASE + '/car.js',
  BASE + '/notes.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
