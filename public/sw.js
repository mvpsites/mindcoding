/* MindCod.ing service worker: network-first shell, cache-first assets */
const CACHE = "mindcoding-v33";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, { cache: "no-cache" }) // bypass Safari's HTTP cache — always revalidate the shell
        .then((r) => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put("__shell__", copy));
          }
          return r;
        })
        .catch(() => caches.match("__shell__"))
    );
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((r) => {
            if (r.ok) {
              const copy = r.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
            }
            return r;
          })
      )
    );
  }
});
