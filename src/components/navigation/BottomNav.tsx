import { NavLink } from 'react-router-dom'
import { ChartColumn, KanbanSquare, Repeat, Settings, Target } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/board', label: 'Board', icon: KanbanSquare },
  { to: '/', label: 'Dashboard', icon: ChartColumn },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur xl:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-16 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )
              }
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
