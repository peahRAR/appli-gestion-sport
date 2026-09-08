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

// Push notification handling (Lot 7) is added here, in the same SW file,
// rather than a second worker — a page can only control one active SW.
