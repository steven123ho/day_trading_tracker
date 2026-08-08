'use client'

import { X, LogIn } from 'lucide-react'
import Link from 'next/link'

interface SignInModalProps {
  open: boolean
  onClose: () => void
  action?: string
}

export default function SignInModal({ open, onClose, action }: SignInModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Sign in required</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white p-1 rounded-lg hover:bg-card-light transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-muted mb-6">
          Please create an account or sign in to {action || 'do that'}. Its free!
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-card-light hover:bg-card text-white rounded-lg transition"
          >
            Cancel
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
          >
            <LogIn size={18} />
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
