import { sampleTasks, TASK_STORAGE_KEY, THEME_STORAGE_KEY } from '@/utils/constants'
import type { Task } from '@/types/task'

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') {
    return sampleTasks
  }

  const stored = window.localStorage.getItem(TASK_STORAGE_KEY)
  if (!stored) {
    return sampleTasks
  }

  try {
    const parsed = JSON.parse(stored) as Task[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : sampleTasks
  } catch {
    return sampleTasks
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks))
}

export function loadTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

export function saveTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}
