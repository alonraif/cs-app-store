import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { requireAdminToken } from '../middleware/adminAuth'

const router = Router()

router.use(requireAdminToken)

const uploadsPath = process.env.UPLOADS_PATH || './uploads'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function makeStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(uploadsPath, subdir)
      ensureDir(dir)
      cb(null, dir)
    },
    filename: (_req, file, cb) => {
      const unique = crypto.randomBytes(8).toString('hex')
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${unique}${ext}`)
    },
  })
}

const screenshotUpload = multer({
  storage: makeStorage('screenshots'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

const installerUpload = multer({
  storage: makeStorage('installers'),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
})

// POST /api/uploads/screenshots  (multipart, field name: screenshots)
router.post(
  '/screenshots',
  screenshotUpload.array('screenshots', 10),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[]
      if (!files?.length) {
        res.status(400).json({ error: 'No files uploaded' })
        return
      }
      const paths = files.map((f) => `/uploads/screenshots/${f.filename}`)
      res.json({ paths })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/uploads/installer  (multipart, field name: installer)
router.post(
  '/installer',
  installerUpload.single('installer'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }
      const filePath = `/uploads/installers/${req.file.filename}`
      res.json({ path: filePath, originalName: req.file.originalname })
    } catch (err) {
      next(err)
    }
  }
)

export default router
