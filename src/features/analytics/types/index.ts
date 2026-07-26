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
  /** 25th percentile. */
  q1: number;
  /** 75th percentile. */
  q3: number;
  /** q3 - q1; the spread the IQR-based anomaly detector is built on. */
  iqr: number;
  /** Third standardized moment. ~0 is symmetric, >0 right-skewed (long tail high), <0 left-skewed. */
  skewness: number;
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
  /** Two-tailed p-value from a t-test on r, under the null hypothesis that the true correlation is 0. */
  pValue: number;
  /** pValue < 0.05. A correlation can be non-negligible in size and still not be statistically significant with a small sample. */
  significant: boolean;
}

export interface GroupComparison {
  categoricalColumn: string;
  numericColumn: string;
  groups: { category: string; average: number; count: number }[];
}

// ---------------------------------------------------------------------------
// Trend analysis (Phase 9)
// ---------------------------------------------------------------------------

export interface TrendAnalysis {
  dateColumn: string;
  numericColumn: string;
  /** Change in the numeric value per day, from an ordinary-least-squares fit against elapsed days. */
  slopePerDay: number;
  /** R² of the linear fit — how well a straight line explains the movement (0-1). */
  rSquared: number;
  direction: 'increasing' | 'decreasing' | 'flat';
  /** Two-tailed p-value testing whether the slope is different from 0. */
  pValue: number;
  significant: boolean;
  pointCount: number;
}

// ---------------------------------------------------------------------------
// Anomaly detection (Phase 9)
// ---------------------------------------------------------------------------

export interface AnomalyPoint {
  rowIndex: number;
  value: number;
  severity: 'mild' | 'extreme';
}

export interface ColumnAnomalies {
  column: string;
  lowerBound: number;
  upperBound: number;
  /** Most extreme first, capped at 10. */
  outliers: AnomalyPoint[];
  outlierCount: number;
  outlierPercentage: number;
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
  trendAnalyses: TrendAnalysis[];
  anomalies: ColumnAnomalies[];
}
