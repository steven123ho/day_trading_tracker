'use client'

import { useSearchParams } from 'next/navigation'
import TradeForm from '@/components/TradeForm'

export default function NewTradeClient() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || undefined

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">New Trade</h1>
      <TradeForm
        trade={
          date
            ? {
                trade_date: date,
              }
            : undefined
        }
      />
    </div>
  )
}
