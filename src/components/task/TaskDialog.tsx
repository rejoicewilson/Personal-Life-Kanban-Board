import { useMemo } from 'react'
import { TaskForm } from '@/components/task/TaskForm'
import type { TaskFormValues } from '@/components/task/taskSchema'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTaskStore } from '@/store/taskStore'
import type { TaskStatus } from '@/types/task'
import { formatDate, getCategoryLabel, getCategoryVariant, getPriorityLabel, getPriorityVariant, getStatusLabel } from '@/utils/task'

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string | null
  initialStatus?: TaskStatus
}

function normalize(values: TaskFormValues) {
  return {
    ...values,
    description: values.description || undefined,
    dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
  }
}

export function TaskDialog({ open, onOpenChange, taskId, initialStatus = 'backlog' }: TaskDialogProps) {
  const tasks = useTaskStore((state) => state.tasks)
  const createTask = useTaskStore((state) => state.createTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)

  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 right-0 top-auto max-h-[88vh] w-full translate-x-0 translate-y-0 rounded-b-none rounded-t-[28px] border-x-0 border-b-0 px-4 pb-6 pt-5 md:left-1/2 md:right-auto md:top-1/2 md:max-h-[90vh] md:w-[calc(100%-2rem)] md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:border md:px-6 md:pt-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? task.title : 'Add a new task'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Review the task details, update the plan, or change its workflow stage.'
              : 'Capture a task and place it where it belongs in your life system.'}
          </DialogDescription>
        </DialogHeader>

        {task ? (
          <div className="flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-4">
            <Badge variant={getCategoryVariant(task.category)}>{getCategoryLabel(task.category)}</Badge>
            <Badge variant={getPriorityVariant(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
            <Badge variant="outline">{getStatusLabel(task.status)}</Badge>
            <Badge variant="outline">Created {formatDate(task.createdAt)}</Badge>
            <Badge variant="outline">Due {formatDate(task.dueDate)}</Badge>
          </div>
        ) : null}

        <TaskForm
          task={task}
          initialStatus={initialStatus}
          onSubmit={(values) => {
            if (task) {
              updateTask(task.id, normalize(values))
            } else {
              createTask(normalize(values))
            }
            onOpenChange(false)
          }}
          onDelete={task ? () => {
            deleteTask(task.id)
            onOpenChange(false)
          } : undefined}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
