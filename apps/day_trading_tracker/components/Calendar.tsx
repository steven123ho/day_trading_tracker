'use client'

import { useEffect, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
  getDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TradeModal from './TradeModal'

interface Trade {
  id: string
  trade_date: string
  pnl: number | null
  status: string
}

interface CalendarProps {
  onTradeSaved?: () => void
}

export default function Calendar({ onTradeSaved }: CalendarProps) {
  const supabase = createClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOffset = getDay(monthStart)

  useEffect(() => {
    loadTrades()
  }, [currentMonth])

  async function loadTrades() {
    setLoading(true)
    const start = format(monthStart, 'yyyy-MM-dd')
    const end = format(monthEnd, 'yyyy-MM-dd')

    const { data } = await supabase
      .from('trades')
      .select('id, trade_date, pnl, status')
      .gte('trade_date', start)
      .lte('trade_date', end)

    setTrades((data as Trade[]) || [])
    setLoading(false)
  }

  const dayTrades = (day: Date) => {
    return trades.filter((t) => isSameDay(parseISO(t.trade_date), day))
  }

  const dayPnl = (day: Date) => {
    return dayTrades(day).reduce((sum, t) => sum + (t.pnl || 0), 0)
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 bg-card-light rounded-lg hover:bg-card text-muted"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 bg-card-light rounded-lg hover:bg-card text-muted"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm text-muted">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading calendar...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dt = dayTrades(day)
            const pnl = dayPnl(day)
            const isFirstDay = index === 0

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setModalDate(format(day, 'yyyy-MM-dd'))
                  setModalOpen(true)
                }}
                style={isFirstDay ? { gridColumnStart: firstDayOffset + 1 } : undefined}
                className="min-h-[100px] p-2 rounded-md border text-left transition bg-background-light border-border hover:border-primary hover:ring-1 hover:ring-primary/40"
              >
                <div className="text-sm font-medium text-white">{format(day, 'd')}</div>
                {dt.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className={`text-xs font-semibold ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                      {pnl >= 0 ? '+' : ''}
                      {pnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted">{dt.length} trade(s)</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <TradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trade={{ trade_date: modalDate }}
        onSaved={() => {
          loadTrades()
          onTradeSaved?.()
        }}
      />
    </div>
  )
}
