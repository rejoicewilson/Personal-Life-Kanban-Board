import { NavLink } from 'react-router-dom'
import { KanbanSquare, LayoutDashboard, Repeat, Settings, Target } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: KanbanSquare },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function SidebarNav() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-sidebar-foreground/60">Life OS</p>
          <h1 className="mt-3 text-2xl font-semibold text-sidebar-foreground">Personal Kanban</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/70">Manage your energy, discipline, and life priorities in one place.</p>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4 text-sm text-sidebar-foreground/80">
        <p className="font-medium text-sidebar-foreground">Weekly review</p>
        <p className="mt-1 text-sidebar-foreground/70">Reset priorities, close open loops, and keep next week realistic.</p>
      </div>
    </div>
  )
}
