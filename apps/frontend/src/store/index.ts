import { create } from 'zustand'
import type { DocuFile, EditorState, ToolId, StorageUsage, CommandHistoryEntry, UploadProgress } from '@/types'

// ─── Files Store ────────────────────────────────────────────────────────────

interface FilesStore {
  files: DocuFile[]
  storageUsage: StorageUsage
  uploadQueue: UploadProgress[]
  setFiles: (files: DocuFile[]) => void
  addFile: (file: DocuFile) => void
  removeFile: (id: string) => void
  setStorageUsage: (u: StorageUsage) => void
  setUploadProgress: (progress: UploadProgress) => void
  clearUploadQueue: () => void
}

export const useFilesStore = create<FilesStore>((set) => ({
  files: [],
  storageUsage: { used: 0, limit: 500 * 1024 * 1024, fileCount: 0 },
  uploadQueue: [],
  setFiles: (files) => set({ files }),
  addFile: (file) => set((s) => ({ files: [file, ...s.files] })),
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  setStorageUsage: (storageUsage) => set({ storageUsage }),
  setUploadProgress: (progress) =>
    set((s) => ({
      uploadQueue: s.uploadQueue.some((u) => u.fileId === progress.fileId)
        ? s.uploadQueue.map((u) => (u.fileId === progress.fileId ? progress : u))
        : [...s.uploadQueue, progress],
    })),
  clearUploadQueue: () => set({ uploadQueue: [] }),
}))

// ─── Editor Store ────────────────────────────────────────────────────────────

interface EditorStore extends EditorState {
  history: CommandHistoryEntry[]
  historyIndex: number
  setFile: (file: DocuFile | null) => void
  setZoom: (zoom: number) => void
  setPage: (page: number) => void
  setTotalPages: (n: number) => void
  setActiveTool: (tool: ToolId | null) => void
  setDirty: (dirty: boolean) => void
  setLoading: (loading: boolean) => void
  pushHistory: (entry: CommandHistoryEntry) => void
  undo: () => void
  redo: () => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  fileId: null,
  file: null,
  isLoading: false,
  isDirty: false,
  zoom: 1,
  currentPage: 1,
  totalPages: 1,
  activeToolId: 'select',
  history: [],
  historyIndex: -1,

  setFile: (file) => set({ file, fileId: file?.id ?? null, currentPage: 1, isDirty: false }),
  setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.25, zoom)) }),
  setPage: (page) => set((s) => ({ currentPage: Math.min(s.totalPages, Math.max(1, page)) })),
  setTotalPages: (totalPages) => set({ totalPages }),
  setActiveTool: (activeToolId) => set({ activeToolId }),
  setDirty: (isDirty) => set({ isDirty }),
  setLoading: (isLoading) => set({ isLoading }),

  pushHistory: (entry) =>
    set((s) => {
      const trimmed = s.history.slice(0, s.historyIndex + 1)
      return { history: [...trimmed, entry], historyIndex: trimmed.length }
    }),

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < 0) return
    history[historyIndex].undo()
    set({ historyIndex: historyIndex - 1 })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    history[historyIndex + 1].redo()
    set({ historyIndex: historyIndex + 1 })
  },
}))
