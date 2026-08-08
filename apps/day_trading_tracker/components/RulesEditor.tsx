'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Trash2, ArrowUp, ArrowDown, Type, List, CheckSquare, Quote, Heading } from 'lucide-react'

type BlockType = 'heading' | 'text' | 'bullet' | 'check' | 'quote'

interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
}

const BLOCK_ICONS: Record<BlockType, typeof Type> = {
  heading: Heading,
  text: Type,
  bullet: List,
  check: CheckSquare,
  quote: Quote,
}

const BLOCK_LABELS: Record<BlockType, string> = {
  heading: 'Heading',
  text: 'Text',
  bullet: 'Bullet',
  check: 'Checklist',
  quote: 'Quote',
}

let idCounter = 0
function newId() {
  idCounter += 1
  return `rule-${Date.now()}-${idCounter}`
}

function newBlock(type: BlockType, content = ''): Block {
  return { id: newId(), type, content, checked: type === 'check' ? false : undefined }
}

function parseRules(raw: string | null): Block[] {
  if (!raw) return [newBlock('heading', 'My Trading Rules'), newBlock('text')]
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // legacy HTML/text rules
    return [newBlock('heading', 'My Trading Rules'), newBlock('text', raw)]
  }
  return [newBlock('heading', 'My Trading Rules'), newBlock('text')]
}

export default function RulesEditor() {
  const supabase = createClient()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadRules()
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  async function loadRules() {
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('rules')
      .eq('id', session.user.id)
      .single()

    setBlocks(parseRules(data?.rules || null))
    setLoading(false)
  }

  async function saveRulesToDb(nextBlocks: Block[]) {
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ rules: JSON.stringify(nextBlocks) })
      .eq('id', session.user.id)

    setSaving(false)
    if (!error) {
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1500)
    }
  }

  function queueSave(nextBlocks: Block[]) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveRulesToDb(nextBlocks), 1000)
  }

  function updateBlock(id: string, changes: Partial<Block>) {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...changes } : b))
    setBlocks(updated)
    queueSave(updated)
  }

  function addBlock(type: BlockType, afterIndex: number) {
    const updated = [...blocks.slice(0, afterIndex + 1), newBlock(type), ...blocks.slice(afterIndex + 1)]
    setBlocks(updated)
    queueSave(updated)
  }

  function removeBlock(id: string) {
    const updated = blocks.filter((b) => b.id !== id)
    if (updated.length === 0) updated.push(newBlock('text'))
    setBlocks(updated)
    queueSave(updated)
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= blocks.length) return
    const updated = [...blocks]
    const [removed] = updated.splice(index, 1)
    updated.splice(newIndex, 0, removed)
    setBlocks(updated)
    queueSave(updated)
  }

  function handleTextChange(id: string, value: string) {
    const updated = blocks.map((b) => (b.id === id ? { ...b, content: value } : b))
    setBlocks(updated)
    queueSave(updated)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, block: Block) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addBlock(block.type, index)
    }
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault()
      removeBlock(block.id)
    }
  }

  function insertAfterCurrent(type: BlockType) {
    const currentIndex = active ? blocks.findIndex((b) => b.id === active) : blocks.length - 1
    addBlock(type, currentIndex >= 0 ? currentIndex : blocks.length - 1)
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">Loading rules...</div>
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-white text-xl font-semibold">
          <BookOpen size={22} /> Trading Rules & Reminders
        </div>
        <div className="text-sm text-muted">{saving ? 'Saving...' : justSaved ? 'Saved' : 'Auto-saves as you type'}</div>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {blocks.map((block, index) => {
          const Icon = BLOCK_ICONS[block.type]
          const isHeading = block.type === 'heading'
          const isQuote = block.type === 'quote'

          return (
            <div
              key={block.id}
              className={`group relative flex items-start gap-2 p-2 rounded-lg border transition ${
                active === block.id ? 'border-primary/40 bg-card-light/50' : 'border-transparent hover:border-border'
              }`}
            >
              <div className="pt-3 text-muted" title={BLOCK_LABELS[block.type]}>
                {block.type === 'check' ? (
                  <input
                    type="checkbox"
                    checked={block.checked}
                    onChange={() => updateBlock(block.id, { checked: !block.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                ) : (
                  <Icon size={16} />
                )}
              </div>

              <div className="flex-1 flex items-start gap-2">
                {block.type === 'bullet' && <span className="pt-2.5 text-muted select-none">•</span>}
                <div className="flex-1">
                  {block.type === 'check' ? (
                    <textarea
                      value={block.content}
                      onChange={(e) => handleTextChange(block.id, e.target.value)}
                      onFocus={() => setActive(block.id)}
                      onBlur={() => setActive(null)}
                      onKeyDown={(e) => handleKey(e, index, block)}
                      rows={1}
                      placeholder="Type a checklist item..."
                      className={`w-full bg-transparent outline-none resize-none text-white placeholder:text-muted ${
                        block.checked ? 'line-through text-muted' : ''
                      }`}
                    />
                  ) : (
                    <textarea
                      value={block.content}
                      onChange={(e) => handleTextChange(block.id, e.target.value)}
                      onFocus={() => setActive(block.id)}
                      onBlur={() => setActive(null)}
                      onKeyDown={(e) => handleKey(e, index, block)}
                      rows={1}
                      placeholder={isHeading ? 'Heading' : 'Type a reminder...'}
                      className={`w-full bg-transparent outline-none resize-none text-white placeholder:text-muted ${
                        isHeading ? 'text-2xl font-bold' : ''
                      } ${isQuote ? 'border-l-2 border-primary pl-3 italic' : ''}`}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition pt-1">
                <button
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  title="Move up"
                  className="p-1.5 text-muted hover:text-white rounded hover:bg-card-light disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  title="Move down"
                  className="p-1.5 text-muted hover:text-white rounded hover:bg-card-light disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  title="Delete"
                  className="p-1.5 text-muted hover:text-danger rounded hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Add:</span>
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => {
            const Icon = BLOCK_ICONS[type]
            return (
              <button
                key={type}
                onClick={() => insertAfterCurrent(type)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-card-light hover:bg-card text-white rounded-lg border border-border transition"
              >
                <Icon size={14} />
                {BLOCK_LABELS[type]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
