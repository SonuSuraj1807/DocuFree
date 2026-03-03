import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { useFilesStore } from '@/store'
import { useFileUpload } from '@/hooks/useFileUpload'
import { api } from '@/lib/api'
import { formatBytes, truncate, cn } from '@/lib/utils'
import {
  Upload, FileText, FileImage, Trash2, Edit3,
  HardDrive, Plus, Search, MoreVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { DocuFile } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { files, storageUsage, uploadQueue, setFiles, setStorageUsage, removeFile } = useFilesStore()
  const { getRootProps, getInputProps, isDragActive } = useFileUpload()
  const [search, setSearch] = useState('')
  const [loadingFiles, setLoadingFiles] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [filesRes, usageRes] = await Promise.all([
          api.get<DocuFile[]>('/files'),
          api.get('/files/usage'),
        ])
        setFiles(filesRes.data)
        setStorageUsage(usageRes.data)
      } catch (e: any) {
        toast.error('Failed to load files')
      } finally {
        setLoadingFiles(false)
      }
    }
    load()
  }, [])

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/files/${id}`)
      removeFile(id)
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = files.filter((f) =>
    f.originalName.toLowerCase().includes(search.toLowerCase())
  )

  const usagePct = Math.min(100, (storageUsage.used / storageUsage.limit) * 100)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-syne font-bold text-2xl text-white mb-1">
            Good {getGreeting()}, {user?.displayName?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {files.length} document{files.length !== 1 ? 's' : ''} · {formatBytes(storageUsage.used)} used
          </p>
        </div>
        <label className="btn-primary cursor-pointer">
          <Plus size={15} />
          Upload file
          <input {...getInputProps()} className="hidden" />
        </label>
      </div>

      {/* Storage bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <HardDrive size={15} className="text-brand-500" />
          <span className="text-sm font-medium text-white">Storage</span>
          <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">
            {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.limit)}
          </span>
        </div>
        <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${usagePct}%`,
              background: usagePct > 80 ? '#ff4444' : 'linear-gradient(90deg, #00e5ff, #b388ff)',
            }}
          />
        </div>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 mb-6 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-brand-500 bg-[var(--accent-dim)]'
            : 'border-surface-600 hover:border-surface-500 bg-surface-800',
        )}
      >
        <input {...getInputProps()} />
        <Upload size={28} className={cn('mx-auto mb-3', isDragActive ? 'text-brand-500' : 'text-[var(--text-muted)]')} />
        <p className="text-sm font-medium text-white mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          PDF, DOCX, DOC, images, TXT · Max 100 MB
        </p>
      </div>

      {/* Upload queue */}
      {uploadQueue.filter((u) => u.status !== 'done').length > 0 && (
        <div className="mb-6 space-y-2">
          {uploadQueue
            .filter((u) => u.status !== 'done')
            .map((u) => (
              <div key={u.fileId} className="card p-3 flex items-center gap-3">
                <FileText size={14} className="text-brand-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{u.fileName}</p>
                  <div className="h-1 bg-surface-600 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">{u.progress}%</span>
              </div>
            ))}
        </div>
      )}

      {/* Search */}
      {files.length > 0 && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="input pl-9"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* File grid */}
      {loadingFiles ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {search ? 'No files match your search' : 'Upload your first document to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onOpen={() => navigate(`/editor/${file.id}`)}
              onDelete={(e) => handleDelete(file.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FileCard({
  file, onOpen, onDelete,
}: { file: DocuFile; onOpen: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const icon = file.fileType === 'pdf'
    ? <FileText size={20} className="text-[#ff6b6b]" />
    : file.fileType === 'docx' || file.fileType === 'doc'
    ? <FileText size={20} className="text-brand-500" />
    : <FileImage size={20} className="text-[#b388ff]" />

  return (
    <div
      onClick={onOpen}
      className="card p-5 cursor-pointer hover:border-surface-500 hover:bg-surface-700 transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.originalName}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">{formatBytes(file.size)}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen() }}
            className="p-1.5 rounded hover:bg-surface-600 text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-surface-600 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] bg-surface-600 px-2 py-0.5 rounded font-mono uppercase tracking-wider text-[var(--text-muted)]">
          {file.fileType}
        </span>
        {file.pageCount && (
          <span className="text-[10px] text-[var(--text-muted)]">{file.pageCount} pages</span>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
