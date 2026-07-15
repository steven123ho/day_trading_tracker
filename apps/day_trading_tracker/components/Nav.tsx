'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, List, Settings, Target, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: List },
  { href: '/strategies', label: 'Strategies', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Nav() {
  const pathname = usePathname()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="w-64 min-h-screen bg-card border-r border-border p-6 flex flex-col">
      <Link href="/dashboard" className="text-xl font-bold mb-8 text-primary">
        Futures Journal
      </Link>

      <ul className="space-y-2 flex-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-card-light hover:text-white'
              )}
            >
              <link.icon size={20} />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={signOut}
        className="flex items-center gap-3 px-4 py-3 text-muted hover:text-danger hover:bg-red-500/10 rounded-lg transition"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </nav>
  )
}
