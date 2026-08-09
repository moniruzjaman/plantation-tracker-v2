import { db } from '@/lib/db'
import { requireApiKey, apiError } from '@/lib/api'

// One-click resolution workflow: marks an alert as resolved.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireApiKey(request)
  if (unauthorized) return unauthorized

  const { id } = await params
  if (!id) return apiError(400, 'Alert id is required')

  try {
    const alert = await db.alert.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date() },
    })
    return Response.json(alert)
  } catch (error) {
    console.error('Failed to resolve alert', error)
    return apiError(404, 'Alert not found')
  }
}
