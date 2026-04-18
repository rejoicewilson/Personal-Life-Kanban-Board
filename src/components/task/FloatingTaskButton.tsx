import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskDialog } from '@/components/task/TaskDialog'

export function FloatingTaskButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        className="fixed bottom-24 right-4 z-40 h-14 rounded-full px-5 text-base shadow-soft xl:bottom-6 xl:right-6"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Task
      </Button>

      <TaskDialog open={open} onOpenChange={setOpen} initialStatus="backlog" />
    </>
  )
}
