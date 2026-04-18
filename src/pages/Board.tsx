import { KanbanBoard } from '@/components/board/KanbanBoard'
import { Button } from '@/components/ui/button'
import { useTaskStore } from '@/store/taskStore'

export function BoardPage() {
  const focusMode = useTaskStore((state) => state.focusMode)
  const toggleFocusMode = useTaskStore((state) => state.toggleFocusMode)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Board</p>
          <h2 className="mt-2 text-3xl font-semibold">Personal life workflow</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Move tasks from planning into execution. Focus mode narrows the board to Today and In Progress.</p>
        </div>
        <Button variant={focusMode ? 'default' : 'outline'} onClick={toggleFocusMode}>{focusMode ? 'Focus mode on' : 'Enable focus mode'}</Button>
      </div>

      <KanbanBoard />
    </div>
  )
}
