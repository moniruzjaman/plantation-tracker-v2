'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, MapPin, Calendar, Filter, Download, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useLang } from '@/lib/i18n'
import { apiHeaders } from '@/lib/api-client'

interface Alert {
  id: string
  ndviCurrent: number
  ndviBaseline: number
  ndviDrop: number
  priority: 'critical' | 'high' | 'medium'
  status: 'open' | 'investigating' | 'resolved'
  areaAffected: number
  estimatedLoss: number
  detectedAt: string
  plantation: { name: string; district: string }
}

const priorityFilters = ['all', 'critical', 'high', 'medium'] as const
const statusFilters = ['all', 'open', 'investigating', 'resolved'] as const

export default function MortalityAlertsPage() {
  const { t } = useLang()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all')

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/alerts')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAlerts(data)
      setError(null)
    } catch (e) {
      console.error('Failed to load alerts', e)
      setError(t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const filtered = alerts.filter(
    (a) => (filter === 'all' || a.priority === filter) && (statusFilter === 'all' || a.status === statusFilter)
  )
  const totalLoss = filtered.reduce((sum, a) => sum + a.estimatedLoss, 0)

  const handleResolve = async (alert: Alert) => {
    setResolvingId(alert.id)
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: apiHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadAlerts()
    } catch (e) {
      console.error('Failed to resolve alert', e)
      setError(t('resolveFailed'))
    } finally {
      setResolvingId(null)
    }
  }

  const handleExportCSV = () => {
    const rows = filtered.map((a) => [
      a.id,
      a.plantation.name,
      a.plantation.district,
      a.ndviCurrent,
      a.ndviBaseline,
      a.ndviDrop,
      a.areaAffected,
      a.estimatedLoss,
      a.detectedAt,
      a.status,
      a.priority,
    ])
    const csv = [['id', 'plantation', 'district', 'ndviCurrent', 'ndviBaseline', 'ndviDrop', 'areaAffected', 'estimatedLoss', 'detectedAt', 'status', 'priority'], ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mortality_alerts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const priorityLabel: Record<string, string> = {
    all: t('filterPriorityAll'),
    critical: t('filterPriorityCritical'),
    high: t('filterPriorityHigh'),
    medium: t('filterPriorityMedium'),
  }

  const statusLabel: Record<string, string> = {
    all: t('filterPriorityAll'),
    open: t('statusOpen'),
    investigating: t('statusInvestigating'),
    resolved: t('statusResolved'),
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{t('loadingAlerts')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 font-medium">{t('criticalAlerts')}</p>
            <p className="text-2xl font-bold text-red-700">{alerts.filter((a) => a.priority === 'critical').length}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 font-medium">{t('highPriority')}</p>
            <p className="text-2xl font-bold text-orange-700">{alerts.filter((a) => a.priority === 'high').length}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 font-medium">{t('openCases')}</p>
            <p className="text-2xl font-bold text-yellow-700">{alerts.filter((a) => a.status === 'open').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground font-medium">{t('estCarbonLoss')}</p>
            <p className="text-2xl font-bold">{totalLoss.toLocaleString()} tCO₂e</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('priorityLabel')}</span>
          {priorityFilters.map((p) => (
            <Button
              key={p}
              variant={filter === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(p)}
              className="text-xs h-8"
            >
              {priorityLabel[p]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('statusLabel')}</span>
          {statusFilters.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="text-xs h-8"
            >
              {statusLabel[s]}
            </Button>
          ))}
          <Button size="sm" className="gap-1.5 ml-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            {t('exportCsv')}
          </Button>
        </div>
      </div>

      {/* Alerts Table */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">{t('alertId')}</TableHead>
                <TableHead className="text-left">{t('plantation')}</TableHead>
                <TableHead className="text-left">{t('ndviDrop')}</TableHead>
                <TableHead className="text-left">{t('areaHa')}</TableHead>
                <TableHead className="text-left">{t('estLoss')}</TableHead>
                <TableHead className="text-left">{t('detected')}</TableHead>
                <TableHead className="text-left">{t('statusLabel').replace(':', '')}</TableHead>
                <TableHead className="text-left">{t('action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {t('noAlerts')}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">
                    #{alert.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{alert.plantation.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {alert.plantation.district}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          alert.ndviDrop > 0.15 ? 'bg-red-500' : alert.ndviDrop > 0.08 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                      />
                      <span
                        className={`font-mono font-medium ${
                          alert.ndviDrop > 0.15 ? 'text-red-600' : alert.ndviDrop > 0.08 ? 'text-orange-600' : 'text-yellow-600'
                        }`}
                      >
                        -{alert.ndviDrop.toFixed(2)}
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
                      <Calendar className="w-3 h-3" /> {alert.detectedAt.slice(0, 10)}
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
                      className="text-xs"
                    >
                      {statusLabel[alert.status] || alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {alert.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('statusResolved')}
                      </span>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-green-600 p-0 h-auto"
                        disabled={resolvingId === alert.id}
                        onClick={() => handleResolve(alert)}
                      >
                        {resolvingId === alert.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span className="ml-1">{t('markResolved')}</span>
                      </Button>
                    )}
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
