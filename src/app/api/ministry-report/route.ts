import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// 17-column and ministry report data from Excel (loaded from JSON at build time)
const excelDataPath = join(process.cwd(), 'src', 'data', 'excel_report_data.json')
let cachedExcelData: { report17: any[]; ministry: any[] } | null = null

function getExcelData() {
  if (!cachedExcelData) {
    try {
      const raw = readFileSync(excelDataPath, 'utf-8')
      cachedExcelData = JSON.parse(raw)
    } catch {
      cachedExcelData = { report17: [], ministry: [] }
    }
  }
  return cachedExcelData
}

// 17-column ministry report format
export async function GET() {
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

  const excelData = getExcelData()

  return NextResponse.json({
    report,
    report17Col: excelData.report17,
    ministryReport: excelData.ministry,
    summary: {
      totalEntries: entries.length,
      totalSaplings,
      uniqueSpecies: Object.keys(speciesBreakdown).length,
      uniqueUpazilas: Object.keys(upazilaBreakdown).length,
      speciesBreakdown,
      upazilaBreakdown,
      report17ColCount: excelData.report17.length,
      ministryReportCount: excelData.ministry.length,
    },
  })
}