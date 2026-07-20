import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const alerts = await db.alert.findMany({
    orderBy: { detectedAt: 'desc' },
    include: { plantation: { select: { name: true, district: true } } },
  })
  return NextResponse.json(alerts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const alert = await db.alert.create({
    data: {
      plantationId: body.plantationId,
      ndviCurrent: body.ndviCurrent,
      ndviBaseline: body.ndviBaseline,
      ndviDrop: body.ndviDrop,
      priority: body.priority ?? 'medium',
      status: body.status ?? 'open',
      areaAffected: body.areaAffected ?? 0,
      estimatedLoss: body.estimatedLoss ?? 0,
    },
  })
  return NextResponse.json(alert, { status: 201 })
}