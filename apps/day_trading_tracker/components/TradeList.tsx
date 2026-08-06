'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import TradeModal from './TradeModal'
import ExportButton from './ExportButton'
import type { TradeFormValues } from './TradeForm'

interface TradeRow {
  id: string
  symbol: string | null
  trade_date: string
  direction: 'long' | 'short'
  entry_price: number | null
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  pnl: number | null
  notes: string | null
  account_id: string | null
  strategy_id: string | null
  followed_rules: boolean | null
  status: 'open' | 'closed'
  strategies: { name: string } | null
  accounts: { name: string } | null
}

export default function TradeList() {
  const supabase = createClient()
  const [trades, setTrades] = useState<TradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTrade, setEditingTrade] = useState<(Partial<TradeFormValues> & { id?: string }) | undefined>(undefined)

  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState<'all' | 'long' | 'short'>('all')
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all')
  const [accountId, setAccountId] = useState('all')
  const [strategyId, setStrategyId] = useState('all')
  const [followedRules, setFollowedRules] = useState<'all' | 'true' | 'false'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pnlMin, setPnlMin] = useState('')
  const [pnlMax, setPnlMax] = useState('')

  useEffect(() => {
    loadTrades()
  }, [])

  const openEdit = (trade: TradeRow) => {
    setEditingTrade({
      id: trade.id,
      symbol: trade.symbol || '',
      trade_date: trade.trade_date,
      direction: trade.direction,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      stop_loss: trade.stop_loss,
      take_profit: trade.take_profit ?? trade.exit_price ?? null,
      pnl: trade.pnl,
      notes: trade.notes || '',
      status: trade.status,
      account_id: trade.account_id,
      strategy_id: trade.strategy_id,
      followed_rules: trade.followed_rules ?? false,
    })
    setModalOpen(true)
  }

  async function loadTrades() {
    const { data, error } = await supabase
      .from('trades')
      .select('id, symbol, trade_date, direction, entry_price, exit_price, stop_loss, take_profit, pnl, notes, account_id, strategy_id, followed_rules, status, strategies(name), accounts(name)')
      .order('trade_date', { ascending: false })

    if (!error && data) {
      setTrades(data as unknown as TradeRow[])
    }
    setLoading(false)
  }

  async function deleteTrade(id: string) {
    if (!confirm('Delete this trade?')) return
    await supabase.from('trades').delete().eq('id', id)
    loadTrades()
  }

  const accountOptions = useMemo(() => {
    const map = new Map<string, string>()
    trades.forEach((t) => { if (t.account_id) map.set(t.account_id, t.accounts?.name || 'Unnamed') })
    return Array.from(map.entries())
  }, [trades])

  const strategyOptions = useMemo(() => {
    const map = new Map<string, string>()
    trades.forEach((t) => { if (t.strategy_id) map.set(t.strategy_id, t.strategies?.name || 'Unnamed') })
    return Array.from(map.entries())
  }, [trades])

  const filteredTrades = useMemo(() => {
    const min = pnlMin !== '' && !isNaN(Number(pnlMin)) ? Number(pnlMin) : -Infinity
    const max = pnlMax !== '' && !isNaN(Number(pnlMax)) ? Number(pnlMax) : Infinity
    return trades.filter((trade) => {
      if (search && !trade.symbol?.toLowerCase().includes(search.toLowerCase())) return false
      if (direction !== 'all' && trade.direction !== direction) return false
      if (status !== 'all' && trade.status !== status) return false
      if (accountId !== 'all' && trade.account_id !== accountId) return false
      if (strategyId !== 'all' && trade.strategy_id !== strategyId) return false
      if (followedRules !== 'all' && String(!!trade.followed_rules) !== followedRules) return false
      const date = trade.trade_date.slice(0, 10)
      if (dateFrom && date < dateFrom) return false
      if (dateTo && date > dateTo) return false
      if (trade.pnl === null || trade.pnl < min || trade.pnl > max) return false
      return true
    })
  }, [trades, search, direction, status, accountId, strategyId, followedRules, dateFrom, dateTo, pnlMin, pnlMax])

  const resetFilters = () => {
    setSearch('')
    setDirection('all')
    setStatus('all')
    setAccountId('all')
    setStrategyId('all')
    setFollowedRules('all')
    setDateFrom('')
    setDateTo('')
    setPnlMin('')
    setPnlMax('')
  }

  if (loading) return <div className="p-8 text-center text-muted">Loading trades...</div>

  const inputClass = "px-3 py-2 rounded bg-card-light border border-border text-white text-sm focus:border-primary outline-none w-full"
  const selectClass = "px-3 py-2 rounded bg-card-light border border-border text-white text-sm focus:border-primary outline-none w-full"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trade History</h1>
        <div className="flex items-center gap-2">
          <ExportButton />
          <button
            onClick={() => { setEditingTrade(undefined); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
          >
            <PlusCircle size={18} />
            New Trade
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Symbol..."
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'all' | 'long' | 'short')}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'all' | 'open' | 'closed')}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selectClass}>
              <option value="all">All</option>
              {accountOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Strategy</label>
            <select value={strategyId} onChange={(e) => setStrategyId(e.target.value)} className={selectClass}>
              <option value="all">All</option>
              {strategyOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Followed Rules</label>
            <select
              value={followedRules}
              onChange={(e) => setFollowedRules(e.target.value as 'all' | 'true' | 'false')}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">P&L Min</label>
            <input type="number" value={pnlMin} onChange={(e) => setPnlMin(e.target.value)} placeholder="0" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">P&L Max</label>
            <input type="number" value={pnlMax} onChange={(e) => setPnlMax(e.target.value)} placeholder="0" className={inputClass} />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 text-sm text-muted hover:text-white border border-border rounded bg-card-light hover:bg-card transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left text-white">
          <thead className="bg-card-light">
            <tr>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">DATE</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">INSTRUMENT</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">DIR</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">ENTRY</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">EXIT</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">P&amp;L ($)</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">STATUS</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">ACCOUNT</th>
              <th className="p-3 font-medium text-muted text-xs tracking-widest">STRATEGY</th>
              <th className="p-3 text-right font-medium text-muted text-xs tracking-widest">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-muted">
                  {trades.length === 0 ? (
                    <>
                      No trades yet.{' '}
                      <button onClick={() => { setEditingTrade(undefined); setModalOpen(true) }} className="text-primary hover:underline">
                        Add your first trade
                      </button>
                      .
                    </>
                  ) : (
                    <>
                      No trades match your filters.{' '}
                      <button onClick={resetFilters} className="text-primary hover:underline">
                        Clear filters
                      </button>
                      .
                    </>
                  )}
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-t border-border hover:bg-card-light/70">
                  <td className="p-4">{formatDate(trade.trade_date)}</td>
                  <td className="p-4 font-semibold text-white">{trade.symbol || '-'}</td>
                  <td className="p-4">
                    <span className={trade.direction === 'long' ? 'text-success' : 'text-danger'}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">{trade.entry_price !== null ? trade.entry_price.toFixed(6) : '-'}</td>
                  <td className="p-4">{trade.exit_price !== null ? trade.exit_price.toFixed(6) : '-'}</td>
                  <td className="p-4">
                    {trade.pnl === null ? '-' : (
                      <span className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${trade.status === 'closed' ? 'bg-emerald-500/20 text-success' : 'bg-white/10 text-muted'}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="p-3">{trade.accounts?.name || '-'}</td>
                  <td className="p-3">{trade.strategies?.name || '-'}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(trade)}
                        className="p-2 hover:bg-card-light rounded text-muted"
                      >
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteTrade(trade.id)} className="p-2 hover:bg-red-500/10 text-danger rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trade={editingTrade}
        onSaved={loadTrades}
      />
    </div>
  )
}
