// Keep the public catalog and instrument available on a return visit offline.
const base = new URL('./', self.location.href)
const prefix = 'world-scales:' + base.pathname + ':'
const cacheName = prefix + '17'
const assets = [
  'index.html', 'guide.html', 'about.html', 'terms.html', 'atlas.webmanifest',
  'style.css', 'theme.js', 'app.js', 'sound.js', 'modes.js', 'diagrams.js',
  'compare.js', 'theory.js', 'wheel.js', 'globe.js', 'coverage.js', 'catalog.json',
  'globe-countries.json', 'globe-index.png', 'globe-relief.jpg',
  ...[64, 180, 192, 512].map(size => 'atlas-logo-' + size + '.png')
]
const paths = new Set(assets.map(file => new URL(file, base).pathname))
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)))
})
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key)
    }
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== base.origin) return
  const path = url.pathname === base.pathname ? base.pathname + 'index.html' : url.pathname
  if (!paths.has(path)) return
  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    try {
      const response = await fetch(request)
      if (response.ok) await cache.put(path, response.clone())
      return response
    } catch (error) {
      const cached = await cache.match(path)
      if (cached) return cached
      throw error
    }
  })())
})
