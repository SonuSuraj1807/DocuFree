import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/store'
import { api } from '@/lib/api'
import EditorToolbar from '@/components/editor/EditorToolbar'
import PdfViewer from '@/components/pdf/PdfViewer'
import AICommandBar from '@/components/editor/AICommandBar'
import { ArrowLeft, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import type { DocuFile } from '@/types'

export default function EditorPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const { file, isLoading, setFile, setLoading, undo, redo } = useEditorStore()

  useEffect(() => {
    if (!fileId) return
    setLoading(true)
    api.get<DocuFile>(`/files/${fileId}`)
      .then(({ data }) => setFile(data))
      .catch(() => { toast.error('File not found'); navigate('/dashboard') })
      .finally(() => setLoading(false))
  }, [fileId])

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (ctrl && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (ctrl && e.key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSave = useCallback(async () => {
    if (!file) return
    try {
      await api.post(`/files/${file.id}/save`, {})
      toast.success('Saved')
    } catch {
      toast.error('Save failed')
    }
  }, [file])

  const handleExport = useCallback(() => {
    if (!file) return
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.originalName
    link.click()
  }, [file])

  if (isLoading || !file) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[var(--text-muted)] font-mono tracking-widest">LOADING EDITOR</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Breadcrumb bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-800 border-b border-surface-700">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded hover:bg-surface-700 text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
        </button>
        <FileText size={14} className="text-brand-500" />
        <span className="text-sm text-white font-medium">{file.originalName}</span>
        <span className="text-xs text-[var(--text-muted)] font-mono uppercase">{file.fileType}</span>
      </div>

      {/* Toolbar */}
      <EditorToolbar onSave={handleSave} onExport={handleExport} />

      {/* Editor canvas */}
      <div className="flex-1 overflow-hidden flex">
        {file.fileType === 'pdf' && <PdfViewer url={file.url} />}
        {(file.fileType === 'docx' || file.fileType === 'doc') && (
          <DocxViewer fileId={file.id} />
        )}
        {file.fileType === 'image' && (
          <div className="flex-1 overflow-auto bg-surface-900 flex items-center justify-center p-8">
            <img src={file.url} alt={file.originalName} className="max-w-full max-h-full object-contain shadow-2xl rounded" />
          </div>
        )}
        {file.fileType === 'txt' && <TxtViewer url={file.url} />}
      </div>

      {/* AI Command Bar */}
      <AICommandBar />
    </div>
  )
}

function DocxViewer({ fileId }: { fileId: string }) {
  return (
    <div className="flex-1 overflow-auto bg-white p-8">
      <div id="docx-container" className="max-w-3xl mx-auto prose prose-sm" />
    </div>
  )
}

function TxtViewer({ url }: { url: string }) {
  return (
    <iframe src={url} className="flex-1 bg-surface-900" title="text viewer" />
  )
}
