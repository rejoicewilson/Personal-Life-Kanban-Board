import { create } from 'zustand'
import type { Task, TaskInput, TaskStatus } from '@/types/task'
import { loadTasks, loadTheme, saveTasks, saveTheme } from '@/utils/storage'
import { columnOrder } from '@/utils/constants'

type Theme = 'light' | 'dark'

type TaskStore = {
  tasks: Task[]
  theme: Theme
  query: string
  focusMode: boolean
  setQuery: (query: string) => void
  createTask: (input: TaskInput) => void
  updateTask: (id: string, input: TaskInput) => void
  deleteTask: (id: string) => void
  moveTask: (activeId: string, overId: string, overStatus: TaskStatus) => void
  moveTaskToColumn: (taskId: string, status: TaskStatus) => void
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  toggleFocusMode: () => void
}

function insertTask(tasks: Task[], activeId: string, overId: string, overStatus: TaskStatus) {
  const next = [...tasks]
  const activeIndex = next.findIndex((task) => task.id === activeId)
  if (activeIndex === -1) {
    return tasks
  }

  const [activeTask] = next.splice(activeIndex, 1)
  activeTask.status = overStatus

  const overIndex = next.findIndex((task) => task.id === overId)
  if (overIndex >= 0) {
    next.splice(overIndex, 0, activeTask)
    return next
  }

  const lastInColumn = next.map((task) => task.status).lastIndexOf(overStatus)
  if (lastInColumn >= 0) {
    next.splice(lastInColumn + 1, 0, activeTask)
    return next
  }

  const nextColumnIndex = columnOrder
    .slice(columnOrder.indexOf(overStatus) + 1)
    .map((status) => next.findIndex((task) => task.status === status))
    .find((index) => index >= 0)

  next.splice(nextColumnIndex ?? next.length, 0, activeTask)
  return next
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: loadTasks(),
  theme: loadTheme(),
  query: '',
  focusMode: false,
  setQuery: (query) => set({ query }),
  createTask: (input) =>
    set((state) => {
      const tasks = [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...input }, ...state.tasks]
      saveTasks(tasks)
      return { tasks }
    }),
  updateTask: (id, input) =>
    set((state) => {
      const tasks = state.tasks.map((task) => (task.id === id ? { ...task, ...input } : task))
      saveTasks(tasks)
      return { tasks }
    }),
  deleteTask: (id) =>
    set((state) => {
      const tasks = state.tasks.filter((task) => task.id !== id)
      saveTasks(tasks)
      return { tasks }
    }),
  moveTask: (activeId, overId, overStatus) =>
    set((state) => {
      const tasks = insertTask(state.tasks, activeId, overId, overStatus)
      saveTasks(tasks)
      return { tasks }
    }),
  moveTaskToColumn: (taskId, status) =>
    set((state) => {
      const tasks = state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
      saveTasks(tasks)
      return { tasks }
    }),
  toggleTheme: () =>
    set((state) => {
      const theme: Theme = state.theme === 'dark' ? 'light' : 'dark'
      saveTheme(theme)
      return { theme }
    }),
  setTheme: (theme) => {
    saveTheme(theme)
    set({ theme })
  },
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
}))
