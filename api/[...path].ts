import { dispatchApi } from '../server/http.ts'

type VercelReq = {
  method?: string
  url?: string
  headers: { host?: string }
}

type VercelRes = {
  status: (code: number) => VercelRes
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

export const config = {
  maxDuration: 10,
}

export default async function handler(req: VercelReq, res: VercelRes) {
  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/', `https://${host}`)
  if (!url.pathname.startsWith('/api/')) {
    url.pathname = `/api${url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`}`
  }
  try {
    const result = await dispatchApi(req.method ?? 'GET', url)
    res.status(result.status).json(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    res.status(500).json({ error: message })
  }
}
