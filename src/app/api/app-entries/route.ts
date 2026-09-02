import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { syncDatabaseWithGoogleSheets } from '@/lib/google-sheets-sync'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const autoSync = searchParams.get('sync') === 'true'

  // If database is empty or sync requested, trigger sync
  const count = await db.appEntry.count()
  if (count === 0 || autoSync) {
    await syncDatabaseWithGoogleSheets(autoSync)
  }

  const entries = await db.appEntry.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(entries)
}

export async function POST(request: Request) {
  const body = await request.json()
  const entry = await db.appEntry.create({ data: body })
  return NextResponse.json(entry, { status: 201 })
}