const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SHEETS_CONFIG = {
  appEntry: { name: 'App_Entry', gid: '2024872015' },
  userProfile: { name: 'User_Profile', gid: '1110053732' },
  customUpazila: { name: 'Custom_Upazila', gid: '407773103' },
  growthLog: { name: 'Growth_Log', gid: '2002330000' },
  processData: { name: 'process_data', gid: '1525390382' },
  gpsCoordinates: { name: 'GPS_Coordinates', gid: '709491931' },
  ministryReport: { name: '17_column_report', gid: '762996008' }
};

function fetchCsv(gid) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTrBmg9rqyD84liuHLe_Gj9gI54LDghZUP0LMMuPnvmljsPXwfOX6IrLfxn7AqRwVDUHNZLYtl8_KPo/pub?gid=${gid}&single=true&output=csv`;
    function req(u) {
      https.get(u, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          req(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for GID ${gid}`));
        }
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    }
    req(url);
  });
}

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // ignore
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.length > 0 && currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

async function syncAppEntries() {
  console.log('\n--- Syncing App_Entry ---');
  const csv = await fetchCsv(SHEETS_CONFIG.appEntry.gid);
  const rows = parseCsv(csv);
  if (rows.length < 2) return;

  const headers = rows[0];
  const colIndex = {
    submissionTime: headers.findIndex(h => h.includes('জমার সময়')),
    appSubmissionId: headers.findIndex(h => h.includes('অ্যাপ জমা আইডি')),
    division: headers.findIndex(h => h.includes('বিভাগ')),
    region: headers.findIndex(h => h.includes('অঞ্চল')),
    district: headers.findIndex(h => h.includes('জেলা')),
    upazila: headers.findIndex(h => h.includes('উপজেলা')),
    unionName: headers.findIndex(h => h.includes('ইউনিয়ন')),
    village: headers.findIndex(h => h.includes('গ্রাম')),
    locationType: headers.findIndex(h => h.includes('অবস্থানের ধরন')),
    seedlingSource: headers.findIndex(h => h.includes('চারার উৎস')),
    address: headers.findIndex(h => h.includes('সুনির্দিষ্ট ঠিকানা')),
    latitude: headers.findIndex(h => h.includes('অক্ষাংশ')),
    longitude: headers.findIndex(h => h.includes('দ্রাঘিমাংশ')),
    plantingDate: headers.findIndex(h => h.includes('রোপণের তারিখ')),
    speciesDesc: headers.findIndex(h => h.includes('চারার বিবরণ') && !h.includes('JSON')),
    saplingCount: headers.findIndex(h => h.includes('মোট চারার সংখ্যা')),
    speciesJson: headers.findIndex(h => h.includes('চারার বিবরণ (JSON)')),
    ndvi: headers.findIndex(h => h.includes('NDVI')),
    farmerName: headers.findIndex(h => h.includes('কৃষকের নাম')),
    farmerMobile: headers.findIndex(h => h.includes('কৃষকের মোবাইল')),
    saaoName: headers.findIndex(h => h.includes('SAAO-এর নাম')),
    saaoMobile: headers.findIndex(h => h.includes('SAAO-এর মোবাইল')),
    moName: headers.findIndex(h => h.includes('মনিটরিং অফিসার')),
    moMobile: headers.findIndex(h => h.includes('মনিটরিং অফিসারের মোবাইল') || h.includes('MO মোবাইল')),
    comments: headers.findIndex(h => h.includes('মন্তব্য')),
    block: headers.findIndex(h => h.includes('ব্লক'))
  };

  const toInsert = [];
  const seenIds = new Set();

  for (const row of rows.slice(1)) {
    const getVal = (idx) => (idx >= 0 && idx < row.length && row[idx]) ? row[idx] : null;

    let submissionId = getVal(colIndex.appSubmissionId);
    if (!submissionId || seenIds.has(submissionId)) {
      submissionId = `app_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    }
    seenIds.add(submissionId);

    let species = getVal(colIndex.speciesDesc);
    let treeClass = 'ফলদ';
    const jsonStr = getVal(colIndex.speciesJson);
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          species = parsed.map(p => p.speciesName || p.species || '').filter(Boolean).join(', ') || species;
          treeClass = parsed[0].category || parsed[0].treeClass || treeClass;
        }
      } catch (e) {}
    }

    toInsert.push({
      appSubmissionId: submissionId,
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
      latitude: parseFloat(getVal(colIndex.latitude)) || 0,
      longitude: parseFloat(getVal(colIndex.longitude)) || 0,
      plantingDate: getVal(colIndex.plantingDate),
      species: species || 'মিশ্র ফলদ',
      treeClass: treeClass,
      count: parseInt(getVal(colIndex.saplingCount), 10) || 0,
      ndvi: parseFloat(getVal(colIndex.ndvi)) || 0,
      farmerName: getVal(colIndex.farmerName),
      farmerMobile: getVal(colIndex.farmerMobile),
      saaoName: getVal(colIndex.saaoName),
      saaoMobile: getVal(colIndex.saaoMobile),
      moName: getVal(colIndex.moName),
      moMobile: getVal(colIndex.moMobile),
      comments: getVal(colIndex.comments),
      block: getVal(colIndex.block)
    });
  }

  await prisma.appEntry.deleteMany();
  for (let i = 0; i < toInsert.length; i += 100) {
    await prisma.appEntry.createMany({ data: toInsert.slice(i, i + 100) });
  }
  console.log(`✓ Inserted ${toInsert.length} AppEntry rows.`);
}

async function syncUserProfiles() {
  console.log('\n--- Syncing User_Profile ---');
  const csv = await fetchCsv(SHEETS_CONFIG.userProfile.gid);
  const rows = parseCsv(csv);
  if (rows.length < 2) return;

  const headers = rows[0];
  const colIndex = {
    submissionTime: headers.findIndex(h => h.includes('জমার সময়')),
    appSubmissionId: headers.findIndex(h => h.includes('অ্যাপ জমা আইডি')),
    shortDesignation: headers.findIndex(h => h.includes('সংক্ষিপ্ত পদবি')),
    designation: headers.findIndex(h => h.includes('পদবি')),
    name: headers.findIndex(h => h.includes('নাম')),
    mobile: headers.findIndex(h => h.includes('মোবাইল')),
    email: headers.findIndex(h => h.includes('ইমেইল')),
    deviceId: headers.findIndex(h => h.includes('ডিভাইস আইডি')),
    district: headers.findIndex(h => h.includes('জেলা')),
    upazila: headers.findIndex(h => h.includes('উপজেলা')),
    unionName: headers.findIndex(h => h.includes('ইউনিয়ন')),
    block: headers.findIndex(h => h.includes('ব্লক'))
  };

  const toInsert = [];
  const seenIds = new Set();

  for (const row of rows.slice(1)) {
    const getVal = (idx) => (idx >= 0 && idx < row.length && row[idx]) ? row[idx] : null;
    const name = getVal(colIndex.name);
    if (!name) continue;

    let subId = getVal(colIndex.appSubmissionId);
    if (subId && seenIds.has(subId)) subId = `${subId}_${Math.random().toString(36).substring(2, 6)}`;
    if (subId) seenIds.add(subId);

    toInsert.push({
      appSubmissionId: subId,
      submissionTime: getVal(colIndex.submissionTime),
      shortDesignation: getVal(colIndex.shortDesignation),
      designation: getVal(colIndex.designation),
      name: name,
      mobile: getVal(colIndex.mobile),
      email: getVal(colIndex.email),
      deviceId: getVal(colIndex.deviceId),
      district: getVal(colIndex.district),
      upazila: getVal(colIndex.upazila),
      unionName: getVal(colIndex.unionName),
      block: getVal(colIndex.block)
    });
  }

  await prisma.userProfile.deleteMany();
  for (let i = 0; i < toInsert.length; i += 100) {
    await prisma.userProfile.createMany({ data: toInsert.slice(i, i + 100) });
  }
  console.log(`✓ Inserted ${toInsert.length} UserProfile rows.`);
}

async function syncCustomUpazilas() {
  console.log('\n--- Syncing Custom_Upazila ---');
  const csv = await fetchCsv(SHEETS_CONFIG.customUpazila.gid);
  const rows = parseCsv(csv);
  if (rows.length < 2) return;

  const headers = rows[0];
  const colIndex = {
    district: headers.findIndex(h => h.includes('জেলা')),
    upazila: headers.findIndex(h => h.includes('উপজেলা')),
    addedBy: headers.findIndex(h => h.includes('যোগকারী')),
    deviceId: headers.findIndex(h => h.includes('ডিভাইস আইডি'))
  };

  const toInsert = [];
  const seen = new Set();

  for (const row of rows.slice(1)) {
    const getVal = (idx) => (idx >= 0 && idx < row.length && row[idx]) ? row[idx] : null;
    const district = getVal(colIndex.district);
    const upazila = getVal(colIndex.upazila);
    if (!district || !upazila) continue;

    const key = `${district}_${upazila}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    toInsert.push({
      district: district,
      upazilaName: upazila,
      addedBy: getVal(colIndex.addedBy),
      deviceId: getVal(colIndex.deviceId)
    });
  }

  await prisma.customUpazila.deleteMany();
  for (let i = 0; i < toInsert.length; i += 100) {
    await prisma.customUpazila.createMany({ data: toInsert.slice(i, i + 100) });
  }
  console.log(`✓ Inserted ${toInsert.length} CustomUpazila records.`);
}

async function syncProcessData() {
  console.log('\n--- Syncing process_data ---');
  const csv = await fetchCsv(SHEETS_CONFIG.processData.gid);
  const rows = parseCsv(csv);
  if (rows.length < 2) return;

  const headers = rows[0];
  const toInsert = [];

  for (const row of rows.slice(1)) {
    if (row.length < 5) continue;
    toInsert.push({
      serialNo: row[0] || null,
      region: row[1] || null,
      district: row[2] || null,
      upazila: row[3] || null,
      species: row[4] || null,
      count: parseInt(row[5], 10) || 0,
      plantingDate: row[6] || null,
      latitude: parseFloat(row[7]) || 0,
      longitude: parseFloat(row[8]) || 0,
      farmerName: row[9] || null,
      farmerMobile: row[10] ? row[10].replace(/^'/, '') : null,
      saaoName: row[11] || null,
      saaoMobile: row[12] ? row[12].replace(/^'/, '') : null,
      moName: row[13] || null,
      moMobile: row[14] ? row[14].replace(/^'/, '') : null,
      comments: row[15] || null
    });
  }

  await prisma.processData.deleteMany();
  if (toInsert.length > 0) {
    await prisma.processData.createMany({ data: toInsert });
  }
  console.log(`✓ Inserted ${toInsert.length} ProcessData records.`);
}

async function main() {
  console.log('=== Starting Full SQLite Database Synchronization from Google Sheets ===');
  await syncAppEntries();
  await syncUserProfiles();
  await syncCustomUpazilas();
  await syncProcessData();
  console.log('\n=== All Tables Successfully Created & Seeded in SQLite! ===');
}

main()
  .catch(err => {
    console.error('Sync error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

