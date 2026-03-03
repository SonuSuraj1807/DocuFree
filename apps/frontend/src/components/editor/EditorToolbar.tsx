import { useEditorStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  MousePointer2, Type, ImagePlus, PenLine,
  Highlighter, EyeOff, PenSquare,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Undo2, Redo2, Save, Download,
} from 'lucide-react'
import type { ToolId } from '@/types'

interface EditorToolbarProps {
  onSave: () => void
  onExport: () => void
}

const tools: { id: ToolId; icon: React.ReactNode; label: string }[] = [
  { id: 'select',    icon: <MousePointer2 size={15} />, label: 'Select (V)' },
  { id: 'text',      icon: <Type size={15} />,          label: 'Add text (T)' },
  { id: 'image',     icon: <ImagePlus size={15} />,     label: 'Insert image (I)' },
  { id: 'draw',      icon: <PenLine size={15} />,       label: 'Draw (D)' },
  { id: 'highlight', icon: <Highlighter size={15} />,   label: 'Highlight (H)' },
  { id: 'redact',    icon: <EyeOff size={15} />,        label: 'Redact (R)' },
  { id: 'signature', icon: <PenSquare size={15} />,     label: 'Signature (S)' },
]

export default function EditorToolbar({ onSave, onExport }: EditorToolbarProps) {
  const {
    activeToolId, setActiveTool,
    zoom, setZoom,
    currentPage, totalPages, setPage,
    isDirty, undo, redo,
    history, historyIndex,
  } = useEditorStore()

  const canUndo = historyIndex >= 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-800 border-b border-surface-700">
      {/* Tool group */}
      <div className="flex items-center gap-0.5 bg-surface-700 rounded-lg p-1">
        {tools.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setActiveTool(t.id)}
            className={cn(
              'p-2 rounded-md transition-all',
              activeToolId === t.id
                ? 'bg-brand-500 text-black'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-surface-600',
            )}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-surface-600 mx-1" />

      {/* Undo / redo */}
      <div className="flex items-center gap-0.5">
        <button
          title="Undo (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-md text-[var(--text-secondary)] hover:text-white hover:bg-surface-700 disabled:opacity-30 transition-all"
        >
          <Undo2 size={15} />
        </button>
        <button
          title="Redo (Ctrl+Shift+Z)"
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-md text-[var(--text-secondary)] hover:text-white hover:bg-surface-700 disabled:opacity-30 transition-all"
        >
          <Redo2 size={15} />
        </button>
      </div>

      <div className="w-px h-6 bg-surface-600 mx-1" />

      {/* Page nav */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded hover:bg-surface-700 text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-mono text-[var(--text-secondary)] min-w-[60px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded hover:bg-surface-700 text-[var(--text-secondary)] hover:text-white disabled:opacity-30 transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="w-px h-6 bg-surface-600 mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(zoom - 0.25)}
          className="p-1.5 rounded hover:bg-surface-700 text-[var(--text-secondary)] hover:text-white transition-all"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-mono text-[var(--text-secondary)] min-w-[44px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.25)}
          className="p-1.5 rounded hover:bg-surface-700 text-[var(--text-secondary)] hover:text-white transition-all"
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <button
        onClick={onSave}
        className={cn('btn-ghost text-xs gap-1.5', isDirty && 'text-brand-500')}
        title="Save (Ctrl+S)"
      >
        <Save size={14} />
        {isDirty ? 'Save*' : 'Saved'}
      </button>
      <button onClick={onExport} className="btn-primary text-xs">
        <Download size={14} />
        Export
      </button>
    </div>
  )
}
