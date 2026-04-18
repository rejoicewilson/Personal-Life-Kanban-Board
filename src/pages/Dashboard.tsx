import { Activity, CheckCircle2, Clock3, Layers3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTaskStore } from '@/store/taskStore'
import { categoryLabels, columnLabels } from '@/utils/constants'

export function DashboardPage() {
  const tasks = useTaskStore((state) => state.tasks)
  const total = tasks.length
  const overdue = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done',
  ).length

  const categoryCounts = Object.entries(categoryLabels).map(([key, label]) => ({
    label,
    count: tasks.filter((task) => task.category === key).length,
  }))

  const statusCounts = Object.entries(columnLabels).map(([key, label]) => ({
    label,
    count: tasks.filter((task) => task.status === key).length,
  }))

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total tasks', value: total, icon: Layers3 },
          { label: 'Completed', value: tasks.filter((task) => task.status === 'done').length, icon: CheckCircle2 },
          { label: 'In progress', value: tasks.filter((task) => task.status === 'in_progress').length, icon: Activity },
          { label: 'Overdue', value: overdue, icon: Clock3 },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold sm:text-3xl">{item.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tasks per category</CardTitle>
            <CardDescription>Balance your effort across life areas instead of overloading one lane.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryCounts.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-primary" style={{ width: `${total === 0 ? 0 : (item.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline health</CardTitle>
            <CardDescription>See where tasks are piling up or completing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusCounts.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-sm">
                <span>{item.label}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
