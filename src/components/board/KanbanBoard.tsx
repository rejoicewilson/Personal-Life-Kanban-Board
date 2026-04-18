import { useMemo, useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { BoardColumn } from '@/components/board/BoardColumn'
import { BoardTaskCard } from '@/components/board/BoardTaskCard'
import { TaskDialog } from '@/components/task/TaskDialog'
import { useTaskStore } from '@/store/taskStore'
import type { Task, TaskStatus } from '@/types/task'
import { columnOrder } from '@/utils/constants'

type KanbanBoardProps = {
  defaultStatus?: TaskStatus
}

export function KanbanBoard({ defaultStatus = 'backlog' }: KanbanBoardProps) {
  const tasks = useTaskStore((state) => state.tasks)
  const query = useTaskStore((state) => state.query)
  const focusMode = useTaskStore((state) => state.focusMode)
  const moveTask = useTaskStore((state) => state.moveTask)
  const moveTaskToColumn = useTaskStore((state) => state.moveTaskToColumn)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [draftStatus, setDraftStatus] = useState<TaskStatus>(defaultStatus)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const normalizedQuery = query.trim().toLowerCase()
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          task.title.toLowerCase().includes(normalizedQuery) ||
          task.description?.toLowerCase().includes(normalizedQuery)

        if (!matchesQuery) {
          return false
        }

        if (!focusMode) {
          return true
        }

        return task.status === 'today' || task.status === 'in_progress'
      }),
    [focusMode, normalizedQuery, tasks],
  )

  const tasksByStatus = useMemo(
    () =>
      columnOrder.reduce<Record<TaskStatus, Task[]>>((acc, status) => {
        acc[status] = filteredTasks.filter((task) => task.status === status)
        return acc
      }, {} as Record<TaskStatus, Task[]>),
    [filteredTasks],
  )

  function openNewTask(status: TaskStatus) {
    setDraftStatus(status)
    setNewTaskOpen(true)
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined
    if (task) {
      setActiveTask(task)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over || active.id === over.id) {
      return
    }

    const activeTaskData = active.data.current?.task as Task | undefined
    const overStatus = (over.data.current?.status as TaskStatus | undefined) ?? activeTaskData?.status

    if (!activeTaskData || !overStatus) {
      return
    }

    if (over.data.current?.type === 'column') {
      moveTaskToColumn(activeTaskData.id, overStatus)
      return
    }

    moveTask(activeTaskData.id, over.id.toString(), overStatus)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="grid gap-4 xl:grid-cols-5">
          {columnOrder
            .filter((status) => !focusMode || status === 'today' || status === 'in_progress')
            .map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onAddTask={openNewTask}
                onSelectTask={setEditingTaskId}
              />
            ))}
        </div>

        <DragOverlay>{activeTask ? <BoardTaskCard task={activeTask} overlay /> : null}</DragOverlay>
      </DndContext>

      <TaskDialog open={editingTaskId !== null} onOpenChange={(open) => !open && setEditingTaskId(null)} taskId={editingTaskId} />
      <TaskDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} initialStatus={draftStatus} />
    </>
  )
}
