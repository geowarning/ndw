/* Cache safety knowledge and application assets, never live warning snapshots. */
const CACHE = 'ndw-shell-b71327abf57f53c1';
const ASSETS = [
  './', './index.html', './favicon.svg', './manifest.webmanifest', './css/styles.css', './css/interface.css',
  './js/shim.js', './js/config.js', './js/data.js', './js/guide-en.js', './js/guide-locales.js',
  './js/cities.js', './js/districts.js', './js/china-geo.js', './js/pinyin-pro.js', './js/i18n.js',
  './js/reliability.js', './js/explanations.js', './js/risk.js', './js/api.js', './js/globe-land.js', './js/holo-globe.js', './js/china-holo.js',
  './js/charts.js', './js/three.min.js', './js/games.js', './js/app-core.js', './js/ui.js', './js/icons.js', './js/views/products.js', './js/search.js', './js/global.js', './js/app.js', './js/offline.js', './assets/world-satellite.jpg', './assets/world-countries.geojson', './assets/world-cities.json', './assets/nasa-nightlights-eastasia.jpg', './assets/nasa-nightlights-eastasia.json', './public-data/global-earthquakes.json', './public-data/global-quakes-history.json'
];
const allowedPaths = new Set(ASSETS.map(asset => new URL(asset, self.location.href).pathname));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(asset => new Request(asset, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ndw-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Hash routes share index.html. Only explicitly listed shell assets may fall back.
  if (!allowedPaths.has(url.pathname)) return;
  event.respondWith(fetch(event.request, { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw Error('Asset unavailable');
    return response;
  }).catch(() => caches.open(CACHE).then(cache => cache.match(event.request, { ignoreSearch: true })).then(response => response || Response.error())));
});
