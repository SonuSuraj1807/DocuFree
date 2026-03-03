import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'

import filesRouter    from './routes/files'
import aiRouter       from './routes/ai'
import exportRouter   from './routes/export'
import pdfToolsRouter from './routes/pdf-tools'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Security & basics ────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:5173'],
  credentials: true,
}))
app.use(compression() as any)
app.use(morgan('dev'))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
})
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'AI rate limit reached. Please wait a moment.' },
})

app.use(globalLimiter)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/files',     filesRouter)
app.use('/api/ai',        aiLimiter, aiRouter)
app.use('/api/export',    exportRouter)
app.use('/api/pdf',       pdfToolsRouter)

// ── 404 & error handlers ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message)
  res.status(500).json({ message: 'Internal server error' })
})

// ── Cron: clean up guest/temp files older than 24h ────────────────────────────
cron.schedule('0 * * * *', () => {
  console.log('[cron] Running temp file cleanup...')
  // TODO: iterate file store, delete files from guest UIDs older than 24h
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 DocuFree API running at http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`)
})

export default app
