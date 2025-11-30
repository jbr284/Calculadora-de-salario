const CACHE_NAME = 'salario-dtc-cache-v4'; // Aumente SEMPRE este número quando mudar algo (v3 -> v4)
const urlsToCache = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// 1. INSTALAÇÃO: Força a atualização imediata (skipWaiting)
self.addEventListener('install', event => {
  // Força o SW novo a entrar em ação sem esperar o antigo fechar
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ATIVAÇÃO: Assume o controle das páginas abertas (clients.claim)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Limpa caches antigos
          }
        })
      );
    }).then(() => {
      // Diz para o navegador: "Comece a usar este SW novo AGORA em todas as abas"
      return self.clients.claim(); 
    })
  );
});

// 3. FETCH: Intercepta as requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
