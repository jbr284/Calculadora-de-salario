const CACHE_NAME = 'salario-dtc-cache-v10'; // <--- MUDEI PARA v6
const urlsToCache = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// --- A MÁGICA ACONTECE AQUI (Network First) ---
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Arquivos CRÍTICOS: Sempre tentar baixar da rede primeiro
  // Se falhar (offline), pega do cache
  if (requestUrl.pathname.endsWith('index.html') || 
      requestUrl.pathname.endsWith('app.js') || 
      requestUrl.pathname.endsWith('style.css') ||
      requestUrl.pathname.endsWith('/')) { // Raiz
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se deu certo baixar, atualiza o cache com a versão nova
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Se deu erro (offline), usa o cache
          return caches.match(event.request);
        })
    );
  } else {
    // Para imagens e outros arquivos, continua Cache Primeiro (mais rápido)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});




