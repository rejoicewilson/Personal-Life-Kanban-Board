import { categoryLabels, columnLabels, priorityLabels } from '@/utils/constants'
import type { TaskCategory, TaskPriority, TaskStatus } from '@/types/task'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function getCategoryLabel(category: TaskCategory) {
  return categoryLabels[category]
}

export function getPriorityLabel(priority: TaskPriority) {
  return priorityLabels[priority]
}

export function getStatusLabel(status: TaskStatus) {
  return columnLabels[status]
}

export function getCategoryVariant(category: TaskCategory) {
  const variants: Record<TaskCategory, 'success' | 'info' | 'violet' | 'default'> = {
    health: 'success',
    career: 'info',
    learning: 'violet',
    personal: 'default',
  }

  return variants[category]
}

export function getPriorityVariant(priority: TaskPriority) {
  const variants: Record<TaskPriority, 'default' | 'warning' | 'danger'> = {
    low: 'default',
    medium: 'warning',
    high: 'danger',
  }

  return variants[priority]
}
