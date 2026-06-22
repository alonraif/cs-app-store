import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'

// In-memory token store — cleared on server restart
export const validTokens = new Set<string>()

export function issueToken(): string {
  const token = crypto.randomBytes(32).toString('hex')
  validTokens.add(token)
  return token
}

export function requireAdminToken(req: Request, res: Response, next: NextFunction): void {
  if (!process.env.ADMIN_PASSWORD) {
    // No password configured — admin is open
    next()
    return
  }
  const token = req.headers['x-admin-token'] as string | undefined
  if (!token || !validTokens.has(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}
