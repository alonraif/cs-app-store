import { Router, Request, Response } from 'express'
import { issueToken, validTokens } from '../middleware/adminAuth'

const router = Router()

// POST /api/admin/login
router.post('/login', (req: Request, res: Response) => {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    // No password configured — return a dummy token so the UI still works
    res.json({ token: 'no-auth' })
    return
  }
  const { password: supplied } = req.body as { password?: string }
  if (!supplied || supplied !== password) {
    res.status(401).json({ error: 'Wrong password' })
    return
  }
  res.json({ token: issueToken() })
})

// GET /api/admin/verify
router.get('/verify', (req: Request, res: Response) => {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    res.json({ ok: true })
    return
  }
  const token = req.headers['x-admin-token'] as string | undefined
  res.json({ ok: !!token && validTokens.has(token) })
})

export default router
