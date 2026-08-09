import { z } from 'zod'

export const appEntrySchema = z.object({
  appSubmissionId: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  upazila: z.string().optional().nullable(),
  unionName: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  locationType: z.string().optional().nullable(),
  seedlingSource: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().default(0),
  longitude: z.coerce.number().min(-180).max(180).optional().default(0),
  plantingDate: z.string().optional().nullable(),
  species: z.string().optional().nullable(),
  treeClass: z.string().optional().nullable(),
  count: z.coerce.number().int().min(0).optional().default(0),
  ndvi: z.coerce.number().min(0).max(1).optional().default(0),
  farmerName: z.string().optional().nullable(),
  farmerMobile: z.string().optional().nullable(),
  saaoName: z.string().optional().nullable(),
  saaoMobile: z.string().optional().nullable(),
  moName: z.string().optional().nullable(),
  moMobile: z.string().optional().nullable(),
  comments: z.string().optional().nullable(),
  block: z.string().optional().nullable(),
})

export const plantationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  district: z.string().min(1, 'District is required'),
  areaHa: z.coerce.number().positive('Area must be positive'),
  trees: z.coerce.number().int().min(0).default(0),
  ndvi: z.coerce.number().min(0).max(1).optional().default(0),
  status: z.string().optional().default('healthy'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  species: z.string().optional().default('Mixed'),
})

export const alertSchema = z.object({
  plantationId: z.string().min(1, 'plantationId is required'),
  ndviCurrent: z.coerce.number().min(0).max(1),
  ndviBaseline: z.coerce.number().min(0).max(1),
  ndviDrop: z.coerce.number().min(0).max(1),
  priority: z.enum(['critical', 'high', 'medium']).optional().default('medium'),
  status: z.enum(['open', 'investigating', 'resolved']).optional().default('open'),
  areaAffected: z.coerce.number().min(0).optional().default(0),
  estimatedLoss: z.coerce.number().min(0).optional().default(0),
})

export const fieldDataSchema = z.object({
  siteName: z.string().optional().nullable(),
  species: z.string().optional().nullable(),
  dbh: z.coerce.number().min(0).optional().default(0),
  height: z.coerce.number().min(0).optional().default(0),
  gpsLat: z.coerce.number().min(-90).max(90),
  gpsLon: z.coerce.number().min(-180).max(180),
  notes: z.string().optional().nullable(),
})
