
const CACHE_NAME = "calculadora-salario-v1";
const urlsToCache = [
  "/Calculadora-de-salario/",
  "/Calculadora-de-salario/index.html",
  "/Calculadora-de-salario/style.css",
  "/Calculadora-de-salario/script.js",
  "/Calculadora-de-salario/icon-192.png",
  "/Calculadora-de-salario/icon-512.png",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
