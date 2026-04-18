import { useEffect, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function RegisterSW() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      console.log('Service worker registered')
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
    },
  })

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setInstalled(standalone)

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) {
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

  return (
    <>
      {!installed && installPrompt ? (
        <button
          type="button"
          onClick={handleInstall}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] left-4 z-[60] flex min-h-11 items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 text-sm font-medium text-slate-100 shadow-lg shadow-black/30 backdrop-blur"
        >
          <Download className="h-4 w-4" />
          Install App
        </button>
      ) : null}

      {(offlineReady || needRefresh) && (
        <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-[60] rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-sm text-slate-100 shadow-lg shadow-black/30 backdrop-blur">
          <p className="font-medium">
            {offlineReady ? 'App ready for offline use.' : 'New version available.'}
          </p>
          <div className="mt-3 flex gap-3">
            {needRefresh ? (
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-sky-500 px-4 font-medium text-slate-950"
              >
                <RefreshCw className="h-4 w-4" />
                Update
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setOfflineReady(false)
                setNeedRefresh(false)
              }}
              className="min-h-11 rounded-xl bg-slate-800 px-4 font-medium text-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
