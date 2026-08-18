import { dispatchApi } from '../server/http'

type VercelReq = {
  method?: string
  url?: string
  query?: Record<string, string | string[] | undefined>
  headers: { host?: string }
}

type VercelRes = {
  status: (code: number) => VercelRes
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

export default async function handler(req: VercelReq, res: VercelRes) {
  const host = req.headers.host ?? 'localhost'
  const url = new URL(req.url ?? '/api/channel', `https://${host}`)
  if (!url.pathname.startsWith('/api/')) {
    url.pathname = '/api/channel'
  }

  const query = req.query ?? {}
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string' && !url.searchParams.has(key)) {
      url.searchParams.set(key, value)
    }
  }

  try {
    const result = await dispatchApi(req.method ?? 'GET', url)
    res.status(result.status).json(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    res.status(500).json({ error: message })
  }
}
