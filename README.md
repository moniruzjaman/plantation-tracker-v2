# Plantation Tracker v2.0

**25 Crore Tree Plantation Program** — Real-time monitoring, satellite mapping, carbon accounting & ministry reporting for the Department of Agricultural Extension (DAE), Bangladesh.

## Overview

Plantation Tracker v2 is a full-stack web application built with Next.js 16, SQLite (Prisma ORM), Leaflet, and Recharts. It tracks tree plantation activities under Bangladesh's national initiative to plant 25 crore (250 million) trees over 5 years, covering Kurigram District and surrounding regions under Rangpur & Khulna Divisions.

The system ingests field data collected via a mobile app, displays GPS-verified planting sites on satellite maps, generates NDVI-based health monitoring, and produces ready-to-submit 17-column ministry reports for weekly email submission to DAE and the Ministry of Agriculture (MoA).

## Key Features

### Dashboard
- Real-time statistics: total saplings, species diversity, upazila coverage, farmer engagement
- Species distribution pie chart with 26+ fruit tree species
- District-level sapling breakdown bar chart
- NDVI vegetation health trend (simulated time-series)
- Carbon sequestration projection area chart
- Weekly Ministry Report summary with reporting email addresses
- Recent planting entries table with farmer and SAAO details

### Satellite Map
- Interactive Leaflet map with satellite imagery (Esri World Imagery) and OpenStreetMap base layers
- GPS-verified CircleMarkers at each planting site, color-coded by species (Guava, Malta, Lemon, Mango, etc.)
- Marker size proportional to sapling count
- Rich popups showing species, quantity, upazila, GPS coordinates, farmer name, SAAO, and seedling source
- Upazila-level filter dropdown
- Species legend and site count info panel
- Supports 52+ GPS-tracked planting sites

### Mortality Alerts
- NDVI-based mortality detection with priority levels (critical, high, medium)
- Status tracking: open, investigating, resolved
- Filterable by priority and status
- Estimated tree loss and area affected calculations
- One-click resolution workflow

### Report (Carbon & Ministry)
- **Ministry Report Tab**: Full 17-column table matching the government reporting format (রোপণকৃত চারার তথ্য) with CSV export
- **IPCC Tier 2 Tab**: District-level carbon sequestration bar chart, above-ground/below-ground biomass line chart
- **Verra VM0047 Tab**: Carbon credit project compliance checklist (PDD, baseline, monitoring plan, leakage, buffer, VVB)
- 6 summary cards: entries, saplings, species, upazilas, 17-col report count, ministry report count
- Upazila-level species breakdown chart

### Field Collector
- Mobile-optimized field measurement form
- GPS auto-fill for latitude/longitude
- Species, DBH, height data entry
- Photo capture support
- Sync status tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | SQLite via Prisma ORM |
| Maps | Leaflet + react-leaflet (dynamic SSR-safe import) |
| Charts | Recharts (Bar, Line, Area, Pie) |
| Icons | Lucide React |

## Data Model

The application uses 5 Prisma models:

- **AppEntry** — 27 fields mapping the full mobile app submission schema (division, district, upazila, union, village, GPS coordinates, species, count, NDVI, farmer/SAAO/MO details, etc.)
- **Plantation** — Legacy plantation site records with NDVI health scores
- **Alert** — Mortality alerts with NDVI drop detection, priority, and resolution tracking
- **CarbonData** — Annual carbon sequestration data (verified/projected tCO2e, AGB/BGB biomass)
- **FieldData** — Field measurement records (DBH, height, GPS)

## Current Data

Imported from the official Tree Plantation Workbook (Excel):

| Metric | Value |
|--------|-------|
| App Entries | 52 GPS-verified records |
| Total Saplings | 3,860 |
| Species | 26 (Guava, Malta, Lemon, Mango, Jackfruit, etc.) |
| Upazilas | 13 across Kurigram District |
| Districts | Kurigram, Khulna, Lalmonirhat, Khagrachhari, Gaibandha |
| 17-Column Report Rows | 30 |
| Ministry Report Rows | 234 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seed` | Seed database with Excel data (idempotent) |
| GET | `/api/app-entries` | List all plantation entries |
| POST | `/api/app-entries` | Create new entry |
| GET | `/api/plantations` | List plantation sites |
| POST | `/api/plantations` | Create plantation |
| GET | `/api/alerts` | List mortality alerts |
| POST | `/api/alerts` | Create alert |
| GET | `/api/carbon` | Carbon data with district aggregation |
| GET | `/api/ministry-report` | 17-col report + ministry report data + summary stats |

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or bun

### Installation

```bash
git clone https://github.com/moniruzjaman/plantation-tracker-v2.git
cd plantation-tracker-v2
npm install
```

### Setup Database

```bash
npx prisma db push
npx prisma generate
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The database auto-seeds on first load.

### Production Build

```bash
npm run build
npm start
```

## Ministry Reporting

This application generates reports in the official format required by:

- **Department of Agricultural Extension (DAE)**: admonitoring@dae.gov.bd / ddimplement@dae.gov.bd
- **Ministry of Agriculture (MoA)**: E-mail-input2@moa.gov.bd / moa.input2@gmail.com

Reports follow the 17-column format:
> সাপ্তাহিকভিত্তিক বৃক্ষরোপণের তথ্য (Weekly Plantation Report)

Columns: Serial No., Village, Block, Union, Upazila, District, Species, Count, Planting Date, GPS Coordinates, Farmer Name, Farmer Mobile, SAAO Name, SAAO Mobile, Monitoring Officer, MO Mobile, Comments.

## Carbon Accounting

The app supports two international carbon accounting frameworks:

- **IPCC Tier 2**: Default biomass conversion equations for tropical fruit tree plantations
- **Verra VM0047**: Afforestation/Reforestation methodology for voluntary carbon credits

## License

This project is developed for the Department of Agricultural Extension, Ministry of Agriculture, Government of Bangladesh.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── app-entries/route.ts    # CRUD for plantation entries
│   │   ├── plantations/route.ts    # Plantation sites API
│   │   ├── alerts/route.ts         # Mortality alerts API
│   │   ├── carbon/route.ts         # Carbon data API
│   │   ├── ministry-report/route.ts # 17-col & ministry report API
│   │   └── seed/route.ts           # Database seeder (Excel data)
│   ├── layout.tsx
│   ├── page.tsx                    # Main app shell with sidebar
│   └── globals.css
├── components/
│   ├── plantation/
│   │   ├── DashboardPage.tsx       # Dashboard with charts & ministry summary
│   │   ├── MapViewPage.tsx         # Leaflet satellite map with markers
│   │   ├── MortalityAlertsPage.tsx # NDVI alert management
│   │   ├── CarbonReportPage.tsx    # IPCC/Verra/Ministry report tabs
│   │   └── FieldCollectorPage.tsx  # Field data collection form
│   └── ui/                         # shadcn/ui components
├── data/
│   └── excel_report_data.json      # 17-col & ministry report data
├── lib/
│   └── db.ts                       # Prisma client singleton
prisma/
└── schema.prisma                   # SQLite database schema
```