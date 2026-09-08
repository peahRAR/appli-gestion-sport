/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

// registerType: 'prompt' — the app shows an "update available" banner and
// only activates the new worker once the user confirms, via this message
// (see composables/usePwaUpdate.ts / updateServiceWorker()).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ---- Push notifications ----
// A page can only control one active service worker, so this lives in the
// same file rather than a second worker.
self.addEventListener('push', (event) => {
  let data: { title?: string; body?: string; url?: string } = {}
  try {
    data = event.data?.json() || {}
  } catch {
    data = { title: 'Nouveau cours disponible', body: event.data?.text() || '' }
  }

  const title = data.title || 'Nouveau cours disponible'
  const options: NotificationOptions = {
    body: data.body || "Un cours vient d'être ajouté, pense à t'y inscrire !",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          client.navigate?.(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
