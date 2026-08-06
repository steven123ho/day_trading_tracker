"use client"

import { useState } from 'react'
import Stats from '@/components/Stats'
import Calendar from '@/components/Calendar'
import TradeModal from '@/components/TradeModal'
import StickyNoteBoard from '@/components/StickyNoteBoard'

export default function DashboardClient() {
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSaved = () => {
    setModalOpen(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <div className="-mx-8 -mt-8 mb-8">
        <StickyNoteBoard onNewTrade={() => setModalOpen(true)} />
      </div>

      <div className="space-y-8">
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
