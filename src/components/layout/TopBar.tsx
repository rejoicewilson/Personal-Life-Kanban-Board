import { useState } from 'react'
import { Menu, MoonStar, Plus, Search, SunMedium } from 'lucide-react'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { TaskDialog } from '@/components/task/TaskDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useTaskStore } from '@/store/taskStore'

export function TopBar() {
  const query = useTaskStore((state) => state.query)
  const setQuery = useTaskStore((state) => state.setQuery)
  const theme = useTaskStore((state) => state.theme)
  const toggleTheme = useTaskStore((state) => state.toggleTheme)
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 rounded-[28px] border border-border/60 bg-background/80 px-4 py-3 shadow-soft backdrop-blur xl:px-5">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="xl:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SidebarNav />
          </SheetContent>
        </Sheet>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-11" placeholder="Search tasks or descriptions" />
        </div>

        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add task
        </Button>
      </header>

      <TaskDialog open={open} onOpenChange={setOpen} initialStatus="backlog" />
    </>
  )
}
