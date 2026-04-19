import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
import webpush from 'npm:web-push@3.6.7'

type ReminderTask = {
  id: string
  user_id: string
  title: string
  due_date: number | null
}

type PushSubscriptionRow = {
  endpoint: string
  p256dh: string
  auth: string
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const vapidSubject = Deno.env.get('VAPID_SUBJECT')
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

if (!supabaseUrl || !serviceRoleKey || !vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
  throw new Error('Missing required function secrets for reminder push delivery.')
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

const supabase = createClient(supabaseUrl, serviceRoleKey)

function buildPayload(task: ReminderTask) {
  const dueDateLabel = task.due_date
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(task.due_date))
    : 'now'

  return JSON.stringify({
    title: 'Task deadline reached',
    body: `${task.title} is due ${dueDateLabel}.`,
    url: '/',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `task-reminder-${task.id}`,
  })
}

Deno.serve(async () => {
  const now = Date.now()

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('id, user_id, title, due_date')
    .neq('status', 'done')
    .eq('reminder_enabled', true)
    .is('reminder_sent_at', null)
    .lte('due_date', now)

  if (taskError) {
    return new Response(JSON.stringify({ ok: false, error: taskError.message }), { status: 500 })
  }

  const dueTasks = (tasks ?? []) as ReminderTask[]

  for (const task of dueTasks) {
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', task.user_id)

    if (subscriptionError) {
      console.error(subscriptionError)
      continue
    }

    const payload = buildPayload(task)

    for (const subscription of (subscriptions ?? []) as PushSubscriptionRow[]) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        )
      } catch (error) {
        console.error('Push send failed', error)
      }
    }

    await supabase
      .from('tasks')
      .update({ reminder_sent_at: now })
      .eq('id', task.id)
  }

  return new Response(JSON.stringify({ ok: true, sent: dueTasks.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
