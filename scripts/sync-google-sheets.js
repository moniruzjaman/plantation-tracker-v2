const https = require('https');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrBmg9rqyD84liuHLe_Gj9gI54LDghZUP0LMMuPnvmljsPXwfOX6IrLfxn7AqRwVDUHNZLYtl8_KPo/pub?gid=2024872015&single=true&output=csv';

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchCsv(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch CSV: status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// RFC 4180 compliant CSV parser
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
          i++; // Skip escaped quote
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
        // Ignore carriage return
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

async function main() {
  console.log('Fetching App_Entry data from Google Sheets...');
  const csvData = await fetchCsv(CSV_URL);
  console.log(`Fetched CSV (${(csvData.length / 1024).toFixed(1)} KB)`);

  const rawRows = parseCsv(csvData);
  if (rawRows.length < 2) {
    throw new Error('CSV is empty or missing headers');
  }

  const headers = rawRows[0].map(h => h.trim());
  console.log('Detected Headers:', headers);

  // Map header indexes
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
    speciesCount: headers.findIndex(h => h.includes('মোট প্রজাতি')),
    saplingCount: headers.findIndex(h => h.includes('মোট চারার সংখ্যা')),
    speciesJson: headers.findIndex(h => h.includes('চারার বিবরণ (JSON)')),
    ndvi: headers.findIndex(h => h.includes('প্রাথমিক NDVI') || h.includes('NDVI')),
    farmerName: headers.findIndex(h => h.includes('কৃষকের নাম')),
    farmerMobile: headers.findIndex(h => h.includes('কৃষকের মোবাইল')),
    saaoName: headers.findIndex(h => h.includes('SAAO-এর নাম')),
    saaoMobile: headers.findIndex(h => h.includes('SAAO-এর মোবাইল')),
    moName: headers.findIndex(h => h.includes('মনিটরিং অফিসার')),
    moMobile: headers.findIndex(h => h.includes('মনিটরিং অফিসারের মোবাইল') || h.includes('MO মোবাইল')),
    comments: headers.findIndex(h => h.includes('মন্তব্য') || h.includes('comments')),
    block: headers.findIndex(h => h.includes('ব্লক') || h.includes('block'))
  };

  const entriesToInsert = [];
  const rows = rawRows.slice(1);

  for (const row of rows) {
    const getVal = (idx) => (idx >= 0 && idx < row.length && row[idx]) ? row[idx] : null;

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
      } catch (e) {
        // ignore json parse error
      }
    }

    const lat = parseFloat(getVal(colIndex.latitude)) || 0;
    const lon = parseFloat(getVal(colIndex.longitude)) || 0;
    const count = parseInt(getVal(colIndex.saplingCount), 10) || 0;
    const ndvi = parseFloat(getVal(colIndex.ndvi)) || 0;

    entriesToInsert.push({
      appSubmissionId: getVal(colIndex.appSubmissionId) || `app_${Math.random().toString(36).substring(2, 9)}`,
      division: getVal(colIndex.division),
      region: getVal(colIndex.region),
      district: getVal(colIndex.district),
      upazila: getVal(colIndex.upazila),
      unionName: getVal(colIndex.unionName),
      village: getVal(colIndex.village),
      locationType: getVal(colIndex.locationType),
      seedlingSource: getVal(colIndex.seedlingSource),
      address: getVal(colIndex.address),
      latitude: lat,
      longitude: lon,
      plantingDate: getVal(colIndex.plantingDate),
      species: species || 'মিশ্র ফলদ',
      treeClass: treeClass,
      count: count,
      ndvi: ndvi,
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

  console.log(`Parsed ${entriesToInsert.length} valid App_Entry records.`);

  // Clear existing AppEntry rows and insert new data
  console.log('Clearing old AppEntry records from database...');
  await prisma.appEntry.deleteMany();

  console.log('Inserting records into SQLite database...');
  // Batch insert
  const batchSize = 100;
  for (let i = 0; i < entriesToInsert.length; i += batchSize) {
    const batch = entriesToInsert.slice(i, i + batchSize);
    await prisma.appEntry.createMany({
      data: batch
    });
  }

  const finalCount = await prisma.appEntry.count();
  const totalSaplings = await prisma.appEntry.aggregate({
    _sum: { count: true }
  });

  console.log(`Successfully seeded SQLite database!`);
  console.log(`Total App_Entry rows: ${finalCount}`);
  console.log(`Total Saplings: ${totalSaplings._sum.count || 0}`);

  // Also check and update Plantation records if needed
  const uniqueUpazilas = await prisma.appEntry.groupBy({
    by: ['upazila', 'district'],
    _sum: { count: true },
    _avg: { latitude: true, longitude: true, ndvi: true }
  });

  console.log('\nUpazila Summary:');
  for (const u of uniqueUpazilas) {
    if (u.upazila) {
      console.log(`- ${u.district || ''} / ${u.upazila}: ${u._sum.count} saplings (Avg Lat: ${u._avg.latitude?.toFixed(4)}, Lon: ${u._avg.longitude?.toFixed(4)})`);
    }
  }
}

main()
  .catch(err => {
    console.error('Error during database initialization:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

