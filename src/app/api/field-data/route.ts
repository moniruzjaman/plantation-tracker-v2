import { db } from '@/lib/db'
import { requireApiKey, apiError, parseBody, readJson } from '@/lib/api'
import { fieldDataSchema } from '@/lib/validation'

export async function GET() {
  try {
    const records = await db.fieldData.findMany({
      orderBy: { collectedAt: 'desc' },
    })
    return Response.json(records)
  } catch (error) {
    console.error('Failed to fetch field data', error)
    return apiError(500, 'Failed to fetch field data')
  }
}

export async function POST(request: Request) {
  const unauthorized = requireApiKey(request)
  if (unauthorized) return unauthorized

  const raw = await readJson(request)
  if (raw === null) return apiError(400, 'Invalid JSON body')

  const { data, error } = parseBody(fieldDataSchema, raw)
  if (error) return error

  try {
    const record = await db.fieldData.create({
      data: {
        ...data,
        status: 'synced',
      },
    })
    return Response.json(record, { status: 201 })
  } catch (error) {
    console.error('Failed to create field data', error)
    return apiError(500, 'Failed to create field data')
  }
}
