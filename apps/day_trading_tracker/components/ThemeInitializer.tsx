'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function applyTheme(theme: string) {
  if (typeof document === 'undefined') return
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = theme
  }
}

export default function ThemeInitializer() {
  const supabase = createClient()

  useEffect(() => {
    if (typeof window === 'undefined') return

    document.documentElement.dataset.font = 'grotesk'

    async function load() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.user.id)
        .single()

      if (!data?.theme) return

      const t = data.theme as Record<string, any>
      if (t.theme) applyTheme(t.theme)
      if (t.font) document.documentElement.dataset.font = t.font
      if (t.density && t.density !== 'default') {
        document.documentElement.dataset.density = t.density
      } else {
        document.documentElement.removeAttribute('data-density')
      }
      if (t.grid) {
        document.documentElement.dataset.grid = 'true'
      } else {
        document.documentElement.removeAttribute('data-grid')
      }
      if (t.contrast) {
        document.documentElement.dataset.contrast = 'true'
      } else {
        document.documentElement.removeAttribute('data-contrast')
      }
    }

    load()
  }, [supabase])

  return null
}
