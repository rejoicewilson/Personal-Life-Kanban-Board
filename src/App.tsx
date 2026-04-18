import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, Play, Plus, X } from 'lucide-react'

type TabKey = 'todo' | 'doing' | 'done'
type Category = 'work' | 'personal' | 'urgent'

type Task = {
  id: string
  title: string
  category: Category
  status: TabKey
  timestamp: number
}

const STORAGE_KEY = 'mobile-kanban.tasks'

const tabs: Array<{ key: TabKey; label: string; icon: typeof Clipboard }> = [
  { key: 'todo', label: 'To Do', icon: Clipboard },
  { key: 'doing', label: 'Doing', icon: Play },
  { key: 'done', label: 'Done', icon: Check },
]

const categoryStyles: Record<Category, string> = {
  work: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20',
  personal: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20',
  urgent: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20',
}

const starterTasks: Task[] = [
  { id: crypto.randomUUID(), title: 'Review tomorrow schedule', category: 'personal', status: 'todo', timestamp: Date.now() - 2 * 60 * 60 * 1000 },
  { id: crypto.randomUUID(), title: 'Finish invoice draft', category: 'work', status: 'doing', timestamp: Date.now() - 6 * 60 * 60 * 1000 },
  { id: crypto.randomUUID(), title: 'Pay electricity bill', category: 'urgent', status: 'done', timestamp: Date.now() - 28 * 60 * 60 * 1000 },
]

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

type TaskCardProps = {
  task: Task
  onOpen: (taskId: string) => void
  onMove: (taskId: string) => void
  now: number
}

function TaskCard({ task, onOpen, onMove, now }: TaskCardProps) {
  const ageClasses = useMemo(() => getTaskAgeStyles(task.timestamp), [task.timestamp, now])
  const ageLabel = useMemo(() => formatTaskAge(task.timestamp), [task.timestamp, now])

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className={`relative w-full rounded-3xl border bg-slate-950/80 p-4 text-left transition active:scale-[0.99] ${ageClasses}`}
    >
      <span className="absolute right-4 top-4 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-300 ring-1 ring-slate-700">
        {ageLabel}
      </span>

      <div className="flex items-start justify-between gap-3 pr-14">
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium leading-6 text-slate-100">{task.title}</p>
          <span className={`mt-3 inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium capitalize ${categoryStyles[task.category]}`}>
            {task.category}
          </span>
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
      category: (task.category as Category) ?? 'personal',
      status: (task.status as TabKey) ?? 'todo',
      timestamp: typeof task.timestamp === 'number' ? task.timestamp : Date.now(),
    }))
  } catch {
    return starterTasks
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('todo')
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('personal')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 60 * 1000)

    return () => window.clearInterval(timer)
  }, [])

  const visibleTasks = useMemo(() => tasks.filter((task) => task.status === activeTab), [activeTab, tasks])
  const editingTask = useMemo(() => tasks.find((task) => task.id === editingTaskId) ?? null, [editingTaskId, tasks])

  useEffect(() => {
    if (!editingTask) {
      setTitle('')
      setCategory('personal')
      return
    }

    setTitle(editingTask.title)
    setCategory(editingTask.category)
  }, [editingTask])

  function openCreateModal() {
    setEditingTaskId(null)
    setTitle('')
    setCategory('personal')
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
    setCategory('personal')
  }

  function handleSaveTask() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    if (editingTask) {
      setTasks((current) => current.map((task) => (task.id === editingTask.id ? { ...task, title: trimmedTitle, category } : task)))
    } else {
      setTasks((current) => [{ id: crypto.randomUUID(), title: trimmedTitle, category, status: activeTab, timestamp: Date.now() }, ...current])
    }

    closeComposer()
  }

  function handleDeleteTask(taskId: string) {
    setTasks((current) => current.filter((task) => task.id !== taskId))
    closeComposer()
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
                <div className="grid grid-cols-3 gap-2">
                  {(['work', 'personal', 'urgent'] as Category[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={`min-h-12 rounded-2xl px-3 text-sm font-medium capitalize transition ${category === option ? 'bg-slate-100 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
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
