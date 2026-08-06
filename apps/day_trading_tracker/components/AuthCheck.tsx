'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import Auth from './Auth'
import Nav from './Nav'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  if (user === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Nav />
      <main className="flex-1 p-8 overflow-auto">
        {children}

        <footer className="mt-12 pt-8 border-t border-border text-sm text-muted">
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 text-center">
            <h4 className="text-white font-semibold mb-2 text-base">Support the Project</h4>
            <p className="mb-4 max-w-xl mx-auto leading-relaxed">
              If Futures Journal helps you trade better, consider donating so I can keep it free for everyone. Feel free to provide feedback for features you want to see in the future!
            </p>
            <a
              href="https://buymeacoffee.com/steven123ho"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark rounded-lg text-black font-semibold transition"
            >
              <span>Buy Me a Coffee</span>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p>© 2026 Steven Ho. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
