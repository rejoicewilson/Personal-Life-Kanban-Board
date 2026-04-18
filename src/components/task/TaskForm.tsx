import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categoryLabels, columnLabels, priorityLabels } from '@/utils/constants'
import type { Task } from '@/types/task'
import { taskSchema, type TaskFormValues } from '@/components/task/taskSchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const emptyValues: TaskFormValues = {
  title: '',
  status: 'backlog',
  category: 'personal',
  priority: 'medium',
}

type TaskFormProps = {
  task?: Task
  initialStatus?: TaskFormValues['status']
  onSubmit: (values: TaskFormValues) => void
  onDelete?: () => void
  onCancel?: () => void
}

export function TaskForm({ task, initialStatus = 'backlog', onSubmit, onDelete, onCancel }: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          status: task.status,
          category: task.category,
          priority: task.priority,
        }
      : { ...emptyValues, status: initialStatus },
  })

  useEffect(() => {
    form.reset(
      task
        ? {
            title: task.title,
            status: task.status,
            category: task.category,
            priority: task.priority,
          }
        : { ...emptyValues, status: initialStatus },
    )
  }, [form, initialStatus, task])

  const { handleSubmit, register, setValue, watch, formState: { errors, isSubmitting } } = form

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input className="h-12" placeholder="Morning walk, read 15 pages..." {...register('title')} />
        {errors.title ? <p className="text-sm text-rose-500">{errors.title.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={watch('status')} onValueChange={(value) => setValue('status', value as TaskFormValues['status'])}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Choose status" /></SelectTrigger>
            <SelectContent>
              {Object.entries(columnLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={watch('category')} onValueChange={(value) => setValue('category', value as TaskFormValues['category'])}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Choose category" /></SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={watch('priority')} onValueChange={(value) => setValue('priority', value as TaskFormValues['priority'])}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Choose priority" /></SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {onDelete ? (
            <Button type="button" variant="ghost" className="justify-start px-0 text-rose-500 hover:text-rose-600" onClick={onDelete}>
              Delete task
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{task ? 'Save changes' : 'Create task'}</Button>
        </div>
      </div>
    </form>
  )
}
