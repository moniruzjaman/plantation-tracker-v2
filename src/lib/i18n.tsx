'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'bn' | 'en'

type Translations = Record<string, { bn: string; en: string }>

const t: Translations = {
  // --- Sidebar ---
  appTitle: { bn: 'বৃক্ষরোপণ ট্র্যাকার', en: 'Plantation Tracker' },
  appVersion: { bn: 'সংস্করণ v২.০', en: 'Tracker v2.0' },
  croreProgram: { bn: '২৫ কোটি বৃক্ষরোপণ কর্মসূচি', en: '25 Crore Tree Plantation' },

  // --- Nav Items ---
  navDashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  navMap: { bn: 'স্যাটেলাইট ম্যাপ', en: 'Satellite Map' },
  navAlerts: { bn: 'মৃত্যু সতর্কতা', en: 'Mortality Alerts' },
  navReport: { bn: 'রিপোর্ট', en: 'Report' },
  navField: { bn: 'ফিল্ড কালেক্টর', en: 'Field Collector' },

  // --- Sidebar Stats ---
  districtLabel: { bn: 'কুড়িগ্রাম জেলা', en: 'Kurigram District' },
  saplings: { bn: 'চারা', en: 'saplings' },
  upazilas: { bn: 'উপজেলা', en: 'Upazilas' },
  species: { bn: 'প্রজাতি', en: 'Species' },
  gpsTracked: { bn: 'জিপিএস যাচাইকৃত', en: 'GPS tracked' },
  fieldVerified: { bn: 'মাঠ পর্যায়ে যাচাইকৃত', en: 'Field verified' },
  statSites: { bn: 'স্থান', en: 'sites' },

  // --- Dashboard ---
  dashBannerTitle: { bn: '২৫ কোটি বৃক্ষরোপণ কর্মসূচি', en: '25 Crore Tree Plantation Program' },
  dashBannerSub: { bn: 'নির্বাহী ড্যাশবোর্ড | কুড়িগ্রাম জেলা, রংপুর বিভাগ | কৃষি সম্প্রসারণ অধিদপ্তর', en: 'Executive Dashboard | Kurigram District, Rangpur Division | Department of Agricultural Extension' },

  statTotalSaplings: { bn: 'মোট রোপণকৃত চারা', en: 'Total Saplings Planted' },
  statUpazilas: { bn: 'আওতাধীন উপজেলা', en: 'Upazilas Covered' },
  statFarmers: { bn: 'সম্পৃক্ত কৃষক', en: 'Farmers Engaged' },
  statSitesLabel: { bn: 'রোপণ স্থান', en: 'Planting Sites' },

  chartByDistrict: { bn: 'জেলাভিত্তিক চারা বিতরণ', en: 'Saplings by District' },
  chartSpeciesDist: { bn: 'প্রজাতি বিতরণ', en: 'Species Distribution' },
  chartNdviTrend: { bn: 'NDVI স্বাস্থ্য প্রবণতা', en: 'NDVI Health Trend' },
  chartCarbon: { bn: 'কার্বন সঞ্চয় (tCO2e)', en: 'Carbon Sequestration (tCO2e)' },

  ndviHealthy: { bn: 'সুস্থ', en: 'Healthy' },
  ndviStressed: { bn: 'পীড়িত', en: 'Stressed' },
  ndviAlert: { bn: 'সতর্কতা', en: 'Alert' },
  carbonVerified: { bn: 'যাচাইকৃত', en: 'Verified' },
  carbonProjected: { bn: 'প্রক্ষিপ্ত', en: 'Projected' },
  saplingsLabel: { bn: 'চারা সংখ্যা', en: 'Saplings' },

  // Month names
  monthJan: { bn: 'জানু', en: 'Jan' },
  monthFeb: { bn: 'ফেব্রু', en: 'Feb' },
  monthMar: { bn: 'মার্চ', en: 'Mar' },
  monthApr: { bn: 'এপ্রিল', en: 'Apr' },
  monthMay: { bn: 'মে', en: 'May' },
  monthJun: { bn: 'জুন', en: 'Jun' },
  monthJul: { bn: 'জুলা', en: 'Jul' },
  monthAug: { bn: 'আগ', en: 'Aug' },
  monthSep: { bn: 'সেপ্টে', en: 'Sep' },
  monthOct: { bn: 'অক্টো', en: 'Oct' },
  monthNov: { bn: 'নভে', en: 'Nov' },
  monthDec: { bn: 'ডিসে', en: 'Dec' },

  // Ministry Report Summary (Dashboard)
  ministryReportTitle: { bn: 'সাপ্তাহিক মন্ত্রণালয় রিপোর্ট সারাংশ', en: 'Weekly Ministry Report Summary' },
  report17ColEntries: { bn: '১৭-কলাম রিপোর্ট (এক্সেল)', en: '17-Col Report (Excel)' },
  reportTotalSaplings: { bn: 'মোট চারা (রিপোর্ট)', en: 'Total Saplings (Report)' },
  reportEmails: { bn: 'রিপোর্টিং ইমেইল', en: 'Reporting Emails' },
  weeklySubmission: { bn: 'সাপ্তাহিক জমা আবশ্যক', en: 'Weekly submission required' },
  weeklyEmailDae: { bn: 'DAE ও MoA তে সাপ্তাহিক ইমেইল', en: 'Weekly email to DAE & MoA' },
  reportFormat: { bn: 'রিপোর্ট ফরম্যাট:', en: 'Report Format:' },
  reportFormatDesc: { bn: 'সাপ্তাহিকভিত্তিক বৃক্ষরোপণের তথ্য (সাপ্তাহিক বৃক্ষরোপণ রিপোর্ট) - ১৭ কলাম যা গ্রাম, ব্লক, ইউনিয়ন, উপজেলা, জেলা, প্রজাতি, সংখ্যা, তারিখ, জিও কোঅর্ডিনেট, কৃষক ও SAAO এর বিবরণ ধারণ করে।', en: 'Weekly Plantation Report - 17 columns including village, block, union, upazila, district, species, count, date, GPS coordinates, farmer & SAAO details.' },
  acrossUpazilas: { bn: 'উপজেলাসমূহে', en: 'Across upazilas' },

  // Recent Entries Table
  recentEntries: { bn: 'সাম্প্রতিক রোপণ তথ্য', en: 'Recent Planting Entries' },
  thSpecies: { bn: 'প্রজাতি', en: 'Species' },
  thQty: { bn: 'পরিমাণ', en: 'Qty' },
  thUpazila: { bn: 'উপজেলা', en: 'Upazila' },
  thFarmer: { bn: 'কৃষক', en: 'Farmer' },
  thSaao: { bn: 'SAAO', en: 'SAAO' },

  // --- Map Page ---
  allUpazilas: { bn: 'সকল উপজেলা', en: 'All Upazilas' },
  satellite: { bn: 'স্যাটেলাইট', en: 'Satellite' },
  sitesSaplings: { bn: 'স্থান | চারা', en: 'sites | saplings' },
  loadingMap: { bn: 'স্যাটেলাইট ম্যাপ লোড হচ্ছে...', en: 'Loading satellite map...' },
  kurigramMap: { bn: 'কুড়িগ্রাম জেলার ম্যাপ', en: 'Kurigram District Map' },
  mapInfoLine1: { bn: '২৫ কোটি বৃক্ষরোপণ | জিপিএস যাচাইকৃত স্থান', en: '25 Crore Tree Plantation | GPS-verified sites' },
  circleSize: { bn: 'বৃত্ত আকার = রোপণকৃত সংখ্যা', en: 'Circle size = quantity planted' },
  speciesLegend: { bn: 'প্রজাতি লিজেন্ড', en: 'Species Legend' },
  legendGuava: { bn: 'পেয়ারা', en: 'Guava' },
  legendMalta: { bn: 'মাল্টা', en: 'Malta' },
  legendLemon: { bn: 'লেবু', en: 'Lemon' },
  legendMango: { bn: 'আম', en: 'Mango' },
  legendOther: { bn: 'অন্যান্য', en: 'Other' },

  // NDVI Legend (Map)
  ndviDenseForest: { bn: 'ঘন বন (>০.৬)', en: 'Dense Forest (>0.6)' },
  ndviVeryHealthy: { bn: 'অত্যন্ত সুস্থ (০.৫-০.৬)', en: 'Very Healthy (0.5-0.6)' },
  ndviHealthy: { bn: 'সুস্থ (০.৪-০.৫)', en: 'Healthy (0.4-0.5)' },
  ndviModerate: { bn: 'মাঝারি (০.৩-০.৪)', en: 'Moderate (0.3-0.4)' },
  ndviSparse: { bn: 'তির্যক (০.২-০.৩)', en: 'Sparse (0.2-0.3)' },
  ndviStressedMap: { bn: 'পীড়িত (০.১-০.২)', en: 'Stressed (0.1-0.2)' },
  ndviDeadBare: { bn: 'মৃত/শূন্য (<০.১)', en: 'Dead/Bare (<0.1)' },

  // Popup
  popupQuantity: { bn: 'পরিমাণ:', en: 'Quantity:' },
  popupSaplings: { bn: 'টি চারা', en: 'saplings' },
  popupUpazila: { bn: 'উপজেলা:', en: 'Upazila:' },
  popupDistrict: { bn: 'জেলা:', en: 'District:' },
  popupDate: { bn: 'তারিখ:', en: 'Date:' },
  popupGps: { bn: 'জিপিএস:', en: 'GPS:' },
  popupFarmer: { bn: 'কৃষক:', en: 'Farmer:' },
  popupSaao: { bn: 'SAAO:', en: 'SAAO:' },
  popupSource: { bn: 'উৎস:', en: 'Source:' },

  // Map layers
  layerSatellite: { bn: 'স্যাটেলাইট', en: 'Satellite' },
  layerOSM: { bn: 'ওপেনস্ট্রিটম্যাপ', en: 'OpenStreetMap' },

  // --- Alerts Page ---
  criticalAlerts: { bn: 'জরুরি সতর্কতা', en: 'Critical Alerts' },
  highPriority: { bn: 'উচ্চ অগ্রাধিকার', en: 'High Priority' },
  openCases: { bn: 'খোলা মামলা', en: 'Open Cases' },
  estCarbonLoss: { bn: 'আনুমানিক কার্বন ক্ষয়', en: 'Est. Carbon Loss' },
  priorityLabel: { bn: 'অগ্রাধিকার:', en: 'Priority:' },
  statusLabel: { bn: 'অবস্থা:', en: 'Status:' },
  exportCsv: { bn: 'CSV রপ্তানি', en: 'Export CSV' },
  alertId: { bn: 'সতর্কতা আইডি', en: 'Alert ID' },
  plantation: { bn: 'বৃক্ষরোপণ', en: 'Plantation' },
  ndviDrop: { bn: 'NDVI হ্রাস', en: 'NDVI Drop' },
  areaHa: { bn: 'এলাকা (হেক্টর)', en: 'Area (ha)' },
  estLoss: { bn: 'আনুমানিক ক্ষয়', en: 'Est. Loss' },
  detected: { bn: 'শনাক্ত', en: 'Detected' },
  action: { bn: 'পদক্ষেপ', en: 'Action' },
  view: { bn: 'দেখুন', en: 'View' },
  statusOpen: { bn: 'খোলা', en: 'Open' },
  statusInvestigating: { bn: 'তদন্তাধীন', en: 'Investigating' },
  statusResolved: { bn: 'সমাধান হয়েছে', en: 'Resolved' },
  filterPriorityAll: { bn: 'সব', en: 'All' },
  filterPriorityCritical: { bn: 'জরুরি', en: 'Critical' },
  filterPriorityHigh: { bn: 'উচ্চ', en: 'High' },
  filterPriorityMedium: { bn: 'মাঝারি', en: 'Medium' },

  // --- Report Page ---
  carbonMinistry: { bn: 'কার্বন ও মন্ত্রণালয় রিপোর্ট', en: 'Carbon & Ministry Report' },
  reportSubtitle: { bn: 'IPCC Tier 2 / Verra VM0047 / ১৭-কলাম মন্ত্রণালয় ফরম্যাট', en: 'IPCC Tier 2 / Verra VM0047 / 17-Column Ministry Format' },
  tabMinistry: { bn: 'মন্ত্রণালয় রিপোর্ট', en: 'Ministry Report' },
  tabIpcc: { bn: 'IPCC Tier 2', en: 'IPCC Tier 2' },
  tabVerra: { bn: 'Verra VM0047', en: 'Verra VM0047' },

  // Summary Cards
  totalEntries: { bn: 'মোট এন্ট্রি', en: 'Total Entries' },
  totalSaplingsCard: { bn: 'মোট চারা', en: 'Total Saplings' },
  uniqueSpecies: { bn: 'স্বতন্ত্র প্রজাতি', en: 'Unique Species' },
  upazilasCovered: { bn: 'আওতাধীন উপজেলা', en: 'Upazilas Covered' },
  report17ColCard: { bn: '১৭-কলাম রিপোর্ট (এক্সেল)', en: '17-Col Report (Excel)' },
  ministryReportCard: { bn: 'মন্ত্রণালয় রিপোর্ট (এক্সেল)', en: 'Ministry Report (Excel)' },

  // 17-Col Table
  ministry17Title: { bn: '১৭-কলাম মন্ত্রণালয় রিপোর্ট (রোপণকৃত চারার তথ্য)', en: '17-Column Ministry Report' },
  exportCSV: { bn: 'CSV রপ্তানি করুন', en: 'Export CSV' },
  total: { bn: 'মোট', en: 'Total' },
  colSl: { bn: 'ক্র.নং', en: 'Sl' },
  colVillage: { bn: 'গ্রাম', en: 'Village' },
  colBlock: { bn: 'ব্লক', en: 'Block' },
  colUnion: { bn: 'ইউনিয়ন', en: 'Union' },
  colUpazila: { bn: 'উপজেলা', en: 'Upazila' },
  colDistrict: { bn: 'জেলা', en: 'District' },
  colSpecies: { bn: 'প্রজাতি', en: 'Species' },
  colCount: { bn: 'সংখ্যা', en: 'Count' },
  colDate: { bn: 'তারিখ', en: 'Date' },
  colCoords: { bn: 'জিও-কোঅর্ডিনেট', en: 'Geo-Coordinate' },
  colFarmer: { bn: 'পরিচর্যাকারী', en: 'Caregiver' },
  colMobile: { bn: 'মোবাইল', en: 'Mobile' },
  colSaao: { bn: 'SAAO', en: 'SAAO' },
  colSaaoMobile: { bn: 'SAAO মোবাইল', en: 'SAAO Mobile' },
  colMo: { bn: 'মনিটরিং অফিসার', en: 'Monitoring Officer' },
  colComments: { bn: 'মন্তব্য', en: 'Comments' },
  colLocation: { bn: 'জেলা, উপজেলা, ইউনিয়ন ও গ্রামের নাম', en: 'District, Upazila, Union & Village' },
  colFarmerInfo: { bn: 'কৃষকের নাম ও ফোন নম্বর', en: 'Farmer Name & Phone' },
  colSaaoInfo: { bn: 'SAAO-এর নাম ও ফোন নম্বর', en: 'SAAO Name & Phone' },
  colMoInfo: { bn: 'মনিটরিং অফিসারের নাম ও ফোন নম্বর', en: 'MO Name & Phone' },

  // Upazila Chart
  upazilaSaplings: { bn: 'উপজেলাভিত্তিক চারা', en: 'Saplings by Upazila' },
  speciesBreakdown: { bn: 'উপজেলাভিত্তিক প্রজাতি বিশ্লেষণ', en: 'Upazila Species Breakdown' },

  // IPCC Tab
  ipccCarbonByUpazila: { bn: 'উপজেলাভিত্তিক কার্বন সঞ্চয় (tCO2e)', en: 'Carbon by Upazila (tCO2e)' },
  ipccVerified: { bn: 'যাচাইকৃত', en: 'Verified' },
  ipccProjected: { bn: 'প্রক্ষিপ্ত', en: 'Projected' },
  totalVerified: { bn: 'মোট যাচাইকৃত', en: 'Total Verified' },
  projected2028: { bn: '২০২৮ প্রক্ষিপ্ত', en: 'Projected 2028' },
  totalArea: { bn: 'মোট এলাকা', en: 'Total Area' },
  avgDensity: { bn: 'গড় ঘনত্ব', en: 'Avg Density' },
  biomassComponents: { bn: 'বায়োমাস উপাদান (tC/ha)', en: 'Biomass Components (tC/ha)' },
  aboveground: { bn: 'ভূমির উপরের', en: 'Aboveground' },
  belowground: { bn: 'ভূমির নিচের', en: 'Belowground' },
  totalBiomass: { bn: 'মোট বায়োমাস', en: 'Total Biomass' },
  ipccTitle: { bn: 'IPCC ২০০৬ Tier 2 পদ্ধতি', en: 'IPCC 2006 Tier 2 Methodology' },
  carbonFraction: { bn: 'কার্বন ভগ্নাংশ', en: 'Carbon Fraction' },
  rootToShoot: { bn: 'মূল-শাখা অনুপাত', en: 'Root-to-Shoot Ratio' },
  woodDensity: { bn: 'কাঠের ঘনত্ব', en: 'Wood Density' },
  biomassExpansion: { bn: 'বায়োমাস সম্প্রসারণ ফ্যাক্টর', en: 'Biomass Expansion Factor' },
  uncertainty: { bn: 'অনিশ্চয়তা', en: 'Uncertainty' },
  reportingPeriod: { bn: 'রিপোর্টিং সময়কাল', en: 'Reporting Period' },
  carbonFractionDetail: { bn: 'ক্রান্তীয় কঠিন কাঠের জন্য IPCC ২০০৬ ডিফল্ট', en: 'Default IPCC 2006 for tropical hardwood' },
  rootToShootDetail: { bn: 'ক্রান্তীয় অঞ্চলের জন্য IPCC সারণি ৪.৪', en: 'IPCC Table 4.4 for tropical zones' },
  woodDensityDetail: { bn: 'বাংলাদেশের প্রজাতির গড়', en: 'Bangladesh species average' },
  biomassExpansionDetail: { bn: 'বৃক্ষরোপণের জন্য ভূমির উপরের BEF', en: 'Above-ground BEF for plantations' },
  uncertaintyDetail: { bn: 'সম্মিলিত পরিমাপ + মডেল', en: 'Combined measurement + model' },
  reportingPeriodDetail: { bn: '৫ বছরের যাচাইকরণ চক্র', en: '5-year verification cycle' },

  // Verra Tab
  verraCompliance: { bn: 'Verra VM0047 v1.1 সম্মতি অবস্থা', en: 'Verra VM0047 v1.1 Compliance Status' },
  verraComplete: { bn: 'সম্পন্ন', en: 'Complete' },
  verraInProgress: { bn: 'চলমান', en: 'In Progress' },
  verraPending: { bn: 'বাকি আছে', en: 'Pending' },
  projectDescription: { bn: 'প্রকল্প বিবরণ', en: 'Project Description' },
  pddDrafted: { bn: 'PDD খসড়া তৈরি', en: 'PDD drafted' },
  baselineScenario: { bn: 'বেসলাইন পরিস্থিতি', en: 'Baseline Scenario' },
  dynamicBenchmark: { bn: 'গতিশীল বেঞ্চমার্ক নির্ধারিত', en: 'Dynamic benchmark set' },
  monitoringPlan: { bn: 'নিরীক্ষণ পরিকল্পনা', en: 'Monitoring Plan' },
  satellitePipelineActive: { bn: 'স্যাটেলাইট পাইপলাইন সক্রিয়', en: 'Satellite pipeline active' },
  leakageAssessment: { bn: 'লিকেজ মূল্যায়ন', en: 'Leakage Assessment' },
  vmd0054Required: { bn: 'VMD0054 প্রয়োজন', en: 'VMD0054 required' },
  permanenceBuffer: { bn: 'স্থায়িত্ব বাফার', en: 'Permanence Buffer' },
  reserveCalc: { bn: '২০% রিজার্ভ হিসাব', en: '20% reserve calc' },
  vvbEngagement: { bn: 'VVB সম্পৃক্ততা', en: 'VVB Engagement' },
  auditorSelection: { bn: 'অডিটর নির্বাচন', en: 'Auditor selection' },
  exportIpccReport: { bn: 'IPCC রিপোর্ট রপ্তানি', en: 'Export IPCC Report' },
  generatePDD: { bn: 'VM0047 PDD তৈরি করুন', en: 'Generate VM0047 PDD' },

  // Banner in ministry tab
  ministryBannerTitle: { bn: '১৭. ০৫ বছরে ২৫ কোটি বৃক্ষরোপণ কর্মসূচির আওতায় রোপণকৃত চারার তথ্য', en: '17. Plantation Data under 25 Crore Tree Plantation Program (05 Years)' },
  ministryBannerSub: { bn: 'মন্ত্রণালয়/বিভাগ/অধিদপ্তর/দপ্তরের নাম: .................................... মাসের নাম: ....................................', en: 'Ministry/Division/Directorate: .................................... Month: ....................................' },
  bannerTotal: { bn: 'মোট', en: 'Total' },
  bannerSpecies: { bn: 'প্রজাতি', en: 'Species' },
  bannerUpazilas: { bn: 'উপজেলা', en: 'Upazilas' },

  // --- Field Collector ---
  newMeasurement: { bn: 'নতুন মাপ পরিমাপ', en: 'New Field Measurement' },
  recentCollections: { bn: 'সাম্প্রতিক সংগ্রহ', en: 'Recent Collections' },
  collectionsToday: { bn: 'আজকের সংগ্রহ', en: 'Collections Today' },
  syncedServer: { bn: 'সার্ভারে সিঙ্ক', en: 'Synced to Server' },
  treesRecorded: { bn: 'বৃক্ষ লিপিবদ্ধ', en: 'Trees Recorded' },
  pendingUpload: { bn: 'আপলোড বাকি', en: 'Pending Upload' },

  siteName: { bn: 'স্থানের নাম', en: 'Site Name' },
  siteNamePlaceholder: { bn: 'যেমন: কুড়িগ্রাম উত্তর ব্লক ক', en: 'e.g. Dhaka North Block A' },
  speciesLabel: { bn: 'প্রজাতি', en: 'Species' },
  speciesPlaceholder: { bn: 'যেমন: আকাশমণি (Acacia auriculiformis)', en: 'e.g. Akashmoni (Acacia auriculiformis)' },
  dbh: { bn: 'DBH (সেমি)', en: 'DBH (cm)' },
  height: { bn: 'উচ্চতা (মিটার)', en: 'Height (m)' },
  latitude: { bn: 'অক্ষাংশ', en: 'Latitude' },
  longitude: { bn: 'দ্রাঘিমাংশ', en: 'Longitude' },
  soilMoisture: { bn: 'মাটির আর্দ্রতা', en: 'Soil Moisture' },
  soilMoisturePlaceholder: { bn: 'যেমন: ৪৫%', en: 'e.g. 45%' },
  temperature: { bn: 'তাপমাত্রা', en: 'Temperature' },
  temperaturePlaceholder: { bn: 'যেমন: ৩২°C', en: 'e.g. 32\u00B0C' },
  rainfall: { bn: 'বৃষ্টিপাত', en: 'Rainfall' },
  rainfallPlaceholder: { bn: 'যেমন: ১৮০মি.মি/মাস', en: 'e.g. 180mm/month' },
  fieldNotes: { bn: 'মাঠ পর্যবেক্ষণ নোট', en: 'Field Notes' },
  fieldNotesPlaceholder: { bn: 'পর্যবেক্ষণ, অবস্থা, যেকোনো ত্রুটি...', en: 'Observations, conditions, any anomalies...' },
  saveMeasurement: { bn: 'মাপ সংরক্ষণ করুন', en: 'Save Measurement' },
  saved: { bn: 'সংরক্ষিত হয়েছে!', en: 'Saved!' },
  attachPhoto: { bn: 'ছবি যুক্ত করুন', en: 'Attach Photo' },
  getGps: { bn: 'জিপিএস নিন', en: 'Get GPS' },
  trees: { bn: 'টি বৃক্ষ', en: 'trees' },
  synced: { bn: 'সিঙ্ক হয়েছে', en: 'Synced' },
  pending: { bn: 'বাকি আছে', en: 'Pending' },
}

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'bn',
  setLang: () => {},
  t: (key: string) => key,
})

function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'bn'
  // Check localStorage first (user preference)
  const stored = localStorage.getItem('plantation-lang') as Lang | null
  if (stored === 'en' || stored === 'bn') return stored
  // Detect from browser/device language
  const browserLang = navigator.language || (navigator as any).userLanguage || ''
  // If browser language starts with 'en', use English; otherwise default to Bangla
  if (browserLang.toLowerCase().startsWith('en')) return 'en'
  return 'bn'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('bn')

  useEffect(() => {
    // Detect language on mount (client-side only)
    const detected = detectLanguage()
    setLang(detected)
  }, [])

  useEffect(() => {
    if (lang) {
      localStorage.setItem('plantation-lang', lang)
      document.documentElement.lang = lang
    }
  }, [lang])

  const tFn = (key: string): string => {
    const entry = t[key]
    if (!entry) return key
    return entry[lang] || entry.en || key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}