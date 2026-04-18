import { MoonStar, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTaskStore } from '@/store/taskStore'

export function SettingsPage() {
  const theme = useTaskStore((state) => state.theme)
  const setTheme = useTaskStore((state) => state.setTheme)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold">Preferences</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Switch between light and dark mode.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
            <SunMedium className="mr-2 h-4 w-4" />
            Light
          </Button>
          <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
            <MoonStar className="mr-2 h-4 w-4" />
            Dark
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
