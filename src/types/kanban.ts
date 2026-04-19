export type TabKey = 'todo' | 'doing' | 'done'
export type CategoryColor = 'sky' | 'violet' | 'rose' | 'emerald' | 'amber' | 'cyan'

export type Category = {
  id: string
  name: string
  color: CategoryColor
}

export type Subtask = {
  id: string
  text: string
  done: boolean
}

export type Task = {
  id: string
  title: string
  categoryId: string
  status: TabKey
  timestamp: number
  dueDate?: number
  reminderEnabled?: boolean
  reminderSentAt?: number
  note?: string
  subtasks: Subtask[]
}

export const defaultCategories: Category[] = [
  { id: 'work', name: 'Work', color: 'sky' },
  { id: 'personal', name: 'Personal', color: 'violet' },
  { id: 'urgent', name: 'Urgent', color: 'rose' },
]

export const starterTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review tomorrow schedule',
    categoryId: 'personal',
    status: 'todo',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    dueDate: Date.now() + 2 * 60 * 60 * 1000,
    reminderEnabled: true,
    note: 'Keep it light and make room for gym time.',
    subtasks: [
      { id: crypto.randomUUID(), text: 'Check calendar', done: true },
      { id: crypto.randomUUID(), text: 'Block workout slot', done: false },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: 'Finish invoice draft',
    categoryId: 'work',
    status: 'doing',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    dueDate: Date.now() + 45 * 60 * 1000,
    reminderEnabled: true,
    note: 'Send before lunch if possible.',
    subtasks: [
      { id: crypto.randomUUID(), text: 'Verify billable hours', done: true },
      { id: crypto.randomUUID(), text: 'Attach PDF summary', done: false },
    ],
  },
  {
    id: crypto.randomUUID(),
    title: 'Pay electricity bill',
    categoryId: 'urgent',
    status: 'done',
    timestamp: Date.now() - 28 * 60 * 60 * 1000,
    dueDate: Date.now() - 4 * 60 * 60 * 1000,
    reminderEnabled: true,
    reminderSentAt: Date.now() - 4 * 60 * 60 * 1000,
    note: 'Paid through the banking app.',
    subtasks: [{ id: crypto.randomUUID(), text: 'Save receipt screenshot', done: true }],
  },
]
