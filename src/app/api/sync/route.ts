import { NextResponse } from 'next/server'
import { syncDatabaseWithGoogleSheets, getSyncStatus } from '@/lib/google-sheets-sync'

export async function GET() {
  const status = getSyncStatus()
  return NextResponse.json(status)
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'

  const result = await syncDatabaseWithGoogleSheets(force)
  return NextResponse.json(result)
}
