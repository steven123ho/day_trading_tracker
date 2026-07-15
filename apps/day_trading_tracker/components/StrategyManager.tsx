'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react'

interface Rule {
  id: string
  text: string
  active: boolean
  [key: string]: Json | undefined
}

interface Strategy {
  id: string
  name: string
  description: string | null
  color: string | null
  rules: Rule[] | null
}

export default function StrategyManager() {
  const supabase = createClient()
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)

  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newRule, setNewRule] = useState<Record<string, string>>({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const { data } = await supabase
      .from('strategies')
      .select('id, name, description, color, rules')
      .eq('user_id', user.user.id)

    const typed = (data || []).map((s) => ({
      ...s,
      rules: Array.isArray(s.rules) ? (s.rules as Rule[]) : [],
    })) as Strategy[]

    setStrategies(typed)
    setLoading(false)
  }

  async function addStrategy(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    await supabase.from('strategies').insert({
      user_id: user.user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
      rules: [],
    })

    setNewName('')
    setNewDesc('')
    load()
  }

  async function deleteStrategy(id: string) {
    if (!confirm('Delete this strategy and all its rules?')) return
    await supabase.from('strategies').delete().eq('id', id)
    load()
  }

  async function addRule(strategyId: string) {
    const text = newRule[strategyId]?.trim()
    if (!text) return

    const strategy = strategies.find((s) => s.id === strategyId)
    if (!strategy) return

    const rule: Rule = { id: crypto.randomUUID(), text, active: true }
    const rules = [...(strategy.rules || []), rule]

    await supabase.from('strategies').update({ rules }).eq('id', strategyId)
    setNewRule((prev) => ({ ...prev, [strategyId]: '' }))
    load()
  }

  async function toggleRule(strategyId: string, ruleId: string) {
    const strategy = strategies.find((s) => s.id === strategyId)
    if (!strategy) return

    const rules = (strategy.rules || []).map((r) =>
      r.id === ruleId ? { ...r, active: !r.active } : r
    )

    await supabase.from('strategies').update({ rules }).eq('id', strategyId)
    load()
  }

  async function deleteRule(strategyId: string, ruleId: string) {
    const strategy = strategies.find((s) => s.id === strategyId)
    if (!strategy) return

    const rules = (strategy.rules || []).filter((r) => r.id !== ruleId)
    await supabase.from('strategies').update({ rules }).eq('id', strategyId)
    load()
  }

  if (loading) return <div className="text-center text-muted py-12">Loading strategies...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={addStrategy} className="bg-card p-6 rounded-2xl border border-border space-y-4">
        <h3 className="text-lg font-bold text-white">Add New Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Strategy name"
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
        >
          <Plus size={18} />
          Add Strategy
        </button>
      </form>

      <div className="space-y-4">
        {strategies.length === 0 ? (
          <div className="text-center text-muted py-12 bg-card rounded-2xl border border-border">
            No strategies yet. Add one above.
          </div>
        ) : (
          strategies.map((strategy) => (
            <div key={strategy.id} className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-lg font-bold text-white">{strategy.name}</h4>
                  {strategy.description && <p className="text-sm text-muted">{strategy.description}</p>}
                </div>
                <button
                  onClick={() => deleteStrategy(strategy.id)}
                  className="p-2 text-danger hover:bg-red-500/10 rounded-lg transition"
                  aria-label="Delete strategy"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {(strategy.rules || []).map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card-light"
                  >
                    <button
                      onClick={() => toggleRule(strategy.id, rule.id)}
                      className={rule.active ? 'text-primary' : 'text-muted'}
                    >
                      {rule.active ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                    <span className={`flex-1 ${rule.active ? 'text-white' : 'text-muted line-through'}`}>
                      {rule.text}
                    </span>
                    <button
                      onClick={() => deleteRule(strategy.id, rule.id)}
                      className="text-muted hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 mt-3">
                  <input
                    value={newRule[strategy.id] || ''}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, [strategy.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addRule(strategy.id)
                      }
                    }}
                    placeholder="Add a rule and press Enter"
                    className="flex-1 px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
                  />
                  <button
                    onClick={() => addRule(strategy.id)}
                    className="px-4 py-2 bg-card hover:bg-card-light text-white rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
