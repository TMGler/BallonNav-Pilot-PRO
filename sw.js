const CACHE_NAME = 'aeronav-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Netzwerk-Request im Hintergrund starten (Stale-while-revalidate)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        
        // Prüfen, ob es eine Karten-Kachel ist (OSM, CartoDB oder ArcGIS Satellit)
        const url = event.request.url;
        if (url.includes('tile.openstreetmap') || 
            url.includes('cartocdn') || 
            url.includes('arcgisonline')) { // Neu: Satellitenbilder cachen
            
            caches.open(CACHE_NAME).then((cache) => {
                // Klonen ist wichtig, da der Stream nur einmal gelesen werden kann
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(() => {
        // Wenn offline und Netzwerk fehlschlägt, ist das okay, 
        // solange wir eine cachedResponse haben.
      });

      // Wenn im Cache, sofort zurückgeben, sonst auf Netzwerk warten
      return cachedResponse || fetchPromise;
    })
  );
});
