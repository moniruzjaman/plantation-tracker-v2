import { db } from '@/lib/db'
import { requireApiKey, apiError, parseBody, readJson } from '@/lib/api'
import { appEntrySchema } from '@/lib/validation'

export async function GET() {
  try {
    const entries = await db.appEntry.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return Response.json(entries)
  } catch (error) {
    console.error('Failed to fetch app entries', error)
    return apiError(500, 'Failed to fetch app entries')
  }
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request)
  if (unauthorized) return unauthorized

  const raw = await readJson(request)
  if (raw === null) return apiError(400, 'Invalid JSON body')

  const { data, error } = parseBody(appEntrySchema, raw)
  if (error) return error

  try {
    const entry = await db.appEntry.create({ data })
    return Response.json(entry, { status: 201 })
  } catch (error) {
    console.error('Failed to create app entry', error)
    return apiError(500, 'Failed to create app entry')
  }
}
