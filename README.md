# DataLens

A schema-aware analytics platform that transforms CSV datasets into dynamic
statistical analysis, interactive visualizations, and rule-based insights.

DataLens is domain-agnostic: it works the same way whether you upload a
mental-health survey, student-performance data, sales figures, or any other
structured CSV. There is no hardcoded assumption about what your columns
mean — the schema, statistics, and insights are all derived from the data
you actually upload.

## Features

- ✓ CSV dataset ingestion, with file-size/type validation and per-row error reporting
- ✓ Automatic schema detection (numeric / categorical / boolean / date / text)
- ✓ Dataset normalization and column-type overrides during import
- ✓ Dynamic analytics: KPIs, descriptive statistics, correlation, group comparisons, trends, anomaly detection
- ✓ Data-quality analysis (missing values, malformed rows)
- ✓ Rule-based, deterministic insight generation (see below — **not** an LLM)
- ✓ Interactive filtering and Chart.js visualizations
- ✓ Multiple dataset support, each stored and analyzed independently
- ✓ Email/password authentication (Supabase Auth), with session persistence and protected routes
- ✓ Supabase/PostgreSQL storage with Row Level Security — every user only ever sees their own datasets
- ✓ Dataset management (import, view, delete)

## Technology stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, react-router-dom
**Backend:** Supabase (PostgreSQL, Authentication, Row Level Security)
**Data processing:** PapaParse (CSV parsing), a custom schema-detection engine, a custom analytics engine, a custom rule-based insight engine
**Visualization:** Chart.js
**Testing:** Vitest

DataLens does **not** call any external AI/LLM API (no OpenAI, Anthropic,
Gemini, Ollama, or similar). Every "insight" it shows is produced by
deterministic rules running against numbers the analytics engine already
computed — see [Rule-based insight engine](#rule-based-insight-engine) below.

## Architecture

```
CSV Upload
  ↓
CSV Parsing (PapaParse) + file/type/size validation
  ↓
Schema Detection (numeric / categorical / boolean / date / text, per column)
  ↓
Normalization (column overrides, missing-value handling)
  ↓
Supabase storage (datasets / dataset_columns / dataset_rows, RLS-protected)
  ↓
Analytics Engine  →  KPIs, correlations, group comparisons, trends, anomalies, data quality
  ↓
Rule-Based Insight Engine  →  plain-English insights, ranked and deduplicated
  ↓
Dashboard (filters, charts, tables, insight cards)
```

### Source layout

```
src/
  app/
    App.tsx              Router — auth routes, protected routes, redirects
    ErrorBoundary.tsx     Top-level crash fallback (wraps the whole app)
    pages/                One file per route
    routes/               ProtectedRoute / PublicOnlyRoute guards
  features/
    auth/                 Supabase Auth: sign up, sign in, sign out, session context
    import/                CSV parsing, file validation, schema detection, normalization
    datasets/              Persisting/listing/loading datasets from Supabase
    analytics/              KPIs, statistics, correlation, trends, anomalies, charts
    filters/                Dynamic filter UI driven by a dataset's actual columns
    insights/               The rule-based insight engine (see below)
  lib/
    supabase/client.ts     Single shared Supabase client (anon/publishable key only)
    errors.ts              Turns raw Supabase/Postgres errors into safe, friendly messages
  shared/
    hooks/useChartInstance.ts   Chart.js lifecycle management, shared by every chart component
```

Each feature folder has its own `components/`, `hooks/`, `lib/`, `types/`,
and an `index.ts` barrel — consumers import `@/features/analytics` rather
than reaching into individual files. The `@/...` import path maps to
`src/...` (configured in `tsconfig.app.json` and `vite.config.ts`).

`ImportPage` and `DatasetDetailPage` (the two heaviest routes — they pull in
the analytics engine and Chart.js) are lazy-loaded via `React.lazy()` in
`app/App.tsx`, so signing in or browsing your dataset list doesn't download
charting code you're not using yet.

## Rule-based insight engine

DataLens does not use a generative AI model. Insights are generated
**deterministically** from predefined rules applied to values the analytics
engine already calculated — the rule engine never invents a statistic.

```
Analytics Engine:  correlation(sleep_hours, stress_level) = -0.67
                              ↓
Rule:              IF |r| >= 0.7 THEN strength = "strong"
                              ↓
Insight:           "Sleep Hours and Stress Level show a strong negative
                    relationship in this sample... This describes an
                    association in the data, not a cause-and-effect
                    relationship."
```

- **Thresholds are centralized**, not scattered — e.g. correlation strength
  bands (`labelCorrelationStrength`), minimum sample size for a correlation
  to be shown at all, group-difference and trend confidence cutoffs.
- **Association, never causation.** Every relationship insight is
  explicitly phrased as an association, and a test suite
  (`generateInsights.test.ts`) asserts no insight ever uses causal language
  ("causes", "leads to", "due to", etc.).
- **Domain-agnostic by construction.** There's no hardcoded list of dataset
  topics; the same rules run for a mental-health dataset, a student-
  performance dataset, or a sales dataset. A small `SENSITIVE_ROLES` set
  (stress/anxiety/depression) only adds a "not medical/clinical advice"
  disclaimer when present — it never gates which rules run.
- **Edge cases are handled explicitly**: too few numeric columns → no
  correlation attempted; below the minimum sample size → no correlation
  insight is shown; constant values → correlation math stays well-defined
  (no `NaN`); no relationships found at all → an explicit "No strong
  relationships, trends, or group differences were detected" message
  instead of an empty or misleading panel.

## Security

- **Authentication**: Supabase Auth (email/password), with `ProtectedRoute`
  guarding all dataset/import pages and `PublicOnlyRoute` keeping signed-in
  users off the login/signup pages.
- **Row Level Security**: every table (`datasets`, `dataset_columns`,
  `dataset_rows`) has RLS enabled with SELECT/INSERT/UPDATE/DELETE policies
  scoped to `auth.uid() = user_id`. Child tables additionally verify the
  parent dataset belongs to the same user before allowing an insert, so one
  user can never attach data to another user's dataset even by guessing an
  ID.
- **Environment variables**: only the Supabase project URL and the public/
  publishable (anon) key are ever used in frontend code. The service-role
  key must never be added here.
- **CSV input validation**: 20MB file-size cap, extension/MIME checks,
  malformed-row detection, per-cell type validation, and a "0 valid rows"
  hard stop — a single bad file can't crash the app.

## Local development

```bash
git clone <repository>
cd datalens
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev            # http://localhost:5173
```

## Scripts

```bash
npm run dev       # start the Vite dev server
npm run build     # tsc -b (type-check) then vite build → dist/
npm run lint      # oxlint
npm run test      # vitest — rule-engine unit tests
npm run preview   # serve the production build locally
```

## Deployment

DataLens is a static Vite/React app backed entirely by Supabase — no custom
server is required.

```
GitHub → Vercel → dist/ (build: npm run build, output: dist)
              ↓
          Supabase (Auth, PostgreSQL, RLS)
```

When configuring hosting, set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables in the hosting
provider's dashboard — never commit real values in `.env`. In Supabase's
Auth settings, make sure the production site URL and redirect URLs are
configured (local `http://localhost:5173` should not be the only allowed
redirect in production).

## Known limitations

- No automated tests beyond the rule-engine suite (`features/insights`) —
  the analytics engine and Supabase data-access layer are covered by manual
  testing only.
- No pagination/virtualization for very large record tables yet; CSV import
  is capped at 20MB and a soft warning appears above 50,000 rows.
- No CSV/PDF export exists beyond the browser's own print dialog.
