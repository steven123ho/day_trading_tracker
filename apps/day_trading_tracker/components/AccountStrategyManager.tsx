'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2 } from 'lucide-react'

interface Account {
  id: string
  name: string
  broker?: string | null
  balance?: number | null
}

interface Strategy {
  id: string
  name: string
  color?: string | null
  description?: string | null
}

export default function AccountStrategyManager() {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [newAccount, setNewAccount] = useState('')
  const [newStrategy, setNewStrategy] = useState('')
  const [newStrategyColor, setNewStrategyColor] = useState('#3b82f6')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const [{ data: accData }, { data: stratData }] = await Promise.all([
      supabase.from('accounts').select('id, name, broker').eq('user_id', user.user.id),
      supabase.from('strategies').select('id, name, color, description').eq('user_id', user.user.id),
    ])

    setAccounts((accData as Account[]) || [])
    setStrategies((stratData as Strategy[]) || [])
  }

  async function addAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!newAccount.trim()) return
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    await supabase.from('accounts').insert({ user_id: user.user.id, name: newAccount.trim() })
    setNewAccount('')
    load()
  }

  async function deleteAccount(id: string) {
    if (!confirm('Delete this account?')) return
    await supabase.from('accounts').delete().eq('id', id)
    load()
  }

  async function addStrategy(e: React.FormEvent) {
    e.preventDefault()
    if (!newStrategy.trim()) return
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    await supabase.from('strategies').insert({ user_id: user.user.id, name: newStrategy.trim(), color: newStrategyColor })
    setNewStrategy('')
    setNewStrategyColor('#3b82f6')
    load()
  }

  async function deleteStrategy(id: string) {
    if (!confirm('Delete this strategy?')) return
    await supabase.from('strategies').delete().eq('id', id)
    load()
  }

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-2xl border border-border">
        <h2 className="text-xl font-bold mb-4 text-white">Accounts</h2>
        <form onSubmit={addAccount} className="flex gap-2 mb-4">
          <input
            value={newAccount}
            onChange={(e) => setNewAccount(e.target.value)}
            placeholder="Account name"
            className="flex-1 px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center gap-2">
            <Plus size={18} /> Add
          </button>
        </form>
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-3 bg-card-light rounded-lg">
              <span className="text-white">{a.name}</span>
              <button onClick={() => deleteAccount(a.id)} className="text-muted hover:text-danger">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {accounts.length === 0 && <li className="text-muted text-sm">No accounts yet.</li>}
        </ul>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border">
        <h2 className="text-xl font-bold mb-4 text-white">Strategies / Tags</h2>
        <form onSubmit={addStrategy} className="flex gap-2 mb-4">
          <input
            value={newStrategy}
            onChange={(e) => setNewStrategy(e.target.value)}
            placeholder="Strategy name"
            className="flex-1 px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
          <input
            type="color"
            value={newStrategyColor}
            onChange={(e) => setNewStrategyColor(e.target.value)}
            className="h-10 w-12 rounded bg-transparent"
          />
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center gap-2">
            <Plus size={18} /> Add
          </button>
        </form>
        <ul className="space-y-2">
          {strategies.map((s) => (
            <li key={s.id} className="flex items-center justify-between p-3 bg-card-light rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color || '#22d3ee' }} />
                <span className="text-white">{s.name}</span>
              </div>
              <button onClick={() => deleteStrategy(s.id)} className="text-muted hover:text-danger">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {strategies.length === 0 && <li className="text-muted text-sm">No strategies yet.</li>}
        </ul>
      </div>
    </div>
  )
}
