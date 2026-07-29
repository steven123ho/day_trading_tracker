'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download } from 'lucide-react'

export default function ExportButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportCSV = async () => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase
      .from('trades')
      .select('id, trade_date, symbol, direction, entry_price, exit_price, stop_loss, take_profit, fees, pnl, pnl_pips, status, notes, accounts(name), strategies(name)')
      .order('trade_date', { ascending: false })

    if (error || !data) {
      setError(error?.message || 'Failed to export trades')
      setLoading(false)
      return
    }

    const rows = data as any[]
    const headers = [
      'Date',
      'Instrument',
      'Direction',
      'Entry',
      'Exit',
      'Stop Loss',
      'Take Profit',
      'Fees',
      'P&L ($)',
      'P&L (points)',
      'Status',
      'Account',
      'Strategy',
      'Notes',
    ]

    const csv = [
      headers.join(','),
      ...rows.map((row) => [
        row.trade_date,
        row.symbol,
        row.direction,
        row.entry_price,
        row.exit_price ?? '',
        row.stop_loss ?? '',
        row.take_profit ?? '',
        row.fees ?? 0,
        row.pnl ?? '',
        row.pnl_pips ?? '',
        row.status,
        row.accounts?.name ?? '',
        row.strategies?.name ?? '',
        `"${(row.notes || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\n')

    try {
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date()
      const filename = `trades-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.csv`
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download CSV')
    }
    
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportCSV}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-card-light hover:bg-card text-white rounded-lg border border-border transition disabled:opacity-50"
      >
        <Download size={18} />
        {loading ? 'Exporting...' : 'Export CSV'}
      </button>
      {error && <div className="text-danger text-sm">{error}</div>}
    </div>
  )
}
