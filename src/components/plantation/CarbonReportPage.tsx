'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { Leaf, Download, FileText, Table, CheckCircle, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
}

export default function CarbonReportPage() {
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

  const monthlyTrend = [
    { month: 'Jan', agb: 420, bgb: 105, total: 525 },
    { month: 'Feb', agb: 445, bgb: 111, total: 556 },
    { month: 'Mar', agb: 480, bgb: 120, total: 600 },
    { month: 'Apr', agb: 520, bgb: 130, total: 650 },
    { month: 'May', agb: 565, bgb: 141, total: 706 },
    { month: 'Jun', agb: 610, bgb: 152, total: 762 },
  ]

  const verraItems = [
    { label: 'Project Description', status: 'complete', detail: 'PDD drafted' },
    { label: 'Baseline Scenario', status: 'complete', detail: 'Dynamic benchmark set' },
    { label: 'Monitoring Plan', status: 'in_progress', detail: 'Satellite pipeline active' },
    { label: 'Leakage Assessment', status: 'pending', detail: 'VMD0054 required' },
    { label: 'Permanence Buffer', status: 'pending', detail: '20% reserve calc' },
    { label: 'VVB Engagement', status: 'pending', detail: 'Auditor selection' },
  ]

  const totalVerified = carbonByDistrict.reduce((s, d) => s + d.verified, 0)
  const totalProjected = carbonByDistrict.reduce((s, d) => s + d.projected, 0)
  const totalArea = carbonByDistrict.reduce((s, d) => s + d.area, 0)
  const avgDensity = totalArea > 0 ? (totalVerified / totalArea).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Carbon & Ministry Report</h2>
          <p className="text-sm text-muted-foreground">IPCC Tier 2 / Verra VM0047 / 17-Column Ministry Format</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'ministry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ministry')}
          >
            <Table className="w-4 h-4 mr-1" />
            Ministry Report
          </Button>
          <Button
            variant={activeTab === 'ipcc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ipcc')}
          >
            IPCC Tier 2
          </Button>
          <Button
            variant={activeTab === 'verra' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('verra')}
          >
            Verra VM0047
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
                17. 05 বছরে 25 কোটি বৃক্ষরোপণ কর্মসূচির আওতায় রোপণকৃত চারার তথ্য
              </h3>
              <p className="text-xs text-green-200 mt-1">
                মন্ত্রণালয়/বিভাগ/অধিদপ্তর/দপ্তরের নাম: .................................... মাসের নাম: ....................................
              </p>
              {report && (
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="bg-green-700/50 rounded px-2 py-1 text-xs">Total: {report.summary.totalSaplings} saplings</span>
                  <span className="bg-green-700/50 rounded px-2 py-1 text-xs">Species: {report.summary.uniqueSpecies}</span>
                  <span className="bg-green-700/50 rounded px-2 py-1 text-xs">Upazilas: {report.summary.uniqueUpazilas}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {report && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-green-600">Total Entries</p>
                  <p className="text-2xl font-bold text-green-800">{report.summary.totalEntries}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-emerald-600">Total Saplings</p>
                  <p className="text-2xl font-bold text-emerald-800">{report.summary.totalSaplings.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-sky-600">Unique Species</p>
                  <p className="text-2xl font-bold text-sky-800">{report.summary.uniqueSpecies}</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <p className="text-xs text-amber-600">Upazilas Covered</p>
                  <p className="text-2xl font-bold text-amber-800">{report.summary.uniqueUpazilas}</p>
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
                  17-Column Ministry Report (রোপণকৃত চারার তথ্য)
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                  if (report) {
                    const headers = ['ক্র.নং', 'গ্রাম', 'ব্লক', 'ইউনিয়ন', 'উপজেলা', 'জেলা', 'প্রজাতি', 'সংখ্যা', 'তারিখ', 'জিও-কোঅর্ডিনেট', 'পরিচর্যাকারী', 'মোবাইল', 'SAAO', 'SAAO মোবাইল', 'মনিটরিং অফিসার', 'মোবাইল', 'মন্তব্য']
                    const rows = report.report.map(r => [r.sl, r.village, r.block, r.union, r.upazila, r.district, r.species, r.count, r.plantingDate, r.coordinates, r.farmerName, r.farmerMobile, r.saaoName, r.saaoMobile, r.moName, r.moMobile, r.comments])
                    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
                    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'ministry_report_17col.csv'
                    a.click()
                  }
                }}>
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-green-800 text-white">
                      <th className="px-2 py-2.5 text-left font-medium">ক্র.নং</th>
                      <th className="px-2 py-2.5 text-left font-medium">গ্রাম</th>
                      <th className="px-2 py-2.5 text-left font-medium">ব্লক</th>
                      <th className="px-2 py-2.5 text-left font-medium">ইউনিয়ন</th>
                      <th className="px-2 py-2.5 text-left font-medium">উপজেলা</th>
                      <th className="px-2 py-2.5 text-left font-medium">জেলা</th>
                      <th className="px-2 py-2.5 text-left font-medium">প্রজাতি</th>
                      <th className="px-2 py-2.5 text-right font-medium">সংখ্যা</th>
                      <th className="px-2 py-2.5 text-left font-medium">তারিখ</th>
                      <th className="px-2 py-2.5 text-left font-medium">জিও-কোঅর্ডিনেট</th>
                      <th className="px-2 py-2.5 text-left font-medium">পরিচর্যাকারী</th>
                      <th className="px-2 py-2.5 text-left font-medium">মোবাইল</th>
                      <th className="px-2 py-2.5 text-left font-medium">SAAO</th>
                      <th className="px-2 py-2.5 text-left font-medium">SAAO মোবাইল</th>
                      <th className="px-2 py-2.5 text-left font-medium">মনিটরিং অফিসার</th>
                      <th className="px-2 py-2.5 text-left font-medium">মোবাইল</th>
                      <th className="px-2 py-2.5 text-left font-medium">মন্তব্য</th>
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
                        <td className="px-2 py-2 text-center" colSpan={7}>মোট (Total)</td>
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
                <CardTitle className="text-base font-semibold">Saplings by Upazila</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(report.summary.upazilaBreakdown).map(([name, count]) => ({ name, count }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" name="Saplings" radius={[0, 4, 4, 0]} />
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
                    <p className="text-sm text-emerald-600">Total Verified</p>
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
                    <p className="text-sm text-sky-600">Projected 2028</p>
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
                    <p className="text-sm text-fuchsia-600">Total Area</p>
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
                    <p className="text-sm text-amber-600">Avg Density</p>
                    <p className="text-2xl font-bold text-amber-800">{avgDensity} t/ha</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Carbon by Upazila (tCO2e)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carbonByDistrict} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="verified" fill="#059669" name="Verified" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="projected" fill="#6366f1" name="Projected" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Biomass Components (tC/ha)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="agb" stroke="#059669" strokeWidth={2} name="Aboveground" />
                    <Line type="monotone" dataKey="bgb" stroke="#7c3aed" strokeWidth={2} name="Belowground" />
                    <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" name="Total Biomass" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">IPCC 2006 Tier 2 Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Carbon Fraction', value: '0.47', detail: 'Default IPCC 2006 for tropical hardwood' },
                  { label: 'Root-to-Shoot Ratio', value: '0.25', detail: 'IPCC Table 4.4 for tropical zones' },
                  { label: 'Wood Density', value: '0.55 t/m3', detail: 'Bangladesh species average' },
                  { label: 'Biomass Expansion Factor', value: '1.74', detail: 'Above-ground BEF for plantations' },
                  { label: 'Uncertainty', value: '+/-12.5%', detail: 'Combined measurement + model' },
                  { label: 'Reporting Period', value: '2024-2028', detail: '5-year verification cycle' },
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
                    <p className="text-sm text-emerald-600">Total Verified</p>
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
                    <p className="text-sm text-sky-600">Projected 2028</p>
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
                    <p className="text-sm text-fuchsia-600">Total Area</p>
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
                    <p className="text-sm text-amber-600">Avg Density</p>
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
                Verra VM0047 v1.1 Compliance Status
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Carbon by Upazila (tCO2e)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carbonByDistrict} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="verified" fill="#059669" name="Verified" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="projected" fill="#6366f1" name="Projected" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Biomass Components (tC/ha)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="agb" stroke="#059669" strokeWidth={2} name="Aboveground" />
                    <Line type="monotone" dataKey="bgb" stroke="#7c3aed" strokeWidth={2} name="Belowground" />
                    <Line type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" name="Total Biomass" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export IPCC Report
            </Button>
            <Button className="gap-2">
              <FileText className="w-4 h-4" />
              Generate VM0047 PDD
            </Button>
          </div>
        </>
      )}
    </div>
  )
}