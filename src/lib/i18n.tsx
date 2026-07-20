\'use client\'

import { createContext, useContext, useState, useEffect, ReactNode } from \'react\'

export type Lang = \'bn\' | \'en\'

type Translations = Record<string, { bn: string; en: string }>

const t: Translations = {
  // --- Sidebar ---
  appTitle: { bn: \'বৃক্ষরোপণ ট্র্যাকার\', en: \'Plantation Tracker\' },
  appVersion: { bn: \'সংস্করণ v২.০\', en: \'Tracker v2.0\' },
  croreProgram: { bn: \'২৫ কোটি বৃক্ষরোপণ কর্মসূচি\', en: \'25 Crore Tree Plantation\' },

  // --- Nav Items ---
  navDashboard: { bn: \'ড্যাশবোর্ড\', en: \'Dashboard\' },
  navMap: { bn: \'স্যাটেলাইট ম্যাপ\', en: \'Satellite Map\' },
  navAlerts: { bn: \'মৃত্যু সতর্কতা\', en: \'Mortality Alerts\' },
  navReport: { bn: \'রিপোর্ট\', en: \'Report\' },
  navField: { bn: \'ফিল্ড কালেক্টর\', en: \'Field Collector\' },

  // --- Sidebar Stats ---
  districtLabel: { bn: \'কুড়িগ্রাম জেলা\', en: \'Kurigram District\' },
  saplings: { bn: \'চারা\', en: \'saplings\' },
  upazilas: { bn: \'উপজেলা\', en: \'Upazilas\' },
  species: { bn: \'প্রজাতি\', en: \'Species\' },
  gpsTracked: { bn: \'জিপিএস যাচাইকৃত\', en: \'GPS tracked\' },
  fieldVerified: { bn: \'মাঠ পর্যায়ে যাচাইকৃত\', en: \'Field verified\' },

  // --- Dashboard ---
  dashBannerTitle: { bn: \'২৫ কোটি বৃক্ষরোপণ কর্মসূচি\', en: \'25 Crore Tree Plantation Program\' },
  dashBannerSub: { bn: \'নির্বাহী ড্যাশবোর্ড | কুড়িগ্রাম জেলা, রংপুর বিভাগ | কৃষি সম্প্রসারণ অধিদপ্তর\', en: \'Executive Dashboard | Kurigram District, Rangpur Division | Department of Agricultural Extension\' },

  statTotalSaplings: { bn: \'মোট রোপণকৃত চারা\', en: \'Total Saplings Planted\' },
  statUpazilas: { bn: \'আওতাধীন উপজেলা\', en: \'Upazilas Covered\' },
  statFarmers: { bn: \'সম্পৃক্ত কৃষক\', en: \'Farmers Engaged\' },
  statSites: { bn: \'রোপণ স্থান\', en: \'Planting Sites\' },

  chartByDistrict: { bn: \'জেলাভিত্তিক চারা বিতরণ\', en: \'Saplings by District\' },
  chartSpeciesDist: { bn: \'প্রজাতি বিতরণ\', en: \'Species Distribution\' },
  chartNdviTrend: { bn: \'NDVI স্বাস্থ্য প্রবণতা\', en: \'NDVI Health Trend\' },
  chartCarbon: { bn: \'কার্বন সঞ্চয় (tCO2e)\', en: \'Carbon Sequestration (tCO2e)\' },

  ndviHealthy: { bn: \'সুস্থ\', en: \'Healthy\' },
  ndviStressed: { bn: \'পীড়িত\', en: \'Stressed\' },
  ndviAlert: { bn: \'সতর্কতা\', en: \'Alert\' },
  carbonVerified: { bn: \'যাচাইকৃত\', en: \'Verified\' },
  carbonProjected: { bn: \'প্রক্ষিপ্ত\', en: \'Projected\' },
  saplingsLabel: { bn: \'চারা সংখ্যা\', en: \'Saplings\' },

  // Ministry Report Summary
  ministryReportTitle: { bn: \'সাপ্তাহিক মন্ত্রণালয় রিপোর্ট সারাংশ\', en: \'Weekly Ministry Report Summary\' },
  report17ColEntries: { bn: \'১৭-কলাম রিপোর্ট (এক্সেল)\', en: \'17-Col Report (Excel)\' },
  reportTotalSaplings: { bn: \'মোট চারা (রিপোর্ট)\', en: \'Total Saplings (Report)\' },
  reportEmails: { bn: \'রিপোর্টিং ইমেইল\', en: \'Reporting Emails\' },
  weeklySubmission: { bn: \'সাপ্তাহিক জমা আবশ্যক\', en: \'Weekly submission required\' },
  reportFormat: { bn: \'রিপোর্ট ফরম্যাট:\', en: \'Report Format:\' },
  reportFormatDesc: { bn: \'সাপ্তাহিকভিত্তিক বৃক্ষরোপণের তথ্য (সাপ্তাহিক বৃক্ষরোপণ রিপোর্ট) - ১৭ কলাম যা গ্রাম, ব্লক, ইউনিয়ন, উপজেলা, জেলা, প্রজাতি, সংখ্যা, তারিখ, জিও কোঅর্ডিনেট, কৃষক ও SAAO এর বিবরণ ধারণ করে।\', en: \'Weekly Plantation Report - 17 columns including village, block, union, upazila, district, species, count, date, GPS coordinates, farmer & SAAO details.\' },
  acrossUpazilas: { bn: \'উপজেলাসমূহে\', en: \'Across upazilas\' },

  // Recent Entries Table
  recentEntries: { bn: \'সাম্প্রতিক রোপণ তথ্য\', en: \'Recent Planting Entries\' },
  thSpecies: { bn: \'প্রজাতি\', en: \'Species\' },
  thQty: { bn: \'পরিমাণ\', en: \'Qty\' },
  thUpazila: { bn: \'উপজেলা\', en: \'Upazila\' },
  thFarmer: { bn: \'কৃষক\', en: \'Farmer\' },
  thSaao: { bn: \'SAAO\', en: \'SAAO\' },

  // --- Map Page ---
  allUpazilas: { bn: \'সকল উপজেলা\', en: \'All Upazilas\' },
  satellite: { bn: \'স্যাটেলাইট\', en: \'Satellite\' },
  sitesSaplings: { bn: \'স্থান | চারা\', en: \'sites | saplings\' },
  loadingMap: { bn: \'স্যাটেলাইট ম্যাপ লোড হচ্ছে...\', en: \'Loading satellite map...\' },
  kurigramMap: { bn: \'কুড়িগ্রাম জেলার ম্যাপ\', en: \'Kurigram District Map\' },
  mapInfoLine1: { bn: \'২৫ কোটি বৃক্ষরোপণ | জিপিএস যাচাইকৃত স্থান\', en: \'25 Crore Tree Plantation | GPS-verified sites\' },
  mapInfoLine2: { bn: \'চারা বিস্তৃত', en: \'saplings across\' },
  mapInfoLine3: { bn: \'স্থানে\', en: \'sites\' },
  circleSize: { bn: \'বৃত্ত আকার = রোপণকৃত সংখ্যা\', en: \'Circle size = quantity planted\' },
  speciesLegend: { bn: \'প্রজাতি লিজেন্ড\', en: \'Species Legend\' },
  legendGuava: { bn: \'পেয়ারা\', en: \'Guava\' },
  legendMalta: { bn: \'মাল্টা\', en: \'Malta\' },
  legendLemon: { bn: \'লেবু\', en: \'Lemon\' },
  legendMango: { bn: \'আম\', en: \'Mango\' },

  // Popup
  popupSpecies: { bn: \'প্রজাতি\', en: \'Species\' },
  popupQuantity: { bn: \'পরিমাণ:\', en: \'Quantity:\' },
  popupSaplings: { bn: \'টি চারা\', en: \'saplings\' },
  popupUpazila: { bn: \'উপজেলা:\', en: \'Upazila:\' },
  popupDistrict: { bn: \'জেলা:\', en: \'District:\' },
  popupDate: { bn: \'তারিখ:\', en: \'Date:\' },
  popupGps: { bn: \'জিপিএস:\', en: \'GPS:\' },
  popupFarmer: { bn: \'কৃষক:\', en: \'Farmer:\' },
  popupSaao: { bn: \'SAAO:\', en: \'SAAO:\' },
  popupSource: { bn: \'উৎস:\', en: \'Source:\' },

  // --- Alerts Page ---
  criticalAlerts: { bn: \'জরুরি সতর্কতা\', en: \'Critical Alerts\' },
  highPriority: { bn: \'উচ্চ অগ্রাধিকার\', en: \'High Priority\' },
  openCases: { bn: \'খোলা মামলা\', en: \'Open Cases\' },
  estCarbonLoss: { bn: \'আনুমানিত কার্বন ক্ষয়ি\', en: \'Est. Carbon Loss\' },
  priority: { bn: \'অগ্রাধিকার:\', en: \'Priority:\' },
  status: { bn: \'অবস্থা:\', en: \'Status:\' },
  exportCsv: { bn: \'CSV রপ্তার্তি\', en: \'Export CSV\' },
  alertId: { bn: \'সতর্কতা আইডি\', en: \'Alert ID\' },
  plantation: { bn: \'বৃক্ষরোপণ\', en: \'Plantation\' },
  ndviDrop: { bn: \'NDVI হ্রাস\', en: \'NDVI Drop\' },
  areaHa: { bn: \'এলাকা (হেক্টর)\', en: \'Area (ha)\' },
  estLoss: { bn: \'আনুমানিত ক্ষয়ি\', en: \'Est. Loss\' },
  detected: { bn: \'শনাক্ত\', en: \'Detected\' },
  action: { bn: \'পদক্ষেপ\', en: \'Action\' },
  view: { bn: \'দেখুন\', en: \'View\' },

  // --- Report Page ---
  carbonMinistry: { bn: \'কার্বন ও মন্ত্রণালয় রিপোর্ট\', en: \'Carbon & Ministry Report\' },
  reportSubtitle: { bn: \'IPCC Tier 2 / Verra VM0047 / ১৭-কলাম মন্ত্রণালয় ফরম্যাট\', en: \'IPCC Tier 2 / Verra VM0047 / 17-Column Ministry Format\' },
  tabMinistry: { bn: \'মন্ত্রণালয় রিপোর্ট\', en: \'Ministry Report\' },
  tabIpcc: { bn: \'IPCC Tier 2\', en: \'IPCC Tier 2\' },
  tabVerra: { bn: \'Verra VM0047\', en: \'Verra VM0047\' },

  // Summary Cards
  totalEntries: { bn: \'মোট এন্ট্রি\', en: \'Total Entries\' },
  totalSaplingsCard: { bn: \'মোট চারা\', en: \'Total Saplings\' },
  uniqueSpecies: { bn: \'স্বতন্ত্র প্রজাতি\', en: \'Unique Species\' },
  upazilasCovered: { bn: \'আওতাধীন উপজেলা\', en: \'Upazilas Covered\' },

  // 17-Col Table
  ministry17Title: { bn: \'১৭-কলাম মন্ত্রণালয় রিপোর্ট (রোপণকৃত চারার তথ্য)\', en: \'17-Column Ministry Report\' },
  exportCSV: { bn: \'CSV রপ্তার্তি করুন\', en: \'Export CSV\' },
  total: { bn: \'মোট (সর্বমূল)\', en: \'Total\' },
  colSl: { bn: \'ক্র.নং\', en: \'Sl\' },
  colVillage: { bn: \'গ্রাম\', en: \'Village\' },
  colBlock: { bn: \'ব্লক\', en: \'Block\' },
  colUnion: { bn: \'ইউনিয়ন\', en: \'Union\' },
  colUpazila: { bn: \'উপজেলা\', en: \'Upazila\' },
  colDistrict: { bn: \'জেলা\', en: \'District\' },
  colSpecies: { bn: \'প্রজাতি\', en: \'Species\' },
  colCount: { bn: \'সংখ্যা\', en: \'Count\' },
  colDate: { bn: \'তারিখ\', en: \'Date\' },
  colCoords: { bn: \'জিও-কোঅর্ডিনেট\', en: \'Geo-Coordinate\' },
  colFarmer: { bn: \'পরিচর্যাকারী\', en: \'Caregiver\' },
  colMobile: { bn: \'মোবাইল\', en: \'Mobile\' },
  colSaao: { bn: \'SAAO\', en: \'SAAO\' },
  colSaaoMobile: { bn: \'SAAO মোবাইল\', en: \'SAAO Mobile\' },
  colMo: { bn: \'মনিটরিং অফিসার\', en: \'Monitoring Officer\' },
  colMoMobile: { bn: \'মোবাইল\', en: \'Mobile\' },
  colComments: { bn: \'মন্তব্য\র\' },
  colLocation: { bn: \'জেলা, উপজেলা, ইউনিয়ন ও গ্রামের নাম\', en: \'District, Upazila, Union & Village\' },
  colFarmerInfo: { bn: \'কৃষকের নাম ও ফোন নম্বর\', en: \'Farmer Name & Phone\' },
  colSaaoInfo: { bn: \'SAAO-এর নাম ও ফোন নম্বর\', en: \'SAAO Name & Phone\' },
  colMoInfo: { bn: \'মনিটরিং অফিসারের নাম ও ফোন নম্বর\', en: \'MO Name & Phone\' },

  // Upazila Chart
  upazilaSaplings: { bn: \'উপজেলাভিত্তিক চারা\', en: \'Saplings by Upazila\' },
  speciesBreakdown: { bn: \'উপজেলাভিত্তিক প্রজাতি বিশ্লেষণ\', en: \'Upazila Species Breakdown\' },

  // IPCC Tab
  ipccDistrictCarbon: { bn: \'জেলাভিত্তিক কার্বন সঞ্চয়\', en: \'District Carbon Sequestration\' },
  ipccVerified: { bn: \'যাচাইকৃত\', en: \'Verified\' },
  ipccProjected: { bn: \'প্রক্ষিপ্ত\', en: \'Projected\' },
  ipccArea: { bn: \'এলাকা (হেক্টর)\', en: \'Area (ha)\' },
  biomassTrend: { bn: \'বায়োমাস প্রবণতা (AGB/BGB)\', en: \'Biomass Trend (AGB/BGB)\' },
  biomassAbove: { bn: \'ভূমির উপরের বায়োমাস (AGB)\', en: \'Above Ground Biomass (AGB)\' },
  biomassBelow: { bn: \'ভূমির নিচের বায়োমাস (BGB)\', en: \'Below Ground Biomass (BGB)\' },
  biomassTotal: { bn: \'মোট বায়োমাস\', en: \'Total Biomass\' },

  // Verra Tab
  verraCompliance: { bn: \'Verra VM0047 সম্মতি তালিকা\', en: \'Verra VM0047 Compliance Checklist\' },
  verraComplete: { bn: \'সম্পন্ন\', en: \'Complete\' },
  verraInProgress: { bn: \'চলমান\', en: \'In Progress\' },
  verraPending: { bn: \'বাকি আছে\', en: \'Pending\' },

  // --- Field Collector ---
  newMeasurement: { bn: \'নতুন মাপ পরিমাপ\', en: \'New Field Measurement\' },
  recentCollections: { bn: \'সাম্প্রতিক সংগ্রহ\', en: \'Recent Collections\' },
  collectionsToday: { bn: \'আজকের সংগ্রহ\', en: \'Collections Today\' },
  syncedServer: { bn: \'সার্ভারে সিঙ্ক\', en: \'Synced to Server\' },
  treesRecorded: { bn: \'বৃক্ষ লিপিবন্ধন\', en: \'Trees Recorded\' },
  pendingUpload: { bn: \'আপলোড বাকি\', en: \'Pending Upload\' },

  siteName: { bn: \'স্থানের নাম\', en: \'Site Name\' },
  speciesLabel: { bn: \'প্রজাতি\', en: \'Species\' },
  dbh: { bn: \'DBH (সেমি)\', en: \'DBH (cm)\' },
  height: { bn: \'উচ্চতা (মিটার)\', en: \'Height (m)\' },
  latitude: { bn: 'অক্ষাংশ', en: \'Latitude\' },
  longitude: { bn: \'দ্রাঘিমাংশ\', en: \'Longitude\' },
  soilMoisture: { bn: \'মাটির আর্দ্রতা\', en: \'Soil Moisture\' },
  temperature: { bn: \'তাপমাত্রা\', en: \'Temperature\' },
  rainfall: { bn: \'বৃষ্টিপাত\', en: \'Rainfall\' },
  fieldNotes: { bn: \'মাঠ পর্যবেক্ষণ নোট\', en: \'Field Notes\' },
  saveMeasurement: { bn: \'মাপ সংরক্ষণ করুন\', en: \'Save Measurement\' },
  saved: { bn: \'সংরক্ষণ হয়েছে!\', en: \'Saved!\' },
  attachPhoto: { bn: \'ছবি যুক্ত করুন\', en: \'Attach Photo\' },
  getGps: { bn: \'জিপিএস নিন\XF0', en: \'Get GPS\' },
  trees: { bn: \'টি বৃক্ষ\', en: \'trees\' },
}

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: \'bn\',
  setLang: () => {},
  t: (key: string) => key,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== \'undefined\') {
      return (localStorage.getItem(\'plantation-lang\') as Lang) || \'bn\'
    }
    return \'bn\'
  })

  useEffect(() => {
    localStorage.setItem(\'plantation-lang\', lang)
  }, [lang])

  const t = (key: string): string => {
    const entry = t[key]
    if (!entry) return key
    return entry[lang] || entry.en || key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
