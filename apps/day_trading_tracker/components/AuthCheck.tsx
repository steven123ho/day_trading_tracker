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
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
