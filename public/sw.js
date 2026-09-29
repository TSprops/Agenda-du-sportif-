// Service worker : l'app s'ouvre même sans réseau (réseau d'abord, cache en secours).
const CACHE = "agenda-v19";
const FONTS = "agenda-fonts";
const SHELL = ["./", "index.html", "styles.css?v=19", "app.js?v=19", "data.js", "firebase-config.js", "vendor/firebase.js", "manifest.webmanifest", "confidentialite.html", "conditions.html", "legal.css", "icons/icon-192.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Polices Google : gardées en cache pour que l'app garde son style hors connexion.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }) // toujours vérifier auprès du serveur (évite les mélanges de versions)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match(e.request, { ignoreSearch: true })).then(r => r || caches.match("index.html")))
  );
});
