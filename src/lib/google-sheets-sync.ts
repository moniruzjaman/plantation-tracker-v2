import { db } from '@/lib/db'

export const GOOGLE_SHEETS_CONFIG = {
  appEntry: { name: 'App_Entry', gid: '2024872015' },
  userProfile: { name: 'User_Profile', gid: '1110053732' },
  customUpazila: { name: 'Custom_Upazila', gid: '407773103' },
  growthLog: { name: 'Growth_Log', gid: '2002330000' },
  processData: { name: 'process_data', gid: '1525390382' },
  gpsCoordinates: { name: 'GPS_Coordinates', gid: '709491931' },
  ministryReport: { name: '17_column_report', gid: '762996008' },
}

let lastSyncTime: Date | null = null
let syncInProgress = false
let lastSyncStats = {
  appEntries: 0,
  userProfiles: 0,
  upazilas: 0,
  processData: 0,
  totalSaplings: 0,
  lastUpdated: null as Date | null,
  error: null as string | null,
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if (char === '\r') {
        // ignore
      } else if (char === '\n') {
        currentRow.push(currentCell.trim())
        if (currentRow.length > 0 && currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentCell = ''
      } else {
        currentCell += char
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

export async function fetchSheetCsv(gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTrBmg9rqyD84liuHLe_Gj9gI54LDghZUP0LMMuPnvmljsPXwfOX6IrLfxn7AqRwVDUHNZLYtl8_KPo/pub?gid=${gid}&single=true&output=csv`
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet (GID: ${gid}): HTTP ${res.status}`)
  }

  return await res.text()
}

export async function syncDatabaseWithGoogleSheets(force = false) {
  if (syncInProgress) {
    return { status: 'in_progress', ...lastSyncStats }
  }

  const now = new Date()
  if (!force && lastSyncTime && now.getTime() - lastSyncTime.getTime() < 60 * 1000) {
    return { status: 'cached', ...lastSyncStats }
  }

  syncInProgress = true

  try {
    // 1. Sync App_Entry
    const appCsv = await fetchSheetCsv(GOOGLE_SHEETS_CONFIG.appEntry.gid)
    const appRows = parseCsv(appCsv)
    if (appRows.length > 1) {
      const headers = appRows[0].map((h) => h.trim())
      const colIndex = {
        submissionTime: headers.findIndex((h) => h.includes('জমার সময়')),
        appSubmissionId: headers.findIndex((h) => h.includes('অ্যাপ জমা আইডি')),
        division: headers.findIndex((h) => h.includes('বিভাগ')),
        region: headers.findIndex((h) => h.includes('অঞ্চল')),
        district: headers.findIndex((h) => h.includes('জেলা')),
        upazila: headers.findIndex((h) => h.includes('উপজেলা')),
        unionName: headers.findIndex((h) => h.includes('ইউনিয়ন')),
        village: headers.findIndex((h) => h.includes('গ্রাম')),
        locationType: headers.findIndex((h) => h.includes('অবস্থানের ধরন')),
        seedlingSource: headers.findIndex((h) => h.includes('চারার উৎস')),
        address: headers.findIndex((h) => h.includes('সুনির্দিষ্ট ঠিকানা')),
        latitude: headers.findIndex((h) => h.includes('অক্ষাংশ')),
        longitude: headers.findIndex((h) => h.includes('দ্রাঘিমাংশ')),
        plantingDate: headers.findIndex((h) => h.includes('রোপণের তারিখ')),
        speciesDesc: headers.findIndex((h) => h.includes('চারার বিবরণ') && !h.includes('JSON')),
        saplingCount: headers.findIndex((h) => h.includes('মোট চারার সংখ্যা')),
        speciesJson: headers.findIndex((h) => h.includes('চারার বিবরণ (JSON)')),
        ndvi: headers.findIndex((h) => h.includes('NDVI')),
        farmerName: headers.findIndex((h) => h.includes('কৃষকের নাম')),
        farmerMobile: headers.findIndex((h) => h.includes('কৃষকের মোবাইল')),
        saaoName: headers.findIndex((h) => h.includes('SAAO-এর নাম')),
        saaoMobile: headers.findIndex((h) => h.includes('SAAO-এর মোবাইল')),
        moName: headers.findIndex((h) => h.includes('মনিটরিং অফিসার')),
        moMobile: headers.findIndex((h) => h.includes('মনিটরিং অফিসারের মোবাইল') || h.includes('MO মোবাইল')),
        comments: headers.findIndex((h) => h.includes('মন্তব্য')),
        block: headers.findIndex((h) => h.includes('ব্লক')),
      }

      const toInsert: any[] = []
      const seenIds = new Set<string>()

      for (const row of appRows.slice(1)) {
        const getVal = (idx: number) =>
          idx >= 0 && idx < row.length && row[idx] ? row[idx] : null

        let subId = getVal(colIndex.appSubmissionId)
        if (!subId || seenIds.has(subId)) {
          subId = `app_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
        }
        seenIds.add(subId)

        let species = getVal(colIndex.speciesDesc)
        let treeClass = 'ফলদ'
        const jsonStr = getVal(colIndex.speciesJson)
        if (jsonStr) {
          try {
            const parsed = JSON.parse(jsonStr)
            if (Array.isArray(parsed) && parsed.length > 0) {
              species =
                parsed
                  .map((p) => p.speciesName || p.species || '')
                  .filter(Boolean)
                  .join(', ') || species
              treeClass = parsed[0].category || parsed[0].treeClass || treeClass
            }
          } catch {}
        }

        toInsert.push({
          appSubmissionId: subId,
          submissionTime: getVal(colIndex.submissionTime),
          division: getVal(colIndex.division),
          region: getVal(colIndex.region),
          district: getVal(colIndex.district),
          upazila: getVal(colIndex.upazila),
          unionName: getVal(colIndex.unionName),
          village: getVal(colIndex.village),
          locationType: getVal(colIndex.locationType),
          seedlingSource: getVal(colIndex.seedlingSource),
          address: getVal(colIndex.address),
          latitude: parseFloat(getVal(colIndex.latitude) || '0') || 0,
          longitude: parseFloat(getVal(colIndex.longitude) || '0') || 0,
          plantingDate: getVal(colIndex.plantingDate),
          species: species || 'মিশ্র ফলদ',
          treeClass: treeClass,
          count: parseInt(getVal(colIndex.saplingCount) || '0', 10) || 0,
          ndvi: parseFloat(getVal(colIndex.ndvi) || '0') || 0,
          farmerName: getVal(colIndex.farmerName),
          farmerMobile: getVal(colIndex.farmerMobile),
          saaoName: getVal(colIndex.saaoName),
          saaoMobile: getVal(colIndex.saaoMobile),
          moName: getVal(colIndex.moName),
          moMobile: getVal(colIndex.moMobile),
          comments: getVal(colIndex.comments),
          block: getVal(colIndex.block),
        })
      }

      await db.appEntry.deleteMany()
      for (let i = 0; i < toInsert.length; i += 100) {
        await db.appEntry.createMany({ data: toInsert.slice(i, i + 100) })
      }
      lastSyncStats.appEntries = toInsert.length
    }

    // 2. Sync User_Profile
    try {
      const upCsv = await fetchSheetCsv(GOOGLE_SHEETS_CONFIG.userProfile.gid)
      const upRows = parseCsv(upCsv)
      if (upRows.length > 1) {
        const headers = upRows[0]
        const colIndex = {
          submissionTime: headers.findIndex((h) => h.includes('জমার সময়')),
          appSubmissionId: headers.findIndex((h) => h.includes('অ্যাপ জমা আইডি')),
          shortDesignation: headers.findIndex((h) => h.includes('সংক্ষিপ্ত পদবি')),
          designation: headers.findIndex((h) => h.includes('পদবি')),
          name: headers.findIndex((h) => h.includes('নাম')),
          mobile: headers.findIndex((h) => h.includes('মোবাইল')),
          email: headers.findIndex((h) => h.includes('ইমেইল')),
          deviceId: headers.findIndex((h) => h.includes('ডিভাইস আইডি')),
          district: headers.findIndex((h) => h.includes('জেলা')),
          upazila: headers.findIndex((h) => h.includes('উপজেলা')),
          unionName: headers.findIndex((h) => h.includes('ইউনিয়ন')),
          block: headers.findIndex((h) => h.includes('ব্লক')),
        }

        const toInsert: any[] = []
        const seen = new Set<string>()

        for (const row of upRows.slice(1)) {
          const getVal = (idx: number) =>
            idx >= 0 && idx < row.length && row[idx] ? row[idx] : null
          const name = getVal(colIndex.name)
          if (!name) continue

          let subId = getVal(colIndex.appSubmissionId)
          if (subId && seen.has(subId)) subId = `${subId}_${Math.random().toString(36).substring(2, 6)}`
          if (subId) seen.add(subId)

          toInsert.push({
            appSubmissionId: subId,
            submissionTime: getVal(colIndex.submissionTime),
            shortDesignation: getVal(colIndex.shortDesignation),
            designation: getVal(colIndex.designation),
            name,
            mobile: getVal(colIndex.mobile),
            email: getVal(colIndex.email),
            deviceId: getVal(colIndex.deviceId),
            district: getVal(colIndex.district),
            upazila: getVal(colIndex.upazila),
            unionName: getVal(colIndex.unionName),
            block: getVal(colIndex.block),
          })
        }

        await db.userProfile.deleteMany()
        for (let i = 0; i < toInsert.length; i += 100) {
          await db.userProfile.createMany({ data: toInsert.slice(i, i + 100) })
        }
        lastSyncStats.userProfiles = toInsert.length
      }
    } catch {}

    // 3. Sync Custom_Upazila (if empty)
    const upazilaCount = await db.customUpazila.count()
    if (upazilaCount === 0) {
      try {
        const uCsv = await fetchSheetCsv(GOOGLE_SHEETS_CONFIG.customUpazila.gid)
        const uRows = parseCsv(uCsv)
        if (uRows.length > 1) {
          const toInsert: any[] = []
          const seen = new Set<string>()
          for (const row of uRows.slice(1)) {
            const district = row[1]
            const upazila = row[2]
            if (!district || !upazila) continue
            const key = `${district}_${upazila}`.toLowerCase()
            if (seen.has(key)) continue
            seen.add(key)
            toInsert.push({
              district,
              upazilaName: upazila,
              addedBy: row[3] || null,
              deviceId: row[4] || null,
            })
          }
          await db.customUpazila.deleteMany()
          for (let i = 0; i < toInsert.length; i += 100) {
            await db.customUpazila.createMany({ data: toInsert.slice(i, i + 100) })
          }
          lastSyncStats.upazilas = toInsert.length
        }
      } catch {}
    } else {
      lastSyncStats.upazilas = upazilaCount
    }

    // 4. Calculate total saplings
    const sumResult = await db.appEntry.aggregate({
      _sum: { count: true },
    })

    lastSyncTime = new Date()
    lastSyncStats = {
      ...lastSyncStats,
      totalSaplings: sumResult._sum.count || 0,
      lastUpdated: lastSyncTime,
      error: null,
    }

    return {
      status: 'success',
      ...lastSyncStats,
    }
  } catch (err: any) {
    lastSyncStats.error = err.message || 'Sync failed'
    return {
      status: 'error',
      message: err.message,
      ...lastSyncStats,
    }
  } finally {
    syncInProgress = false
  }
}

export function getSyncStatus() {
  return {
    syncInProgress,
    lastSyncTime,
    ...lastSyncStats,
  }
}
