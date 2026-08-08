'use client'

import { useState } from 'react'
import { Bold, Italic, Underline, List } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)

  const exec = (command: string) => {
    document.execCommand(command, false)
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML)
  }

  return (
    <div className={`border rounded-lg bg-card-light overflow-hidden transition ${isFocused ? 'border-primary ring-1 ring-primary/40' : 'border-border'}`}>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-card">
        <button
          type="button"
          onClick={() => exec('bold')}
          className="p-2 rounded hover:bg-card-light text-muted hover:text-white"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec('italic')}
          className="p-2 rounded hover:bg-card-light text-muted hover:text-white"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec('underline')}
          className="p-2 rounded hover:bg-card-light text-muted hover:text-white"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          className="p-2 rounded hover:bg-card-light text-muted hover:text-white"
          title="Bullet List"
        >
          <List size={16} />
        </button>
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        className="min-h-[160px] p-4 outline-none text-white empty:before:content-[attr(data-placeholder)] empty:before:text-muted"
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false)
          onChange(e.currentTarget.innerHTML)
        }}
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  )
}
