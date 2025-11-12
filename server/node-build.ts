// server/node-build.ts
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import serverless from 'serverless-http'
import { createServer } from './index'

const app = createServer()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, '../../spa') 
app.use(express.static(distPath))


app.use((req, res, next) => {

  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return next()
  }

  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('File send error:', err)

      if (res.headersSent) return next(err as any)
      res.status(500).send('Server Error')
    }
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Fusion Starter server running on port ${port}`)
  console.log(`Frontend: http://localhost:${port}`)
  console.log(`API: http://localhost:${port}/api`)
})

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))

// === VERCEL: Export serverless handler ===
export const handler = serverless(app)