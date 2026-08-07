'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Paintbrush, Type, Sparkles } from 'lucide-react'

const THEME_OPTIONS = [
  { id: 'default', label: 'Core Midnight' },
  { id: 'neon', label: 'Neon Grid' },
  { id: 'stealth', label: 'Stealth Carbon' },
  { id: 'aurora', label: 'Aurora Light' },
  { id: 'paper', label: 'Minimal Paper' },
  { id: 'sunset', label: 'Sunset Ember' },
]

const FONT_OPTIONS = [
  { id: 'grotesk', label: 'Modern Grotesk' },
  { id: 'mono', label: 'Terminal Mono' },
  { id: 'serif', label: 'Editorial Serif' },
]

const DENSITY_OPTIONS = [
  { id: 'default', label: 'Standard' },
  { id: 'compact', label: 'Compact' },
  { id: 'relaxed', label: 'Relaxed' },
]

export default function ThemeSettings() {
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('default')
  const [font, setFont] = useState('grotesk')
  const [density, setDensity] = useState('default')
  const [grid, setGrid] = useState(false)
  const [contrast, setContrast] = useState(false)
  const isFirstSave = useRef(true)

  useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        setMounted(true)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.user.id)
        .single()

      if (data?.theme) {
        const t = data.theme as Record<string, any>
        setTheme(t.theme || 'default')
        setFont(t.font || 'grotesk')
        setDensity(t.density || 'default')
        setGrid(!!t.grid)
        setContrast(!!t.contrast)
      }
      setMounted(true)
    }
    load()
  }, [supabase])

  const settings = useMemo(() => ({ theme, font, density, grid, contrast }), [theme, font, density, grid, contrast])

  useEffect(() => {
    if (!mounted) return
    if (typeof window === 'undefined') return

    applyTheme(theme)
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
  }, [theme, font, density, grid, contrast, mounted])

  useEffect(() => {
    if (!mounted) return
    if (isFirstSave.current) {
      isFirstSave.current = false
      return
    }

    const timeout = setTimeout(async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return
      await supabase.from('profiles').update({ theme: settings }).eq('id', user.user.id)
    }, 500)

    return () => clearTimeout(timeout)
  }, [settings, mounted, supabase])

  const description = {
    default: 'Balanced neon contrast with cyan accents.',
    neon: 'Electric blues with vivid magenta shadows.',
    stealth: 'Muted graphite surfaces with cyan signals.',
    aurora: 'Bright arctic light with frosted cards.',
    paper: 'Soft parchment background with charcoal text.',
    sunset: 'Deep purple base with ember gradients.',
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <Paintbrush size={18} /> Appearance & Feel
        </div>
        <p className="text-sm text-muted">Personalize the UI so it matches your evaluation vibe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingSelect
          label="Color Theme"
          icon={<Sparkles size={16} />}
          value={theme}
          onChange={setTheme}
          options={THEME_OPTIONS}
          helper={description[theme as keyof typeof description]}
        />

        <SettingSelect
          label="Headline Font"
          icon={<Type size={16} />}
          value={font}
          onChange={setFont}
          options={FONT_OPTIONS}
          helper={font === 'mono' ? 'Terminal-style log feel.' : font === 'serif' ? 'Journal / editorial tone.' : 'Clean & modern default.'}
        />

        <SettingSelect
          label="Scale"
          value={density}
          onChange={setDensity}
          options={DENSITY_OPTIONS}
          helper={density === 'compact' ? 'Tighter typography for dense journaling.' : density === 'relaxed' ? 'Slightly larger text for long reviews.' : 'Standard spacing.'}
        />
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <ToggleRow
          label="Ambient grid background"
          description="Adds a holographic grid behind the dashboard (subtle but great on dark themes)."
          enabled={grid}
          onToggle={() => setGrid((prev) => !prev)}
        />
        <ToggleRow
          label="High-contrast cards"
          description="Boosts borders/shadows so widgets pop when screen recording for eval updates."
          enabled={contrast}
          onToggle={() => setContrast((prev) => !prev)}
        />
      </div>
    </div>
  )
}

function applyTheme(theme: string) {
  if (typeof document === 'undefined') return
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme')
    return
  }
  document.documentElement.dataset.theme = theme
}

interface SettingSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string }[]
  helper?: string
  icon?: React.ReactNode
}

function SettingSelect({ label, value, onChange, options, helper, icon }: SettingSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted flex items-center gap-2">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
      >
        {options.map((option) => (
          <option value={option.id} key={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && <p className="text-xs text-muted">{helper}</p>}
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`px-4 py-2 rounded-lg border transition ${
          enabled ? 'bg-primary text-black border-primary' : 'bg-card-light text-muted border-border'
        }`}
      >
        {enabled ? 'On' : 'Off'}
      </button>
    </div>
  )
}
