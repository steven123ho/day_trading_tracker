'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import TradeForm, { TradeFormValues } from './TradeForm'

interface TradeModalProps {
  open: boolean
  onClose: () => void
  trade?: Partial<TradeFormValues> & { id?: string }
  onSaved?: () => void
}

export default function TradeModal({ open, onClose, trade, onSaved }: TradeModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-white">
            {trade?.id ? 'Edit Trade' : 'New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white p-1 rounded-lg hover:bg-card-light"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <TradeForm trade={trade} onSaved={() => { onClose(); onSaved?.() }} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}
