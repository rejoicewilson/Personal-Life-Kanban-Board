import type { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/task'

export const TASK_STORAGE_KEY = 'personal-life-kanban.tasks'
export const THEME_STORAGE_KEY = 'personal-life-kanban.theme'

export const columnOrder: TaskStatus[] = [
  'backlog',
  'today',
  'in_progress',
  'done',
]

export const columnLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  today: 'Today',
  in_progress: 'In Progress',
  done: 'Done',
}

export const categoryLabels: Record<TaskCategory, string> = {
  health: 'Health',
  career: 'Career',
  learning: 'Learning',
  personal: 'Personal',
}

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Plan tomorrow meals',
    status: 'backlog',
    category: 'health',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Reply to recruiter',
    status: 'in_progress',
    category: 'career',
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Read 15 pages',
    status: 'today',
    category: 'learning',
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Clear phone photos',
    status: 'done',
    category: 'personal',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
]
