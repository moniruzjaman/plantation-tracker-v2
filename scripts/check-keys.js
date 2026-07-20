// Check for missing i18n keys
const fs = require('fs');
const path = require('path');

// Read i18n.tsx and extract all defined keys
const i18nContent = fs.readFileSync('/home/z/my-project/src/lib/i18n.tsx', 'utf8');
const definedKeys = new Set();
const keyRegex = /^  ([a-zA-Z][a-zA-Z0-9]*): \{ bn:/gm;
let match;
while ((match = keyRegex.exec(i18nContent)) !== null) {
  definedKeys.add(match[1]);
}

// Read all component files and extract t('...') calls
const files = [
  '/home/z/my-project/src/app/page.tsx',
  '/home/z/my-project/src/components/plantation/DashboardPage.tsx',
  '/home/z/my-project/src/components/plantation/MapViewPage.tsx',
  '/home/z/my-project/src/components/plantation/MortalityAlertsPage.tsx',
  '/home/z/my-project/src/components/plantation/CarbonReportPage.tsx',
  '/home/z/my-project/src/components/plantation/FieldCollectorPage.tsx',
];

const usedKeys = new Set();
const tCallRegex = /t\('([a-zA-Z][a-zA-Z0-9]+)'\)/g;
let missing = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  while ((match = tCallRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
    if (!definedKeys.has(match[1])) {
      missing.push({ key: match[1], file: path.basename(file) });
    }
  }
}

console.log(`Total defined keys: ${definedKeys.size}`);
console.log(`Total used keys: ${usedKeys.size}`);

if (missing.length === 0) {
  console.log('\n✅ All translation keys are defined!');
} else {
  console.log(`\n❌ ${missing.length} MISSING keys:`);
  missing.forEach(m => console.log(`  ${m.key} (in ${m.file})`));
}