import type { Category, Task } from '@/types/kanban'

export function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getTaskAge(timestamp: number) {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60))
}

export function getTaskAgeStyles(timestamp: number) {
  const ageInHours = getTaskAge(timestamp)

  if (ageInHours > 24) {
    return 'border-red-500 ring-1 ring-red-500/30'
  }

  if (ageInHours > 4) {
    return 'border-amber-500 ring-1 ring-amber-500/20'
  }

  return 'border-slate-800'
}

export function formatTaskAge(timestamp: number) {
  const ageInHours = getTaskAge(timestamp)

  if (ageInHours >= 24) {
    return `${Math.floor(ageInHours / 24)}d`
  }

  return `${Math.max(0, ageInHours)}h`
}

export function formatDueDateInput(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000
  return new Date(timestamp - timezoneOffset).toISOString().slice(0, 16)
}

export function parseDueDateInput(value: string) {
  if (!value) {
    return undefined
  }

  const parsed = new Date(value)
  const timestamp = parsed.getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

export function formatDueDate(timestamp?: number) {
  if (!timestamp) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function resolveCategory(categories: Category[], categoryId: string): Category {
  return (
    categories.find((category) => category.id === categoryId) ?? {
      id: categoryId,
      name: 'Uncategorized',
      color: 'sky',
    }
  )
}

export async function sendReminderNotification(task: Task) {
  const title = 'Task deadline reached'
  const body = `${task.title}${task.dueDate ? ` is due ${formatDueDate(task.dueDate)}.` : '.'}`

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.showNotification(title, {
        body,
        tag: `task-reminder-${task.id}`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      })
      return
    }
  }

  if ('Notification' in window) {
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: `task-reminder-${task.id}`,
    })
  }
}
