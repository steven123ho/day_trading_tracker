'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, List, Settings, Target, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: List },
  { href: '/strategies', label: 'Strategies', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const HOVER_DELAY = 300

export default function Nav() {
  const pathname = usePathname()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(true)
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (expandTimer.current) clearTimeout(expandTimer.current)
      if (collapseTimer.current) clearTimeout(collapseTimer.current)
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleEnter = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    expandTimer.current = setTimeout(() => setCollapsed(false), HOVER_DELAY)
  }

  const handleLeave = () => {
    if (expandTimer.current) clearTimeout(expandTimer.current)
    collapseTimer.current = setTimeout(() => setCollapsed(true), HOVER_DELAY)
  }

  return (
    <nav
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        'min-h-screen bg-card border-r border-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16 pt-5 pb-6 px-2' : 'w-64 pt-5 pb-6 px-6'
      )}
    >
      <ul className="space-y-2 flex-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'flex items-center rounded-lg transition',
                collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-card-light hover:text-white'
              )}
              title={link.label}
            >
              <link.icon size={20} />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={signOut}
        className={cn(
          'flex items-center text-muted hover:text-danger hover:bg-red-500/10 rounded-lg transition',
          collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
        )}
        title="Sign Out"
      >
        <LogOut size={20} />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </nav>
  )
}
