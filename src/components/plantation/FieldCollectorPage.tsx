'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TreePine, MapPin, Camera, Save, Plus, Droplets, Ruler, Thermometer, CloudRain,
  Upload, CheckCircle, Navigation, ClipboardList, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/i18n'
import { apiHeaders } from '@/lib/api-client'

interface FieldRecord {
  id: string
  siteName: string | null
  species: string | null
  dbh: number
  height: number
  gpsLat: number
  gpsLon: number
  notes: string | null
  status: string
  collectedAt: string
}

const emptyForm = {
  siteName: '',
  species: '',
  dbh: '',
  height: '',
  gpsLat: '',
  gpsLon: '',
  notes: '',
}

export default function FieldCollectorPage() {
  const { t } = useLang()
  const [records, setRecords] = useState<FieldRecord[]>([])
  const [formData, setFormData] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [geolocating, setGeolocating] = useState(false)

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/field-data')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRecords(await res.json())
      setError(null)
    } catch (e) {
      console.error('Failed to load field data', e)
      setError(t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGPS = () => {
    if (!('geolocation' in navigator)) {
      setError(t('gpsUnsupported'))
      return
    }
    setGeolocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          gpsLat: pos.coords.latitude.toFixed(6),
          gpsLon: pos.coords.longitude.toFixed(6),
        }))
        setGeolocating(false)
      },
      () => {
        setGeolocating(false)
        setError(t('gpsDenied'))
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handleSubmit = async () => {
    if (!formData.species.trim()) {
      setError(t('speciesRequired'))
      return
    }
    const lat = Number(formData.gpsLat)
    const lon = Number(formData.gpsLon)
    if (!lat || !lon) {
      setError(t('gpsRequired'))
      return
    }
    if (formData.dbh && Number(formData.dbh) < 0) {
      setError(t('invalidDbh'))
      return
    }
    if (formData.height && Number(formData.height) < 0) {
      setError(t('invalidHeight'))
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/field-data', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          siteName: formData.siteName.trim() || null,
          species: formData.species.trim(),
          dbh: formData.dbh ? Number(formData.dbh) : 0,
          height: formData.height ? Number(formData.height) : 0,
          gpsLat: lat,
          gpsLon: lon,
          notes: formData.notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || `HTTP ${res.status}`)
      }
      setFormData({ ...emptyForm })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
      await loadRecords()
    } catch (e) {
      console.error('Failed to save measurement', e)
      setError(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const syncedCount = records.filter((r) => r.status === 'synced').length
  const pendingCount = records.filter((r) => r.status !== 'synced').length

  const statusLabel = (status: string) => (status === 'synced' ? t('synced') : t('pending'))

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          {t('saved')}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{records.length}</p>
              <p className="text-sm text-muted-foreground">{t('collectionsToday')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{syncedCount}</p>
              <p className="text-sm text-muted-foreground">{t('syncedServer')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-sky-50/50 border-sky-200">
          <CardContent className="p-4 flex items-center gap-3">
            <TreePine className="w-8 h-8 text-sky-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{records.length.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('treesRecorded')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Upload className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">{t('pendingUpload')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Data Collection Form */}
        <Card className="shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              {t('newMeasurement')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">{t('siteName')}</Label>
                <Input id="siteName" name="siteName" placeholder={t('siteNamePlaceholder')} value={formData.siteName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">{t('speciesLabel')}</Label>
                <Input id="species" name="species" placeholder={t('speciesPlaceholder')} value={formData.species} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbh" className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" /> {t('dbh')}
                </Label>
                <Input id="dbh" name="dbh" type="number" placeholder="25.5" value={formData.dbh} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-1">
                  <TreePine className="w-3.5 h-3.5" /> {t('height')}
                </Label>
                <Input id="height" name="height" type="number" placeholder="12.0" value={formData.height} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpsLat" className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" /> {t('latitude')}
                </Label>
                <div className="flex gap-1">
                  <Input id="gpsLat" name="gpsLat" placeholder="23.8103" value={formData.gpsLat} onChange={handleChange} />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={handleGPS}
                    disabled={geolocating}
                    title={t('getGps')}
                  >
                    {geolocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpsLon" className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {t('longitude')}
                </Label>
                <Input id="gpsLon" name="gpsLon" placeholder="90.4125" value={formData.gpsLon} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> {t('soilMoisture')}
                </Label>
                <Input placeholder={t('soilMoisturePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" /> {t('temperature')}
                </Label>
                <Input placeholder={t('temperaturePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5" /> {t('rainfall')}
                </Label>
                <Input placeholder={t('rainfallPlaceholder')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('fieldNotes')}</Label>
              <Textarea id="notes" name="notes" placeholder={t('fieldNotesPlaceholder')} rows={3} value={formData.notes} onChange={handleChange} />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t('saveMeasurement')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                {t('attachPhoto')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Collections */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('recentCollections')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && records.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('loadingCollections')}</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {records.length === 0 && (
                  <p className="text-sm text-muted-foreground py-10 text-center">{t('noCollections')}</p>
                )}
                {records.map((r) => (
                  <div key={r.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.species || r.siteName || '-'}</p>
                      <Badge
                        variant={r.status === 'synced' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {statusLabel(r.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                      {r.siteName && <span>{r.siteName}</span>}
                      <span>{r.dbh} cm</span>
                      <span>{r.height} m</span>
                      <span>{r.collectedAt.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
