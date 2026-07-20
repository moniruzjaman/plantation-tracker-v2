'use client'

import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet'
import { Satellite, Eye, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import 'leaflet/dist/leaflet.css'

const getNDVIColor = (ndvi: number) => {
  if (ndvi < 0.1) return '#8B0000'
  if (ndvi < 0.2) return '#CD853F'
  if (ndvi < 0.3) return '#FFD700'
  if (ndvi < 0.4) return '#9ACD32'
  if (ndvi < 0.5) return '#228B22'
  if (ndvi < 0.6) return '#006400'
  return '#004d00'
}

const samplePlantations = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { id: 1, name: 'Dhaka North Plantation', area: 45.2, ndvi: 0.52, status: 'healthy', trees: 12500 },
      geometry: { type: 'Polygon' as const, coordinates: [[[90.4, 23.8], [90.42, 23.8], [90.42, 23.82], [90.4, 23.82], [90.4, 23.8]]] },
    },
    {
      type: 'Feature' as const,
      properties: { id: 2, name: 'Sylhet Tea Garden Buffer', area: 120.5, ndvi: 0.28, status: 'stressed', trees: 34000 },
      geometry: { type: 'Polygon' as const, coordinates: [[[91.85, 24.9], [91.88, 24.9], [91.88, 24.93], [91.85, 24.93], [91.85, 24.9]]] },
    },
    {
      type: 'Feature' as const,
      properties: { id: 3, name: 'Chittagong Hill Reforest', area: 78.0, ndvi: 0.61, status: 'healthy', trees: 22000 },
      geometry: { type: 'Polygon' as const, coordinates: [[[91.95, 22.35], [91.98, 22.35], [91.98, 22.38], [91.95, 22.38], [91.95, 22.35]]] },
    },
    {
      type: 'Feature' as const,
      properties: { id: 4, name: 'Rajshahi Dry Zone', area: 200.0, ndvi: 0.15, status: 'mortality_alert', trees: 15000 },
      geometry: { type: 'Polygon' as const, coordinates: [[[88.6, 24.35], [88.65, 24.35], [88.65, 24.4], [88.6, 24.4], [88.6, 24.35]]] },
    },
    {
      type: 'Feature' as const,
      properties: { id: 5, name: 'Khulna Sundarbans Edge', area: 78.0, ndvi: 0.22, status: 'stressed', trees: 18500 },
      geometry: { type: 'Polygon' as const, coordinates: [[[89.5, 22.5], [89.55, 22.5], [89.55, 22.55], [89.5, 22.55], [89.5, 22.5]]] },
    },
    {
      type: 'Feature' as const,
      properties: { id: 6, name: 'Barisal Coastal Belt', area: 200.0, ndvi: 0.35, status: 'stressed', trees: 28000 },
      geometry: { type: 'Polygon' as const, coordinates: [[[90.35, 22.7], [90.4, 22.7], [90.4, 22.75], [90.35, 22.75], [90.35, 22.7]]] },
    },
    {
      type: 'Feature' as const,
      properties: { id: 7, name: 'Rangpur Northern Belt', area: 65.0, ndvi: 0.19, status: 'mortality_alert', trees: 11000 },
      geometry: { type: 'Polygon' as const, coordinates: [[[89.2, 25.7], [89.25, 25.7], [89.25, 25.75], [89.2, 25.75], [89.2, 25.7]]] },
    },
  ],
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

export default function MapViewPage() {
  const [selectedDate, setSelectedDate] = useState('2026-06-15')
  const [showNDVI, setShowNDVI] = useState(true)
  const [showSatellite, setShowSatellite] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const onEachFeature = useCallback((feature: any, layer: any) => {
    const p = feature.properties
    layer.bindPopup(`
      <div style="min-width:220px">
        <h3 style="font-weight:bold;margin-bottom:8px;font-size:14px">${p.name}</h3>
        <p style="margin:4px 0">Area: <strong>${p.area} ha</strong> | Trees: <strong>${p.trees.toLocaleString()}</strong></p>
        <p style="margin:4px 0">NDVI: <span style="color:${getNDVIColor(p.ndvi)};font-weight:bold;font-family:monospace">${p.ndvi}</span></p>
        <p style="margin-top:8px">
          <span style="text-transform:uppercase;font-size:11px;padding:2px 8px;border-radius:4px;
            background:${p.status === 'healthy' ? '#dcfce7' : p.status === 'stressed' ? '#fef9c3' : '#fee2e2'};
            color:${p.status === 'healthy' ? '#166534' : p.status === 'stressed' ? '#854d0e' : '#991b1b'}">
            ${p.status.replace('_', ' ')}
          </span>
        </p>
      </div>
    `)
    layer.setStyle({
      fillColor: getNDVIColor(p.ndvi),
      fillOpacity: 0.6,
      color: p.status === 'mortality_alert' ? '#dc2626' : '#166534',
      weight: p.status === 'mortality_alert' ? 3 : 1.5,
    })
  }, [])

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-muted-foreground">Loading map...</p>
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
          <Button
            variant={showNDVI ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowNDVI(!showNDVI)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            NDVI Overlay
          </Button>
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
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Healthy: {samplePlantations.features.filter(f => f.properties.status === 'healthy').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Stressed: {samplePlantations.features.filter(f => f.properties.status === 'stressed').length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-600 font-medium">Alert: {samplePlantations.features.filter(f => f.properties.status === 'mortality_alert').length}</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative rounded-xl overflow-hidden border shadow-sm">
        <MapContainer center={[23.8, 90.4]} zoom={7} className="h-full w-full" style={{ minHeight: '400px' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={showSatellite} name="Satellite">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            </LayersControl.BaseLayer>
          </LayersControl>
          {showNDVI && <GeoJSON data={samplePlantations as any} onEachFeature={onEachFeature} />}
        </MapContainer>

        {/* NDVI Legend */}
        <Card className="absolute bottom-4 right-4 z-[1000] shadow-lg">
          <CardContent className="p-3">
            <h4 className="text-sm font-bold mb-2">NDVI Legend</h4>
            <div className="space-y-1">
              {ndviLegend.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="text-xs">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Panel */}
        <Card className="absolute top-4 left-4 z-[1000] shadow-lg max-w-xs">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Active Alerts (3)
            </h4>
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-xs font-medium text-red-800">Rajshahi Dry Zone</p>
                <p className="text-xs text-red-600">NDVI dropped 0.18 in 30 days</p>
                <p className="text-xs text-muted-foreground mt-1">Action: Field inspection required</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs font-medium text-yellow-800">Sylhet Tea Garden</p>
                <p className="text-xs text-yellow-600">NDVI declining trend detected</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs font-medium text-yellow-800">Rangpur Northern Belt</p>
                <p className="text-xs text-yellow-600">NDVI dropped 0.12, mortality risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}