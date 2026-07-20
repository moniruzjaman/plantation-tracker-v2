---
Task ID: 1
Agent: Main
Task: Clone, prepare, and deploy Plantation Tracker v2

Work Log:
- Cloned https://github.com/moniruzjaman/plantation-tracker-v2
- Unzipped plantation-tracker-v2.zip (original project was React + Vite + FastAPI + PostgreSQL)
- Analyzed full project structure: frontend (React/Leaflet/Recharts), backend (FastAPI), satellite, ai, carbon modules
- Installed leaflet + react-leaflet + @types/leaflet
- Created Prisma schema with 4 models: Plantation, Alert, CarbonData, FieldData
- Pushed schema to SQLite database via `bun run db:push`
- Built 5 page components as Next.js client components with shadcn/ui:
  - DashboardPage: stat cards, NDVI line chart, carbon area chart, health pie chart, recent alerts
  - MapViewPage: Leaflet map with 7 Bangladesh plantation zones, NDVI color overlay, alert panel, legend (SSR-safe via require())
  - MortalityAlertsPage: 8 alert records, priority/status filters, summary cards, sortable table
  - CarbonReportPage: IPCC/Verra toggle, district bar chart, biomass line chart, VM0047 compliance checklist
  - FieldCollectorPage: data collection form with GPS, species, DBH/height fields, recent collections list
- Created main page.tsx with green sidebar navigation (responsive with mobile hamburger menu)
- Updated layout.tsx metadata for Plantation Tracker v2
- Added Leaflet CSS and custom scrollbar styles to globals.css
- Created 3 API routes: /api/plantations, /api/alerts, /api/carbon
- Created /api/seed route that populates 8 plantations, 8 alerts, 22 carbon entries, 6 field data records
- Fixed SSR issue with react-leaflet using require() + mounted state guard
- Fixed turbopack cache corruption by clean restart
- Browser-verified all 5 views: Dashboard, Satellite Map, Mortality Alerts, Carbon Report, Field Collector

Stage Summary:
- Fully deployed Plantation Tracker v2 as Next.js 16 app
- SQLite database seeded with Bangladesh plantation data (8 sites, 2,670 ha total)
- All 5 pages render correctly with zero console errors
- Server returns HTTP 200, health check passed
