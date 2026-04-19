import { defaultCategories, starterTasks, type Category, type CategoryColor, type Subtask, type Task, type TabKey } from '@/types/kanban'
import { ensureSupabaseSession, supabase } from '@/lib/supabase'

type CategoryRow = {
  id: string
  name: string
  color: CategoryColor
}

type TaskRow = {
  id: string
  title: string
  category_id: string
  status: TabKey
  timestamp: number
  due_date: number | null
  reminder_enabled: boolean
  reminder_sent_at: number | null
  note: string | null
  subtasks: Subtask[] | null
}

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  }
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    status: row.status,
    timestamp: row.timestamp,
    dueDate: typeof row.due_date === 'number' ? row.due_date : undefined,
    reminderEnabled: row.reminder_enabled,
    reminderSentAt: typeof row.reminder_sent_at === 'number' ? row.reminder_sent_at : undefined,
    note: row.note ?? undefined,
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
  }
}

function fromCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
  }
}

function fromTask(task: Task) {
  return {
    id: task.id,
    title: task.title,
    category_id: task.categoryId,
    status: task.status,
    timestamp: task.timestamp,
    due_date: task.dueDate ?? null,
    reminder_enabled: Boolean(task.reminderEnabled),
    reminder_sent_at: task.reminderSentAt ?? null,
    note: task.note ?? null,
    subtasks: task.subtasks,
  }
}

async function seedBoard() {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  const { error: categoryError } = await supabase.from('categories').upsert(defaultCategories.map(fromCategory))
  if (categoryError) {
    throw categoryError
  }

  const { error: taskError } = await supabase.from('tasks').upsert(starterTasks.map(fromTask))
  if (taskError) {
    throw taskError
  }

  return {
    categories: defaultCategories,
    tasks: starterTasks,
  }
}

export async function fetchBoardData() {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  await ensureSupabaseSession()

  const [{ data: categoryRows, error: categoryError }, { data: taskRows, error: taskError }] = await Promise.all([
    supabase.from('categories').select('id, name, color').order('name', { ascending: true }),
    supabase.from('tasks').select('id, title, category_id, status, timestamp, due_date, reminder_enabled, reminder_sent_at, note, subtasks').order('timestamp', { ascending: false }),
  ])

  if (categoryError) {
    throw categoryError
  }

  if (taskError) {
    throw taskError
  }

  const categories = (categoryRows ?? []).map(toCategory)
  const tasks = (taskRows ?? []).map(toTask)

  if (categories.length === 0 && tasks.length === 0) {
    return seedBoard()
  }

  return {
    categories: categories.length > 0 ? categories : defaultCategories,
    tasks,
  }
}

export async function saveTask(task: Task) {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  await ensureSupabaseSession()
  const { error } = await supabase.from('tasks').upsert(fromTask(task))
  if (error) {
    throw error
  }
}

export async function saveTasks(tasks: Task[]) {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  if (tasks.length === 0) {
    return
  }

  await ensureSupabaseSession()
  const { error } = await supabase.from('tasks').upsert(tasks.map(fromTask))
  if (error) {
    throw error
  }
}

export async function deleteTaskById(taskId: string) {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  await ensureSupabaseSession()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) {
    throw error
  }
}

export async function saveCategory(category: Category) {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  await ensureSupabaseSession()
  const { error } = await supabase.from('categories').upsert(fromCategory(category))
  if (error) {
    throw error
  }
}

export async function deleteCategoryById(categoryId: string) {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  await ensureSupabaseSession()
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) {
    throw error
  }
}
