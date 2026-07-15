'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import TradeModal from './TradeModal'
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

  if (loading) return <div className="p-8 text-center text-muted">Loading trades...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingTrade(undefined); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
        >
          <PlusCircle size={18} />
          New Trade
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-left text-white/90">
          <thead className="bg-card-light/80">
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
            {trades.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-muted">
                  No trades yet.{' '}
                  <button onClick={() => { setEditingTrade(undefined); setModalOpen(true) }} className="text-primary hover:underline">
                    Add your first trade
                  </button>
                  .
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
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
