import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api'
import excelReportData from '@/data/excel_report_data.json'

// 17-column and ministry report data from Excel (bundled at build time,
// so it works in the standalone production output too).
const { report17, ministry } = excelReportData

// 17-column ministry report format
export async function GET() {
  try {
    const entries = await db.appEntry.findMany({
      orderBy: { createdAt: 'asc' },
    })

    // Transform into 17-column ministry report format
    const report = entries.map((e, idx) => ({
      sl: idx + 1,
      village: e.village || '-',
      block: e.block || '-',
      union: e.unionName || '-',
      upazila: e.upazila || '-',
      district: e.district || '-',
      species: e.species || '-',
      count: e.count || 0,
      plantingDate: e.plantingDate || '-',
      coordinates: e.latitude && e.longitude ? `${e.latitude}, ${e.longitude}` : '-',
      farmerName: e.farmerName || '-',
      farmerMobile: e.farmerMobile || '-',
      saaoName: e.saaoName || '-',
      saaoMobile: e.saaoMobile || '-',
      moName: e.moName || '-',
      moMobile: e.moMobile || '-',
      comments: e.comments || '-',
    }))

    // Summary stats
    const totalSaplings = entries.reduce((s, e) => s + e.count, 0)
    const speciesBreakdown: Record<string, number> = {}
    const upazilaBreakdown: Record<string, number> = {}
    for (const e of entries) {
      if (e.species) speciesBreakdown[e.species] = (speciesBreakdown[e.species] || 0) + e.count
      if (e.upazila) upazilaBreakdown[e.upazila] = (upazilaBreakdown[e.upazila] || 0) + e.count
    }

    return NextResponse.json({
      report,
      report17Col: report17,
      ministryReport: ministry,
      summary: {
        totalEntries: entries.length,
        totalSaplings,
        uniqueSpecies: Object.keys(speciesBreakdown).length,
        uniqueUpazilas: Object.keys(upazilaBreakdown).length,
        speciesBreakdown,
        upazilaBreakdown,
        report17ColCount: report17.length,
        ministryReportCount: ministry.length,
      },
    })
  } catch (error) {
    console.error('Failed to build ministry report', error)
    return apiError(500, 'Failed to build ministry report')
  }
}
