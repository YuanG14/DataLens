# MindState — Mental Health Analytics Dashboard

React + TypeScript + Vite + Tailwind CSS v4 dashboard, feature-based structure.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks (tsc -b) then produces dist/
npm run lint     # oxlint
npm run preview  # serve the production build locally
```

## Structure

```
src/
  app/
    App.tsx              Composition root — wires the dashboard feature together
    ErrorBoundary.tsx     Top-level crash fallback (wraps App in main.tsx)
  features/
    dashboard/
      components/         Header, FilterBar, KpiGrid, InsightPanel, RecordTable,
                           RiskPanel, charts/ (one file per Chart.js chart)
      hooks/               useDashboardData — raw data, filters, filtered data
      lib/                 constants, mockData, stats, csv, risk
      types/               StudentRecord, FilterState, DashboardStats, etc.
  shared/
    hooks/
      useChartInstance.ts  Chart.js lifecycle, usable by any future chart-based feature
  main.tsx, index.css
```

Import path `@/...` maps to `src/...` (configured in both `tsconfig.app.json`
and `vite.config.ts`) — avoids `../../../` chains as the tree grows.

Each folder under `features/dashboard/` has an `index.ts` barrel, so
consumers import `@/features/dashboard/components` rather than reaching into
individual files. When a second feature (e.g. `features/auth/`) is added in a
later phase, it follows the same shape: `components/`, `hooks/`, `lib/`,
`types/`, each with its own barrel.

## Known placeholders (see Phase 1 audit)

- **InsightPanel** renders a rule-based template string, not an LLM-generated
  insight — wire up once an AI-insights backend exists.
- **RiskPanel** uses a fixed linear heuristic (`lib/risk.ts`), not a trained
  model.
- **Export PDF** button calls `window.print()` — a real PDF export is a later
  phase.
- No backend yet: data is either the generated mock set or a locally
  imported CSV. Supabase/auth/persistence are subsequent phases.
