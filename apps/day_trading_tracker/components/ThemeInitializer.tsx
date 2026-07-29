'use client'

import { useEffect } from 'react'

export default function ThemeInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const theme = localStorage.getItem('journal-theme') || 'default'
    const font = localStorage.getItem('journal-font') || 'grotesk'
    const density = localStorage.getItem('journal-density') || 'default'
    const grid = localStorage.getItem('journal-grid') === 'true'
    const contrast = localStorage.getItem('journal-contrast') === 'true'

    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.dataset.theme = theme
    }

    document.documentElement.dataset.font = font

    if (density !== 'default') {
      document.documentElement.dataset.density = density
    } else {
      document.documentElement.removeAttribute('data-density')
    }

    if (grid) {
      document.documentElement.dataset.grid = 'true'
    } else {
      document.documentElement.removeAttribute('data-grid')
    }

    if (contrast) {
      document.documentElement.dataset.contrast = 'true'
    } else {
      document.documentElement.removeAttribute('data-contrast')
    }
  }, [])

  return null
}
