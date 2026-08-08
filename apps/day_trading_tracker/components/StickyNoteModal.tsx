'use client'

import { useEffect, useRef, useState } from 'react'
import { Bold, Type, Palette, Highlighter, X, Type as TypeIcon, Square, List, ListOrdered, CheckSquare } from 'lucide-react'

interface Note {
  id: string
  content: string
  color: string
  transparent: boolean
}

interface StickyNoteModalProps {
  note: Note | null
  open: boolean
  onClose: () => void
  onSave: (id: string, content: string, color: string, transparent: boolean) => void
  onDelete: (id: string) => void
}

const COLORS = ['#facc15', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#e2e8f0']
const TEXT_COLORS = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#9333ea', '#ffffff', '#000000']
const HIGHLIGHTS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa', 'transparent']
const FONTS = [
  { id: 'Space Grotesk', label: 'Modern' },
  { id: 'Inter', label: 'Clean' },
  { id: 'Georgia', label: 'Serif' },
  { id: 'Courier New', label: 'Mono' },
]
const FONT_SIZES = [
  { value: '2', label: 'Small' },
  { value: '3', label: 'Normal' },
  { value: '4', label: 'Large' },
  { value: '5', label: 'Huge' },
]

export default function StickyNoteModal({ note, open, onClose, onSave, onDelete }: StickyNoteModalProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#facc15')
  const [isTransparent, setIsTransparent] = useState(false)
  const [activeTab, setActiveTab] = useState<'color' | 'text' | 'highlight' | null>(null)

  useEffect(() => {
    if (open && note) {
      setContent(note.content)
      setColor(note.color)
      setIsTransparent(note.transparent)
      setActiveTab(null)
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = note.content || '<div><br></div>'
          editorRef.current.focus()
        }
      }, 50)
    }
  }, [open, note])

  function exec(command: string, value: string | undefined = undefined) {
    editorRef.current?.focus()
    if (['foreColor', 'backColor', 'fontSize', 'fontName'].includes(command)) {
      document.execCommand('styleWithCSS', false, 'true')
    }
    document.execCommand(command, false, value ?? '')
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  function insertList(tag: 'ul' | 'ol') {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const list = document.createElement(tag)
    const li = document.createElement('li')
    const text = range.extractContents()
    if (text && text.textContent) {
      li.appendChild(text)
    } else {
      li.appendChild(document.createElement('br'))
    }
    list.appendChild(li)
    range.insertNode(list)
    const newRange = document.createRange()
    newRange.selectNodeContents(li)
    newRange.collapse(false)
    sel.removeAllRanges()
    sel.addRange(newRange)
    handleInput()
  }

  function handleInput() {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  function handleSave() {
    if (!note) return
    onSave(note.id, content, color, isTransparent)
    onClose()
  }

  if (!open || !note) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--card-color, #12161f)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TypeIcon size={18} /> Edit Sticky Note
          </h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-white rounded hover:bg-card-light">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exec('bold')}
              className="p-2 rounded bg-card-light text-white hover:bg-card border border-border"
              title="Bold"
            >
              <Bold size={16} />
            </button>

            <div className="relative">
              <button
                onClick={() => setActiveTab(activeTab === 'text' ? null : 'text')}
                className={`p-2 rounded border border-border ${activeTab === 'text' ? 'bg-primary text-black' : 'bg-card-light text-white hover:bg-card'}`}
                title="Text color"
              >
                <Type size={16} />
              </button>
              {activeTab === 'text' && (
                <div className="absolute top-10 left-0 z-50 bg-card border border-border rounded-lg p-2 shadow-xl flex items-center gap-2">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { exec('foreColor', c); setActiveTab(null) }}
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setActiveTab(activeTab === 'highlight' ? null : 'highlight')}
                className={`p-2 rounded border border-border ${activeTab === 'highlight' ? 'bg-primary text-black' : 'bg-card-light text-white hover:bg-card'}`}
                title="Highlight"
              >
                <Highlighter size={16} />
              </button>
              {activeTab === 'highlight' && (
                <div className="absolute top-10 left-0 z-50 bg-card border border-border rounded-lg p-2 shadow-xl flex items-center gap-2">
                  {HIGHLIGHTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { exec(c === 'transparent' ? 'removeFormat' : 'backColor', c === 'transparent' ? '' : c); setActiveTab(null) }}
                      className={`w-6 h-6 rounded-full border border-white/10 ${c === 'transparent' ? 'bg-card-light' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => insertList('ul')}
              className="p-2 rounded bg-card-light text-white hover:bg-card border border-border"
              title="Bullet list"
            >
              <List size={16} />
            </button>

            <button
              onClick={() => insertList('ol')}
              className="p-2 rounded bg-card-light text-white hover:bg-card border border-border"
              title="Numbered list"
            >
              <ListOrdered size={16} />
            </button>

            <button
              onClick={() => exec('insertHTML', '<input type="checkbox" />&nbsp;')}
              className="p-2 rounded bg-card-light text-white hover:bg-card border border-border"
              title="Checklist item"
            >
              <CheckSquare size={16} />
            </button>

            <select
              onChange={(e) => { exec('fontName', e.target.value); e.target.value = '' }}
              className="px-3 py-2 rounded bg-card-light border border-border text-white text-sm focus:border-primary outline-none"
            >
              <option value="">Font</option>
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>

            <select
              onChange={(e) => { exec('fontSize', e.target.value); e.target.value = '' }}
              className="px-3 py-2 rounded bg-card-light border border-border text-white text-sm focus:border-primary outline-none"
            >
              <option value="">Size</option>
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className="relative ml-auto">
              <button
                onClick={() => setActiveTab(activeTab === 'color' ? null : 'color')}
                className="flex items-center gap-2 px-3 py-2 rounded border border-border bg-card-light text-white hover:bg-card text-sm"
              >
                <Palette size={14} /> Note Color
              </button>
              {activeTab === 'color' && (
                <div className="absolute top-10 right-0 z-50 bg-card border border-border rounded-lg p-2 shadow-xl flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setIsTransparent(false); setActiveTab(null) }}
                      className={`w-6 h-6 rounded-full border border-black/10 ${color === c && !isTransparent ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    onClick={() => { setIsTransparent(true); setActiveTab(null) }}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${isTransparent ? 'bg-primary text-black' : 'bg-card-light text-white'}`}
                  >
                    <Square size={10} /> Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onClick={handleInput}
            className="min-h-[300px] p-4 rounded-xl border border-border outline-none text-white text-base overflow-auto [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:list-item"
            style={{
              backgroundColor: isTransparent ? 'transparent' : color,
              color: isTransparent ? 'var(--text-body-color, #e2e8f0)' : '#111827',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { note && onDelete(note.id) }}
              className="px-4 py-2 text-sm text-danger hover:bg-red-500/10 rounded-lg transition"
            >
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-muted hover:text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
