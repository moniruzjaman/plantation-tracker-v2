'use client'

import { useState } from 'react'
import {
  TreePine, MapPin, Camera, Save, Plus, Droplets, Ruler, Thermometer, CloudRain,
  Upload, CheckCircle, Navigation, ClipboardList,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/i18n'

const sampleCollections = [
  { id: 1, site: 'Dhaka North Block A', species: 'Akashmoni', trees: 450, date: '2026-06-18', status: 'synced' },
  { id: 2, site: 'Sylhet Buffer Zone', species: 'Teak', trees: 320, date: '2026-06-17', status: 'synced' },
  { id: 3, site: 'Rajshahi Plot 7', species: 'Eucalyptus', trees: 180, date: '2026-06-16', status: 'pending' },
  { id: 4, site: 'Chittagong Hill Section', species: 'Gamari', trees: 275, date: '2026-06-15', status: 'synced' },
]

export default function FieldCollectorPage() {
  const { t } = useLang()
  const [formData, setFormData] = useState({
    siteName: '',
    species: '',
    dbh: '',
    height: '',
    gpsLat: '',
    gpsLon: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
  }

  const handleGPS = () => {
    setFormData((prev) => ({
      ...prev,
      gpsLat: (23.7 + Math.random() * 0.5).toFixed(6),
      gpsLon: (89.5 + Math.random() * 2.5).toFixed(6),
    }))
  }

  const statusLabel = (status: string) => {
    if (status === 'synced') return t('synced')
    return t('pending')
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{sampleCollections.length}</p>
              <p className="text-sm text-muted-foreground">{t('collectionsToday')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{sampleCollections.filter(c => c.status === 'synced').length}</p>
              <p className="text-sm text-muted-foreground">{t('syncedServer')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-sky-50/50 border-sky-200">
          <CardContent className="p-4 flex items-center gap-3">
            <TreePine className="w-8 h-8 text-sky-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{sampleCollections.reduce((s, c) => s + c.trees, 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t('treesRecorded')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Upload className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{sampleCollections.filter(c => c.status === 'pending').length}</p>
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
                  <Button variant="outline" size="icon" className="shrink-0" onClick={handleGPS} title={t('getGps')}>
                    <MapPin className="w-4 h-4" />
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
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" />
                {submitted ? t('saved') : t('saveMeasurement')}
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
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {sampleCollections.map((c) => (
                <div key={c.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{c.site}</p>
                    <Badge
                      variant={c.status === 'synced' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {statusLabel(c.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>{c.species}</span>
                    <span>{c.trees} {t('trees')}</span>
                    <span>{c.date}</span>
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