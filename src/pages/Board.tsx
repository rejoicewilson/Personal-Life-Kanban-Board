import { categoryLabels, priorityLabels } from '@/utils/constants'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import { Button } from '@/components/ui/button'
import { useTaskStore } from '@/store/taskStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BoardPage() {
  const focusMode = useTaskStore((state) => state.focusMode)
  const toggleFocusMode = useTaskStore((state) => state.toggleFocusMode)
  const categoryFilter = useTaskStore((state) => state.categoryFilter)
  const priorityFilter = useTaskStore((state) => state.priorityFilter)
  const setCategoryFilter = useTaskStore((state) => state.setCategoryFilter)
  const setPriorityFilter = useTaskStore((state) => state.setPriorityFilter)
  const clearFilters = useTaskStore((state) => state.clearFilters)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Board</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Personal life workflow</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Swipe across lanes, drag tasks with touch, and keep your phone workflow light and deliberate.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as typeof priorityFilter)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-3">
            <Button className="h-12 flex-1" variant={focusMode ? 'default' : 'outline'} onClick={toggleFocusMode}>
              {focusMode ? 'Focus On' : 'Focus Mode'}
            </Button>
            <Button className="h-12" variant="ghost" onClick={clearFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      <KanbanBoard />
    </div>
  )
}
