'use client'

import { useState, useEffect } from 'react'
import { Satellite, MapPin, Calendar } from 'lucide-react'
import { useLang, type Lang } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface MapEntry {
  id: string
  species: string | null
  count: number
  upazila: string | null
  district: string | null
  latitude: number
  longitude: number
  farmerName: string | null
  saaoName: string | null
  plantingDate: string | null
  seedlingSource: string | null
}

const getSpeciesColor = (species: string) => {
  const s = species.toLowerCase()
  if (s.includes('পেয়ারা') || s.includes('peyar')) return '#059669'
  if (s.includes('মাল্টা') || s.includes('malta')) return '#7c3aed'
  if (s.includes('লেবু') || s.includes('lebu')) return '#ea580c'
  if (s.includes('আম') || s.includes('am')) return '#eab308'
  return '#0891b2'
}

const getSpeciesLegend = (t: (key: string) => string) => [
  { label: `${t('legendGuava')} (পেয়ারা)`, color: '#059669' },
  { label: `${t('legendMalta')} (মাল্টা)`, color: '#7c3aed' },
  { label: `${t('legendLemon')} (লেবু)`, color: '#ea580c' },
  { label: `${t('legendMango')} (আম)`, color: '#eab308' },
  { label: `${t('legendOther')}`, color: '#0891b2' },
]

function LeafletMap({ entries, showSatellite, upazilaFilter, t, lang }: {
  entries: MapEntry[]
  showSatellite: boolean
  upazilaFilter: string
  t: (key: string) => string
  lang: Lang
}) {
  const { MapContainer, TileLayer, LayersControl, CircleMarker, Popup } = require('react-leaflet')

  const filtered = upazilaFilter === 'all'
    ? entries
    : entries.filter(e => e.upazila === upazilaFilter)

  const validEntries = entries.filter(e => e.latitude && e.longitude)
  const centerLat = validEntries.length
    ? validEntries.reduce((s, e) => s + e.latitude, 0) / validEntries.length
    : 25.75
  const centerLng = validEntries.length
    ? validEntries.reduce((s, e) => s + e.longitude, 0) / validEntries.length
    : 89.55

  return (
    <MapContainer center={[centerLat, centerLng]} zoom={10} className="h-full w-full" style={{ minHeight: '400px' }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked={showSatellite} name={t('layerSatellite')}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name={t('layerOSM')}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        </LayersControl.BaseLayer>
      </LayersControl>
      {filtered.map((entry) => {
        if (!entry.latitude || !entry.longitude) return null
        const color = getSpeciesColor(entry.species || '')
        return (
          <CircleMarker
            key={entry.id}
            center={[entry.latitude, entry.longitude]}
            radius={Math.max(6, Math.min(16, Math.sqrt(entry.count) * 1.8))}
            pathOptions={{
              fillColor: color,
              color: '#fff',
              weight: 2,
              fillOpacity: 0.75,
            }}
          >
            <Popup>
              <div style={{ minWidth: 220, fontFamily: 'system-ui' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 14, color: '#166534' }}>
                  {entry.species}
                </h3>
                <table style={{ fontSize: 12, width: '100%' }}>
                  <tbody>
                    <tr><td style={{ color: '#666', paddingRight: 8 }}>{t('popupQuantity')}</td><td style={{ fontWeight: 600 }}>{entry.count} {t('popupSaplings')}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupUpazila')}</td><td style={{ fontWeight: 600 }}>{entry.upazila || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupDistrict')}</td><td>{entry.district || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupDate')}</td><td>{entry.plantingDate || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupGps')}</td><td style={{ fontFamily: 'monospace', fontSize: 11 }}>{entry.latitude}, {entry.longitude}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupFarmer')}</td><td>{entry.farmerName || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupSaao')}</td><td>{entry.saaoName || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>{t('popupSource')}</td><td>{entry.seedlingSource || '-'}</td></tr>
                  </tbody>
                </table>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

export default function MapViewPage() {
  const [entries, setEntries] = useState<MapEntry[]>([])
  const [selectedDate, setSelectedDate] = useState('2026-06-20')
  const [showSatellite, setShowSatellite] = useState(true)
  const { t, lang } = useLang()
  const [mounted, setMounted] = useState(false)
  const [upazilaFilter, setUpazilaFilter] = useState('all')

  useEffect(() => {
    fetch('/api/app-entries')
      .then(r => r.json())
      .then(data => setEntries(data))
      .catch(() => {})
    import('leaflet/dist/leaflet.css')
    setMounted(true)
  }, [])

  const upazilas = ['all', ...Array.from(new Set(entries.filter(e => e.upazila).map(e => e.upazila!)))]
  const filteredCount = upazilaFilter === 'all'
    ? entries.length
    : entries.filter(e => e.upazila === upazilaFilter).length
  const filteredSaplings = upazilaFilter === 'all'
    ? entries.reduce((s, e) => s + e.count, 0)
    : entries.filter(e => e.upazila === upazilaFilter).reduce((s, e) => s + e.count, 0)

  const speciesLegend = getSpeciesLegend(t)

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">{t('loadingMap')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto text-sm"
            />
          </div>
          <select
            value={upazilaFilter}
            onChange={(e) => setUpazilaFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            {upazilas.map(u => (
              <option key={u} value={u}>{u === 'all' ? t('allUpazilas') : u}</option>
            ))}
          </select>
          <Button
            variant={showSatellite ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSatellite(!showSatellite)}
            className="gap-2"
          >
            <Satellite className="w-4 h-4" />
            {t('satellite')}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {filteredCount} {t('statSites')} | {filteredSaplings.toLocaleString()} {t('saplings')}
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative rounded-xl overflow-hidden border shadow-sm">
        <LeafletMap entries={entries} showSatellite={showSatellite} upazilaFilter={upazilaFilter} t={t} lang={lang} />

        {/* Species Legend */}
        <Card className="absolute bottom-4 right-4 z-[1000] shadow-lg">
          <CardContent className="p-3">
            <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {t('speciesLegend')}
            </h4>
            <div className="space-y-1">
              {speciesLegend.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="text-xs">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card className="absolute top-4 left-4 z-[1000] shadow-lg max-w-xs">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t('kurigramMap')}
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              {t('croreProgram')} | {entries.length} {t('gpsTracked')}
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-xs font-medium text-green-800">
                {filteredSaplings.toLocaleString()} {t('saplings')} {t('acrossUpazilas')} {filteredCount} {t('statSites')}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {t('circleSize')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}