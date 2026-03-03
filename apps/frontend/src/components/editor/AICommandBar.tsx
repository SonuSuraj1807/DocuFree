import { useState, useRef, useEffect } from 'react'
import { api } from '@/lib/api'
import { Sparkles, Send, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AICommandBarProps {
  onResult?: (result: string) => void
  selectedText?: string
}

const SUGGESTIONS = [
  'Rewrite this paragraph more formally',
  'Translate selected text to Spanish',
  'Detect all dates and amounts',
  'Summarize this document',
  'Make this text more concise',
]

export default function AICommandBar({ onResult, selectedText }: AICommandBarProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  async function handleSubmit(cmd?: string) {
    const command = cmd ?? input
    if (!command.trim()) return

    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/ai/command', {
        command,
        selectedText: selectedText ?? '',
      })
      setResult(data.result)
      onResult?.(data.result)
    } catch (e: any) {
      toast.error('AI command failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-black font-semibold px-4 py-3 rounded-full shadow-2xl transition-all text-sm z-50"
      >
        <Sparkles size={15} />
        AI Assistant
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] card shadow-2xl z-50 animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-600">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand-500" />
          <span className="text-sm font-medium text-white">AI Assistant</span>
          <span className="text-[10px] bg-surface-600 text-[var(--text-muted)] px-2 py-0.5 rounded font-mono">
            OpenRouter
          </span>
        </div>
        <button
          onClick={() => { setIsOpen(false); setResult(null); setInput('') }}
          className="p-1 rounded hover:bg-surface-600 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {selectedText && (
        <div className="px-4 py-2 bg-surface-700 border-b border-surface-600">
          <p className="text-[10px] label mb-1">Selected text</p>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">"{selectedText}"</p>
        </div>
      )}

      <div className="p-4">
        {/* Suggestions */}
        {!result && !loading && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); handleSubmit(s) }}
                className="text-[10px] bg-surface-700 hover:bg-surface-600 text-[var(--text-secondary)] hover:text-white px-2 py-1 rounded border border-surface-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mb-3 bg-surface-700 rounded-lg p-3 text-sm text-[var(--text-secondary)] leading-relaxed max-h-48 overflow-auto">
            {result}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            className="input flex-1"
            placeholder="Ask AI anything about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !input.trim()}
            className={cn(
              'p-2.5 rounded-md transition-all',
              loading || !input.trim()
                ? 'bg-surface-600 text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-brand-500 text-black hover:bg-brand-400',
            )}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}
