import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAdminToken } from '../middleware/adminAuth'

const router = Router()
const categorySchema = z.object({ name: z.string().min(1).max(60).trim() })

// GET /api/categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

// POST /api/categories
router.post('/', requireAdminToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = categorySchema.parse(req.body)
    const category = await prisma.category.create({ data: { name } })
    res.status(201).json(category)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/categories/:id
router.delete('/:id', requireAdminToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    await prisma.category.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
