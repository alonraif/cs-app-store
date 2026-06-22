import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { issueToken, validTokens, requireAdminToken } from '../middleware/adminAuth'
import { prisma } from '../lib/prisma'

const router = Router()

// POST /api/admin/login
router.post('/login', (req: Request, res: Response) => {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
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

// GET /api/admin/export
router.get('/export', requireAdminToken, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [tools, categories] = await Promise.all([
      prisma.tool.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
    ])
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: categories.map(c => ({ name: c.name })),
      tools: tools.map(({ id: _id, createdAt: _ca, updatedAt: _ua, ...t }) => t),
    }
    const date = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Disposition', `attachment; filename="cs-app-store-${date}.json"`)
    res.setHeader('Content-Type', 'application/json')
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/import
const importToolSchema = z.object({
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  longDescription: z.string().default(''),
  category: z.string().min(1),
  type: z.enum(['cli', 'desktop', 'webapp']),
  version: z.string().nullish(),
  owner: z.string().min(1),
  ownerContact: z.string().min(1),
  screenshots: z.array(z.string()).default([]),
  installCommand: z.string().nullish(),
  repoUrl: z.string().nullish(),
  downloadUrl: z.string().nullish(),
  installerFilename: z.string().nullish(),
  launchUrl: z.string().nullish(),
  installationInstructions: z.string().nullish(),
  usageInstructions: z.string().nullish(),
})

const importSchema = z.object({
  version: z.number().optional(),
  categories: z.array(z.object({ name: z.string().min(1) })).default([]),
  tools: z.array(importToolSchema).default([]),
})

router.post('/import', requireAdminToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categories, tools } = importSchema.parse(req.body)
    await prisma.$transaction(async (tx) => {
      await tx.tool.deleteMany()
      await tx.category.deleteMany()
      if (categories.length > 0) {
        await tx.category.createMany({ data: categories.map(c => ({ name: c.name })) })
      }
      if (tools.length > 0) {
        await tx.tool.createMany({
          data: tools.map(t => ({
            name: t.name,
            shortDescription: t.shortDescription,
            longDescription: t.longDescription ?? '',
            category: t.category,
            type: t.type,
            version: t.version ?? null,
            owner: t.owner,
            ownerContact: t.ownerContact,
            screenshots: t.screenshots ?? [],
            installCommand: t.installCommand ?? null,
            repoUrl: t.repoUrl ?? null,
            downloadUrl: t.downloadUrl ?? null,
            installerFilename: t.installerFilename ?? null,
            launchUrl: t.launchUrl ?? null,
            installationInstructions: t.installationInstructions ?? null,
            usageInstructions: t.usageInstructions ?? null,
          })),
        })
      }
    })
    res.json({ imported: { tools: tools.length, categories: categories.length } })
  } catch (err) {
    next(err)
  }
})

export default router
