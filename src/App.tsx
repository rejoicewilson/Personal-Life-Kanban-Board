import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { BoardPage } from '@/pages/Board'
import { DashboardPage } from '@/pages/Dashboard'
import { GoalsPage } from '@/pages/Goals'
import { HabitsPage } from '@/pages/Habits'
import { SettingsPage } from '@/pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
