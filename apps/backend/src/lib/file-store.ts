// Simple in-memory store — swap out for Firestore or PostgreSQL in production

export interface StoredFile {
  id: string
  userId: string
  originalName: string
  mimeType: string
  size: number
  storageKey: string
  url: string
  fileType: string
  pageCount?: number
  createdAt: string
  updatedAt: string
}

const store = new Map<string, StoredFile>()

export const fileStore = {
  create(file: StoredFile) {
    store.set(file.id, file)
    return file
  },
  get(id: string) {
    return store.get(id) ?? null
  },
  listByUser(userId: string) {
    return [...store.values()]
      .filter((f) => f.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  },
  update(id: string, patch: Partial<StoredFile>) {
    const existing = store.get(id)
    if (!existing) return null
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    store.set(id, updated)
    return updated
  },
  delete(id: string) {
    return store.delete(id)
  },
  usageByUser(userId: string) {
    const files = fileStore.listByUser(userId)
    return {
      used: files.reduce((sum, f) => sum + f.size, 0),
      limit: 500 * 1024 * 1024,
      fileCount: files.length,
    }
  },
}
