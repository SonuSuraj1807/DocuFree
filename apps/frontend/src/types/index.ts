export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type FileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'image'

export interface DocuFile {
  id: string
  userId: string
  name: string
  originalName: string
  fileType: FileType
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  pageCount?: number
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number     // 0–100
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
}

export interface StorageUsage {
  used: number         // bytes
  limit: number        // bytes
  fileCount: number
}

export interface EditorState {
  fileId: string | null
  file: DocuFile | null
  isLoading: boolean
  isDirty: boolean
  zoom: number         // 0.5 – 3.0
  currentPage: number
  totalPages: number
  activeToolId: ToolId | null
}

export type ToolId =
  | 'select'
  | 'text'
  | 'image'
  | 'draw'
  | 'highlight'
  | 'redact'
  | 'signature'
  | 'crop'

export interface AICommand {
  type: 'rewrite' | 'translate' | 'detect_fields' | 'summarize'
  input: string
  options?: Record<string, string>
}

export interface AIResult {
  type: AICommand['type']
  output: string
  fields?: DetectedField[]
}

export interface DetectedField {
  type: 'name' | 'date' | 'amount' | 'address' | 'email' | 'phone'
  value: string
  pageIndex: number
  boundingBox: { x: number; y: number; w: number; h: number }
}

export interface CommandHistoryEntry {
  id: string
  timestamp: number
  description: string
  undo: () => void
  redo: () => void
}
