const CACHE_NAME = 'nav-tiles-v1';
const TILE_CACHE = 'map-tiles-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  const isTile =
    url.includes('tile.openstreetmap.org') ||
    url.includes('basemaps.cartocdn.com') ||
    url.includes('tile.opentopomap.org') ||
    url.includes('tiles.openaip.net') ||
    url.includes('a.tile') ||
    url.includes('b.tile') ||
    url.includes('c.tile');

  if (isTile) {
    e.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) return cached;

        try {
          const response = await fetch(e.request);
          if (response.ok) {
            cache.put(e.request, response.clone());
          }
          return response;
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  e.respondWith(fetch(e.request).catch(() => new Response('Offline', { status: 503 })));
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'CACHE_TILES') {
    const { tiles } = e.data;
    caches.open(TILE_CACHE).then(async (cache) => {
      let cached = 0;
      for (const url of tiles) {
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            await cache.put(url, resp);
            cached++;
          }
        } catch {}
      }
      e.source && e.source.postMessage({ type: 'CACHE_DONE', cached, total: tiles.length });
    });
  }

  if (e.data && e.data.type === 'CACHE_STATS') {
    caches.open(TILE_CACHE).then(async (cache) => {
      const keys = await cache.keys();
      e.source && e.source.postMessage({ type: 'CACHE_STATS_RESULT', count: keys.length });
    });
  }

  if (e.data && e.data.type === 'CLEAR_TILES') {
    caches.delete(TILE_CACHE).then(() => {
      e.source && e.source.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});
