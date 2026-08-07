'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, BookOpen } from 'lucide-react'
import RichTextEditor from './RichTextEditor'
import SignInModal from './SignInModal'

export default function DashboardRules() {
  const supabase = createClient()
  const [rules, setRules] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [signInAction, setSignInAction] = useState('')

  useEffect(() => {
    loadRules()
  }, [])

  async function loadRules() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('rules')
      .eq('id', user.user.id)
      .single()

    if (data?.rules) {
      setRules(data.rules)
    }
    setLoading(false)
  }

  async function saveRules() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      setSignInAction('save your rules')
      setSignInOpen(true)
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ rules })
      .eq('id', user.user.id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (loading) return <div className="text-center py-8 text-muted">Loading rules...</div>

  return (
    <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <BookOpen size={18} /> Trading Rules & Reminders
        </div>
        <button
          onClick={saveRules}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Rules'}
        </button>
      </div>
      <RichTextEditor
        value={rules}
        onChange={setRules}
        placeholder="Type your trading rules and reminders here..."
      />

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        action={signInAction}
      />
    </div>
  )
}
