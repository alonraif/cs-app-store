import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAdminToken } from '../middleware/adminAuth'

const router = Router()

const toolSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    shortDescription: z.string().min(1).max(200),
    longDescription: z.string().default(''),
    category: z.string().min(1, 'Category is required'),
    type: z.enum(['cli', 'desktop', 'webapp']),
    version: z.string().optional(),
    owner: z.string().min(1, 'Owner is required'),
    ownerContact: z.string().min(1, 'Owner contact is required'),
    screenshots: z.array(z.string()).default([]),
    installCommand: z.string().optional(),
    repoUrl: z.string().optional(),
    downloadUrl: z.string().optional(),
    launchUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'cli' && !data.installCommand?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'installCommand is required for CLI tools',
        path: ['installCommand'],
      })
    }
    if (data.type === 'webapp' && !data.launchUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'launchUrl is required for webapp tools',
        path: ['launchUrl'],
      })
    }
  })

// GET /api/tools
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tools = await prisma.tool.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(tools)
  } catch (err) {
    next(err)
  }
})

// GET /api/tools/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tool = await prisma.tool.findUnique({ where: { id: req.params.id } })
    if (!tool) {
      res.status(404).json({ error: 'Tool not found' })
      return
    }
    res.json(tool)
  } catch (err) {
    next(err)
  }
})

// POST /api/tools
router.post('/', requireAdminToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = toolSchema.parse(req.body)
    const tool = await prisma.tool.create({ data })
    res.status(201).json(tool)
  } catch (err) {
    next(err)
  }
})

// PUT /api/tools/:id
router.put('/:id', requireAdminToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exists = await prisma.tool.findUnique({ where: { id: req.params.id } })
    if (!exists) {
      res.status(404).json({ error: 'Tool not found' })
      return
    }
    const data = toolSchema.parse(req.body)
    const tool = await prisma.tool.update({ where: { id: req.params.id }, data })
    res.json(tool)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/tools/:id
router.delete('/:id', requireAdminToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exists = await prisma.tool.findUnique({ where: { id: req.params.id } })
    if (!exists) {
      res.status(404).json({ error: 'Tool not found' })
      return
    }
    await prisma.tool.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
