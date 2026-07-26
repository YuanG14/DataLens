import type { AnalyzableDataset, AnomalyPoint, ColumnAnomalies, ColumnStatistics } from '@/features/analytics/types';
import { analyzableNumericColumns } from '@/features/analytics/lib/columnValues';

/** Below this many present values, quartiles are too noisy to call anything an "anomaly" rather than just a small sample. */
const MIN_VALUES_FOR_ANOMALY_DETECTION = 8;

/** Classic Tukey boxplot fences: 1.5×IQR is the conventional "mild outlier" cutoff, 3×IQR is "extreme". */
const MILD_OUTLIER_MULTIPLIER = 1.5;
const EXTREME_OUTLIER_MULTIPLIER = 3;

const MAX_OUTLIERS_PER_COLUMN = 10;

/**
 * IQR-based outlier detection (Tukey's fences) for every analyzable numeric
 * column. Deliberately not a z-score method — z-scores assume a roughly
 * normal distribution and are themselves distorted by the very outliers
 * they're trying to find; the IQR method is robust to that and is the
 * standard choice for "does this dataset have unusual values" without
 * assuming a distribution shape.
 */
export function computeAnomalies(dataset: AnalyzableDataset, columnStatistics: Record<string, ColumnStatistics>): ColumnAnomalies[] {
  const results: ColumnAnomalies[] = [];

  for (const col of analyzableNumericColumns(dataset)) {
    const stats = columnStatistics[col.name];
    if (!stats || stats.kind !== 'numeric') continue;
    if (stats.count < MIN_VALUES_FOR_ANOMALY_DETECTION) continue;
    if (stats.iqr === 0) continue; // no spread — every present value is identical, nothing can be "unusual"

    const lowerBound = stats.q1 - MILD_OUTLIER_MULTIPLIER * stats.iqr;
    const upperBound = stats.q3 + MILD_OUTLIER_MULTIPLIER * stats.iqr;
    const extremeLower = stats.q1 - EXTREME_OUTLIER_MULTIPLIER * stats.iqr;
    const extremeUpper = stats.q3 + EXTREME_OUTLIER_MULTIPLIER * stats.iqr;

    const outliers: AnomalyPoint[] = [];
    dataset.rows.forEach((row, rowIndex) => {
      const raw = row[col.name];
      if (raw === null || raw === undefined || raw === '') return;
      const value = typeof raw === 'number' ? raw : Number(raw);
      if (Number.isNaN(value)) return;
      if (value < lowerBound || value > upperBound) {
        const severity: AnomalyPoint['severity'] = value < extremeLower || value > extremeUpper ? 'extreme' : 'mild';
        outliers.push({ rowIndex, value, severity });
      }
    });

    if (outliers.length === 0) continue;

    // Most extreme (furthest from the nearer bound) first, so the capped
    // top-10 shown to the user are the ones most worth looking at.
    outliers.sort((a, b) => {
      const distance = (v: number) => Math.min(Math.abs(v - lowerBound), Math.abs(v - upperBound));
      return distance(b.value) - distance(a.value);
    });

    results.push({
      column: col.name,
      lowerBound: Math.round(lowerBound * 100) / 100,
      upperBound: Math.round(upperBound * 100) / 100,
      outliers: outliers.slice(0, MAX_OUTLIERS_PER_COLUMN),
      outlierCount: outliers.length,
      outlierPercentage: (outliers.length / stats.count) * 100,
    });
  }

  return results.sort((a, b) => b.outlierPercentage - a.outlierPercentage);
}
