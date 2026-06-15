import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Mode = 'dev' | 'simple'

interface ModeContextValue {
  mode: Mode
  isDev: boolean
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('pyraxis-mode')
    return saved === 'simple' ? 'simple' : 'dev'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('simple', mode === 'simple')
    localStorage.setItem('pyraxis-mode', mode)
  }, [mode])

  const toggleMode = () => setMode((m) => (m === 'dev' ? 'simple' : 'dev'))

  return (
    <ModeContext.Provider value={{ mode, isDev: mode === 'dev', toggleMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}
