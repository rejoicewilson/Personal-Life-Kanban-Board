import type { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/task'

export const TASK_STORAGE_KEY = 'personal-life-kanban.tasks'
export const THEME_STORAGE_KEY = 'personal-life-kanban.theme'

export const columnOrder: TaskStatus[] = [
  'backlog',
  'this_week',
  'today',
  'in_progress',
  'done',
]

export const columnLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  this_week: 'This Week',
  today: 'Today',
  in_progress: 'In Progress',
  done: 'Done',
}

export const categoryLabels: Record<TaskCategory, string> = {
  health: 'Health',
  career: 'Career',
  learning: 'Learning',
  finance: 'Finance',
  family: 'Family',
  spiritual: 'Spiritual',
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
    title: 'Plan weekly meals and grocery list',
    description: 'Keep meals simple, high protein, and within budget.',
    status: 'this_week',
    category: 'health',
    priority: 'medium',
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Finish portfolio case study draft',
    description: 'Wrap up the metrics section and polish the visuals.',
    status: 'in_progress',
    category: 'career',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Read 20 pages of current book',
    status: 'today',
    category: 'learning',
    priority: 'low',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Call parents in the evening',
    status: 'done',
    category: 'family',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
]
