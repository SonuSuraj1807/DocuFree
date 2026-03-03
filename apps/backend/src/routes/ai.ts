import { Router } from 'express'
import axios from 'axios'
import { authGuard, type AuthRequest } from '../middleware/auth'

const router = Router()

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Free models to cycle through
const FREE_MODELS = [
  'google/gemini-flash-1.5-8b',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
]

function buildSystemPrompt(command: string, selectedText: string): string {
  const contextNote = selectedText
    ? `\nThe user has selected the following text from their document:\n"""\n${selectedText}\n"""\n`
    : ''

  return `You are an AI document assistant. You help users edit, rewrite, translate, and analyze document content.
${contextNote}
Respond concisely and directly. Do not wrap your response in markdown code blocks unless returning code.
If rewriting or translating, return only the transformed text.`
}

async function callOpenRouter(command: string, selectedText: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  for (const model of FREE_MODELS) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: buildSystemPrompt(command, selectedText) },
            { role: 'user',   content: command },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL ?? 'https://docufree.app',
            'X-Title': 'DocuFree',
          },
          timeout: 30000,
        },
      )

      const content = response.data?.choices?.[0]?.message?.content
      if (content) return content
    } catch (err: any) {
      // Rate limited or unavailable — try next model
      if (err.response?.status === 429 || err.response?.status === 503) continue
      throw err
    }
  }

  throw new Error('All AI models are currently unavailable. Please try again.')
}

// POST /api/ai/command
router.post('/command', authGuard, async (req: AuthRequest, res) => {
  const { command, selectedText = '' } = req.body
  if (!command?.trim()) {
    return res.status(400).json({ message: 'command is required' })
  }

  try {
    const result = await callOpenRouter(command.trim(), selectedText)
    return res.json({ result })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
})

// POST /api/ai/detect-fields
router.post('/detect-fields', authGuard, async (req: AuthRequest, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ message: 'text is required' })

  const command = `Extract structured fields from this document text. Return a JSON array of objects with shape:
{ type: "name"|"date"|"amount"|"address"|"email"|"phone", value: string }
Only return the JSON array, no extra text.

Document text:
${text.slice(0, 4000)}`

  try {
    const raw = await callOpenRouter(command, '')
    const clean = raw.replace(/```json|```/g, '').trim()
    const fields = JSON.parse(clean)
    return res.json({ fields })
  } catch {
    return res.json({ fields: [] })
  }
})

export default router
