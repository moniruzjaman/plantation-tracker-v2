import { db } from '@/lib/db'
import { requireApiKey, apiError, parseBody, readJson } from '@/lib/api'
import { alertSchema } from '@/lib/validation'

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { detectedAt: 'desc' },
      include: { plantation: { select: { name: true, district: true } } },
    })
    return Response.json(alerts)
  } catch (error) {
    console.error('Failed to fetch alerts', error)
    return apiError(500, 'Failed to fetch alerts')
  }
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request)
  if (unauthorized) return unauthorized

  const raw = await readJson(request)
  if (raw === null) return apiError(400, 'Invalid JSON body')

  const { data, error } = parseBody(alertSchema, raw)
  if (error) return error

  try {
    const alert = await db.alert.create({ data })
    return Response.json(alert, { status: 201 })
  } catch (error) {
    console.error('Failed to create alert', error)
    return apiError(500, 'Failed to create alert')
  }
}
