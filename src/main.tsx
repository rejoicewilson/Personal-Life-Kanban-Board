import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { RegisterSW } from '@/components/RegisterSW'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <>
      <App />
      <RegisterSW />
    </>
  </React.StrictMode>,
)
