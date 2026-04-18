import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { BoardTaskCard } from '@/components/board/BoardTaskCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task, TaskStatus } from '@/types/task'
import { columnLabels } from '@/utils/constants'

type BoardColumnProps = {
  status: TaskStatus
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
  onSelectTask: (taskId: string) => void
}

export function BoardColumn({ status, tasks, onAddTask, onSelectTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } })

  return (
    <Card className="flex min-h-[28rem] flex-col bg-card/80">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">{columnLabels[status]}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{tasks.length} tasks</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onAddTask(status)}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div
          ref={setNodeRef}
          className={[
            'flex min-h-[22rem] flex-col gap-3 rounded-2xl border border-dashed border-border/60 p-3 transition-colors',
            isOver ? 'border-primary/60 bg-primary/5' : 'bg-muted/30',
          ].join(' ')}
        >
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <BoardTaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
            ))}
          </SortableContext>
          {tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 text-center text-sm text-muted-foreground">
              Drop a task here or create a new one.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
