const CACHE_NAME = "davito-web-v1.7.0";

// Precache only long-lived media. CSS/JS are unhashed and change often;
// cache-first for those left the first visit (and any visit after a deploy)
// on a stale bundle until Ctrl+Shift+R bypassed the worker.
const STATIC_ASSETS = [
  "/media/favicon-32x32.webp",
  "/media/favicon-16x16.webp",
  "/media/favicon.ico",
  "/media/Davo.jpg",
  "/media/langostina.png"
];

const ALLOWED_DOMAINS = [
  "davito.es",
  "localhost",
  "127.0.0.1",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdnjs.cloudflare.com",
  "www.gstatic.com",
  "firestore.googleapis.com",
  "firebase.googleapis.com",
  "api.lanyard.rest",
  "api.github.com",
  "router.project-osrm.org",
  "nominatim.openstreetmap.org",
  "sedeaplicaciones.minetur.gob.es",
  "api.allorigins.win",
  "corsproxy.io",
  "api.codetabs.com",
  "cartocdn.com",
  "unpkg.com",
  "cdn.tailwindcss.com"
];

function isAllowedDomain(url) {
  try {
    const urlObj = new URL(url);
    return ALLOWED_DOMAINS.some((domain) => urlObj.hostname.endsWith(domain));
  } catch (e) {
    return false;
  }
}

function isHtmlRequest(request, urlObj) {
  const accept = request.headers.get("accept") || "";
  return (
    request.mode === "navigate" ||
    accept.includes("text/html") ||
    urlObj.pathname === "/" ||
    urlObj.pathname.endsWith(".html") ||
    urlObj.pathname === "/sw.js"
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(STATIC_ASSETS.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (e) {
    return;
  }

  if (urlObj.hostname.includes("lanyard.rest")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (
    urlObj.hostname.includes("firestore") ||
    urlObj.hostname.includes("firebase") ||
    urlObj.hostname.includes("gstatic.com") ||
    urlObj.hostname.includes("googleapis.com")
  ) {
    return;
  }

  if (!isAllowedDomain(url)) return;

  const isApi = urlObj.pathname.includes("/api/");
  const dest = event.request.destination;
  // Let the browser fetch webfonts itself. Intercepting font requests (especially
  // CORS Font Awesome files) is the classic "icons missing until Ctrl+F5" bug.
  if (
    dest === "font" ||
    /\.(woff2?|ttf|otf|eot)$/i.test(urlObj.pathname)
  ) {
    return;
  }
  const isCode = dest === "script" || dest === "style" ||
    urlObj.pathname.endsWith(".js") || urlObj.pathname.endsWith(".css");

  // HTML, API, JS and CSS: network first. Cache is only an offline fallback.
  // Returning cache first served old CSS/JS while index.html was already new.
  if (isHtmlRequest(event.request, urlObj) || isApi || isCode) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === "basic" && isCode) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || networked;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "SKIP_WAITING" || event.data.action === "skipWaiting")) {
    self.skipWaiting();
  }

  if (event.data === "FORCE_UPDATE" || event.data === "CLEAN_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => event.data === "FORCE_UPDATE" || name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
    );
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

self.addEventListener("push", function (event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "Nueva Notificación",
      body: event.data ? event.data.text() : "",
      icon: "/media/android-chrome-192x192.webp",
      url: "/"
    };
  }

  const title = data.title || "davito_03";
  const options = {
    body: data.body || "Tienes una nueva actualización.",
    icon: data.icon || "/media/android-chrome-192x192.webp",
    badge: "/media/favicon-32x32.webp",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "explore", title: "Ver ahora", icon: "/media/favicon-16x16.webp" },
      { action: "close", title: "Cerrar", icon: "/media/favicon-16x16.webp" }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (event.action === "close") return;

  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  const isRelative = url.startsWith("/") && !url.startsWith("//");
  const isSameDomain = url.startsWith("https://davito.es");

  event.waitUntil(clients.openWindow(isRelative || isSameDomain ? url : "/"));
});
