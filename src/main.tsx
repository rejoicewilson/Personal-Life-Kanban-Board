import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { useTaskStore } from '@/store/taskStore'
import '@/index.css'

function ThemeSync() {
  const theme = useTaskStore((state) => state.theme)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <App />
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeSync />
    </BrowserRouter>
  </React.StrictMode>,
)
