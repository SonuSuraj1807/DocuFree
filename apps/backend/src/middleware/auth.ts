import type { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../lib/firebase-admin'

export interface AuthRequest extends Request {
  uid?: string
  userEmail?: string
}

export async function authGuard(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    req.uid       = decoded.uid
    req.userEmail = decoded.email
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
