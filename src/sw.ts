/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null
    url: string
  }>
}

type ReminderPayload = {
  title?: string
  body?: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
}

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }

  const payload = (event.data.json() as ReminderPayload | null) ?? {}
  const title = payload.title ?? 'Task deadline reached'
  const body = payload.body ?? 'A task needs your attention.'
  const url = payload.url ?? '/'
  const icon = payload.icon ?? '/pwa-192x192.png'
  const badge = payload.badge ?? '/pwa-192x192.png'
  const tag = payload.tag ?? 'task-reminder'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data?.url as string | undefined) ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'REMINDER_OPENED', url: targetUrl })
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }

      return undefined
    }),
  )
})

export {}
