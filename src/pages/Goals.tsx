import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const goals = [
  { title: 'Health baseline', detail: 'Train 4 times per week and protect sleep consistency.' },
  { title: 'Career depth', detail: 'Ship one meaningful portfolio or work asset every month.' },
  { title: 'Financial discipline', detail: 'Track spending weekly and grow the emergency buffer.' },
]

export function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Goals</p>
        <h2 className="mt-2 text-3xl font-semibold">Longer-term direction</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Use goals to keep short-term work aligned with the bigger picture.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.title}>
            <CardHeader>
              <CardTitle>{goal.title}</CardTitle>
              <CardDescription>{goal.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">This page is ready for milestone and progress tracking.</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
