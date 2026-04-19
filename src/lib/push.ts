import { supabase } from '@/lib/supabase'

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

export const isPushSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

export const isPushConfigured = Boolean(vapidPublicKey)

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export async function ensurePushSubscription() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  if (!isPushSupported) {
    throw new Error('Push notifications are not supported on this device/browser.')
  }

  if (!vapidPublicKey) {
    throw new Error('VITE_VAPID_PUBLIC_KEY is missing.')
  }

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const subscriptionJson = subscription.toJSON()
  const p256dh = subscriptionJson.keys?.p256dh
  const auth = subscriptionJson.keys?.auth

  if (!subscription.endpoint || !p256dh || !auth) {
    throw new Error('Push subscription keys are incomplete.')
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    endpoint: subscription.endpoint,
    p256dh,
    auth,
  })

  if (error) {
    throw error
  }

  return subscription
}
