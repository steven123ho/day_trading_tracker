'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AuthCheck from '@/components/AuthCheck'
import TradeForm, { TradeFormValues } from '@/components/TradeForm'
import TradeImageUpload from '@/components/TradeImageUpload'
import { createClient } from '@/lib/supabase/client'

type Trade = TradeFormValues & { id: string }

export default function EditTradePage() {
  const params = useParams()
  const id = params.id as string
  const [trade, setTrade] = useState<Trade | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!id) return
    supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTrade({
            id: data.id,
            symbol: data.symbol || '',
            trade_date: data.trade_date,
            direction: (data.direction as 'long' | 'short') || 'long',
            entry_price: data.entry_price ?? null,
            exit_price: data.exit_price ?? null,
            stop_loss: data.stop_loss ?? null,
            take_profit: data.take_profit ?? data.exit_price ?? null,
            pnl: data.pnl ?? null,
            notes: data.notes || '',
            status: (data.status as 'open' | 'closed') || 'open',
            account_id: data.account_id,
            strategy_id: data.strategy_id,
            followed_rules: data.followed_rules ?? false,
          })
        }
      })
  }, [id, supabase])

  if (!trade) return <AuthCheck><div className="p-8 text-white">Loading trade...</div></AuthCheck>

  return (
    <AuthCheck>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white">Edit Trade</h1>
        <TradeForm trade={trade} />
        <TradeImageUpload tradeId={trade.id} />
      </div>
    </AuthCheck>
  )
}
