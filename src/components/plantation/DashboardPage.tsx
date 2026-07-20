'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TreePine, AlertTriangle, Leaf, MapPin, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ndviTrend = [
  { month: 'Jan', healthy: 0.45, stressed: 0.28, alert: 0.15 },
  { month: 'Feb', healthy: 0.48, stressed: 0.30, alert: 0.18 },
  { month: 'Mar', healthy: 0.52, stressed: 0.32, alert: 0.22 },
  { month: 'Apr', healthy: 0.55, stressed: 0.35, alert: 0.25 },
  { month: 'May', healthy: 0.58, stressed: 0.33, alert: 0.20 },
  { month: 'Jun', healthy: 0.61, stressed: 0.30, alert: 0.15 },
]

const carbonData = [
  { year: '2022', sequestered: 45000, projected: 45000 },
  { year: '2023', sequestered: 120000, projected: 110000 },
  { year: '2024', sequestered: 280000, projected: 250000 },
  { year: '2025', sequestered: 520000, projected: 480000 },
  { year: '2026', sequestered: 890000, projected: 820000 },
  { year: '2027', sequestered: 0, projected: 1350000 },
  { year: '2028', sequestered: 0, projected: 2100000 },
]

const statusData = [
  { name: 'Healthy', value: 62, color: '#22c55e' },
  { name: 'Stressed', value: 28, color: '#eab308' },
  { name: 'Mortality Alert', value: 10, color: '#ef4444' },
]

const stats = [
  { label: 'Total Plantations', value: '1,247', icon: MapPin, change: '+12%', color: 'bg-blue-50 text-blue-700' },
  { label: 'Trees Monitored', value: '25.4M', icon: TreePine, change: '+8.5%', color: 'bg-green-50 text-green-700' },
  { label: 'Active Alerts', value: '23', icon: AlertTriangle, change: '-5%', color: 'bg-red-50 text-red-700' },
  { label: 'Carbon Stored', value: '890K tCO₂e', icon: Leaf, change: '+15%', color: 'bg-emerald-50 text-emerald-700' },
]

const recentAlerts = [
  { site: 'Rajshahi Dry Zone', ndvi: 0.15, change: '-0.18', date: '2 days ago', severity: 'critical' },
  { site: 'Sylhet Tea Garden Buffer', ndvi: 0.28, change: '-0.08', date: '5 days ago', severity: 'warning' },
  { site: 'Khulna Sundarbans Edge', ndvi: 0.22, change: '-0.12', date: '1 week ago', severity: 'warning' },
  { site: 'Barisal Coastal Belt', ndvi: 0.35, change: '-0.05', date: '2 weeks ago', severity: 'info' },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('6m')

  return (
    <div className="space-y-6">
      {/* Stats Row */}
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
                <div className="mt-3 flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NDVI Trend */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                NDVI Time Series
              </CardTitle>
              <div className="flex gap-1">
                {['1m', '3m', '6m', '1y'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                      timeRange === r ? 'bg-green-100 text-green-700 font-medium' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ndviTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 0.8]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} name="Healthy" />
                <Line type="monotone" dataKey="stressed" stroke="#eab308" strokeWidth={2} name="Stressed" />
                <Line type="monotone" dataKey="alert" stroke="#ef4444" strokeWidth={2} name="Mortality Alert" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Carbon Sequestration */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Carbon Sequestration (tCO₂e)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Legend />
                <Area type="monotone" dataKey="sequestered" stackId="1" stroke="#059669" fill="#d1fae5" name="Verified" />
                <Area type="monotone" dataKey="projected" stackId="1" stroke="#6366f1" fill="#e0e7ff" strokeDasharray="5 5" name="Projected" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Plantation Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent Mortality Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.site} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        alert.severity === 'critical'
                          ? 'bg-red-500 animate-pulse'
                          : alert.severity === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{alert.site}</p>
                      <p className="text-xs text-muted-foreground">
                        NDVI: {alert.ndvi} ({alert.change} in 30d)
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-muted-foreground">{alert.date}</p>
                    <button className="text-xs text-green-600 hover:text-green-700 font-medium mt-1">
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}