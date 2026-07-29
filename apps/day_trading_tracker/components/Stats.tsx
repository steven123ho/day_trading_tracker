'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Percent, DollarSign, Activity, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

interface Trade {
  trade_date: string
  pnl: number | null
  direction: 'long' | 'short'
  status: 'open' | 'closed'
}

export default function Stats() {
  const supabase = createClient()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrades()
  }, [])

  async function loadTrades() {
    const { data } = await supabase.from('trades').select('trade_date, pnl, direction, status')
    setTrades((data as Trade[]) || [])
    setLoading(false)
  }

  const closed = trades.filter((t) => t.status === 'closed')
  const wins = closed.filter((t) => (t.pnl || 0) > 0)
  const losses = closed.filter((t) => (t.pnl || 0) < 0)
  const totalPnl = closed.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0
  const avgLoss = losses.length ? losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length : 0
  const profitFactor = losses.length && avgLoss !== 0
    ? (wins.reduce((s, t) => s + (t.pnl || 0), 0)) / Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0))
    : 0

  const dateTotals = new Map<string, number>()
  trades.forEach((t) => {
    const current = dateTotals.get(t.trade_date) || 0
    dateTotals.set(t.trade_date, current + (t.pnl || 0))
  })

  let cumulativeProfit = 0
  let cumulativeLoss = 0
  let runningBalance = 0
  const chartData = Array.from(dateTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnlValue]) => {
      if (pnlValue >= 0) cumulativeProfit += pnlValue
      else cumulativeLoss += Math.abs(pnlValue)
      runningBalance += pnlValue
      return {
        date,
        profit: cumulativeProfit,
        loss: cumulativeLoss,
        net: runningBalance,
      }
    })

  let runningPeak = 0
  let drawdown = 0
  let maxDrawdown = 0
  const sortedByDate = [...trades].sort((a, b) => a.trade_date.localeCompare(b.trade_date))
  sortedByDate.forEach((t) => {
    const pnl = t.pnl || 0
    runningPeak = Math.max(runningPeak + pnl, runningPeak)
    drawdown = runningPeak + pnl - runningPeak
    maxDrawdown = Math.min(maxDrawdown, drawdown)
  })

  const stats = [
    { label: 'Total P&L', value: formatCurrency(totalPnl), icon: DollarSign, color: totalPnl >= 0 ? 'text-success' : 'text-danger' },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, icon: Percent, color: 'text-primary' },
    { label: 'Total Trades', value: trades.length.toString(), icon: Activity, color: 'text-primary' },
    { label: 'Win / Loss', value: `${wins.length} / ${losses.length}`, icon: Calendar, color: 'text-primary' },
    { label: 'Avg Win', value: formatCurrency(avgWin), icon: TrendingUp, color: 'text-success' },
    { label: 'Avg Loss', value: formatCurrency(avgLoss), icon: TrendingDown, color: 'text-danger' },
    { label: 'Profit Factor', value: profitFactor ? profitFactor.toFixed(2) : '-', icon: TrendingUp, color: 'text-primary' },
    { label: 'Max Drawdown', value: formatCurrency(maxDrawdown), icon: TrendingDown, color: 'text-danger' },
  ]

  if (loading) return <div className="p-8 text-center text-muted">Loading stats...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-4 rounded-lg border border-border hover:border-primary/40 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted text-xs tracking-wide">{s.label}</span>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="text-2xl font-semibold text-white tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card p-5 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-3 text-white">Lifetime Profit / Loss / Net</h3>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#64748b" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                <YAxis stroke="#64748b" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12161f', border: '1px solid #1f2937', borderRadius: '8px' }}
                  formatter={(value: number, name: string | number) => [formatCurrency(value), typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : String(name)]}
                />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted py-12">No closed trades to chart yet.</div>
        )}
      </div>
    </div>
  )
}
