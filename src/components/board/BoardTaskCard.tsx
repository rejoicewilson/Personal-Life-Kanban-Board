import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import type { Task } from '@/types/task'
import { formatRelativeDate, getCategoryLabel, getCategoryVariant, getPriorityLabel, getPriorityVariant } from '@/utils/task'

type BoardTaskCardProps = {
  task: Task
  overlay?: boolean
  onClick?: () => void
}

export function BoardTaskCard({ task, overlay = false, onClick }: BoardTaskCardProps) {
  const sortable = useSortable({ id: task.id, disabled: overlay, data: { type: 'task', task, status: task.status } })
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  }

  return (
    <Card
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer border-border/60 bg-background/95 p-4 transition hover:-translate-y-0.5 hover:shadow-soft',
        sortable.isDragging && !overlay && 'opacity-40',
        overlay && 'rotate-1 shadow-soft',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 rounded-full p-1 text-muted-foreground hover:bg-accent"
          {...sortable.attributes}
          {...sortable.listeners}
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{task.title}</h4>
            {task.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={getCategoryVariant(task.category)}>{getCategoryLabel(task.category)}</Badge>
            <Badge variant={getPriorityVariant(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{task.dueDate ? formatRelativeDate(task.dueDate) : 'No due date'}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
