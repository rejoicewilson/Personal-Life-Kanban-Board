export type TaskStatus = 'backlog' | 'this_week' | 'today' | 'in_progress' | 'done'
export type TaskCategory =
  | 'health'
  | 'career'
  | 'learning'
  | 'finance'
  | 'family'
  | 'spiritual'
  | 'personal'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string
  createdAt: string
}

export type TaskInput = Omit<Task, 'id' | 'createdAt'>
