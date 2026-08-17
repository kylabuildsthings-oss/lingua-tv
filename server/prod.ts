import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dispatchApi } from './http.ts'

const app = express()
const root = path.join(fileURLToPath(new URL('.', import.meta.url)), '..')
const dist = path.join(root, 'dist')

app.use(express.static(dist))

app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    next()
    return
  }
  try {
    const url = new URL(req.originalUrl, `http://${req.headers.host}`)
    const result = await dispatchApi(req.method, url)
    res.status(result.status).json(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    res.status(500).json({ error: message })
  }
})

app.use((_req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

const port = Number(process.env.PORT) || 4173
app.listen(port, () => {
  console.log(`LinguaTV running on http://localhost:${port}`)
})
