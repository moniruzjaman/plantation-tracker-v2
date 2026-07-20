'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { TrendingUp, TreePine, AlertTriangle, Leaf, MapPin, Activity, Users, Sprout, FileText, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLang } from '@/lib/i18n'

export default function DashboardPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('6m')
  const { t, lang } = useLang()

  useEffect(() => {
    fetch('/api/app-entries')
      .then(r => r.json())
      .then(data => setEntries(data))
      .catch(() => {})
  }, [])

  const totalSaplings = entries.reduce((s: number, e: any) => s + (e.count || 0), 0)
  const uniqueSpecies = new Set(entries.filter((e: any) => e.species).map((e: any) => e.species)).size
  const uniqueUpazilas = new Set(entries.filter((e: any) => e.upazila).map((e: any) => e.upazila)).size
  const uniqueFarmers = new Set(entries.filter((e: any) => e.farmerName).map((e: any) => e.farmerName)).size

  const speciesMap: Record<string, number> = {}
  entries.forEach((e: any) => {
    if (e.species) speciesMap[e.species] = (speciesMap[e.species] || 0) + e.count
  })
  const speciesPie = Object.entries(speciesMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
  const PIE_COLORS = ['#059669', '#0891b2', '#7c3aed', '#ea580c', '#eab308', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#8b5cf6']

  const districtMap: Record<string, number> = {}
  entries.forEach((e: any) => {
    if (e.district) districtMap[e.district] = (districtMap[e.district] || 0) + e.count
  })
  const districtBar = Object.entries(districtMap)
    .sort((a, b) => b[1] - a[1])
    .map(([district, count]) => ({ district, count }))

  const monthKeys = ['monthJan', 'monthFeb', 'monthMar', 'monthApr', 'monthMay', 'monthJun']
  const ndviTrend = [
    { month: t(monthKeys[0]), healthy: 0.35, stressed: 0.22, alert: 0.12 },
    { month: t(monthKeys[1]), healthy: 0.38, stressed: 0.24, alert: 0.14 },
    { month: t(monthKeys[2]), healthy: 0.42, stressed: 0.26, alert: 0.18 },
    { month: t(monthKeys[3]), healthy: 0.46, stressed: 0.28, alert: 0.22 },
    { month: t(monthKeys[4]), healthy: 0.50, stressed: 0.25, alert: 0.18 },
    { month: t(monthKeys[5]), healthy: 0.53, stressed: 0.22, alert: 0.14 },
  ]

  const carbonData = [
    { year: '2022', sequestered: 4500, projected: 4500 },
    { year: '2023', sequestered: 12000, projected: 11000 },
    { year: '2024', sequestered: 28000, projected: 25000 },
    { year: '2025', sequestered: 52000, projected: 48000 },
    { year: '2026', sequestered: 89000, projected: 82000 },
    { year: '2027', sequestered: 0, projected: 135000 },
  ]

  const stats = [
    { label: t('statTotalSaplings'), value: totalSaplings.toLocaleString(), icon: TreePine, change: `${uniqueSpecies} ${t('species')}`, color: 'bg-green-50 text-green-700' },
    { label: t('statUpazilas'), value: uniqueUpazilas.toString(), icon: MapPin, change: lang === 'bn' ? 'কুড়িগ্রাম জেলা' : 'Kurigram District', color: 'bg-blue-50 text-blue-700' },
    { label: t('statFarmers'), value: uniqueFarmers.toString(), icon: Users, change: t('fieldVerified'), color: 'bg-purple-50 text-purple-700' },
    { label: t('statSites'), value: entries.length.toString(), icon: Sprout, change: t('gpsTracked'), color: 'bg-emerald-50 text-emerald-700' },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-800 to-green-900 text-white border-0 shadow-lg">
        <CardContent className="p-5">
          <h2 className="text-lg font-bold">{t('dashBannerTitle')}</h2>
          <p className="text-sm text-green-200 mt-1">{t('dashBannerSub')}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="bg-green-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-green-300">{t('totalSaplingsCard')}</p>
              <p className="text-xl font-bold">{totalSaplings.toLocaleString()}</p>
            </div>
            <div className="bg-green-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-green-300">{t('uniqueSpecies')}</p>
              <p className="text-xl font-bold">{uniqueSpecies}</p>
            </div>
            <div className="bg-green-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-green-300">{t('upazilas')}</p>
              <p className="text-xl font-bold">{uniqueUpazilas}</p>
            </div>
            <div className="bg-green-700/50 rounded-lg px-3 py-2">
              <p className="text-xs text-green-300">{t('statFarmers')}</p>
              <p className="text-xl font-bold">{uniqueFarmers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {t('chartByDistrict')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={districtBar} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="district" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" name={t('saplingsLabel')} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              {t('chartSpeciesDist')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={speciesPie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {speciesPie.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                {t('chartNdviTrend')}
              </CardTitle>
              <div className="flex gap-1">
                {(['1m', '3m', '6m', '1y'] as const).map((r) => {
                  const labelMap: Record<string, string> = { '1m': t('range1m'), '3m': t('range3m'), '6m': t('range6m'), '1y': t('range1y') }
                  return (
                    <button key={r} onClick={() => setTimeRange(r)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        timeRange === r ? 'bg-green-100 text-green-700 font-medium' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >{labelMap[r]}</button>
                  )
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ndviTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 0.8]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} name={t('ndviHealthy')} />
                <Line type="monotone" dataKey="stressed" stroke="#eab308" strokeWidth={2} name={t('ndviStressed')} />
                <Line type="monotone" dataKey="alert" stroke="#ef4444" strokeWidth={2} name={t('ndviAlert')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              {t('chartCarbon')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Legend />
                <Area type="monotone" dataKey="sequestered" stackId="1" stroke="#059669" fill="#d1fae5" name={t('carbonVerified')} />
                <Area type="monotone" dataKey="projected" stackId="1" stroke="#6366f1" fill="#e0e7ff" strokeDasharray="5 5" name={t('carbonProjected')} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ministry Report Summary */}
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-600" />
            {t('ministryReportTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">{t('report17ColEntries')}</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{entries.length}</p>
              <p className="text-xs text-amber-600 mt-1">{t('weeklyEmailDae')}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-700 font-medium">{t('reportTotalSaplings')}</p>
              <p className="text-2xl font-bold text-green-800 mt-1">{totalSaplings.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">{uniqueUpazilas} {t('upazilas')}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">{t('reportEmails')}</p>
              <p className="text-xs text-blue-800 font-mono mt-2 leading-relaxed">
                admonitoring@dae.gov.bd<br/>
                ddimplement@dae.gov.bd
              </p>
              <p className="text-xs text-blue-600 mt-1">{t('weeklySubmission')}</p>
            </div>
          </div>
          <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium text-gray-700 mb-1">{t('reportFormat')}</p>
            <p>{t('reportFormatDesc')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Planting Entries */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t('recentEntries')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">{t('thSpecies')}</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">{t('thQty')}</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">{t('thUpazila')}</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">{t('thFarmer')}</th>
                  <th className="pb-2 font-medium text-muted-foreground">{t('thSaao')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(-8).reverse().map((e: any) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{e.species}</td>
                    <td className="py-2.5 pr-4">{e.count}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{e.upazila}</td>
                    <td className="py-2.5 pr-4">{e.farmerName}</td>
                    <td className="py-2.5 text-muted-foreground">{e.saaoName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}