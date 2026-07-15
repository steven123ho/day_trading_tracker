'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDateInput } from '@/lib/utils'

interface Account {
  id: string
  name: string
}

interface Strategy {
  id: string
  name: string
  color?: string | null
}

export interface TradeFormValues {
  account_id: string | null
  strategy_id: string | null
  symbol: string
  trade_date: string
  direction: 'long' | 'short'
  entry_price: number | null
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  pnl: number | null
  notes: string
  status: 'open' | 'closed'
  followed_rules: boolean
}

interface TradeFormProps {
  trade?: Partial<TradeFormValues> & { id?: string }
  onSaved?: () => void
  onCancel?: () => void
}

export default function TradeForm({ trade, onSaved, onCancel }: TradeFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<TradeFormValues>({
    symbol: trade?.symbol || '',
    trade_date: trade?.trade_date || formatDateInput(new Date()),
    direction: trade?.direction || 'long',
    entry_price: trade?.entry_price ?? null,
    exit_price: trade?.exit_price ?? null,
    stop_loss: trade?.stop_loss ?? null,
    take_profit: trade?.take_profit ?? trade?.exit_price ?? null,
    pnl: trade?.pnl ?? null,
    notes: trade?.notes || '',
    status: trade?.status || 'open',
    account_id: trade?.account_id || null,
    strategy_id: trade?.strategy_id || null,
    followed_rules: trade?.followed_rules ?? false,
  })

  useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const [{ data: accountsData }, { data: strategiesData }] = await Promise.all([
        supabase.from('accounts').select('id, name').eq('user_id', user.user.id),
        supabase.from('strategies').select('id, name, color').eq('user_id', user.user.id),
      ])

      setAccounts(accountsData || [])
      setStrategies(strategiesData || [])
    }
    load()
  }, [supabase])

  const handleChange = <K extends keyof TradeFormValues>(field: K, value: TradeFormValues[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePriceChange = (field: 'entry_price' | 'exit_price', value: number | null) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      next.take_profit = next.entry_price !== null && next.exit_price !== null ? next.exit_price : null
      return next
    })
  }

  const handleDelete = async () => {
    if (!trade?.id) return
    if (!confirm('Delete this trade?')) return
    setLoading(true)
    const { error } = await supabase.from('trades').delete().eq('id', trade.id)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (onSaved) onSaved()
    else router.push('/trades')
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.trade_date || form.pnl === null || form.pnl === undefined) {
      setError('Trade date and profit/loss are required.')
      setLoading(false)
      return
    }

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      setError('You must be signed in')
      setLoading(false)
      return
    }

    const isClosed = form.exit_price !== null || form.pnl !== null
    const normalizedSymbol = form.symbol?.trim()
    const payload = {
      ...form,
      status: isClosed ? 'closed' : 'open',
      symbol: normalizedSymbol ? normalizedSymbol.toUpperCase() : null,
      user_id: user.user.id,
      followed_rules: !!form.followed_rules,
    }

    if (trade?.id) {
      const { error } = await supabase.from('trades').update(payload).eq('id', trade.id)
      if (error) setError(error.message)
      else if (onSaved) onSaved()
      else router.push('/trades')
    } else {
      const { error } = await supabase.from('trades').insert(payload)
      if (error) setError(error.message)
      else if (onSaved) onSaved()
      else router.push('/trades')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="text-danger p-3 bg-red-500/10 border border-red-500/30 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Instrument</label>
          <input
            value={form.symbol || ''}
            onChange={(e) => handleChange('symbol', e.target.value)}
            placeholder="ES, NQ, CL, GC..."
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Trade Date *</label>
          <input
            type="date"
            required
            value={form.trade_date}
            onChange={(e) => handleChange('trade_date', e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Direction</label>
          <select
            value={form.direction}
            onChange={(e) => handleChange('direction', e.target.value as 'long' | 'short')}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Entry Price</label>
          <input
            type="number"
            step="0.000001"
            value={form.entry_price ?? ''}
            onChange={(e) => handlePriceChange('entry_price', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Exit Price</label>
          <input
            type="number"
            step="0.000001"
            value={form.exit_price ?? ''}
            onChange={(e) => handlePriceChange('exit_price', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Stop Loss</label>
          <input
            type="number"
            step="0.000001"
            value={form.stop_loss ?? ''}
            onChange={(e) => handleChange('stop_loss', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">P&L ($) *</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.pnl ?? ''}
            onChange={(e) => handleChange('pnl', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Account</label>
          <select
            value={form.account_id || ''}
            onChange={(e) => handleChange('account_id', e.target.value || null)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-muted">Strategy</label>
          <select
            value={form.strategy_id || ''}
            onChange={(e) => handleChange('strategy_id', e.target.value || null)}
            className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          >
            <option value="">Select strategy</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card-light px-4 py-3 flex items-center gap-3">
        <input
          type="checkbox"
          id="followed-rules"
          checked={!!form.followed_rules}
          onChange={(e) => handleChange('followed_rules', e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <div>
          <label htmlFor="followed-rules" className="text-sm font-medium text-white">
            Did you follow all the rules?
          </label>
          <p className="text-xs text-muted">Toggle on if the playbook was followed perfectly.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-muted">Notes</label>
        <textarea
          value={form.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-card-light border border-border focus:border-primary focus:outline-none text-white"
          placeholder="Setup, emotions, lessons, screenshots..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : trade?.id ? 'Update Trade' : 'Save Trade'}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push('/trades'))}
          className="px-6 py-2.5 bg-card-light hover:bg-card text-white rounded-lg transition"
        >
          Cancel
        </button>
        {trade?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
