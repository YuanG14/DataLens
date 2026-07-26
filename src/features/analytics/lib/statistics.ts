import type {
  AnalyzableDataset,
  CategoricalStats,
  ColumnStatistics,
  DateStats,
  DatasetSummary,
  NumericStats,
} from '@/features/analytics/types';
import {
  categoricalColumns,
  dateColumns,
  getNumericValues,
  getPresentStringValues,
  missingCountFor,
  numericColumns,
} from '@/features/analytics/lib/columnValues';

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function stdDev(values: number[], avg: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Linear-interpolation percentile (the same convention Excel/numpy's default use) over already-sorted values. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/** Pearson's moment coefficient of skewness (third standardized moment). 0 for values with no spread. */
function skewness(values: number[], avg: number, sd: number): number {
  if (values.length < 3 || sd === 0) return 0;
  const n = values.length;
  const thirdMoment = values.reduce((sum, v) => sum + ((v - avg) / sd) ** 3, 0) / n;
  return thirdMoment;
}

export function computeNumericStats(dataset: AnalyzableDataset, column: string): NumericStats {
  const values = getNumericValues(dataset, column);
  const avg = mean(values);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const sd = stdDev(values, avg);

  return {
    kind: 'numeric',
    count: values.length,
    missingCount: missingCountFor(dataset, column),
    mean: avg,
    median: median(values),
    min,
    max,
    range: max - min,
    stdDev: sd,
    uniqueCount: new Set(values).size,
    q1,
    q3,
    iqr: q3 - q1,
    skewness: skewness(values, avg, sd),
  };
}

export function computeCategoricalStats(dataset: AnalyzableDataset, column: string): CategoricalStats {
  const present = getPresentStringValues(dataset, column);
  const counts = new Map<string, number>();
  for (const value of present) counts.set(value, (counts.get(value) ?? 0) + 1);

  const topCategories = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([value, count]) => ({
      value,
      count,
      percentage: present.length > 0 ? (count / present.length) * 100 : 0,
    }));

  return {
    kind: 'categorical',
    count: present.length,
    missingCount: missingCountFor(dataset, column),
    uniqueCount: counts.size,
    topCategories,
  };
}

export function computeDateStats(dataset: AnalyzableDataset, column: string): DateStats {
  const present = getPresentStringValues(dataset, column);
  const timestamps = present.map((v) => Date.parse(v)).filter((t) => !Number.isNaN(t));

  return {
    kind: 'date',
    count: present.length,
    missingCount: missingCountFor(dataset, column),
    earliest: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString().slice(0, 10) : '',
    latest: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString().slice(0, 10) : '',
  };
}

/**
 * Computes the right kind of statistics for every column in the dataset,
 * keyed by column name. This is the one place that decides "numeric gets
 * numeric stats, categorical gets categorical stats" — nothing about a
 * specific field name.
 */
export function computeAllColumnStatistics(dataset: AnalyzableDataset): Record<string, ColumnStatistics> {
  const result: Record<string, ColumnStatistics> = {};

  for (const col of numericColumns(dataset)) {
    result[col.name] = computeNumericStats(dataset, col.name);
  }
  for (const col of categoricalColumns(dataset)) {
    result[col.name] = computeCategoricalStats(dataset, col.name);
  }
  for (const col of dateColumns(dataset)) {
    result[col.name] = computeDateStats(dataset, col.name);
  }

  return result;
}

export function computeDatasetSummary(dataset: AnalyzableDataset): DatasetSummary {
  const numeric = numericColumns(dataset);
  const categorical = categoricalColumns(dataset);
  const dates = dateColumns(dataset);

  const totalCells = dataset.rowCount * dataset.columns.length;
  const missingCells = dataset.columns.reduce((sum, col) => sum + missingCountFor(dataset, col.name), 0);

  return {
    rowCount: dataset.rowCount,
    columnCount: dataset.columns.length,
    numericColumnCount: numeric.length,
    categoricalColumnCount: categorical.length,
    dateColumnCount: dates.length,
    missingPercentage: totalCells > 0 ? (missingCells / totalCells) * 100 : 0,
  };
}
