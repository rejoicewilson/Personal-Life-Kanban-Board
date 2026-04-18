import { Outlet } from 'react-router-dom'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/navigation/BottomNav'
import { FloatingTaskButton } from '@/components/task/FloatingTaskButton'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 px-3 pb-28 pt-3 sm:px-4 xl:grid-cols-[280px_1fr] xl:gap-6 xl:p-6">
        <aside className="hidden rounded-[32px] border border-sidebar-border bg-sidebar p-6 shadow-soft xl:block">
          <SidebarNav />
        </aside>

        <main className="flex min-h-0 flex-col gap-6">
          <TopBar />
          <div className="flex-1 rounded-[28px] border border-border/60 bg-card/70 p-3 shadow-soft backdrop-blur sm:p-4 xl:rounded-[32px] xl:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <FloatingTaskButton />
      <BottomNav />
    </div>
  )
}
