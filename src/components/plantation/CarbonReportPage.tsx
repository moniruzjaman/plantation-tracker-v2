'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { Leaf, Download, Calculator, FileText, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const carbonByDistrict = [
  { district: 'Dhaka', verified: 125000, projected: 180000, area: 450 },
  { district: 'Sylhet', verified: 98000, projected: 145000, area: 380 },
  { district: 'Chittagong', verified: 156000, projected: 220000, area: 520 },
  { district: 'Rajshahi', verified: 45000, projected: 85000, area: 290 },
  { district: 'Khulna', verified: 72000, projected: 110000, area: 340 },
  { district: 'Barisal', verified: 58000, projected: 95000, area: 280 },
  { district: 'Rangpur', verified: 89000, projected: 135000, area: 410 },
]

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

export default function CarbonReportPage() {
  const [selectedStandard, setSelectedStandard] = useState<'ipcc' | 'verra'>('verra')

  const totalVerified = carbonByDistrict.reduce((s, d) => s + d.verified, 0)
  const totalProjected = carbonByDistrict.reduce((s, d) => s + d.projected, 0)
  const totalArea = carbonByDistrict.reduce((s, d) => s + d.area, 0)
  const avgDensity = (totalVerified / totalArea).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Carbon Accounting Report</h2>
          <p className="text-sm text-muted-foreground">IPCC Tier 2 / Verra VM0047 Compliant</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedStandard === 'ipcc' ? 'default' : 'outline'}
            onClick={() => setSelectedStandard('ipcc')}
          >
            IPCC Tier 2
          </Button>
          <Button
            variant={selectedStandard === 'verra' ? 'default' : 'outline'}
            onClick={() => setSelectedStandard('verra')}
          >
            Verra VM0047
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg shrink-0">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-600">Total Verified</p>
                <p className="text-2xl font-bold text-emerald-800">{(totalVerified / 1000).toFixed(0)}K tCO₂e</p>
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
                <p className="text-2xl font-bold text-sky-800">{(totalProjected / 1000).toFixed(0)}K tCO₂e</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Carbon by District (tCO₂e)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={carbonByDistrict} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}K`} />
                <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
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

      {/* VM0047 Compliance Panel */}
      {selectedStandard === 'verra' && (
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
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.status === 'complete'
                            ? 'bg-green-500'
                            : item.status === 'in_progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-300'
                        }`}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IPCC Panel */}
      {selectedStandard === 'ipcc' && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">IPCC 2006 Tier 2 Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Carbon Fraction', value: '0.47', detail: 'Default IPCC 2006 for tropical hardwood' },
                { label: 'Root-to-Shoot Ratio', value: '0.25', detail: 'IPCC Table 4.4 for tropical zones' },
                { label: 'Wood Density', value: '0.55 t/m³', detail: 'Bangladesh species average' },
                { label: 'Biomass Expansion Factor', value: '1.74', detail: 'Above-ground BEF for plantations' },
                { label: 'Uncertainty', value: '±12.5%', detail: 'Combined measurement + model' },
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
      )}

      {/* Export Actions */}
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
    </div>
  )
}