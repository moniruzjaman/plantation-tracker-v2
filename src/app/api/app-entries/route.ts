import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const entries = await db.appEntry.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(entries)
}

export async function POST(request: Request) {
  const body = await request.json()
  const entry = await db.appEntry.create({ data: body })
  return NextResponse.json(entry, { status: 201 })
}