import { useState } from 'react'
import { Menu, MoonStar, Search, SunMedium } from 'lucide-react'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useTaskStore } from '@/store/taskStore'

export function TopBar() {
  const query = useTaskStore((state) => state.query)
  const setQuery = useTaskStore((state) => state.setQuery)
  const theme = useTaskStore((state) => state.theme)
  const toggleTheme = useTaskStore((state) => state.toggleTheme)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2 rounded-[24px] border border-border/60 bg-background/90 px-3 py-3 shadow-soft backdrop-blur xl:px-5">
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

        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Personal Life</p>
          <h1 className="truncate text-lg font-semibold sm:text-xl">Kanban Board</h1>
        </div>

        <div className="hidden flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 pl-11"
              placeholder="Search tasks or descriptions"
            />
          </div>
        </div>

        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setSearchOpen((value) => !value)}>
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
      </header>

      {searchOpen ? (
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 rounded-2xl pl-11"
              placeholder="Search tasks or descriptions"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
