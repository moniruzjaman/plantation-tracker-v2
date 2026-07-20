import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const plantations = [
  { name: 'Dhaka North Plantation', district: 'Dhaka', areaHa: 45.2, trees: 12500, ndvi: 0.52, status: 'healthy', latitude: 23.81, longitude: 90.41, species: 'Akashmoni' },
  { name: 'Sylhet Tea Garden Buffer', district: 'Sylhet', areaHa: 120.5, trees: 34000, ndvi: 0.28, status: 'stressed', latitude: 24.915, longitude: 91.865, species: 'Teak' },
  { name: 'Chittagong Hill Reforest', district: 'Chittagong', areaHa: 78.0, trees: 22000, ndvi: 0.61, status: 'healthy', latitude: 22.365, longitude: 91.965, species: 'Gamari' },
  { name: 'Rajshahi Dry Zone', district: 'Rajshahi', areaHa: 200.0, trees: 15000, ndvi: 0.15, status: 'mortality_alert', latitude: 24.375, longitude: 88.625, species: 'Eucalyptus' },
  { name: 'Khulna Sundarbans Edge', district: 'Khulna', areaHa: 78.0, trees: 18500, ndvi: 0.22, status: 'stressed', latitude: 22.525, longitude: 89.525, species: 'Sundari' },
  { name: 'Barisal Coastal Belt', district: 'Barisal', areaHa: 200.0, trees: 28000, ndvi: 0.35, status: 'stressed', latitude: 22.725, longitude: 90.375, species: 'Keora' },
  { name: 'Rangpur Northern Belt', district: 'Rangpur', areaHa: 65.0, trees: 11000, ndvi: 0.19, status: 'mortality_alert', latitude: 25.725, longitude: 89.225, species: 'Shishu' },
  { name: 'Mymensingh Agroforestry', district: 'Mymensingh', areaHa: 92.0, trees: 21000, ndvi: 0.44, status: 'healthy', latitude: 24.75, longitude: 90.4, species: 'Mixed' },
]

const alertsData = [
  { plantationName: 'Rajshahi Dry Zone', ndviCurrent: 0.15, ndviBaseline: 0.33, ndviDrop: 0.18, priority: 'critical', status: 'open', areaAffected: 45, estimatedLoss: 3200 },
  { plantationName: 'Sylhet Tea Garden Buffer', ndviCurrent: 0.28, ndviBaseline: 0.36, ndviDrop: 0.08, priority: 'high', status: 'investigating', areaAffected: 120, estimatedLoss: 5400 },
  { plantationName: 'Khulna Sundarbans Edge', ndviCurrent: 0.22, ndviBaseline: 0.34, ndviDrop: 0.12, priority: 'high', status: 'open', areaAffected: 78, estimatedLoss: 4100 },
  { plantationName: 'Barisal Coastal Belt', ndviCurrent: 0.35, ndviBaseline: 0.40, ndviDrop: 0.05, priority: 'medium', status: 'investigating', areaAffected: 200, estimatedLoss: 2800 },
  { plantationName: 'Rangpur Northern Belt', ndviCurrent: 0.19, ndviBaseline: 0.31, ndviDrop: 0.12, priority: 'high', status: 'resolved', areaAffected: 65, estimatedLoss: 3600 },
  { plantationName: 'Mymensingh Agroforestry', ndviCurrent: 0.31, ndviBaseline: 0.42, ndviDrop: 0.11, priority: 'high', status: 'open', areaAffected: 92, estimatedLoss: 4800 },
  { plantationName: 'Dhaka North Plantation', ndviCurrent: 0.38, ndviBaseline: 0.44, ndviDrop: 0.06, priority: 'medium', status: 'investigating', areaAffected: 35, estimatedLoss: 1200 },
  { plantationName: 'Chittagong Hill Reforest', ndviCurrent: 0.12, ndviBaseline: 0.29, ndviDrop: 0.17, priority: 'critical', status: 'open', areaAffected: 150, estimatedLoss: 7200 },
]

const carbonEntries = [
  { plantationName: 'Dhaka North Plantation', year: 2024, verified: 28000, projected: 35000, agbTc: 120, bgbTc: 30, totalBiomass: 150 },
  { plantationName: 'Dhaka North Plantation', year: 2025, verified: 65000, projected: 72000, agbTc: 180, bgbTc: 45, totalBiomass: 225 },
  { plantationName: 'Dhaka North Plantation', year: 2026, verified: 125000, projected: 140000, agbTc: 250, bgbTc: 62, totalBiomass: 312 },
  { plantationName: 'Sylhet Tea Garden Buffer', year: 2024, verified: 22000, projected: 30000, agbTc: 80, bgbTc: 20, totalBiomass: 100 },
  { plantationName: 'Sylhet Tea Garden Buffer', year: 2025, verified: 55000, projected: 68000, agbTc: 130, bgbTc: 32, totalBiomass: 162 },
  { plantationName: 'Sylhet Tea Garden Buffer', year: 2026, verified: 98000, projected: 120000, agbTc: 190, bgbTc: 47, totalBiomass: 237 },
  { plantationName: 'Chittagong Hill Reforest', year: 2024, verified: 35000, projected: 45000, agbTc: 150, bgbTc: 37, totalBiomass: 187 },
  { plantationName: 'Chittagong Hill Reforest', year: 2025, verified: 85000, projected: 110000, agbTc: 220, bgbTc: 55, totalBiomass: 275 },
  { plantationName: 'Chittagong Hill Reforest', year: 2026, verified: 156000, projected: 190000, agbTc: 300, bgbTc: 75, totalBiomass: 375 },
  { plantationName: 'Rajshahi Dry Zone', year: 2024, verified: 8000, projected: 20000, agbTc: 40, bgbTc: 10, totalBiomass: 50 },
  { plantationName: 'Rajshahi Dry Zone', year: 2025, verified: 22000, projected: 45000, agbTc: 70, bgbTc: 17, totalBiomass: 87 },
  { plantationName: 'Rajshahi Dry Zone', year: 2026, verified: 45000, projected: 65000, agbTc: 95, bgbTc: 24, totalBiomass: 119 },
  { plantationName: 'Khulna Sundarbans Edge', year: 2024, verified: 15000, projected: 25000, agbTc: 65, bgbTc: 16, totalBiomass: 81 },
  { plantationName: 'Khulna Sundarbans Edge', year: 2025, verified: 40000, projected: 58000, agbTc: 110, bgbTc: 27, totalBiomass: 137 },
  { plantationName: 'Khulna Sundarbans Edge', year: 2026, verified: 72000, projected: 95000, agbTc: 160, bgbTc: 40, totalBiomass: 200 },
  { plantationName: 'Barisal Coastal Belt', year: 2024, verified: 12000, projected: 22000, agbTc: 55, bgbTc: 14, totalBiomass: 69 },
  { plantationName: 'Barisal Coastal Belt', year: 2025, verified: 32000, projected: 48000, agbTc: 90, bgbTc: 22, totalBiomass: 112 },
  { plantationName: 'Barisal Coastal Belt', year: 2026, verified: 58000, projected: 80000, agbTc: 130, bgbTc: 32, totalBiomass: 162 },
  { plantationName: 'Rangpur Northern Belt', year: 2024, verified: 18000, projected: 30000, agbTc: 75, bgbTc: 19, totalBiomass: 94 },
  { plantationName: 'Rangpur Northern Belt', year: 2025, verified: 48000, projected: 72000, agbTc: 140, bgbTc: 35, totalBiomass: 175 },
  { plantationName: 'Rangpur Northern Belt', year: 2026, verified: 89000, projected: 120000, agbTc: 200, bgbTc: 50, totalBiomass: 250 },
  { plantationName: 'Mymensingh Agroforestry', year: 2026, verified: 42000, projected: 55000, agbTc: 110, bgbTc: 27, totalBiomass: 137 },
]

export async function POST() {
  // Create plantations
  const created: { name: string; id: string }[] = []
  for (const p of plantations) {
    const plantation = await db.plantation.create({ data: p })
    created.push({ name: plantation.name, id: plantation.id })
  }

  // Create alerts
  for (const a of alertsData) {
    const match = created.find((p) => p.name === a.plantationName)
    if (match) {
      await db.alert.create({
        data: {
          plantationId: match.id,
          ndviCurrent: a.ndviCurrent,
          ndviBaseline: a.ndviBaseline,
          ndviDrop: a.ndviDrop,
          priority: a.priority,
          status: a.status,
          areaAffected: a.areaAffected,
          estimatedLoss: a.estimatedLoss,
          detectedAt: new Date('2026-06-' + String(Math.floor(Math.random() * 20) + 5).padStart(2, '0')),
        },
      })
    }
  }

  // Create carbon data
  for (const c of carbonEntries) {
    const match = created.find((p) => p.name === c.plantationName)
    if (match) {
      await db.carbonData.create({
        data: {
          plantationId: match.id,
          year: c.year,
          verifiedTco2e: c.verified,
          projectedTco2e: c.projected,
          agbTc: c.agbTc,
          bgbTc: c.bgbTc,
          totalBiomass: c.totalBiomass,
        },
      })
    }
  }

  // Create field data
  const fieldSamples = [
    { plantationName: 'Dhaka North Plantation', species: 'Akashmoni', dbh: 22.5, height: 14.2, gpsLat: 23.81, gpsLon: 90.41, notes: 'Healthy canopy, good growth rate', status: 'synced' },
    { plantationName: 'Sylhet Tea Garden Buffer', species: 'Teak', dbh: 18.3, height: 16.8, gpsLat: 24.915, gpsLon: 91.865, notes: 'Some yellowing observed', status: 'synced' },
    { plantationName: 'Rajshahi Dry Zone', species: 'Eucalyptus', dbh: 12.1, height: 8.5, gpsLat: 24.375, gpsLon: 88.625, notes: 'Wilting, low soil moisture', status: 'pending' },
    { plantationName: 'Chittagong Hill Reforest', species: 'Gamari', dbh: 26.7, height: 18.0, gpsLat: 22.365, gpsLon: 91.965, notes: 'Excellent growth', status: 'synced' },
    { plantationName: 'Khulna Sundarbans Edge', species: 'Sundari', dbh: 20.0, height: 12.5, gpsLat: 22.525, gpsLon: 89.525, notes: 'Salinity stress observed', status: 'synced' },
    { plantationName: 'Rangpur Northern Belt', species: 'Shishu', dbh: 15.4, height: 10.2, gpsLat: 25.725, gpsLon: 89.225, notes: 'Mortality patches detected', status: 'pending' },
  ]
  for (const f of fieldSamples) {
    const match = created.find((p) => p.name === f.plantationName)
    if (match) {
      await db.fieldData.create({
        data: {
          plantationId: match.id,
          species: f.species,
          dbh: f.dbh,
          height: f.height,
          gpsLat: f.gpsLat,
          gpsLon: f.gpsLon,
          notes: f.notes,
          status: f.status,
          collectedAt: new Date('2026-06-' + String(Math.floor(Math.random() * 18) + 5).padStart(2, '0')),
        },
      })
    }
  }

  return NextResponse.json({
    message: 'Database seeded successfully',
    plantations: created.length,
    alerts: alertsData.length,
    carbonEntries: carbonEntries.length,
    fieldSamples: fieldSamples.length,
  })
}