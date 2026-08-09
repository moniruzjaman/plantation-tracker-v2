import { db } from '@/lib/db'
import { requireApiKey, apiError, parseBody, readJson } from '@/lib/api'
import { plantationSchema } from '@/lib/validation'

export async function GET() {
  try {
    const plantations = await db.plantation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { alerts: true, fieldData: true } },
      },
    })
    return Response.json(plantations)
  } catch (error) {
    console.error('Failed to fetch plantations', error)
    return apiError(500, 'Failed to fetch plantations')
  }
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request)
  if (unauthorized) return unauthorized

  const raw = await readJson(request)
  if (raw === null) return apiError(400, 'Invalid JSON body')

  const { data, error } = parseBody(plantationSchema, raw)
  if (error) return error

  try {
    const plantation = await db.plantation.create({ data })
    return Response.json(plantation, { status: 201 })
  } catch (error) {
    console.error('Failed to create plantation', error)
    return apiError(500, 'Failed to create plantation')
  }
}
