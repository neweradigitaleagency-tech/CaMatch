const CACHE_NAME = "ca-match-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || "Ça Match";
    const options = {
      body: data.body || "",
      icon: data.icon || "/vite.svg",
      badge: data.badge || "/vite.svg",
      vibrate: [200, 100, 200],
      tag: data.tag || "ca-match-notification",
      renotify: true,
      requireInteraction: true,
      data: data.data || {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const title = "Ça Match";
    const options = {
      body: event.data.text(),
      icon: "/vite.svg",
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/orders";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.postMessage({ type: "NAVIGATE", url: target });
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(self.location.origin + target);
    })
  );
});
