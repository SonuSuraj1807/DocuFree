import { Router } from 'express'
import { authGuard, type AuthRequest } from '../middleware/auth'
import { fileStore } from '../lib/file-store'

const router = Router()

// POST /api/export/:fileId
// In a full implementation, Puppeteer (PDF), Canvas (PNG), etc. would be invoked here.
// This scaffold returns the original file URL with export metadata.
router.post('/:fileId', authGuard, async (req: AuthRequest, res) => {
  const { format = 'pdf' } = req.body
  const file = fileStore.get(req.params.fileId)

  if (!file || file.userId !== req.uid) {
    return res.status(404).json({ message: 'File not found' })
  }

  const validFormats = ['pdf', 'png', 'jpg', 'docx', 'txt']
  if (!validFormats.includes(format)) {
    return res.status(400).json({ message: `Invalid format. Must be one of: ${validFormats.join(', ')}` })
  }

  // TODO: invoke Puppeteer for PDF rendering, sharp for image export, mammoth for DOCX
  return res.json({
    success: true,
    exportUrl: file.url,
    format,
    fileName: file.originalName.replace(/\.[^.]+$/, '') + '.' + format,
  })
})

export default router
