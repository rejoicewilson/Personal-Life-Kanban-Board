import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const habits = ['Morning walk or workout', 'Read for 20 minutes', 'Log expenses', 'Evening reflection']

export function HabitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Habits</p>
        <h2 className="mt-2 text-3xl font-semibold">Repeat what builds stability</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Habit tracking is scaffolded here so the app can expand beyond one-off tasks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily habits</CardTitle>
          <CardDescription>Simple recurring routines that support consistency.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => (
            <div key={habit} className="rounded-2xl border border-border/60 bg-muted/50 px-4 py-3 text-sm">{habit}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
