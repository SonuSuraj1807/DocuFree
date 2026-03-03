import { Router } from 'express'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { authGuard, type AuthRequest } from '../middleware/auth'
import { uploadToStorage, deleteFromStorage, refreshSignedUrl } from '../services/storage'
import { fileStore } from '../lib/file-store'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
})

// POST /api/files/upload
router.post('/upload', authGuard, upload.single('file'), async (req: AuthRequest, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ message: 'No file provided' })

  try {
    const { storageKey, signedUrl, fileType } = await uploadToStorage(
      file.buffer,
      file.originalname,
      file.mimetype,
      req.uid!,
    )

    const stored = fileStore.create({
      id: uuid(),
      userId: req.uid!,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey,
      url: signedUrl,
      fileType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return res.status(201).json(stored)
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
})

// GET /api/files
router.get('/', authGuard, (req: AuthRequest, res) => {
  const files = fileStore.listByUser(req.uid!)
  return res.json(files)
})

// GET /api/files/usage
router.get('/usage', authGuard, (req: AuthRequest, res) => {
  return res.json(fileStore.usageByUser(req.uid!))
})

// GET /api/files/:id
router.get('/:id', authGuard, async (req: AuthRequest, res) => {
  const file = fileStore.get(req.params.id as string)
  if (!file || file.userId !== req.uid) {
    return res.status(404).json({ message: 'File not found' })
  }

  // Refresh signed URL on every fetch (in case it expired)
  try {
    const freshUrl = await refreshSignedUrl(file.storageKey, file.fileType)
    fileStore.update(file.id, { url: freshUrl })
    return res.json({ ...file, url: freshUrl })
  } catch {
    return res.json(file)
  }
})

// DELETE /api/files/:id
router.delete('/:id', authGuard, async (req: AuthRequest, res) => {
  const file = fileStore.get(req.params.id as string)
  if (!file || file.userId !== req.uid) {
    return res.status(404).json({ message: 'File not found' })
  }

  await deleteFromStorage(file.storageKey)
  fileStore.delete(file.id)
  return res.json({ success: true })
})

// POST /api/files/:id/save  (placeholder for future annotation saving)
router.post('/:id/save', authGuard, (req: AuthRequest, res) => {
  const file = fileStore.get(req.params.id as string)
  if (!file || file.userId !== req.uid) {
    return res.status(404).json({ message: 'File not found' })
  }
  fileStore.update(file.id, { updatedAt: new Date().toISOString() })
  return res.json({ success: true })
})

export default router
