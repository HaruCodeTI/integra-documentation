'use client'

import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('integra-docs-theme', theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    const stored = localStorage.getItem('integra-docs-theme') as ThemeMode | null
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored)
      applyTheme(stored)
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const next = prefersDark ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
  }, [])

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        const next: ThemeMode = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        applyTheme(next)
      }}
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {theme === 'light' ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a1 1 0 0 1 1 1v1.4a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1Zm0 14.6a1 1 0 0 1 1 1V20a1 1 0 0 1-2 0v-1.4a1 1 0 0 1 1-1ZM5.64 5.64a1 1 0 0 1 1.42 0l.98.99a1 1 0 0 1-1.41 1.41l-.99-.98a1 1 0 0 1 0-1.42Zm10.32 10.32a1 1 0 0 1 1.41 0l.99.98a1 1 0 1 1-1.41 1.42l-.99-.99a1 1 0 0 1 0-1.41ZM3 12a1 1 0 0 1 1-1h1.4a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1Zm14.6 0a1 1 0 0 1 1-1H20a1 1 0 0 1 0 2h-1.4a1 1 0 0 1-1-1ZM6.63 15.96a1 1 0 0 1 1.41 1.41l-.98.99a1 1 0 1 1-1.42-1.42l.99-.98Zm10.74-9.33a1 1 0 0 1 0 1.41l-.99.99a1 1 0 1 1-1.41-1.41l.98-.99a1 1 0 0 1 1.42 0ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.82 15.14A9 9 0 0 1 8.86 3.18a.7.7 0 0 0-.88-.88A10 10 0 1 0 21.7 16.02a.7.7 0 0 0-.88-.88Z" />
        </svg>
      )}
      <span>{theme === 'light' ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}
