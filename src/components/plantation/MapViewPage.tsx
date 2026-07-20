'use client'

import { useState, useCallback, useEffect } from 'react'
import { Satellite, Eye, Calendar, MapPin } from 'lucide-react'
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

const getNDVIColor = (ndvi: number) => {
  if (ndvi < 0.1) return '#8B0000'
  if (ndvi < 0.2) return '#CD853F'
  if (ndvi < 0.3) return '#FFD700'
  if (ndvi < 0.4) return '#9ACD32'
  if (ndvi < 0.5) return '#228B22'
  if (ndvi < 0.6) return '#006400'
  return '#004d00'
}

const getSpeciesColor = (species: string) => {
  const s = species.toLowerCase()
  if (s.includes('পেয়ারা') || s.includes('peyar')) return '#059669'
  if (s.includes('মাল্টা') || s.includes('malta')) return '#7c3aed'
  if (s.includes('লেবু') || s.includes('lebu')) return '#ea580c'
  if (s.includes('আম') || s.includes('am')) return '#eab308'
  return '#0891b2'
}

const ndviLegend = [
  { label: 'Dense Forest (>0.6)', color: '#004d00' },
  { label: 'Very Healthy (0.5-0.6)', color: '#006400' },
  { label: 'Healthy (0.4-0.5)', color: '#228B22' },
  { label: 'Moderate (0.3-0.4)', color: '#9ACD32' },
  { label: 'Sparse (0.2-0.3)', color: '#FFD700' },
  { label: 'Stressed (0.1-0.2)', color: '#CD853F' },
  { label: 'Dead/Bare (<0.1)', color: '#8B0000' },
]

const speciesLegend = [
  { label: 'Guava (পেয়ারা)', color: '#059669' },
  { label: 'Malta (মাল্টা)', color: '#7c3aed' },
  { label: 'Lemon (লেবু)', color: '#ea580c' },
  { label: 'Mango (আম)', color: '#eab308' },
]

function LeafletMap({ entries, showSatellite, upazilaFilter }: {
  entries: MapEntry[]
  showSatellite: boolean
  upazilaFilter: string
}) {
  const { MapContainer, TileLayer, Marker, Popup, LayersControl, CircleMarker } = require('react-leaflet')
  const L = require('leaflet')

  const filtered = upazilaFilter === 'all'
    ? entries
    : entries.filter(e => e.upazila === upazilaFilter)

  // Calculate center from data
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
        <LayersControl.BaseLayer checked={showSatellite} name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenStreetMap">
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
                    <tr><td style={{ color: '#666', paddingRight: 8 }}>Quantity:</td><td style={{ fontWeight: 600 }}>{entry.count} saplings</td></tr>
                    <tr><td style={{ color: '#666' }}>Upazila:</td><td style={{ fontWeight: 600 }}>{entry.upazila || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>District:</td><td>{entry.district || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>Date:</td><td>{entry.plantingDate || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>GPS:</td><td style={{ fontFamily: 'monospace', fontSize: 11 }}>{entry.latitude}, {entry.longitude}</td></tr>
                    <tr><td style={{ color: '#666' }}>Farmer:</td><td>{entry.farmerName || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>SAAO:</td><td>{entry.saaoName || '-'}</td></tr>
                    <tr><td style={{ color: '#666' }}>Source:</td><td>{entry.seedlingSource || '-'}</td></tr>
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

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading satellite map...</p>
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
              <option key={u} value={u}>{u === 'all' ? 'All Upazilas' : u}</option>
            ))}
          </select>
          <Button
            variant={showSatellite ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSatellite(!showSatellite)}
            className="gap-2"
          >
            <Satellite className="w-4 h-4" />
            Satellite
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {filteredCount} sites | {filteredSaplings.toLocaleString()} saplings
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative rounded-xl overflow-hidden border shadow-sm">
        <LeafletMap entries={entries} showSatellite={showSatellite} upazilaFilter={upazilaFilter} />

        {/* Species Legend */}
        <Card className="absolute bottom-4 right-4 z-[1000] shadow-lg">
          <CardContent className="p-3">
            <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Species Legend
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
              Kurigram District Map
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              25 Crore Tree Plantation | {entries.length} GPS-verified sites
            </p>
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <p className="text-xs font-medium text-green-800">
                {filteredSaplings.toLocaleString()} saplings across {filteredCount} sites
              </p>
              <p className="text-xs text-green-600 mt-1">
                Circle size = quantity planted
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}