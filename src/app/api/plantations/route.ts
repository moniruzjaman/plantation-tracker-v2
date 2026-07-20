import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const plantations = await db.plantation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { alerts: true, fieldData: true } },
    },
  })
  return NextResponse.json(plantations)
}

export async function POST(request: Request) {
  const body = await request.json()
  const plantation = await db.plantation.create({
    data: {
      name: body.name,
      district: body.district,
      areaHa: body.areaHa,
      trees: body.trees,
      ndvi: body.ndvi ?? 0.0,
      status: body.status ?? 'healthy',
      latitude: body.latitude,
      longitude: body.longitude,
      species: body.species ?? 'Mixed',
    },
  })
  return NextResponse.json(plantation, { status: 201 })
}