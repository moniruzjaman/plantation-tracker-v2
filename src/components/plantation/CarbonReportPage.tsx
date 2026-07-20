'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { Leaf, Download, FileText, Table, CheckCircle, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/i18n'

interface MinistryRow {
  sl: number
  village: string
  block: string
  union: string
  upazila: string
  district: string
  species: string
  count: number
  plantingDate: string
  coordinates: string
  farmerName: string
  farmerMobile: string
  saaoName: string
  saaoMobile: string
  moName: string
  moMobile: string
  comments: string
}

interface ReportSummary {
  totalEntries: number
  totalSaplings: number
  uniqueSpecies: number
  uniqueUpazilas: number
  speciesBreakdown: Record<string, number>
  upazilaBreakdown: Record<string, number>
  report17ColCount: number
  ministryReportCount: number
}

export default function CarbonReportPage() {
  const { t, lang } = useLang()
  const [activeTab, setActiveTab] = useState<'ministry' | 'ipcc' | 'verra'>('ministry')
  const [report, setReport] = useState<{ report: MinistryRow[]; summary: ReportSummary } | null>(null)

  useEffect(() => {
    fetch('/api/ministry-report')
      .then(r => r.json())
      .then(data => setReport(data))
      .catch(() => {})
  }, [])

  const carbonByDistrict = report
    ? Object.entries(report.summary.upazilaBreakdown).map(([district, count]) => ({
        district,
        verified: count * 3,
        projected: count * 5,
        area: Math.round(count / 20),
      }))
    : []

  const monthKeys = ['monthJan', 'monthFeb', 'monthMar', 'monthApr', 'monthMay', 'monthJun']
  const monthlyTrend = monthKeys.map((key, i) => ({
    month: t(key),
    agb: 420 + i * 38,
    bgb: 105 + i * 9.4,
    total: 525 + i * 47.4,
  }))

  const verraItems = [
    { label: t('projectDescription'), status: 'complete', detail: t('pddDrafted') },
    { label: t('baselineScenario'), status: 'complete', detail: t('dynamicBenchmark') },
    { label: t('monitoringPlan'), status: 'in_progress', detail: t('satellitePipelineActive') },
    { label: t('leakageAssessment'), status: 'pending', detail: t('vmd0054Required') },
    { label: t('permanenceBuffer'), status: 'pending', detail: t('reserveCalc') },
    { label: t('vvbEngagement'), status: 'pending', detail: t('auditorSelection') },
  ]

  const totalVerified = carbonByDistrict.reduce((s, d) => s + d.verified, 0)
  const totalProjected = carbonByDistrict.reduce((s, d) => s + d.projected, 0)
  const totalArea = carbonByDistrict.reduce((s, d) => s + d.area, 0)
  const avgDensity = totalArea > 0 ? (totalVerified / totalArea).toFixed(1) : '0'

  const verraStatusLabel = (status: string) => {
    if (status === 'complete') return t('verraComplete')
    if (status === 'in_progress') return t('verraInProgress')
    return t('verraPending')
  }

  const handleExportCSV = () => {
    if (!report) return
    const headers = [
      t('colSl'), t('colVillage'), t('colBlock'), t('colUnion'), t('colUpazila'),
      t('colDistrict'), t('colSpecies'), t('colCount'), t('colDate'), t('colCoords'),
      t('colFarmer'), t('colMobile'), t('colSaao'), t('colSaaoMobile'),
      t('colMo'), t('colMobile'), t('colComments')
    ]
    const rows = report.report.map(r => [r.sl, r.village, r.block, r.union, r.upazila, r.district, r.species, r.count, r.plantingDate, r.coordinates, r.farmerName, r.farmerMobile, r.saaoName, r.saaoMobile, r.moName, r.moMobile, r.comments])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ministry_report_17col.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{t('carbonMinistry')}</h2>
          <p className="text-sm text-muted-foreground">{t('reportSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'ministry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ministry')}
          >
            <Table className="w-4 h-4 mr-1" />
            {t('tabMinistry')}
          </Button>
          <Button
            variant={activeTab === 'ipcc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ipcc')}
          >
            {t('tabIpcc')}
          </Button>
          <Button
            variant={activeTab === 'verra' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('verra')}
          >
            {t('tabVerra')}
          </Button>
        </div>
      </div>

      {/* Ministry Report Tab - 17 Column */}
      {activeTab === 'ministry' && (
        <>
          {/* Ministry Report Header Banner */}
          <Card className="bg-gradient-to-r from-green-800 to-green-900 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold">
                {t('ministryBannerTitle')}
              </h3>
              <p className="text-xs text-green-200 mt-1">
                {t('ministryBannerSub')}
              </p>
              {report && (
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="bg-green-700/50 rounded px-2 py-1 text-xs">{t('total')}: {report.summary.totalSaplings} {t('saplings')}</span>
                  <span className="bg-green-700/50 rounded px-2 py-1 text-xs">{t('uniqueSpecies')}: {report.summary.uniqueSpecies}</span>
                  <span className="bg-green-700/50 rounded px-2 py-1 text-xs">{t('upazilasCovered')}: {report.summary.uniqueUpazilas}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {report && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-green-600">{t('totalEntries')}</p>
                  <p className="text-2xl font-bold text-green-800">{report.summary.totalEntries}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-emerald-600">{t('totalSaplingsCard')}</p>
                  <p className="text-2xl font-bold text-emerald-800">{report.summary.totalSaplings.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-sky-600">{t('uniqueSpecies')}</p>
                  <p className="text-2xl font-bold text-sky-800">{report.summary.uniqueSpecies}</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-amber-600">{t('upazilasCovered')}</p>
                  <p className="text-2xl font-bold text-amber-800">{report.summary.uniqueUpazilas}</p>
                </CardContent>
              </Card>
              <Card className="border-violet-200 bg-violet-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-violet-600">{t('report17ColCard')}</p>
                  <p className="text-2xl font-bold text-violet-800">{report.summary.report17ColCount || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-rose-200 bg-rose-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-rose-600">{t('ministryReportCard')}</p>
                  <p className="text-2xl font-bold text-rose-800">{report.summary.ministryReportCount || 0}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 17 Column Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  {t('ministry17Title')}
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                  {t('exportCSV')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-green-800 text-white">
                      <th className="px-2 py-2.5 text-left font-medium">{t('colSl')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colVillage')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colBlock')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colUnion')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colUpazila')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colDistrict')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colSpecies')}</th>
                      <th className="px-2 py-2.5 text-right font-medium">{t('colCount')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colDate')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colCoords')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colFarmer')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colMobile')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colSaao')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colSaaoMobile')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colMo')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colMobile')}</th>
                      <th className="px-2 py-2.5 text-left font-medium">{t('colComments')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report?.report.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-2 text-center font-medium">{row.sl}</td>
                        <td className="px-2 py-2">{row.village}</td>
                        <td className="px-2 py-2">{row.block}</td>
                        <td className="px-2 py-2">{row.union}</td>
                        <td className="px-2 py-2 font-medium">{row.upazila}</td>
                        <td className="px-2 py-2">{row.district}</td>
                        <td className="px-2 py-2 font-medium">{row.species}</td>
                        <td className="px-2 py-2 text-right font-bold text-green-700">{row.count}</td>
                        <td className="px-2 py-2">{row.plantingDate}</td>
                        <td className="px-2 py-2 font-mono text-[10px]">{row.coordinates}</td>
                        <td className="px-2 py-2">{row.farmerName}</td>
                        <td className="px-2 py-2">{row.farmerMobile}</td>
                        <td className="px-2 py-2">{row.saaoName}</td>
                        <td className="px-2 py-2">{row.saaoMobile}</td>
                        <td className="px-2 py-2">{row.moName}</td>
                        <td className="px-2 py-2">{row.moMobile}</td>
                        <td className="px-2 py-2">{row.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                  {report && (
                    <tfoot>
                      <tr className="bg-green-100 font-bold">
                        <td className="px-2 py-2 text-center" colSpan={7}>{t('total')}</td>
                        <td className="px-2 py-2 text-right text-green-800">{report.summary.totalSaplings}</td>
                        <td colSpan={9}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Upazila Bar Chart */}
          {report && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t('upazilaSaplings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(report.summary.upazilaBreakdown).map(([name, count]) => ({ name, count }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" name={t('saplingsLabel')} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* IPCC Tab */}
      {activeTab === 'ipcc' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-lg shrink-0">
                    <Leaf className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">{t('totalVerified')}</p>
                    <p className="text-2xl font-bold text-emerald-800">{(totalVerified / 1000).toFixed(0)}K tCO2e</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-sky-200 bg-sky-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-100 rounded-lg shrink-0">
                    <Calculator className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sky-600">{t('projected2028')}</p>
                    <p className="text-2xl font-bold text-sky-800">{(totalProjected / 1000).toFixed(0)}K tCO2e</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-fuchsia-200 bg-fuchsia-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-fuchsia-100 rounded-lg shrink-0">
                    <FileText className="w-6 h-6 text-fuchsia-600" />
                  </div>
                  <div>
                    <p className="text-sm text-fuchsia-600">{t('totalArea')}</p>
                    <p className="text-2xl font-bold text-fuchsia-800">{totalArea.toLocaleString()} ha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg shrink-0">
                    <CheckCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">{t('avgDensity')}</p>
                    <p className="text-2xl font-bold text-amber-800">{avgDensity} t/ha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t('ipccCarbonByUpazila')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carbonByDistrict} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="verified" fill="#059669" name={t('ipccVerified')} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="projected" fill="#6366f1" name={t('ipccProjected')} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t('biomassComponents')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="agb" stroke="#059669" strokeWidth={2} name={t('aboveground')} />
                    <Line type="monotone" dataKey="bgb" stroke="#7c3aed" strokeWidth={2} name={t('belowground')} />
                    <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" name={t('totalBiomass')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t('ipccTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: t('carbonFraction'), value: '0.47', detail: t('carbonFractionDetail') },
                  { label: t('rootToShoot'), value: '0.25', detail: t('rootToShootDetail') },
                  { label: t('woodDensity'), value: '0.55 t/m\u00B3', detail: t('woodDensityDetail') },
                  { label: t('biomassExpansion'), value: '1.74', detail: t('biomassExpansionDetail') },
                  { label: t('uncertainty'), value: '+/-12.5%', detail: t('uncertaintyDetail') },
                  { label: t('reportingPeriod'), value: '2024-2028', detail: t('reportingPeriodDetail') },
                ].map((item) => (
                  <Card key={item.label} className="bg-white">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xl font-bold text-green-700 mt-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Verra VM0047 Tab */}
      {activeTab === 'verra' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-lg shrink-0">
                    <Leaf className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600">{t('totalVerified')}</p>
                    <p className="text-2xl font-bold text-emerald-800">{(totalVerified / 1000).toFixed(0)}K tCO2e</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-sky-200 bg-sky-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-100 rounded-lg shrink-0">
                    <Calculator className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sky-600">{t('projected2028')}</p>
                    <p className="text-2xl font-bold text-sky-800">{(totalProjected / 1000).toFixed(0)}K tCO2e</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-fuchsia-200 bg-fuchsia-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-fuchsia-100 rounded-lg shrink-0">
                    <FileText className="w-6 h-6 text-fuchsia-600" />
                  </div>
                  <div>
                    <p className="text-sm text-fuchsia-600">{t('totalArea')}</p>
                    <p className="text-2xl font-bold text-fuchsia-800">{totalArea.toLocaleString()} ha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg shrink-0">
                    <CheckCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600">{t('avgDensity')}</p>
                    <p className="text-2xl font-bold text-amber-800">{avgDensity} t/ha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t('verraCompliance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {verraItems.map((item) => (
                  <Card key={item.label} className="bg-white">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.status === 'complete' ? 'bg-green-500' : item.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                      <p className="text-xs mt-1 font-medium" style={{
                        color: item.status === 'complete' ? '#059669' : item.status === 'in_progress' ? '#eab308' : '#888'
                      }}>
                        {verraStatusLabel(item.status)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t('ipccCarbonByUpazila')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carbonByDistrict} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="verified" fill="#059669" name={t('ipccVerified')} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="projected" fill="#6366f1" name={t('ipccProjected')} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t('biomassComponents')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="agb" stroke="#059669" strokeWidth={2} name={t('aboveground')} />
                    <Line type="monotone" dataKey="bgb" stroke="#7c3aed" strokeWidth={2} name={t('belowground')} />
                    <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" name={t('totalBiomass')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t('exportIpccReport')}
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              {t('generatePDD')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}