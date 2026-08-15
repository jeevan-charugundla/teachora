/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Clean up old caches and precache build assets injected by vite-plugin-pwa
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Push Event Listener: Receives and displays Web Push notifications
self.addEventListener('push', (event) => {
  let data: {
    title: string;
    body: string;
    url: string;
    icon: string;
    badge: string;
    data?: Record<string, unknown>;
  } = {
    title: 'Teachora Material Ready 📚',
    body: 'Your classroom content has finished generating.',
    url: '/app/workspace',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        url: payload.url || payload.data?.url || data.url,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        data: payload.data || payload,
      };
    } catch {
      try {
        const textVal = event.data.text();
        if (textVal) data.body = textVal;
      } catch {
        // Fallback default
      }
    }
  }

  const options: NotificationOptions = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: {
      url: data.url,
      ...(data.data || {}),
    },
    tag: (data.data?.tag as string) || `teachora-notification-${Date.now()}`,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 2. Notification Click Listener: Focuses existing Teachora window or opens target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/app/workspace';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullTargetUrl);
          }
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(fullTargetUrl);
      }
    })
  );
});

// 3. Notification Close Listener
self.addEventListener('notificationclose', () => {
  // Optional notification dismissal tracking
});
