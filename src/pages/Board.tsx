import { KanbanBoard } from '@/components/board/KanbanBoard'

export function BoardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Board</p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Simple daily task board</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Swipe across columns, drag tasks with touch, and keep daily life tasks easy to manage on your phone.
          </p>
        </div>
      </div>

      <KanbanBoard />
    </div>
  )
}
