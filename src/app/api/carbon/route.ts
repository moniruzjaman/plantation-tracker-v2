import { db } from '@/lib/db'
import { apiError } from '@/lib/api'

export async function GET() {
  try {
    const carbonData = await db.carbonData.findMany({
      orderBy: [{ plantationId: 'asc' }, { year: 'asc' }],
      include: { plantation: { select: { name: true, district: true, areaHa: true } } },
    })

    // Aggregate by district
    const districtMap = new Map<string, { district: string; verified: number; projected: number; area: number }>()
    for (const row of carbonData) {
      const d = row.plantation.district
      if (!districtMap.has(d)) districtMap.set(d, { district: d, verified: 0, projected: 0, area: row.plantation.areaHa })
      const entry = districtMap.get(d)!
      entry.verified += row.verifiedTco2e
      entry.projected += row.projectedTco2e
    }

    return Response.json({
      details: carbonData,
      byDistrict: Array.from(districtMap.values()),
    })
  } catch (error) {
    console.error('Failed to fetch carbon data', error)
    return apiError(500, 'Failed to fetch carbon data')
  }
}
