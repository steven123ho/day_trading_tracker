"use client"

import { useState } from 'react'
import Stats from '@/components/Stats'
import Calendar from '@/components/Calendar'
import TradeModal from '@/components/TradeModal'
import { Plus } from 'lucide-react'

export default function DashboardClient() {
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSaved = () => {
    setModalOpen(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-sm text-muted mt-1">Overview and quick trade entry</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition shadow-[0_0_12px_rgba(34,211,238,0.6)] ring-1 ring-primary/50"
          >
            <Plus size={18} />
            New Trade
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Performance</h2>
          <Stats key={refreshKey} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Calendar</h2>
          <Calendar key={refreshKey} onTradeSaved={handleSaved} />
        </div>
      </div>

      <TradeModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
    </>
  )
}
