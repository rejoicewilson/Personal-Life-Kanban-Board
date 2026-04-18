import { Outlet } from 'react-router-dom'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { TopBar } from '@/components/layout/TopBar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 p-4 xl:grid-cols-[280px_1fr] xl:p-6">
        <aside className="hidden rounded-[32px] border border-sidebar-border bg-sidebar p-6 shadow-soft xl:block">
          <SidebarNav />
        </aside>

        <main className="flex min-h-0 flex-col gap-6">
          <TopBar />
          <div className="flex-1 rounded-[32px] border border-border/60 bg-card/60 p-4 shadow-soft backdrop-blur xl:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
