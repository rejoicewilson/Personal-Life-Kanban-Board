import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronRight,
  Clipboard,
  ListChecks,
  Palette,
  Play,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import {
  deleteCategoryById,
  deleteTaskById,
  fetchBoardData,
  saveCategory,
  saveTask,
  saveTasks,
} from '@/lib/kanban-data'
import {
  formatDueDate,
  formatDueDateInput,
  formatTaskAge,
  getTaskAgeStyles,
  parseDueDateInput,
  resolveCategory,
  sendReminderNotification,
  slugifyCategoryName,
} from '@/lib/kanban-helpers'
import { ensurePushSubscription, isPushConfigured, isPushSupported } from '@/lib/push'
import { isSupabaseConfigured } from '@/lib/supabase'
import { defaultCategories, type Category, type CategoryColor, type Task, type TabKey } from '@/types/kanban'

type TaskCardProps = {
  task: Task
  category: Category
  onOpen: (taskId: string) => void
  onMove: (taskId: string) => void
  now: number
}

const tabs: Array<{ key: TabKey; label: string; icon: typeof Clipboard }> = [
  { key: 'todo', label: 'To Do', icon: Clipboard },
  { key: 'doing', label: 'Doing', icon: Play },
  { key: 'done', label: 'Done', icon: Check },
]

const categoryStyles: Record<CategoryColor, string> = {
  sky: 'bg-sky-400/12 text-sky-100 ring-1 ring-sky-300/20',
  violet: 'bg-fuchsia-400/14 text-fuchsia-100 ring-1 ring-fuchsia-300/25',
  rose: 'bg-rose-400/14 text-rose-100 ring-1 ring-rose-300/25',
  emerald: 'bg-emerald-400/12 text-emerald-100 ring-1 ring-emerald-300/20',
  amber: 'bg-amber-300/14 text-amber-50 ring-1 ring-amber-200/25',
  cyan: 'bg-cyan-300/14 text-cyan-50 ring-1 ring-cyan-200/20',
}

const categoryPickerStyles: Record<CategoryColor, string> = {
  sky: 'bg-sky-950/80 text-sky-100 ring-sky-300/30',
  violet: 'bg-fuchsia-950/85 text-fuchsia-50 ring-fuchsia-300/35',
  rose: 'bg-rose-950/80 text-rose-100 ring-rose-300/30',
  emerald: 'bg-emerald-950/80 text-emerald-100 ring-emerald-300/30',
  amber: 'bg-amber-950/80 text-amber-100 ring-amber-300/30',
  cyan: 'bg-cyan-950/80 text-cyan-100 ring-cyan-300/30',
}

const categorySelectionStyles: Record<CategoryColor, string> = {
  sky: 'border-sky-300/30 bg-sky-400/10 text-sky-50 shadow-[0_12px_28px_-18px_rgba(56,189,248,0.75)]',
  violet: 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-50 shadow-[0_12px_28px_-18px_rgba(232,121,249,0.75)]',
  rose: 'border-rose-300/30 bg-rose-400/10 text-rose-50 shadow-[0_12px_28px_-18px_rgba(251,113,133,0.7)]',
  emerald: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-50 shadow-[0_12px_28px_-18px_rgba(52,211,153,0.75)]',
  amber: 'border-amber-300/30 bg-amber-300/10 text-amber-50 shadow-[0_12px_28px_-18px_rgba(252,211,77,0.7)]',
  cyan: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-50 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.75)]',
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
      className={`relative w-full overflow-hidden rounded-[28px] border bg-slate-950/80 p-4 text-left shadow-[0_14px_40px_-24px_rgba(8,145,178,0.45)] transition active:scale-[0.99] ${overdue ? 'border-rose-500 ring-1 ring-rose-500/30' : ageClasses}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/0 via-cyan-300/60 to-fuchsia-400/0" />
      <span className="absolute right-4 top-4 rounded-full bg-slate-900/95 px-2.5 py-1 text-[11px] font-semibold text-slate-200 ring-1 ring-white/10">
        {ageLabel}
      </span>

      <div className="flex items-start justify-between gap-3 pr-14">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-6 text-white">{task.title}</p>
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
                    ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30'
                    : 'bg-slate-900/90 text-slate-300 ring-1 ring-white/10'
                }`}
              >
                Due {dueLabel}
              </span>
            ) : null}
            {task.subtasks.length > 0 ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-slate-900/90 px-3 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                <ListChecks className="h-3.5 w-3.5" />
                {completedSubtasks}/{task.subtasks.length} checklist
              </span>
            ) : null}
            {task.reminderEnabled && task.dueDate ? (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-cyan-400/12 px-3 text-xs font-medium text-cyan-100 ring-1 ring-cyan-300/15">
                <Bell className="h-3.5 w-3.5" />
                Reminder
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
            className="inline-flex min-h-11 min-w-11 items-center gap-1 rounded-full bg-white/8 px-4 text-sm font-medium text-slate-100 ring-1 ring-white/10 transition hover:bg-white/12"
          >
            Move
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-300/20">
            <CheckCheck className="h-5 w-5" />
          </div>
        )}
      </div>
    </button>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return fallback
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('todo')
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<string>(defaultCategories[0]?.id ?? 'personal')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState<CategoryColor>('sky')
  const [dueDateInput, setDueDateInput] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderStatus, setReminderStatus] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [subtasks, setSubtasks] = useState<Task['subtasks']>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
  )
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      setSyncError('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    let cancelled = false

    async function load() {
      try {
        const data = await fetchBoardData()
        if (cancelled) {
          return
        }

        setCategories(data.categories)
        setTasks(data.tasks)
        setSupabaseUserId(data.userId)
        setCategoryId(data.categories[0]?.id ?? defaultCategories[0]?.id ?? 'personal')
        setSyncError(null)
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setSyncError('Could not load your Supabase board. Check your schema, env vars, and anonymous auth settings.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

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
        task.reminderEnabled === true &&
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
        const updatedTask = { ...task, reminderSentAt: Date.now() }
        setTasks((current) => current.map((item) => (item.id === task.id ? updatedTask : item)))
        try {
          await saveTask(updatedTask)
          setSyncError(null)
        } catch (error) {
          console.error(error)
          setSyncError('A reminder fired, but the reminder state did not sync to Supabase.')
        }
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
      setCategoryId(categories[0]?.id ?? defaultCategories[0]?.id ?? 'personal')
      setNewCategoryName('')
      setNewCategoryColor('sky')
      setDueDateInput('')
      setReminderEnabled(false)
      setReminderStatus(null)
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
    setReminderEnabled(Boolean(editingTask.reminderEnabled && editingTask.dueDate))
    setReminderStatus(null)
    setNote(editingTask.note ?? '')
    setSubtasks(editingTask.subtasks)
    setSubtaskInput('')
  }, [categories, editingTask])

  function openCreateModal() {
    setEditingTaskId(null)
    setTitle('')
    setCategoryId(categories[0]?.id ?? defaultCategories[0]?.id ?? 'personal')
    setNewCategoryName('')
    setNewCategoryColor('sky')
    setDueDateInput('')
    setReminderEnabled(false)
    setReminderStatus(null)
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
    setCategoryId(categories[0]?.id ?? defaultCategories[0]?.id ?? 'personal')
    setNewCategoryName('')
    setNewCategoryColor('sky')
    setDueDateInput('')
    setReminderEnabled(false)
    setReminderStatus(null)
    setNote('')
    setSubtasks([])
    setSubtaskInput('')
  }

  async function syncOperation(operation: () => Promise<void>, message: string) {
    try {
      await operation()
      setSyncError(null)
    } catch (error) {
      console.error(error)
      setSyncError(message)
    }
  }

  function createCategory() {
    const trimmedName = newCategoryName.trim()
    if (!trimmedName || !supabaseUserId) {
      return
    }

    const baseId = `${supabaseUserId}:${slugifyCategoryName(trimmedName) || crypto.randomUUID()}`
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
    void syncOperation(() => saveCategory(category), 'Could not save the new category to Supabase.')
  }

  function deleteCategory(categoryToDeleteId: string) {
    if (categories.length <= 1) {
      return
    }

    const fallbackCategoryId =
      categories.find((item) => item.id !== categoryToDeleteId)?.id ?? defaultCategories[0]?.id ?? 'personal'
    const affectedTasks = tasks
      .filter((task) => task.categoryId === categoryToDeleteId)
      .map((task) => ({ ...task, categoryId: fallbackCategoryId }))

    setCategories((current) => current.filter((item) => item.id !== categoryToDeleteId))
    setTasks((current) =>
      current.map((task) =>
        task.categoryId === categoryToDeleteId ? { ...task, categoryId: fallbackCategoryId } : task,
      ),
    )

    if (categoryId === categoryToDeleteId) {
      setCategoryId(fallbackCategoryId)
    }

    void syncOperation(async () => {
      await saveTasks(affectedTasks)
      await deleteCategoryById(categoryToDeleteId)
    }, 'Could not delete the category in Supabase.')
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      return 'unsupported' as const
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission
  }

  async function handleReminderToggle() {
    if (reminderEnabled) {
      setReminderEnabled(false)
      setReminderStatus('Backend reminder disabled for this task.')
      return
    }

    if (!dueDateInput) {
      setReminderStatus('Add a due date first.')
      return
    }

    let permission = notificationPermission

    if (permission === 'default') {
      permission = await requestNotificationPermission()
    }

    if (permission === 'granted') {
      if (!isPushSupported) {
        const message = 'Push notifications are not supported on this device/browser.'
        setSyncError(message)
        setReminderStatus(message)
        return
      }

      if (!isPushConfigured) {
        const message = 'VITE_VAPID_PUBLIC_KEY is missing. Add it to your env and restart the app.'
        setSyncError(message)
        setReminderStatus(message)
        return
      }

      try {
        await ensurePushSubscription()
        setReminderEnabled(true)
        setReminderStatus('This device is registered for backend push reminders.')
        setSyncError(null)
      } catch (error) {
        console.error(error)
        const message = getErrorMessage(error, 'Could not register this device for push reminders.')
        setSyncError(message)
        setReminderStatus(message)
      }
      return
    }

    if (permission === 'denied') {
      setReminderStatus('Notification permission is blocked in the browser. Enable notifications for this site and try again.')
      return
    }

    setReminderStatus('Notification permission was not granted.')
  }

  async function handleSaveTask() {
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
      const updatedTask: Task = {
        ...editingTask,
        title: trimmedTitle,
        categoryId,
        dueDate: parsedDueDate,
        reminderEnabled: parsedDueDate ? reminderEnabled : false,
        note: cleanedNote || undefined,
        subtasks: cleanedSubtasks,
        reminderSentAt:
          parsedDueDate && reminderEnabled && parsedDueDate <= Date.now()
            ? editingTask.reminderSentAt
            : undefined,
      }

      setTasks((current) => current.map((task) => (task.id === editingTask.id ? updatedTask : task)))
      void syncOperation(() => saveTask(updatedTask), 'Could not save the task changes to Supabase.')
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        categoryId,
        status: activeTab,
        timestamp: Date.now(),
        dueDate: parsedDueDate,
        reminderEnabled: parsedDueDate ? reminderEnabled : false,
        note: cleanedNote || undefined,
        subtasks: cleanedSubtasks,
      }

      setTasks((current) => [newTask, ...current])
      void syncOperation(() => saveTask(newTask), 'Could not create the task in Supabase.')
    }

    closeComposer()
  }

  function handleDeleteTask(taskId: string) {
    setTasks((current) => current.filter((task) => task.id !== taskId))
    closeComposer()
    void syncOperation(() => deleteTaskById(taskId), 'Could not delete the task from Supabase.')
  }

  function addSubtask() {
    const trimmed = subtaskInput.trim()
    if (!trimmed) {
      return
    }

    setSubtasks((current) => [...current, { id: crypto.randomUUID(), text: trimmed, done: false }])
    setSubtaskInput('')
  }

  function toggleSubtask(id: string) {
    setSubtasks((current) =>
      current.map((subtask) => (subtask.id === id ? { ...subtask, done: !subtask.done } : subtask)),
    )
  }

  function removeSubtask(id: string) {
    setSubtasks((current) => current.filter((subtask) => subtask.id !== id))
  }

  function moveTaskForward(taskId: string) {
    const currentTask = tasks.find((task) => task.id === taskId)
    if (!currentTask) {
      return
    }

    const updatedTask: Task =
      currentTask.status === 'todo'
        ? { ...currentTask, status: 'doing', timestamp: Date.now() }
        : currentTask.status === 'doing'
          ? { ...currentTask, status: 'done', timestamp: Date.now() }
          : currentTask

    if (updatedTask === currentTask) {
      return
    }

    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
    void syncOperation(() => saveTask(updatedTask), 'Could not move the task in Supabase.')
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,_#07111f_0%,_#020617_48%,_#020617_100%)] text-slate-100">
      <main className="flex-1 overflow-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
        <section className="flex h-full flex-col rounded-[32px] border border-white/10 bg-slate-900/65 p-4 shadow-[0_24px_80px_-36px_rgba(8,145,178,0.55)] backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100/75 ring-1 ring-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Personal Flow
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              <p className="mt-1 text-sm text-slate-400">{visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'} in this lane</p>
            </div>
            <div className="rounded-2xl bg-white/5 px-3 py-2 text-right ring-1 ring-white/10">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Queue</p>
              <p className="text-lg font-semibold text-white">{visibleTasks.length}</p>
            </div>
          </div>

          {syncError ? (
            <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              {syncError}
            </div>
          ) : null}

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex h-full min-h-56 items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/45 px-6 text-center text-sm leading-6 text-slate-400">
                Loading your Supabase board...
              </div>
            ) : visibleTasks.length > 0 ? (
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
              <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/45 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-300/15">
                  <Clipboard className="h-6 w-6" />
                </div>
                <p className="mt-4 text-base font-medium text-slate-200">No tasks here yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Tap the floating + button to create your first task in this lane.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="shrink-0 border-t border-white/10 bg-slate-950/80 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = tab.key === activeTab

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[22px] px-3 text-xs font-medium transition ${
                  active
                    ? 'bg-gradient-to-br from-cyan-300 to-sky-400 text-slate-950 shadow-[0_12px_30px_-12px_rgba(56,189,248,0.8)]'
                    : 'bg-white/5 text-slate-400 ring-1 ring-white/10'
                }`}
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
        className="absolute bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 flex min-h-14 min-w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-300 via-sky-400 to-fuchsia-400 text-slate-950 shadow-[0_18px_38px_-14px_rgba(56,189,248,0.75)] transition hover:brightness-105"
      >
        <Plus className="h-6 w-6" />
      </button>

      {isComposerOpen ? (
        <div className="absolute inset-0 z-50 flex items-end bg-black/60">
          <div className="flex max-h-[88dvh] w-full flex-col rounded-t-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_-24px_80px_-30px_rgba(8,145,178,0.55)]">
            <div className="flex items-center justify-between px-5 pb-4 pt-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 ring-1 ring-white/10">
                  <Sparkles className="h-3.5 w-3.5" />
                  Composer
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                <p className="mt-1 text-sm text-slate-400">Fast input, clear choices, one-thumb friendly.</p>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/6 text-slate-300 ring-1 ring-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter task title"
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((option) => (
                    <div
                      key={option.id}
                      className={`flex min-h-14 items-center gap-2 rounded-2xl border px-3 transition ${
                        categoryId === option.id
                          ? categorySelectionStyles[option.color]
                          : 'border-white/10 bg-slate-950/60 text-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCategoryId(option.id)}
                        className="flex min-h-14 flex-1 items-center gap-3"
                      >
                        <span className={`h-3 w-3 rounded-full ${option.color === 'sky' ? 'bg-sky-300' : option.color === 'violet' ? 'bg-fuchsia-300' : option.color === 'rose' ? 'bg-rose-300' : option.color === 'emerald' ? 'bg-emerald-300' : option.color === 'amber' ? 'bg-amber-300' : 'bg-cyan-300'}`} />
                        <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs ${categoryStyles[option.color]}`}>
                          {option.name}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteCategory(option.id)
                        }}
                        disabled={categories.length <= 1}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-40 ${
                          categoryId === option.id ? 'text-white/75 hover:bg-white/10' : 'text-slate-400 hover:bg-white/5'
                        }`}
                        aria-label={`Delete ${option.name} category`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/65 p-3">
                  <p className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    <Palette className="h-3.5 w-3.5" />
                    New category
                  </p>
                  <div className="space-y-3">
                    <input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Category name"
                      className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {(['sky', 'violet', 'rose', 'emerald', 'amber', 'cyan'] as CategoryColor[]).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={`min-h-11 rounded-2xl px-3 text-xs font-medium capitalize transition ${
                            newCategoryColor === color
                              ? `ring-2 ring-white shadow-[0_10px_20px_-14px_rgba(255,255,255,0.85)] ${categoryPickerStyles[color]}`
                              : `ring-1 ${categoryPickerStyles[color]}`
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={createCategory}
                      className="min-h-11 w-full rounded-2xl bg-white/7 px-4 text-sm font-medium text-white ring-1 ring-white/10"
                    >
                      Add category
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                  <CalendarClock className="h-4 w-4 text-cyan-200" />
                  Due date
                </label>
                <input
                  type="datetime-local"
                  value={dueDateInput}
                  onChange={(event) => {
                    const value = event.target.value
                    setDueDateInput(value)
                    if (!value) {
                      setReminderEnabled(false)
                    }
                  }}
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-base text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleReminderToggle()
                  }}
                  disabled={!dueDateInput}
                  className={`mt-3 flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-medium transition ${
                    reminderEnabled
                      ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_10px_25px_-18px_rgba(34,211,238,0.85)]'
                      : 'border-white/10 bg-slate-950/70 text-slate-300'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Set reminder for this task
                  </span>
                  <span
                    className={`inline-flex h-6 w-11 items-center rounded-full px-1 transition ${
                      reminderEnabled ? 'bg-cyan-300/25 justify-end' : 'bg-white/8 justify-start'
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white" />
                  </span>
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  Add a due date first. Reminders work only while the app is open or installed.
                </p>
                {reminderStatus ? (
                  <p className="mt-2 rounded-2xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                    {reminderStatus}
                  </p>
                ) : null}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Notes</label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a short note"
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <label className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ListChecks className="h-4 w-4 text-cyan-200" />
                  Checklist
                </label>
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
                    className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="min-h-12 rounded-2xl bg-white/8 px-4 text-sm font-medium text-white ring-1 ring-white/10"
                  >
                    Add
                  </button>
                </div>

                {subtasks.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 rounded-2xl bg-slate-950/70 px-3 py-3 ring-1 ring-white/10"
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
                          className="rounded-full px-2 py-1 text-xs font-medium text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-white/10 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4">
              <div className="flex gap-3">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="min-h-12 flex-1 rounded-2xl bg-rose-400/12 px-4 text-base font-medium text-rose-100 ring-1 ring-rose-300/15"
                  >
                    Delete
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    void handleSaveTask()
                  }}
                  className="min-h-12 flex-1 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 px-4 text-base font-semibold text-slate-950 shadow-[0_18px_36px_-18px_rgba(56,189,248,0.8)]"
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
