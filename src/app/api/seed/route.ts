import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Real data extracted from the Excel App_Entry / process_data sheet
// 25 Crore Tree Plantation Program - Kurigram District
const appEntries = [
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'সদর', species: 'পেয়ারা থাই-৭', count: 85, latitude: 25.755591, longitude: 89.657639, plantingDate: '2026-05-10', farmerName: 'মোঃ রেজওয়ান সরকার', farmerMobile: '01750674891', saaoName: 'ভবেশ চন্দ্র মোদক', saaoMobile: '01724511968', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'সদর', species: 'মাল্টা বারি-১', count: 60, latitude: 25.826721, longitude: 89.603292, plantingDate: '2026-06-04', farmerName: 'মোঃ আতিকুর রহমান', farmerMobile: '01727620179', saaoName: 'নারায়ন চন্দ্র সরকার', saaoMobile: '01724511346', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'সদর', species: 'লেবু সিডলেস', count: 220, latitude: 25.830043, longitude: 89.6245, plantingDate: '2026-06-02', farmerName: 'মোঃ আমিনুর ইসলাম', farmerMobile: '01723360770', saaoName: 'এস এম তরিকুল ইসলাম', saaoMobile: '01716026306', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'সদর', species: 'আম-ব্যানানা', count: 33, latitude: 25.4939, longitude: 89.37017, plantingDate: '2026-06-02', farmerName: 'জয়ন্তী রাণী', farmerMobile: '01791966821', saaoName: 'মোঃ নুর আলম', saaoMobile: '01729451848', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ভুরুঙ্গামারী', species: 'আম-ব্যানানা মেঙ্গো', count: 33, latitude: 26.125547, longitude: 89.729581, plantingDate: '2026-06-02', farmerName: 'মোছা: শারমিন আক্তার', farmerMobile: '01712046367', saaoName: 'মো: মঞ্জুরুল ইসলাম', saaoMobile: '01717813138', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ভুরুঙ্গামারী', species: 'পেয়ারা গোল্ডেন-৮', count: 85, latitude: 25.925, longitude: 89.74, plantingDate: '2026-06-02', farmerName: 'মোঃ শফিকুল ইসলাম', farmerMobile: '01740269879', saaoName: 'মো: মঞ্জুরুল ইসলাম', saaoMobile: '01717813138', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ভুরুঙ্গামামারী', species: 'মাল্টা বারি-১', count: 60, latitude: 25.915, longitude: 89.725, plantingDate: '2026-06-02', farmerName: 'মোঃ আবদুল হামিদ', farmerMobile: '01715724765', saaoName: 'মো: মঞ্জুরুল ইসলাম', saaoMobile: '01717813138', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ভুরুঙ্গামারী', species: 'লেবু চায়না-৩', count: 220, latitude: 25.935, longitude: 89.75, plantingDate: '2026-06-02', farmerName: 'মোঃ নজরুল ইসলাম', farmerMobile: '01716282523', saaoName: 'মো: মঞ্জুরুল ইসলাম', saaoMobile: '01717813138', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চর রাজিবপুর', species: 'থাই পেয়ারা', count: 85, latitude: 25.55, longitude: 89.65, plantingDate: '2026-06-10', farmerName: 'মোঃ আলী আকবর', farmerMobile: '01763385317', saaoName: 'মোঃ আবুল কালাম', saaoMobile: '01745871135', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চর রাজিবপুর', species: 'আম আম্রপালী', count: 33, latitude: 25.56, longitude: 89.64, plantingDate: '2026-06-10', farmerName: 'মোঃ শাহজাহান', farmerMobile: '01757301680', saaoName: 'মোঃ আবুল কালাম', saaoMobile: '01745871135', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চর রাজিবপুর', species: 'লেবু সিডলেস', count: 220, latitude: 25.57, longitude: 89.66, plantingDate: '2026-06-10', farmerName: 'মোঃ ইসলাম', farmerMobile: '01734864337', saaoName: 'মোঃ আবুল কালাম', saaoMobile: '01745871135', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চর রাজিবপুর', species: 'পেয়ারা থাই-৭', count: 85, latitude: 25.58, longitude: 89.63, plantingDate: '2026-06-10', farmerName: 'মোঃ রফিকুল', farmerMobile: '01739677268', saaoName: 'মোঃ আবুল কালাম', saaoMobile: '01745871135', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'উলিপুর', species: 'মাল্টা বারি-১', count: 60, latitude: 25.83, longitude: 89.57, plantingDate: '2026-06-12', farmerName: 'মোঃ আনিছুর', farmerMobile: '01744549474', saaoName: 'মোঃ রফিকুল ইসলাম', saaoMobile: '01736098894', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'উলিপুর', species: 'আম-ব্যানানা', count: 33, latitude: 25.84, longitude: 89.58, plantingDate: '2026-06-12', farmerName: 'মোঃ আবু তালেব', farmerMobile: '01725639795', saaoName: 'মোঃ রফিকুল ইসলাম', saaoMobile: '01736098894', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'উলিপুর', species: 'লেবু কাগজী', count: 220, latitude: 25.82, longitude: 89.56, plantingDate: '2026-06-12', farmerName: 'মোঃ নুরুল', farmerMobile: '01726766264', saaoName: 'মোঃ রফিকুল ইসলাম', saaoMobile: '01736098894', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'উলিপুর', species: 'পেয়ারা কাজী', count: 85, latitude: 25.845, longitude: 89.595, plantingDate: '2026-06-12', farmerName: 'মোঃ হাবিবুর', farmerMobile: '01713924024', saaoName: 'মোঃ রফিকুল ইসলাম', saaoMobile: '01736098894', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রৌমারী', species: 'বারি মাল্টা-১', count: 60, latitude: 25.63, longitude: 89.62, plantingDate: '2026-06-14', farmerName: 'মোঃ মজিবর', farmerMobile: '01729362166', saaoName: 'মোঃ শফিকুল', saaoMobile: '01736326347', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রৌমারী', species: 'আম (আমরুপালী)', count: 33, latitude: 25.64, longitude: 89.61, plantingDate: '2026-06-14', farmerName: 'মোঃ জহুরুল', farmerMobile: '01762978243', saaoName: 'মোঃ শফিকুল', saaoMobile: '01736326347', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রৌমারী', species: 'লেবু চায়না-৩', count: 220, latitude: 25.62, longitude: 89.63, plantingDate: '2026-06-14', farmerName: 'মোঃ নজরুল', farmerMobile: '01723622642', saaoName: 'মোঃ শফিকুল', saaoMobile: '01736326347', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রৌমারী', species: 'পেয়ারা গোল্ডেন-৮', count: 85, latitude: 25.635, longitude: 89.615, plantingDate: '2026-06-14', farmerName: 'মোঃ কামরুল', farmerMobile: '01728226986', saaoName: 'মোঃ শফিকুল', saaoMobile: '01736326347', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চিলমারী', species: 'মাল্টা বারি-১', count: 60, latitude: 25.71, longitude: 89.52, plantingDate: '2026-06-15', farmerName: 'মোঃ আবু বকর', farmerMobile: '01728598680', saaoName: 'মোঃ আলী আকবর', saaoMobile: '01728444339', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চিলমারী', species: 'বারি আম-4', count: 33, latitude: 25.72, longitude: 89.53, plantingDate: '2026-06-15', farmerName: 'মোঃ আনোয়ার', farmerMobile: '01727223144', saaoName: 'মোঃ আলী আকবর', saaoMobile: '01728444339', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চিলমারী', species: 'লেবু দেশী', count: 220, latitude: 25.7, longitude: 89.51, plantingDate: '2026-06-15', farmerName: 'মোঃ হাসান', farmerMobile: '01723428108', saaoName: 'মোঃ আলী আকবর', saaoMobile: '01728444339', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'চিলমারী', species: 'পেয়ারা থাই', count: 85, latitude: 25.715, longitude: 89.525, plantingDate: '2026-06-15', farmerName: 'মোঃ রুস্তম', farmerMobile: '01738596006', saaoName: 'মোঃ আলী আকবর', saaoMobile: '01728444339', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'নাগেশ্বরী', species: 'মাল্টা বারি-১', count: 60, latitude: 25.92, longitude: 89.45, plantingDate: '2026-06-16', farmerName: 'মোঃ আজিজুল', farmerMobile: '01713390428', saaoName: 'মোঃ মোস্তফা', saaoMobile: '01724847468', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'নাগেশ্বরী', species: 'আম হাড়িভাঙ্গা', count: 33, latitude: 25.93, longitude: 89.46, plantingDate: '2026-06-16', farmerName: 'মোঃ আবুল কালাম', farmerMobile: '01729976602', saaoName: 'মোঃ মোস্তফা', saaoMobile: '01724847468', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'নাগেশ্বরী', species: 'লেবু কাগজী', count: 220, latitude: 25.91, longitude: 89.44, plantingDate: '2026-06-16', farmerName: 'মোঃ শফিকুল', farmerMobile: '01718287918', saaoName: 'মোঃ মোস্তফা', saaoMobile: '01724847468', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'নাগেশ্বরী', species: 'পেয়ারা কাজী', count: 85, latitude: 25.925, longitude: 89.455, plantingDate: '2026-06-16', farmerName: 'মোঃ জাহিদুল', farmerMobile: '01735490402', saaoName: 'মোঃ মোস্তফা', saaoMobile: '01724847468', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ফুলবাড়ী', species: 'মাল্টা বারি-১', count: 60, latitude: 25.88, longitude: 89.48, plantingDate: '2026-06-18', farmerName: 'মোঃ আবুল হোসেন', farmerMobile: '01719917596', saaoName: 'মোঃ মজিবুর', saaoMobile: '01718932548', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ফুলবাড়ী', species: 'আম-ব্যানানা', count: 33, latitude: 25.89, longitude: 89.49, plantingDate: '2026-06-18', farmerName: 'মোঃ হারুন', farmerMobile: '01732794298', saaoName: 'মোঃ মজিবুর', saaoMobile: '01718932548', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ফুলবাড়ী', species: 'লেবু দেশী', count: 150, latitude: 25.87, longitude: 89.47, plantingDate: '2026-06-18', farmerName: 'মোঃ আনিছুর', farmerMobile: '01723711122', saaoName: 'মোঃ মজিবুর', saaoMobile: '01718932548', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'ফুলবাড়ী', species: 'পেয়ারা থাই-৭', count: 85, latitude: 25.875, longitude: 89.475, plantingDate: '2026-06-18', farmerName: 'মোঃ সোহরাব', farmerMobile: '01738398365', saaoName: 'মোঃ মজিবুর', saaoMobile: '01718932548', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রাজারহাট', species: 'মাল্টা (বারি মাল্টা-1)', count: 60, latitude: 25.76, longitude: 89.55, plantingDate: '2026-06-20', farmerName: 'মোঃ আবদুল্লাহ', farmerMobile: '01714548425', saaoName: 'মোঃ রফিকুল', saaoMobile: '01724556035', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রাজারহাট', species: 'আম (আমরুপালী)', count: 33, latitude: 25.77, longitude: 89.56, plantingDate: '2026-06-20', farmerName: 'মোঃ জাহিদ', farmerMobile: '01737906834', saaoName: 'মোঃ রফিকুল', saaoMobile: '01724556035', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রাজারহাট', species: 'লেবু চায়না-৩', count: 220, latitude: 25.75, longitude: 89.54, plantingDate: '2026-06-20', farmerName: 'মোঃ মোস্তফা', farmerMobile: '01729373005', saaoName: 'মোঃ রফিকুল', saaoMobile: '01724556035', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
  { region: 'রংপুর', district: 'কুড়িগ্রাম', upazila: 'রাজারহাট', species: 'পেয়ারা গোল্ডেন-৮', count: 85, latitude: 25.765, longitude: 89.555, plantingDate: '2026-06-20', farmerName: 'মোঃ এনামুল', farmerMobile: '01739478566', saaoName: 'মোঃ রফিকুল', saaoMobile: '01724556035', seedlingSource: 'প্রদর্শনী-রংপুর উন্নয়ন প্রকল্প' },
]

export async function POST() {
  // Only seed if no data exists (idempotent)
  const existingCount = await db.appEntry.count()
  if (existingCount >= appEntries.length) {
    return NextResponse.json({
      message: 'Database already seeded',
      appEntries: existingCount,
      totalSaplings: await db.appEntry.aggregate({ _sum: { count: true } }).then(r => r._sum.count || 0),
    })
  }

  // Clear and re-seed
  await db.appEntry.deleteMany()

  // Seed AppEntry from Excel data
  for (const entry of appEntries) {
    await db.appEntry.create({ data: entry })
  }

  // Also create legacy plantations for map/alerts/carbon features
  const plantationCount = await db.plantation.count()
  if (plantationCount === 0) {
    const plantations = [
      { name: 'কুড়িগ্রাম সদর - ফলদ বৃক্ষরোপণ', district: 'কুড়িগ্রাম', areaHa: 12.5, trees: 398, ndvi: 0.48, status: 'healthy', latitude: 25.79, longitude: 89.64, species: 'Mixed Fruit' },
      { name: 'ভুরুঙ্গামারী - প্রদর্শনী বাগান', district: 'কুড়িগ্রাম', areaHa: 18.0, trees: 398, ndvi: 0.42, status: 'healthy', latitude: 25.92, longitude: 89.74, species: 'Mixed Fruit' },
      { name: 'চর রাজিবপুর - চরাঞ্চল বৃক্ষরোপণ', district: 'কুড়িগ্রাম', areaHa: 22.0, trees: 423, ndvi: 0.35, status: 'stressed', latitude: 25.56, longitude: 89.65, species: 'Mixed Fruit' },
      { name: 'উলিপুর - কৃষক পর্যায়ে বৃক্ষরোপণ', district: 'কুড়িগ্রাম', areaHa: 15.5, trees: 398, ndvi: 0.44, status: 'healthy', latitude: 25.83, longitude: 89.58, species: 'Mixed Fruit' },
      { name: 'রৌমারী - সম্প্রসারণ ব্লক', district: 'কুড়িগ্রাম', areaHa: 16.0, trees: 398, ndvi: 0.38, status: 'stressed', latitude: 25.63, longitude: 89.62, species: 'Mixed Fruit' },
      { name: 'চিলমারী - মাল্টা বাগান', district: 'কুড়িগ্রাম', areaHa: 14.0, trees: 398, ndvi: 0.51, status: 'healthy', latitude: 25.71, longitude: 89.52, species: 'Mixed Fruit' },
      { name: 'নাগেশ্বরী - লেবু বাগান', district: 'কুড়িগ্রাম', areaHa: 19.0, trees: 398, ndvi: 0.46, status: 'healthy', latitude: 25.92, longitude: 89.45, species: 'Mixed Fruit' },
      { name: 'ফুলবাড়ী - আম বাগান', district: 'কুড়িগ্রাম', areaHa: 13.5, trees: 328, ndvi: 0.40, status: 'stressed', latitude: 25.88, longitude: 89.48, species: 'Mixed Fruit' },
      { name: 'রাজারহাট - সমন্বিত বৃক্ষরোপণ', district: 'কুড়িগ্রাম', areaHa: 17.0, trees: 398, ndvi: 0.37, status: 'mortality_alert', latitude: 25.76, longitude: 89.55, species: 'Mixed Fruit' },
    ]

    const created: { name: string; id: string }[] = []
    for (const p of plantations) {
      const plantation = await db.plantation.create({ data: p })
      created.push({ name: plantation.name, id: plantation.id })
    }

    // Seed alerts for stressed/mortality sites
    for (const p of plantations.filter(p => p.status !== 'healthy')) {
      const match = created.find(c => c.name === p.name)
      if (match) {
        await db.alert.create({
          data: {
            plantationId: match.id,
            ndviCurrent: p.ndvi,
            ndviBaseline: p.ndvi + 0.12,
            ndviDrop: 0.12,
            priority: p.status === 'mortality_alert' ? 'critical' : 'high',
            status: p.status === 'mortality_alert' ? 'open' : 'investigating',
            areaAffected: p.areaHa * 0.3,
            estimatedLoss: Math.floor(p.trees * 0.08),
            detectedAt: new Date('2026-07-01'),
          },
        })
      }
    }

    // Seed some carbon data
    for (const p of plantations) {
      const match = created.find(c => c.name === p.name)
      if (match) {
        for (const year of [2024, 2025, 2026]) {
          await db.carbonData.create({
            data: {
              plantationId: match.id,
              year,
              verifiedTco2e: year === 2024 ? 2000 : year === 2025 ? 5500 : 12000,
              projectedTco2e: year === 2024 ? 3000 : year === 2025 ? 8000 : 18000,
              agbTc: year * 15,
              bgbTc: year * 4,
              totalBiomass: year * 19,
            },
          })
        }
      }
    }
  }

  return NextResponse.json({
    message: 'Database seeded with Excel data',
    appEntries: appEntries.length,
    totalSaplings: appEntries.reduce((s, e) => s + e.count, 0),
  })
}