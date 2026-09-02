import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table') || 'appEntry'
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const search = searchParams.get('search') || ''

  try {
    // Get counts for all tables
    const [
      appEntriesCount,
      userProfilesCount,
      customUpazilasCount,
      processDataCount,
      plantationsCount,
      alertsCount,
      carbonDataCount,
      fieldDataCount,
      growthLogsCount,
      gpsCoordinatesCount,
      ministryReportsCount,
    ] = await Promise.all([
      db.appEntry.count(),
      db.userProfile.count(),
      db.customUpazila.count(),
      db.processData.count(),
      db.plantation.count(),
      db.alert.count(),
      db.carbonData.count(),
      db.fieldData.count(),
      db.growthLog.count(),
      db.gPSCoordinate.count(),
      db.ministryReport.count(),
    ])

    const tableCounts: Record<string, number> = {
      appEntry: appEntriesCount,
      userProfile: userProfilesCount,
      customUpazila: customUpazilasCount,
      processData: processDataCount,
      plantation: plantationsCount,
      alert: alertsCount,
      carbonData: carbonDataCount,
      fieldData: fieldDataCount,
      growthLog: growthLogsCount,
      gpsCoordinate: gpsCoordinatesCount,
      ministryReport: ministryReportsCount,
    }

    let records: any[] = []

    switch (table) {
      case 'appEntry':
        records = await db.appEntry.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'userProfile':
        records = await db.userProfile.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'customUpazila':
        records = await db.customUpazila.findMany({
          take: limit,
          orderBy: { district: 'asc' },
        })
        break
      case 'processData':
        records = await db.processData.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'plantation':
        records = await db.plantation.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { alerts: true, carbonData: true },
        })
        break
      case 'alert':
        records = await db.alert.findMany({
          take: limit,
          orderBy: { detectedAt: 'desc' },
          include: { plantation: true },
        })
        break
      case 'carbonData':
        records = await db.carbonData.findMany({
          take: limit,
          orderBy: { year: 'desc' },
          include: { plantation: true },
        })
        break
      case 'fieldData':
        records = await db.fieldData.findMany({
          take: limit,
          orderBy: { collectedAt: 'desc' },
        })
        break
      case 'growthLog':
        records = await db.growthLog.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'gpsCoordinate':
        records = await db.gPSCoordinate.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'ministryReport':
        records = await db.ministryReport.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
        break
      default:
        records = await db.appEntry.findMany({ take: limit })
    }

    return NextResponse.json({
      table,
      totalCount: tableCounts[table] || 0,
      tableCounts,
      records,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schema records' },
      { status: 500 }
    )
  }
}

