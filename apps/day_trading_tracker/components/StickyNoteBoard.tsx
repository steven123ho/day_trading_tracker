'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ArrowDownRight, Edit, ChevronUp, ChevronDown } from 'lucide-react'
import StickyNoteModal from './StickyNoteModal'
import SignInModal from './SignInModal'

interface Note {
  id: string
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  transparent: boolean
  z_index: number
}

const COLORS = ['#facc15', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#e2e8f0']

function newNote(x = 20, y = 20): Note {
  return {
    id: crypto.randomUUID(),
    content: '',
    x,
    y,
    width: 200,
    height: 160,
    rotation: 0,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    transparent: true,
    z_index: 0,
  }
}

interface StickyNoteBoardProps {
  onNewTrade?: () => void
}

export default function StickyNoteBoard({ onNewTrade }: StickyNoteBoardProps) {
  const supabase = createClient()
  const boardRef = useRef<HTMLDivElement>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [modalNote, setModalNote] = useState<Note | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [boardOpen, setBoardOpen] = useState(true)
  const [topZ, setTopZ] = useState(0)
  const [signInOpen, setSignInOpen] = useState(false)
  const [signInAction, setSignInAction] = useState('')
  const draggingRef = useRef<{ id: string; startX: number; startY: number; noteX: number; noteY: number } | null>(null)
  const resizingRef = useRef<{ id: string; startW: number; startH: number; startX: number; startY: number } | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNotesRef = useRef<Note[] | null>(null)
  const pendingAddRef = useRef(false)

  useEffect(() => {
    loadNotes()
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        if (pendingNotesRef.current) saveNotesToDb(pendingNotesRef.current)
      }
    }
  }, [])

  useEffect(() => {
    function onMouseUp() {
      draggingRef.current = null
      resizingRef.current = null
    }

    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [])

  useEffect(() => {
    if (boardOpen && pendingAddRef.current) {
      pendingAddRef.current = false
      addNote()
    }
  }, [boardOpen])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (draggingRef.current) {
        const { id, startX, startY, noteX, noteY } = draggingRef.current
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        updateNote(id, { x: noteX + dx, y: noteY + dy })
      }
      if (resizingRef.current) {
        const { id, startW, startH, startX, startY } = resizingRef.current
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        updateNote(id, { width: Math.max(120, startW + dx), height: Math.max(80, startH + dy) })
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [notes])

  async function loadNotes() {
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('sticky_notes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    const loaded = (data || []).map((n) => ({
      id: n.id,
      content: n.content || '',
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      rotation: n.rotation,
      color: n.color || '#facc15',
      transparent: n.transparent || false,
      z_index: n.z_index,
    }))

    setNotes(loaded)
    setTopZ(loaded.length > 0 ? Math.max(...loaded.map((n) => n.z_index)) : 0)
    setLoading(false)
  }

  function queueSave(nextNotes: Note[]) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    pendingNotesRef.current = nextNotes
    saveTimeoutRef.current = setTimeout(() => saveNotesToDb(nextNotes), 800)
  }

  async function saveNotesToDb(nextNotes: Note[]) {
    pendingNotesRef.current = null
    if (nextNotes.length === 0) return
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return

    await supabase
      .from('sticky_notes')
      .upsert(
        nextNotes.map((note) => ({
          id: note.id,
          user_id: session.user.id,
          content: note.content,
          x: note.x,
          y: note.y,
          width: note.width,
          height: note.height,
          rotation: note.rotation,
          color: note.color,
          transparent: note.transparent,
          z_index: note.z_index,
        }))
      )
  }

  async function deleteNoteFromDb(id: string) {
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) return
    await supabase.from('sticky_notes').delete().eq('id', id).eq('user_id', session.user.id)
  }

  function bringToFront(id: string) {
    const nextZ = topZ + 1
    setTopZ(nextZ)
    updateNote(id, { z_index: nextZ })
  }

  async function addNote() {
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) {
      setSignInAction('add a sticky note')
      setSignInOpen(true)
      return
    }

    if (!boardOpen) {
      pendingAddRef.current = true
      setBoardOpen(true)
      return
    }
    if (!boardRef.current) return
    const board = boardRef.current
    const x = Math.min(40, Math.max(0, board.clientWidth - 220))
    const y = Math.min(40, Math.max(0, board.clientHeight - 180))
    const nextZ = topZ + 1
    const note = { ...newNote(x, y), z_index: nextZ }
    note.width = Math.min(200, Math.max(120, board.clientWidth - note.x))
    note.height = Math.min(160, Math.max(80, board.clientHeight - note.y))
    const next = [...notes, note]
    setNotes(next)
    setTopZ(nextZ)
    setHoverId(note.id)
    queueSave(next)
  }

  function updateNote(id: string, changes: Partial<Note>) {
    const next = notes.map((n) => {
      if (n.id !== id) return n
      const updated = { ...n, ...changes }
      if (boardRef.current) {
        const board = boardRef.current
        updated.width = Math.min(Math.max(120, updated.width), board.clientWidth)
        updated.height = Math.min(Math.max(80, updated.height), board.clientHeight)
        updated.x = Math.min(Math.max(0, updated.x), Math.max(0, board.clientWidth - updated.width))
        updated.y = Math.min(Math.max(0, updated.y), Math.max(0, board.clientHeight - updated.height))
      }
      return updated
    })
    setNotes(next)
    queueSave(next)
  }

  function removeNote(id: string) {
    const next = notes.filter((n) => n.id !== id)
    setNotes(next)
    setHoverId(null)
    deleteNoteFromDb(id)
  }

  function startDrag(e: React.MouseEvent, note: Note) {
    e.preventDefault()
    draggingRef.current = { id: note.id, startX: e.clientX, startY: e.clientY, noteX: note.x, noteY: note.y }
    bringToFront(note.id)
  }

  function startResize(e: React.MouseEvent, note: Note) {
    e.preventDefault()
    e.stopPropagation()
    resizingRef.current = { id: note.id, startW: note.width, startH: note.height, startX: e.clientX, startY: e.clientY }
    bringToFront(note.id)
  }

  function clearBoardFocus() {
    setHoverId(null)
  }

  function closeModal() {
    setModalNote(null)
    setHoverId(null)
  }

  function saveModal(id: string, content: string, color: string, transparent: boolean) {
    updateNote(id, { content, color, transparent })
    setModalNote(null)
  }

  function deleteModal(id: string) {
    removeNote(id)
    setModalNote(null)
  }

  function openModal(note: Note) {
    setModalNote(note)
    bringToFront(note.id)
  }

  if (loading) return <div className="text-center py-12 text-muted">Loading board...</div>

  return (
    <>
      <div className="w-full bg-background-soft">
        <div className="flex items-center justify-between px-4 pt-5 pb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {!boardOpen && (
              <button
                onClick={() => setBoardOpen(true)}
                className="p-1 text-muted hover:text-white hover:bg-card-light rounded-lg transition shrink-0"
                title="Expand board"
              >
                <ChevronDown size={18} />
              </button>
            )}
            <h1 className="text-xl font-semibold text-white text-left truncate min-w-0">
              Trading Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={addNote}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition whitespace-nowrap"
            >
              <Plus size={16} /> Add Sticky
            </button>
            {onNewTrade && (
              <button
                onClick={async () => {
                  const { data: session } = await supabase.auth.getUser()
                  if (!session.user) {
                    setSignInAction('add a new trade')
                    setSignInOpen(true)
                    return
                  }
                  onNewTrade()
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition shadow-[0_0_12px_rgba(34,211,238,0.6)] ring-1 ring-primary/50 whitespace-nowrap"
              >
                New Trade
              </button>
            )}
          </div>
        </div>
      </div>

      {boardOpen && (
        <div
          ref={boardRef}
          onMouseDown={clearBoardFocus}
          className="relative w-full h-[75vh] bg-background-soft overflow-hidden"
        >
          {notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted pointer-events-none">
              Click Add Sticky to create your first note
            </div>
          )}

          {notes.map((note) => {
            const isTransparent = note.transparent

            return (
              <div
                key={note.id}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  startDrag(e, note)
                }}
                onMouseEnter={() => setHoverId(note.id)}
                onMouseLeave={() => setHoverId((id) => (id === note.id ? null : id))}
                className={`absolute rounded-lg p-4 flex flex-col group cursor-grab active:cursor-grabbing ${!isTransparent ? 'shadow-lg' : ''}`}
                style={{
                  left: note.x,
                  top: note.y,
                  width: note.width,
                  height: note.height,
                  backgroundColor: isTransparent ? 'transparent' : note.color,
                  color: isTransparent ? 'var(--text-body-color, #e2e8f0)' : '#111827',
                  border: hoverId === note.id ? '1px dashed var(--border-color, #1f2937)' : (isTransparent ? '1px dashed transparent' : 'none'),
                  transform: `rotate(${note.rotation}deg)`,
                  zIndex: note.z_index,
                }}
              >
                <div
                  className="flex-1 w-full overflow-auto text-sm font-medium break-words [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:list-item"
                  style={{ color: isTransparent ? 'var(--text-body-color, #e2e8f0)' : '#111827' }}
                  dangerouslySetInnerHTML={{ __html: note.content || '<div class="opacity-50">Empty sticky note</div>' }}
                />

                <div className="flex items-center justify-end mt-2 h-6" onMouseDown={(e) => e.stopPropagation()}>
                  {hoverId === note.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(note) }}
                        className="p-1 text-black/60 hover:text-black rounded"
                        title="Edit"
                      >
                        <Edit size={14} style={{ color: isTransparent ? '#94a3b8' : undefined }} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNote(note.id) }}
                        className="p-1 text-black/60 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} style={{ color: isTransparent ? '#94a3b8' : undefined }} />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className="absolute -right-1.5 -bottom-1.5 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => startResize(e, note)}
                >
                  <ArrowDownRight size={14} style={{ color: isTransparent ? '#94a3b8' : 'rgba(0,0,0,0.4)' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {boardOpen && (
        <div className="w-full bg-background-soft border-b border-border py-1.5 flex justify-center">
          <button
            onClick={() => setBoardOpen(false)}
            className="p-1 text-muted hover:text-white hover:bg-card-light rounded-lg transition"
            title="Collapse board"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      )}

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        action={signInAction}
      />

      <StickyNoteModal
        note={modalNote}
        open={!!modalNote}
        onClose={closeModal}
        onSave={saveModal}
        onDelete={deleteModal}
      />
    </>
  )
}
