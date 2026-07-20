'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Map, BarChart3, AlertTriangle, TreePine, ClipboardList, Leaf,
  Menu, X, TrendingUp, FileText, Users, Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/i18n'
import DashboardPage from '@/components/plantation/DashboardPage'
import MortalityAlertsPage from '@/components/plantation/MortalityAlertsPage'
import CarbonReportPage from '@/components/plantation/CarbonReportPage'
import FieldCollectorPage from '@/components/plantation/FieldCollectorPage'

const MapViewPage = dynamic(() => import('@/components/plantation/MapViewPage'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function Home() {
  const [activePage, setActivePage] = useState<'dashboard' | 'map' | 'alerts' | 'carbon' | 'field'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dbSeeded, setDbSeeded] = useState(false)
  const [sidebarStats, setSidebarStats] = useState<{ saplings: number; species: number; upazilas: number }>({ saplings: 0, species: 0, upazilas: 0 })
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    fetch('/api/seed', { method: 'POST' })
      .then(() => setDbSeeded(true))
      .catch(() => setDbSeeded(true))
  }, [])

  useEffect(() => {
    if (!dbSeeded) return
    fetch('/api/app-entries')
      .then(r => r.json())
      .then((data: any[]) => {
        const total = data.reduce((s: number, e: any) => s + (e.count || 0), 0)
        const species = new Set(data.filter((e: any) => e.species).map((e: any) => e.species)).size
        const upazilas = new Set(data.filter((e: any) => e.upazila).map((e: any) => e.upazila)).size
        setSidebarStats({ saplings: total, species, upazilas })
      })
      .catch(() => {})
  }, [dbSeeded])

  const navItems = [
    { key: 'dashboard' as const, label: t('navDashboard'), icon: BarChart3 },
    { key: 'map' as const, label: t('navMap'), icon: Map },
    { key: 'alerts' as const, label: t('navAlerts'), icon: AlertTriangle },
    { key: 'carbon' as const, label: t('navReport'), icon: FileText },
    { key: 'field' as const, label: t('navField'), icon: ClipboardList },
  ]

  const pageComponents: Record<string, React.ComponentType> = {
    dashboard: DashboardPage,
    map: MapViewPage,
    alerts: MortalityAlertsPage,
    carbon: CarbonReportPage,
    field: FieldCollectorPage,
  }

  const currentNav = navItems.find((n) => n.key === activePage)!

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-green-900 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-green-700 rounded-lg">
                <TreePine className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight">{t('appTitle')}</h1>
                <p className="text-[11px] text-green-400 font-medium">{t('appVersion')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-green-300 hover:text-white hover:bg-green-800 h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[11px] text-green-400 mt-2.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {t('croreProgram')}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActivePage(item.key)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-green-200 hover:bg-green-800/70 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-green-800">
          <div className="bg-green-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-green-300 font-medium">{t('districtLabel')}</p>
              {dbSeeded && (
                <span className="text-[10px] bg-green-700 text-green-200 px-1.5 py-0.5 rounded">LIVE</span>
              )}
            </div>
            <p className="text-xl font-bold text-white mt-1">{sidebarStats.saplings.toLocaleString()} {t('saplings')}</p>
            <p className="text-[11px] text-green-400 mt-0.5">{sidebarStats.upazilas} {t('upazilas')} | {sidebarStats.species} {t('species')}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {currentNav.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            >
              <Globe className="w-4 h-4" />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </Button>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <pageComponents[activePage] />
        </div>
      </main>
    </div>
  )
}