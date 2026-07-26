import type { DatasetColumnType } from '@/features/datasets/types';
import type { SemanticRole } from '@/features/import/types';

/**
 * The one shape the whole analytics engine works from. Deliberately not
 * `NormalizedDataset` (Phase 6's import-time type) or `DatasetWithData`
 * (Phase 6's storage type) directly — both get adapted into this so the
 * engine never has to care whether the data just came off a CSV or was
 * loaded back out of Supabase. See `lib/adapters.ts`.
 */
export interface AnalyzableColumn {
  /** Matches the key used in every row's data object. */
  name: string;
  displayName: string;
  columnType: DatasetColumnType;
  semanticRole: SemanticRole;
}

export interface AnalyzableDataset {
  name: string;
  rowCount: number;
  columns: AnalyzableColumn[];
  rows: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Dataset summary + per-column statistics
// ---------------------------------------------------------------------------

export interface NumericStats {
  kind: 'numeric';
  count: number;
  missingCount: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  range: number;
  stdDev: number;
  uniqueCount: number;
}

export interface CategoricalStats {
  kind: 'categorical';
  count: number;
  missingCount: number;
  uniqueCount: number;
  /** Most frequent values first, capped at 8. */
  topCategories: { value: string; count: number; percentage: number }[];
}

export interface DateStats {
  kind: 'date';
  count: number;
  missingCount: number;
  earliest: string;
  latest: string;
}

export type ColumnStatistics = NumericStats | CategoricalStats | DateStats;

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  numericColumnCount: number;
  categoricalColumnCount: number;
  dateColumnCount: number;
  /** Overall percentage of missing cells across all included columns. */
  missingPercentage: number;
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export interface KpiCandidate {
  column: string;
  label: string;
  value: number;
  /** How the value should be displayed. */
  format: 'integer' | 'decimal' | 'percentage';
  /** Why this column was chosen — surfaced for transparency, not shown by default. */
  reason: string;
}

// ---------------------------------------------------------------------------
// Relationships / correlation
// ---------------------------------------------------------------------------

export type CorrelationStrength = 'negligible' | 'weak' | 'moderate' | 'strong';

export interface CorrelationPair {
  columnA: string;
  columnB: string;
  r: number;
  strength: CorrelationStrength;
  direction: 'positive' | 'negative' | 'none';
  /** Number of paired observations the correlation was computed from. */
  sampleSize: number;
}

export interface GroupComparison {
  categoricalColumn: string;
  numericColumn: string;
  groups: { category: string; average: number; count: number }[];
}

// ---------------------------------------------------------------------------
// Chart recommendations
// ---------------------------------------------------------------------------

export type ChartRecommendation =
  | {
      type: 'histogram';
      title: string;
      column: string;
      reason: string;
    }
  | {
      type: 'categorical-distribution';
      /** Doughnut for low cardinality, bar once there are too many slices to read. */
      variant: 'doughnut' | 'bar';
      title: string;
      column: string;
      reason: string;
    }
  | {
      type: 'group-comparison';
      title: string;
      categoricalColumn: string;
      numericColumn: string;
      reason: string;
    }
  | {
      type: 'scatter';
      title: string;
      xColumn: string;
      yColumn: string;
      correlation: CorrelationPair | null;
      reason: string;
    }
  | {
      type: 'time-series';
      title: string;
      dateColumn: string;
      numericColumn: string;
      reason: string;
    };

// ---------------------------------------------------------------------------
// Data quality
// ---------------------------------------------------------------------------

export interface DataQualityWarning {
  level: 'warning' | 'info';
  message: string;
}

export interface DataQuality {
  summary: DatasetSummary;
  warnings: DataQualityWarning[];
}

// ---------------------------------------------------------------------------
// Aggregate result
// ---------------------------------------------------------------------------

export interface AnalyticsResult {
  summary: DatasetSummary;
  columnStatistics: Record<string, ColumnStatistics>;
  kpis: KpiCandidate[];
  correlations: CorrelationPair[];
  recommendations: ChartRecommendation[];
  dataQuality: DataQuality;
}
