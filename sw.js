/**
 * Service Worker para GameUziel
 * Proporciona soporte Offline y gestión de caché para la PWA.
 */

const CACHE_NAME = 'gameuziel-cache-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@700;900&display=swap'
];

// Evento de Instalación: Se ejecuta cuando el SW se registra por primera vez
self.addEventListener('install', (event) => {
    // Forzar la activación inmediata para que el proceso de limpieza ocurra lo antes posible
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cacheando nuevos archivos de GameUziel...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Evento de Activación: Limpia la caché antigua PRIMERO antes de tomar el control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Si la caché encontrada no coincide con el nombre actual, se elimina de inmediato
                    if (cacheName !== CACHE_NAME) {
                        console.log('Limpiando caché antigua de forma prioritaria:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Caché limpia. El Service Worker ahora tiene el control.');
            // Permite que el Service Worker tome el control de las pestañas abiertas inmediatamente
            return self.clients.claim();
        })
    );
});

// Evento Fetch: Intercepta las solicitudes para servir desde el caché si no hay red
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Si falla la red (offline), busca en el caché actualizado
            return caches.match(event.request);
        })
    );
});
