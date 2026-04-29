/* ══════════════════════════════════════════
   SERVICE WORKER — Le Livre de la Fin
   Cache stratégique : JSON, images, audio
   ══════════════════════════════════════════ */

const CACHE_NAME  = "otome-v1";
const JSON_CACHE  = "otome-json-v1";
const ASSET_CACHE = "otome-assets-v1";

/* Fichiers critiques mis en cache dès l'installation */
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./game.html",
  "./chapters.html",
  /* Ajoute ici tes assets critiques : */
  /* "./images/backgrounds/main_bg.webp", */
  /* "./music/main_theme.ogg", */
];

/* ── INSTALL : pré-cache les fichiers critiques ── */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE : nettoie les vieux caches ── */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== JSON_CACHE && k !== ASSET_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH : stratégie selon le type de ressource ── */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  /* JSON chapitres/endings → Network first, cache fallback (contenu qui peut changer) */
  if (path.includes("/json/")) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(JSON_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  /* Images / Audio / Fonts → Cache first, Network fallback (assets statiques) */
  if (
    path.match(/\.(webp|jpg|jpeg|png|gif|svg|ogg|mp3|wav|woff2?)$/)
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(ASSET_CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  /* Tout le reste → Network with cache fallback */
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});