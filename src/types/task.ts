export type TaskStatus = 'backlog' | 'today' | 'in_progress' | 'done'
export type TaskCategory = 'health' | 'career' | 'learning' | 'personal'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  status: TaskStatus
  category: TaskCategory
  priority: TaskPriority
  createdAt: string
}

export type TaskInput = Omit<Task, 'id' | 'createdAt'>
