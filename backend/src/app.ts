import express from 'express'
import cors from 'cors'
import path from 'path'
import toolsRouter from './routes/tools'
import uploadsRouter from './routes/uploads'
import adminRouter from './routes/admin'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.use(cors({
  origin: (_origin, callback) => callback(null, true), // LAN tool — allow all origins
}))

app.use(express.json({ limit: '10mb' }))

const uploadsPath = process.env.UPLOADS_PATH || './uploads'
app.use('/uploads', express.static(path.resolve(uploadsPath)))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/admin', adminRouter)
app.use('/api/tools', toolsRouter)
app.use('/api/uploads', uploadsRouter)

app.use(errorHandler)

export default app
