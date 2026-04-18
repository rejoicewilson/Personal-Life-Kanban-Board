import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, Play, Plus, X } from 'lucide-react'

type TabKey = 'todo' | 'doing' | 'done'
type Category = 'work' | 'personal' | 'urgent'

type Task = {
  id: string
  title: string
  category: Category
  status: TabKey
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
  { id: crypto.randomUUID(), title: 'Review tomorrow schedule', category: 'personal', status: 'todo' },
  { id: crypto.randomUUID(), title: 'Finish invoice draft', category: 'work', status: 'doing' },
  { id: crypto.randomUUID(), title: 'Pay electricity bill', category: 'urgent', status: 'done' },
]

function loadTasks(): Task[] {
  if (typeof window === 'undefined') {
    return starterTasks
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return starterTasks
  }

  try {
    const parsed = JSON.parse(stored) as Task[]
    return Array.isArray(parsed) ? parsed : starterTasks
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

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

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
      setTasks((current) => [{ id: crypto.randomUUID(), title: trimmedTitle, category, status: activeTab }, ...current])
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
          return { ...task, status: 'doing' }
        }

        if (task.status === 'doing') {
          return { ...task, status: 'done' }
        }

        return task
      }),
    )
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="shrink-0 px-5 pb-4 pt-6">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Mobile Kanban</p>
        <h1 className="mt-2 text-3xl font-semibold">Daily Flow</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">One column at a time, built for fast mobile task management.</p>
      </header>

      <main className="flex-1 overflow-hidden px-4 pb-24">
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
                <button
                  key={task.id}
                  type="button"
                  onClick={() => openEditModal(task.id)}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
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
                          moveTaskForward(task.id)
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
        className="absolute bottom-24 right-4 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
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
