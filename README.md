# MindState — Mental Health Analytics Dashboard

React + TypeScript + Vite + Tailwind CSS v4 rebuild of the original single-file
prototype. Visual design is unchanged; the app is now componentized, typed,
and built with a real toolchain instead of CDN scripts.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks (tsc -b) then produces dist/
npm run preview  # serve the production build locally
```

## Structure

```
src/
  types/dashboard.ts        Domain types (StudentRecord, FilterState, etc.)
  lib/
    mockData.ts              Synthetic dataset generator
    stats.ts                 Aggregation helpers (KPIs, correlation, brackets, demographics)
    csv.ts                   CSV import (header-based) and export
    risk.ts                  Heuristic risk estimator (placeholder, not ML)
  hooks/
    useDashboardData.ts      Central state: raw data, filters, filtered data
    useChartInstance.ts      Chart.js lifecycle (create on mount, destroy on unmount)
  components/dashboard/
    Header.tsx, FilterBar.tsx, KpiGrid.tsx, InsightPanel.tsx,
    RecordTable.tsx, RiskPanel.tsx
    charts/                  One component per Chart.js chart
```

## Known placeholders (see audit)

- **InsightPanel** renders a rule-based template string, not an LLM-generated
  insight. Wire this up once an AI-insights backend exists.
- **RiskPanel** uses a fixed linear heuristic (`lib/risk.ts`), not a trained
  model.
- **Export PDF** button calls `window.print()` — a real PDF export (e.g.
  server-rendered or a PDF library) is a later phase.
- No backend yet: data is either the generated mock set or a locally
  imported CSV. Supabase/auth/persistence are subsequent phases.
