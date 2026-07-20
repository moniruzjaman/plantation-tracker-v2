'use client'

import { useState } from 'react'
import { AlertTriangle, MapPin, Calendar, Filter, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Alert {
  id: number
  plantation: string
  district: string
  ndviCurrent: number
  ndviBaseline: number
  drop: number
  detected: string
  status: 'open' | 'investigating' | 'resolved'
  priority: 'critical' | 'high' | 'medium'
  areaAffected: number
  estimatedLoss: number
}

const alerts: Alert[] = [
  { id: 1, plantation: 'Rajshahi Dry Zone', district: 'Rajshahi', ndviCurrent: 0.15, ndviBaseline: 0.33, drop: 0.18, detected: '2026-06-18', status: 'open', priority: 'critical', areaAffected: 45, estimatedLoss: 3200 },
  { id: 2, plantation: 'Sylhet Tea Garden Buffer', district: 'Sylhet', ndviCurrent: 0.28, ndviBaseline: 0.36, drop: 0.08, detected: '2026-06-15', status: 'investigating', priority: 'high', areaAffected: 120, estimatedLoss: 5400 },
  { id: 3, plantation: 'Khulna Sundarbans Edge', district: 'Khulna', ndviCurrent: 0.22, ndviBaseline: 0.34, drop: 0.12, detected: '2026-06-12', status: 'open', priority: 'high', areaAffected: 78, estimatedLoss: 4100 },
  { id: 4, plantation: 'Barisal Coastal Belt', district: 'Barisal', ndviCurrent: 0.35, ndviBaseline: 0.40, drop: 0.05, detected: '2026-06-10', status: 'investigating', priority: 'medium', areaAffected: 200, estimatedLoss: 2800 },
  { id: 5, plantation: 'Rangpur Northern Belt', district: 'Rangpur', ndviCurrent: 0.19, ndviBaseline: 0.31, drop: 0.12, detected: '2026-06-08', status: 'resolved', priority: 'high', areaAffected: 65, estimatedLoss: 3600 },
  { id: 6, plantation: 'Mymensingh Agroforestry', district: 'Mymensingh', ndviCurrent: 0.31, ndviBaseline: 0.42, drop: 0.11, detected: '2026-06-05', status: 'open', priority: 'high', areaAffected: 92, estimatedLoss: 4800 },
  { id: 7, plantation: 'Dhaka Peri-Urban Green', district: 'Dhaka', ndviCurrent: 0.38, ndviBaseline: 0.44, drop: 0.06, detected: '2026-06-02', status: 'investigating', priority: 'medium', areaAffected: 35, estimatedLoss: 1200 },
  { id: 8, plantation: 'Cox Bazar Mangrove', district: 'Chittagong', ndviCurrent: 0.12, ndviBaseline: 0.29, drop: 0.17, detected: '2026-05-28', status: 'open', priority: 'critical', areaAffected: 150, estimatedLoss: 7200 },
]

const priorityFilters = ['all', 'critical', 'high', 'medium'] as const
const statusFilters = ['all', 'open', 'investigating', 'resolved'] as const

export default function MortalityAlertsPage() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all')

  const filtered = alerts.filter(
    (a) => (filter === 'all' || a.priority === filter) && (statusFilter === 'all' || a.status === statusFilter)
  )
  const totalLoss = filtered.reduce((sum, a) => sum + a.estimatedLoss, 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 font-medium">Critical Alerts</p>
            <p className="text-2xl font-bold text-red-700">{alerts.filter((a) => a.priority === 'critical').length}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 font-medium">High Priority</p>
            <p className="text-2xl font-bold text-orange-700">{alerts.filter((a) => a.priority === 'high').length}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 font-medium">Open Cases</p>
            <p className="text-2xl font-bold text-yellow-700">{alerts.filter((a) => a.status === 'open').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground font-medium">Est. Carbon Loss</p>
            <p className="text-2xl font-bold">{totalLoss.toLocaleString()} tCO₂e</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Priority:</span>
          {priorityFilters.map((p) => (
            <Button
              key={p}
              variant={filter === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(p)}
              className="capitalize text-xs h-8"
            >
              {p}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {statusFilters.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize text-xs h-8"
            >
              {s}
            </Button>
          ))}
          <Button size="sm" className="gap-1.5 ml-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Alerts Table */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Alert ID</TableHead>
                <TableHead className="text-left">Plantation</TableHead>
                <TableHead className="text-left">NDVI Drop</TableHead>
                <TableHead className="text-left">Area (ha)</TableHead>
                <TableHead className="text-left">Est. Loss</TableHead>
                <TableHead className="text-left">Detected</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">#{alert.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{alert.plantation}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {alert.district}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          alert.drop > 0.15 ? 'bg-red-500' : alert.drop > 0.08 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                      />
                      <span
                        className={`font-mono font-medium ${
                          alert.drop > 0.15 ? 'text-red-600' : alert.drop > 0.08 ? 'text-orange-600' : 'text-yellow-600'
                        }`}
                      >
                        -{alert.drop.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {alert.ndviCurrent} / {alert.ndviBaseline}
                    </p>
                  </TableCell>
                  <TableCell>{alert.areaAffected}</TableCell>
                  <TableCell>
                    <span className="text-red-600 font-medium">{alert.estimatedLoss.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground"> tCO₂e</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {alert.detected}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.status === 'open'
                          ? 'destructive'
                          : alert.status === 'investigating'
                          ? 'secondary'
                          : 'default'
                      }
                      className="capitalize text-xs"
                    >
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" size="sm" className="text-green-600 p-0 h-auto">
                      View &rarr;
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}