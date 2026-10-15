/* PADPAO EV service worker — offline app shell.
   Only same-origin static files are cached. Sign-in and member data (Supabase) are never cached. */
const VERSION = "padpao-ev-v1";
const SHELL = [
  "./", "index.html", "auth.html", "members.html", "offline.html", "manifest.webmanifest",
  "assets/css/app.css",
  "assets/js/config.js", "assets/js/auth.js", "assets/js/ui.js", "assets/js/auth-page.js", "assets/js/members.js",
  "assets/icons/logo-circle-256.png", "assets/icons/logo-circle-512.png",
  "assets/icons/icon-192.png", "assets/icons/favicon-48.png", "assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: cache-first so the app keeps its typography offline.
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(VERSION + "-fonts").then(async (c) => (await c.match(req)) || fetch(req).then((r) => { c.put(req, r.clone()); return r; })));
    return;
  }
  if (url.origin !== location.origin) return;        // auth, Supabase API, CDNs: always network
  if (url.pathname.endsWith("demo-meetings.js")) return; // never keep member data in the cache

  // Pages: network first, fall back to cache, then the offline page.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(url.pathname.endsWith("/") ? "./" : req, copy)); return r; })
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) || caches.match("offline.html"))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) caches.open(VERSION).then((c) => c.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
