'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Auth() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) setError(error.message)
      else {
        setError('Check your email for the confirmation link.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
      else window.location.reload()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === 'signin' ? 'Sign in to Futures Journal' : 'Create your Futures Journal account'}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-danger p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>

          <p className="text-sm text-center text-muted">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
