'use client'

import React, { useState, useEffect } from 'react'
import {
  Database, RefreshCw, Layers, ShieldCheck, HelpCircle,
  MapPin, Eye, Compass, Bell, AlertCircle, FileText,
  Table as TableIcon, Search, CheckCircle2, ChevronRight,
  ArrowRight, Key, Sparkles, Filter, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/i18n'

export type SelectedTableType =
  | 'appEntry'
  | 'userProfile'
  | 'customUpazila'
  | 'processData'
  | 'growthLog'
  | 'plantation'
  | 'alert'
  | 'carbonData'
  | 'fieldData'
  | 'gpsCoordinate'
  | 'ministryReport'

interface TableMeta {
  key: SelectedTableType
  name: string
  nameBn: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: 'core' | 'admin' | 'monitoring' | 'reporting'
  fields: { name: string; type: string; isKey?: boolean; isRelation?: boolean }[]
}

const TABLES_METADATA: TableMeta[] = [
  {
    key: 'appEntry',
    name: 'AppEntry',
    nameBn: 'অ্যাপ জমা এন্ট্রি',
    description: 'Field mobile app submissions with GPS coordinates, farmer & SAAO info, and species breakdown',
    icon: Database,
    category: 'core',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'appSubmissionId', type: 'String (Unique)', isKey: true },
      { name: 'division', type: 'String' },
      { name: 'district', type: 'String' },
      { name: 'upazila', type: 'String' },
      { name: 'latitude', type: 'Float' },
      { name: 'longitude', type: 'Float' },
      { name: 'species', type: 'String' },
      { name: 'count', type: 'Int' },
      { name: 'ndvi', type: 'Float' },
      { name: 'farmerName', type: 'String' },
      { name: 'farmerMobile', type: 'String' },
      { name: 'saaoName', type: 'String' },
      { name: 'moName', type: 'String' },
      { name: 'growthLogs', type: 'Relation (1:N)', isRelation: true },
    ],
  },
  {
    key: 'userProfile',
    name: 'UserProfile',
    nameBn: 'অফিসার প্রোফাইল',
    description: 'DAE Officials directory (ADD, DD, SAAO) with jurisdictional assignments and device IDs',
    icon: ShieldCheck,
    category: 'admin',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'name', type: 'String' },
      { name: 'shortDesignation', type: 'String' },
      { name: 'designation', type: 'String' },
      { name: 'mobile', type: 'String' },
      { name: 'email', type: 'String' },
      { name: 'district', type: 'String' },
      { name: 'upazila', type: 'String' },
      { name: 'deviceId', type: 'String' },
    ],
  },
  {
    key: 'customUpazila',
    name: 'CustomUpazila',
    nameBn: 'উপজেলা ডিরেক্টরি',
    description: 'National Upazila master directory across all districts in Bangladesh',
    icon: MapPin,
    category: 'admin',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'district', type: 'String' },
      { name: 'upazilaName', type: 'String' },
      { name: 'addedBy', type: 'String' },
      { name: 'deviceId', type: 'String' },
    ],
  },
  {
    key: 'processData',
    name: 'ProcessData',
    nameBn: 'যাচাইকৃত ফিল্ড ডাটা',
    description: 'Curated and verified field data rows with official serial numbers',
    icon: Layers,
    category: 'core',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'serialNo', type: 'String' },
      { name: 'district', type: 'String' },
      { name: 'upazila', type: 'String' },
      { name: 'species', type: 'String' },
      { name: 'count', type: 'Int' },
      { name: 'plantingDate', type: 'String' },
      { name: 'farmerName', type: 'String' },
    ],
  },
  {
    key: 'plantation',
    name: 'Plantation',
    nameBn: 'বাগান সাইট',
    description: 'Core plantation sites with area calculation and GIS coordinates',
    icon: Compass,
    category: 'monitoring',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'name', type: 'String' },
      { name: 'district', type: 'String' },
      { name: 'areaHa', type: 'Float' },
      { name: 'trees', type: 'Int' },
      { name: 'ndvi', type: 'Float' },
      { name: 'status', type: 'String' },
      { name: 'alerts', type: 'Relation (1:N)', isRelation: true },
      { name: 'carbonData', type: 'Relation (1:N)', isRelation: true },
    ],
  },
  {
    key: 'alert',
    name: 'Alert',
    nameBn: 'মর্টালিটি এলার্ট',
    description: 'NDVI vegetation drop and seedling mortality tracking alerts',
    icon: AlertCircle,
    category: 'monitoring',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'plantationId', type: 'Foreign Key -> Plantation', isRelation: true },
      { name: 'ndviCurrent', type: 'Float' },
      { name: 'ndviBaseline', type: 'Float' },
      { name: 'ndviDrop', type: 'Float' },
      { name: 'priority', type: 'String' },
      { name: 'status', type: 'String' },
    ],
  },
  {
    key: 'carbonData',
    name: 'CarbonData',
    nameBn: 'কার্বন হিসাব',
    description: 'Annual carbon sequestration (tCO2e) and above/below-ground biomass estimates',
    icon: Sparkles,
    category: 'reporting',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'plantationId', type: 'Foreign Key -> Plantation', isRelation: true },
      { name: 'year', type: 'Int' },
      { name: 'verifiedTco2e', type: 'Float' },
      { name: 'projectedTco2e', type: 'Float' },
      { name: 'agbTc', type: 'Float' },
      { name: 'bgbTc', type: 'Float' },
    ],
  },
  {
    key: 'growthLog',
    name: 'GrowthLog',
    nameBn: 'বৃদ্ধির লগ',
    description: 'Periodic tree height (cm) and health observation logs',
    icon: Bell,
    category: 'monitoring',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'entryId', type: 'Foreign Key -> AppEntry', isRelation: true },
      { name: 'heightCm', type: 'Float' },
      { name: 'ndvi', type: 'Float' },
      { name: 'condition', type: 'String' },
    ],
  },
  {
    key: 'fieldData',
    name: 'FieldData',
    nameBn: 'ফিল্ড পরিমাপ',
    description: 'Inspector field measurements (DBH, height, GPS points)',
    icon: FileText,
    category: 'core',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'plantationId', type: 'Foreign Key -> Plantation', isRelation: true },
      { name: 'species', type: 'String' },
      { name: 'dbh', type: 'Float' },
      { name: 'height', type: 'Float' },
      { name: 'status', type: 'String' },
    ],
  },
  {
    key: 'gpsCoordinate',
    name: 'GPSCoordinate',
    nameBn: 'জিপিএস রেফারেন্স',
    description: 'GPS Reference coordinates with DMS conversion and Google Maps URLs',
    icon: MapPin,
    category: 'core',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'siteName', type: 'String' },
      { name: 'district', type: 'String' },
      { name: 'latitude', type: 'Float' },
      { name: 'longitude', type: 'Float' },
    ],
  },
  {
    key: 'ministryReport',
    name: 'MinistryReport',
    nameBn: 'মন্ত্রণালয় ১৭-কলাম রিপোর্ট',
    description: 'Weekly 17-column reports generated for the Ministry of Agriculture',
    icon: FileText,
    category: 'reporting',
    fields: [
      { name: 'id', type: 'String (CUID)', isKey: true },
      { name: 'serialNo', type: 'Int' },
      { name: 'upazila', type: 'String' },
      { name: 'district', type: 'String' },
      { name: 'species', type: 'String' },
      { name: 'count', type: 'Int' },
      { name: 'plantingDate', type: 'String' },
    ],
  },
]

export default function DatabaseSchemaExplorer() {
  const { t, lang } = useLang()
  const [selectedTable, setSelectedTable] = useState<SelectedTableType>('appEntry')
  const [records, setRecords] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'explorer' | 'diagram'>('explorer')
  const [searchQuery, setSearchQuery] = useState('')
  const [inspectRecord, setInspectRecord] = useState<any | null>(null)

  const activeMeta = TABLES_METADATA.find((t) => t.key === selectedTable) || TABLES_METADATA[0]

  const loadRecords = async (tableKey = selectedTable) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/schema-explorer?table=${tableKey}&limit=100`)
      const data = await res.json()
      setRecords(data.records || [])
      setTotalCount(data.totalCount || 0)
      if (data.tableCounts) {
        setTableCounts(data.tableCounts)
      }
    } catch (err) {
      console.error('Error loading schema records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords(selectedTable)
  }, [selectedTable])

  const filteredRecords = records.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return Object.values(r).some(
      (val) => val && String(val).toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {lang === 'bn' ? 'ডাটাবেস স্কিমা এক্সপ্লোরার' : 'Database Schema Explorer'}
              </h1>
              <p className="text-xs text-gray-500">
                {lang === 'bn'
                  ? 'SQLite ডাটাবেস আর্কিটেকচার, রিলেশন ও লাইভ রেকর্ড ম্যানেজমেন্ট'
                  : 'SQLite relational schema, ERD architecture & live records inspector'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg border">
            <button
              onClick={() => setViewMode('explorer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'explorer'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'ডাটা এক্সপ্লোরার' : 'Record Explorer'}
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'diagram'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'ইআরডি ডায়াগ্রাম' : 'ERD Diagram'}
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadRecords(selectedTable)}
            disabled={loading}
            className="gap-1.5 text-xs text-gray-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Table Selection */}
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>{lang === 'bn' ? 'ডাটাবেস টেবিলসমূহ' : 'Database Tables'}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {TABLES_METADATA.length} {lang === 'bn' ? 'টেবিল' : 'Tables'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {TABLES_METADATA.map((meta) => {
                const Icon = meta.icon
                const isSelected = selectedTable === meta.key
                const count = tableCounts[meta.key] ?? (isSelected ? totalCount : 0)

                return (
                  <button
                    key={meta.key}
                    onClick={() => {
                      setSelectedTable(meta.key)
                      setSearchQuery('')
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${
                      isSelected
                        ? 'bg-emerald-700 text-white font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-200' : 'text-emerald-700'}`} />
                      <div className="truncate">
                        <div className="text-xs font-semibold leading-tight">
                          {lang === 'bn' ? meta.nameBn : meta.name}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                          {meta.name}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        isSelected
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Content Area: Diagram vs Explorer */}
        <div className="lg:col-span-3 space-y-4">
          {viewMode === 'diagram' ? (
            /* ERD DIAGRAM VIEW */
            <div className="space-y-4">
              <Card>
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900">
                        {lang === 'bn' ? 'রিলেশনাল স্কিমা আর্কিটেকচার (ERD)' : 'Relational Schema Architecture (ERD)'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {lang === 'bn'
                          ? 'SQLite ডাটাবেসের সকল মডেল, প্রাইমারি কী ও ফরেন কী রিলেশন'
                          : 'Entity Relationship Diagram with primary keys, relations & data types'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                      Prisma ORM + SQLite
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  {/* Visual Relationship Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TABLES_METADATA.map((meta) => {
                      const Icon = meta.icon
                      const count = tableCounts[meta.key] ?? 0
                      return (
                        <div
                          key={meta.key}
                          className={`border rounded-xl p-4 transition ${
                            selectedTable === meta.key
                              ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-emerald-700" />
                              <span className="font-bold text-sm text-gray-900">{meta.name}</span>
                            </div>
                            <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {count} rows
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 my-2.5 line-clamp-2">
                            {lang === 'bn' ? meta.nameBn : meta.description}
                          </p>
                          <div className="space-y-1.5 pt-1">
                            {meta.fields.slice(0, 6).map((f) => (
                              <div
                                key={f.name}
                                className="flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded hover:bg-gray-50 font-mono"
                              >
                                <div className="flex items-center gap-1.5">
                                  {f.isKey && <Key className="w-3 h-3 text-amber-500 shrink-0" />}
                                  {f.isRelation && <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />}
                                  <span className={f.isKey ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                                    {f.name}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400">{f.type}</span>
                              </div>
                            ))}
                            {meta.fields.length > 6 && (
                              <div className="text-[10px] text-emerald-700 font-medium pt-1 text-center">
                                + {meta.fields.length - 6} more columns...
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* RECORD EXPLORER VIEW */
            <div className="space-y-4">
              {/* Selected Table Overview Card */}
              <Card>
                <CardHeader className="p-4 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900">
                          {activeMeta.name} ({lang === 'bn' ? activeMeta.nameBn : activeMeta.name})
                        </h2>
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
                          {totalCount.toLocaleString()} {lang === 'bn' ? 'রেকর্ড' : 'records'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{activeMeta.description}</p>
                    </div>

                    <div className="w-full sm:w-64">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <Input
                          placeholder={lang === 'bn' ? 'রেকর্ড সার্চ করুন...' : 'Search records...'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 pl-8 text-xs bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 border-t">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                      <span className="text-xs">{lang === 'bn' ? 'ডাটা লোড হচ্ছে...' : 'Loading records...'}</span>
                    </div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      {searchQuery ? 'No records match search' : 'No records found in this table'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[520px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-gray-50/90 sticky top-0 z-10 border-b text-[11px] text-gray-600 font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="p-3 w-10 text-center">#</th>
                            {Object.keys(filteredRecords[0] || {})
                              .slice(0, 7)
                              .map((k) => (
                                <th key={k} className="p-3 whitespace-nowrap">
                                  {k}
                                </th>
                              ))}
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredRecords.map((row, idx) => (
                            <tr key={row.id || idx} className="hover:bg-emerald-50/30 transition font-mono">
                              <td className="p-3 text-center text-gray-400 text-[10px]">{idx + 1}</td>
                              {Object.keys(row)
                                .slice(0, 7)
                                .map((k) => {
                                  const val = row[k]
                                  return (
                                    <td key={k} className="p-3 text-gray-700 max-w-[200px] truncate">
                                      {typeof val === 'object' && val !== null ? (
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                          {Array.isArray(val) ? `[${val.length} items]` : '{...}'}
                                        </Badge>
                                      ) : val === null || val === undefined ? (
                                        <span className="text-gray-300 italic">null</span>
                                      ) : (
                                        String(val)
                                      )}
                                    </td>
                                  )
                                })}
                              <td className="p-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setInspectRecord(row)}
                                  className="h-6 px-2 text-[10px] text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Inspect
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* JSON Record Inspector Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-gray-900">
                  {activeMeta.name} Record Inspector
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setInspectRecord(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-auto flex-1 bg-gray-900 text-emerald-400 font-mono text-xs rounded-b-xl">
              <pre>{JSON.stringify(inspectRecord, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

