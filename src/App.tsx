import { useEffect, useMemo, useState } from 'react'
import { Bell, BellRing, Check, Clipboard, Play, Plus, X } from 'lucide-react'

type TabKey = 'todo' | 'doing' | 'done'
type CategoryColor = 'sky' | 'violet' | 'rose' | 'emerald' | 'amber' | 'cyan'

type Category = {
  id: string
  name: string
  color: CategoryColor
}

type Task = {
  id: string
  title: string
  categoryId: string
  status: TabKey
  timestamp: number
  dueDate?: number
  reminderSentAt?: number
  note?: string
  subtasks: Array<{
    id: string
    text: string
    done: boolean
  }>
}

const STORAGE_KEY = 'mobile-kanban.tasks'
const CATEGORY_STORAGE_KEY = 'mobile-kanban.categories'

const tabs: Array<{ key: TabKey; label: string; icon: typeof Clipboard }> = [
  { key: 'todo', label: 'To Do', icon: Clipboard },
  { key: 'doing', label: 'Doing', icon: Play },
  { key: 'done', label: 'Done', icon: Check },
]

const categoryStyles: Record<CategoryColor, string> = {
  sky: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20',
  violet: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20',
  rose: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20',
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20',
  amber: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20',
  cyan: 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20',
}

const defaultCategories: Category[] = [
  { id: 'work', name: 'Work', color: 'sky' },
  { id: 'personal', name: 'Personal', color: 'violet' },
  { id: 'urgent', name: 'Urgent', color: 'rose' },
]

const starterTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Review tomorrow schedule',
    categoryId: 'personal',
    status: 'todo',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    dueDate: Date.now() + 2 * 60 * 60 * 1000,
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
    reminderSentAt: Date.now() - 4 * 60 * 60 * 1000,
    note: 'Paid through the banking app.',
    subtasks: [{ id: crypto.randomUUID(), text: 'Save receipt screenshot', done: true }],
  },
]

function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function loadCategories(): Category[] {
  if (typeof window === 'undefined') {
    return defaultCategories
  }

  const stored = window.localStorage.getItem(CATEGORY_STORAGE_KEY)
  if (!stored) {
    return defaultCategories
  }

  try {
    const parsed = JSON.parse(stored) as Array<Partial<Category>>
    if (!Array.isArray(parsed)) {
      return defaultCategories
    }

    const categories = parsed
      .filter((item) => typeof item === 'object' && item !== null)
      .map((item) => ({
        id: typeof item.id === 'string' && item.id.trim() ? item.id : crypto.randomUUID(),
        name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Custom',
        color:
          typeof item.color === 'string' && item.color in categoryStyles
            ? (item.color as CategoryColor)
            : 'sky',
      }))

    return categories.length > 0 ? categories : defaultCategories
  } catch {
    return defaultCategories
  }
}

export function getTaskAge(timestamp: number) {
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60))
}

function getTaskAgeStyles(timestamp: number) {
  const ageInHours = getTaskAge(timestamp)

  if (ageInHours > 24) {
    return 'border-red-500 ring-1 ring-red-500/30'
  }

  if (ageInHours > 4) {
    return 'border-amber-500 ring-1 ring-amber-500/20'
  }

  return 'border-slate-800'
}

function formatTaskAge(timestamp: number) {
  const ageInHours = getTaskAge(timestamp)

  if (ageInHours >= 24) {
    return `${Math.floor(ageInHours / 24)}d`
  }

  return `${Math.max(0, ageInHours)}h`
}

function formatDueDateInput(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000
  return new Date(timestamp - timezoneOffset).toISOString().slice(0, 16)
}

function parseDueDateInput(value: string) {
  if (!value) {
    return undefined
  }

  const parsed = new Date(value)
  const timestamp = parsed.getTime()
  return Number.isNaN(timestamp) ? undefined : timestamp
}

function formatDueDate(timestamp?: number) {
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

async function sendReminderNotification(task: Task) {
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

function resolveCategory(
  categories: Category[],
  categoryId: string,
): Category {
  return (
    categories.find((category) => category.id === categoryId) ?? {
      id: categoryId,
      name: 'Uncategorized',
      color: 'sky',
    }
  )
}

type TaskCardProps = {
  task: Task
  category: Category
  onOpen: (taskId: string) => void
  onMove: (taskId: string) => void
  now: number
}

function TaskCard({ task, category, onOpen, onMove, now }: TaskCardProps) {
  const ageClasses = useMemo(() => getTaskAgeStyles(task.timestamp), [task.timestamp, now])
  const ageLabel = useMemo(() => formatTaskAge(task.timestamp), [task.timestamp, now])
  const dueLabel = useMemo(() => formatDueDate(task.dueDate), [task.dueDate])
  const overdue = Boolean(task.dueDate && task.status !== 'done' && now >= task.dueDate)
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.done).length

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className={`relative w-full rounded-3xl border bg-slate-950/80 p-4 text-left transition active:scale-[0.99] ${overdue ? 'border-rose-500 ring-1 ring-rose-500/30' : ageClasses}`}
    >
      <span className="absolute right-4 top-4 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-300 ring-1 ring-slate-700">
        {ageLabel}
      </span>

      <div className="flex items-start justify-between gap-3 pr-14">
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium leading-6 text-slate-100">{task.title}</p>
          {task.note ? (
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{task.note}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium ${categoryStyles[category.color]}`}>
              {category.name}
            </span>
            {dueLabel ? (
              <span
                className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium ${
                  overdue
                    ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
                    : 'bg-slate-900 text-slate-300 ring-1 ring-slate-700'
                }`}
              >
                Due {dueLabel}
              </span>
            ) : null}
            {task.subtasks.length > 0 ? (
              <span className="inline-flex min-h-8 items-center rounded-full bg-slate-900 px-3 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
                {completedSubtasks}/{task.subtasks.length} checklist
              </span>
            ) : null}
          </div>
        </div>

        {task.status !== 'done' ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onMove(task.id)
            }}
            className="min-h-11 min-w-11 rounded-full bg-slate-800 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Move
          </button>
        ) : (
          <div className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <Check className="h-5 w-5" />
          </div>
        )}
      </div>
    </button>
  )
}

function loadTasks(): Task[] {
  if (typeof window === 'undefined') {
    return starterTasks
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return starterTasks
  }

  try {
    const parsed = JSON.parse(stored) as Array<Partial<Task>>
    if (!Array.isArray(parsed)) {
      return starterTasks
    }

    return parsed.map((task) => ({
      id: task.id ?? crypto.randomUUID(),
      title: task.title ?? 'Untitled task',
      categoryId:
        typeof task.categoryId === 'string'
          ? task.categoryId
          : typeof (task as { category?: string }).category === 'string'
            ? (task as { category?: string }).category!
            : 'personal',
      status: (task.status as TabKey) ?? 'todo',
      timestamp: typeof task.timestamp === 'number' ? task.timestamp : Date.now(),
      dueDate: typeof task.dueDate === 'number' ? task.dueDate : undefined,
      reminderSentAt:
        typeof task.reminderSentAt === 'number' ? task.reminderSentAt : undefined,
      note: typeof task.note === 'string' ? task.note : undefined,
      subtasks: Array.isArray(task.subtasks)
        ? task.subtasks
            .filter((subtask) => typeof subtask === 'object' && subtask !== null)
            .map((subtask) => ({
              id:
                'id' in subtask && typeof subtask.id === 'string'
                  ? subtask.id
                  : crypto.randomUUID(),
              text:
                'text' in subtask && typeof subtask.text === 'string'
                  ? subtask.text
                  : '',
              done: 'done' in subtask ? Boolean(subtask.done) : false,
            }))
            .filter((subtask) => subtask.text.trim().length > 0)
        : [],
    }))
  } catch {
    return starterTasks
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('todo')
  const [categories, setCategories] = useState<Category[]>(() => loadCategories())
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<string>('personal')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState<CategoryColor>('sky')
  const [dueDateInput, setDueDateInput] = useState('')
  const [note, setNote] = useState('')
  const [subtasks, setSubtasks] = useState<Array<{ id: string; text: string; done: boolean }>>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
  )

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 60 * 1000)

    return () => window.clearInterval(timer)
  }, [])

  const visibleTasks = useMemo(() => tasks.filter((task) => task.status === activeTab), [activeTab, tasks])
  const editingTask = useMemo(() => tasks.find((task) => task.id === editingTaskId) ?? null, [editingTaskId, tasks])

  useEffect(() => {
    if (notificationPermission !== 'granted') {
      return
    }

    const dueTasks = tasks.filter(
      (task) =>
        task.status !== 'done' &&
        typeof task.dueDate === 'number' &&
        task.dueDate <= now &&
        typeof task.reminderSentAt !== 'number',
    )

    if (dueTasks.length === 0) {
      return
    }

    let cancelled = false

    async function notify() {
      for (const task of dueTasks) {
        if (cancelled) {
          return
        }

        await sendReminderNotification(task)
        setTasks((current) =>
          current.map((item) =>
            item.id === task.id ? { ...item, reminderSentAt: Date.now() } : item,
          ),
        )
      }
    }

    void notify()

    return () => {
      cancelled = true
    }
  }, [notificationPermission, now, tasks])

  useEffect(() => {
    if (!editingTask) {
      setTitle('')
      setCategoryId(categories[0]?.id ?? 'personal')
      setNewCategoryName('')
      setNewCategoryColor('sky')
      setDueDateInput('')
      setNote('')
      setSubtasks([])
      setSubtaskInput('')
      return
    }

    setTitle(editingTask.title)
    setCategoryId(editingTask.categoryId)
    setNewCategoryName('')
    setNewCategoryColor('sky')
    setDueDateInput(formatDueDateInput(editingTask.dueDate))
    setNote(editingTask.note ?? '')
    setSubtasks(editingTask.subtasks)
    setSubtaskInput('')
  }, [categories, editingTask])

  function openCreateModal() {
    setEditingTaskId(null)
    setTitle('')
    setCategoryId(categories[0]?.id ?? 'personal')
    setNewCategoryName('')
    setNewCategoryColor('sky')
    setDueDateInput('')
    setNote('')
    setSubtasks([])
    setSubtaskInput('')
    setIsComposerOpen(true)
  }

  function openEditModal(taskId: string) {
    setEditingTaskId(taskId)
    setIsComposerOpen(true)
  }

  function closeComposer() {
    setIsComposerOpen(false)
    setEditingTaskId(null)
    setTitle('')
    setCategoryId(categories[0]?.id ?? 'personal')
    setNewCategoryName('')
    setNewCategoryColor('sky')
    setDueDateInput('')
    setNote('')
    setSubtasks([])
    setSubtaskInput('')
  }

  function createCategory() {
    const trimmedName = newCategoryName.trim()
    if (!trimmedName) {
      return
    }

    const baseId = slugifyCategoryName(trimmedName) || crypto.randomUUID()
    const existingIds = new Set(categories.map((item) => item.id))
    let nextId = baseId
    let counter = 2
    while (existingIds.has(nextId)) {
      nextId = `${baseId}-${counter}`
      counter += 1
    }

    const category: Category = {
      id: nextId,
      name: trimmedName,
      color: newCategoryColor,
    }

    setCategories((current) => [...current, category])
    setCategoryId(category.id)
    setNewCategoryName('')
    setNewCategoryColor('sky')
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      return
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

  function handleSaveTask() {
    const trimmedTitle = title.trim()
    const parsedDueDate = parseDueDateInput(dueDateInput)
    const cleanedNote = note.trim()
    const cleanedSubtasks = subtasks
      .map((subtask) => ({ ...subtask, text: subtask.text.trim() }))
      .filter((subtask) => subtask.text.length > 0)
    if (!trimmedTitle) {
      return
    }

    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: trimmedTitle,
                categoryId,
                dueDate: parsedDueDate,
                note: cleanedNote || undefined,
                subtasks: cleanedSubtasks,
                reminderSentAt:
                  parsedDueDate && parsedDueDate <= Date.now() ? task.reminderSentAt : undefined,
              }
            : task,
        ),
      )
    } else {
      setTasks((current) => [
        {
          id: crypto.randomUUID(),
          title: trimmedTitle,
          categoryId,
          status: activeTab,
          timestamp: Date.now(),
          dueDate: parsedDueDate,
          note: cleanedNote || undefined,
          subtasks: cleanedSubtasks,
        },
        ...current,
      ])
    }

    closeComposer()
  }

  function handleDeleteTask(taskId: string) {
    setTasks((current) => current.filter((task) => task.id !== taskId))
    closeComposer()
  }

  function addSubtask() {
    const trimmed = subtaskInput.trim()
    if (!trimmed) {
      return
    }

    setSubtasks((current) => [
      ...current,
      { id: crypto.randomUUID(), text: trimmed, done: false },
    ])
    setSubtaskInput('')
  }

  function toggleSubtask(id: string) {
    setSubtasks((current) =>
      current.map((subtask) =>
        subtask.id === id ? { ...subtask, done: !subtask.done } : subtask,
      ),
    )
  }

  function removeSubtask(id: string) {
    setSubtasks((current) => current.filter((subtask) => subtask.id !== id))
  }

  function moveTaskForward(taskId: string) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        if (task.status === 'todo') {
          return { ...task, status: 'doing', timestamp: Date.now() }
        }

        if (task.status === 'doing') {
          return { ...task, status: 'done', timestamp: Date.now() }
        }

        return task
      }),
    )
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="shrink-0 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Mobile Kanban</p>
        <h1 className="mt-2 text-3xl font-semibold">Daily Flow</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">One column at a time, built for fast mobile task management.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {notificationPermission === 'granted' ? (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-500/15 px-4 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/20">
              <BellRing className="h-4 w-4" />
              Reminders on
            </span>
          ) : notificationPermission === 'unsupported' ? (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-medium text-slate-400 ring-1 ring-slate-700">
              <Bell className="h-4 w-4" />
              Notifications unavailable
            </span>
          ) : (
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-medium text-slate-100 ring-1 ring-slate-700"
            >
              <Bell className="h-4 w-4" />
              Enable reminders
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
        <section className="flex h-full flex-col rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              <p className="text-sm text-slate-400">{visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={resolveCategory(categories, task.categoryId)}
                  now={now}
                  onOpen={openEditModal}
                  onMove={moveTaskForward}
                />
              ))
            ) : (
              <div className="flex h-full min-h-56 items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/50 px-6 text-center text-sm leading-6 text-slate-500">
                No tasks here yet. Tap the + button to add one.
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="shrink-0 border-t border-slate-800 bg-slate-950/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = tab.key === activeTab

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-medium transition ${active ? 'bg-slate-100 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <button
        type="button"
        onClick={openCreateModal}
        className="absolute bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
      >
        <Plus className="h-6 w-6" />
      </button>

      {isComposerOpen ? (
        <div className="absolute inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-[32px] border border-slate-800 bg-slate-900 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                <p className="mt-1 text-sm text-slate-400">Simple and touch-friendly.</p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter task title"
                  className="min-h-12 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setCategoryId(option.id)}
                      className={`min-h-12 rounded-2xl px-3 text-sm font-medium transition ${
                        categoryId === option.id ? 'bg-slate-100 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs ${categoryStyles[option.color]}`}>
                        {option.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    New category
                  </p>
                  <div className="space-y-3">
                    <input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Category name"
                      className="min-h-12 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {(['sky', 'violet', 'rose', 'emerald', 'amber', 'cyan'] as CategoryColor[]).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={`min-h-11 rounded-2xl px-3 text-xs font-medium capitalize transition ${
                            newCategoryColor === color ? 'ring-2 ring-slate-100' : 'ring-1 ring-slate-800'
                          } ${categoryStyles[color]}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={createCategory}
                      className="min-h-11 w-full rounded-2xl bg-slate-800 px-4 text-sm font-medium text-slate-100"
                    >
                      Add category
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Due date</label>
                <input
                  type="datetime-local"
                  value={dueDateInput}
                  onChange={(event) => setDueDateInput(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Notes</label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a short note"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Checklist</label>
                <div className="flex gap-2">
                  <input
                    value={subtaskInput}
                    onChange={(event) => setSubtaskInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addSubtask()
                      }
                    }}
                    placeholder="Add a subtask"
                    className="min-h-12 flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="min-h-12 rounded-2xl bg-slate-800 px-4 text-sm font-medium text-slate-100"
                  >
                    Add
                  </button>
                </div>

                {subtasks.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 rounded-2xl bg-slate-950 px-3 py-3 ring-1 ring-slate-800"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSubtask(subtask.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            subtask.done
                              ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                              : 'border-slate-600 text-slate-500'
                          }`}
                        >
                          {subtask.done ? <Check className="h-4 w-4" /> : null}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            subtask.done ? 'text-slate-500 line-through' : 'text-slate-200'
                          }`}
                        >
                          {subtask.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubtask(subtask.id)}
                          className="rounded-full px-2 py-1 text-xs font-medium text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3 pt-2">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="min-h-12 flex-1 rounded-2xl bg-rose-500/15 px-4 text-base font-medium text-rose-300"
                  >
                    Delete
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSaveTask}
                  className="min-h-12 flex-1 rounded-2xl bg-sky-500 px-4 text-base font-semibold text-slate-950"
                >
                  {editingTask ? 'Save' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
