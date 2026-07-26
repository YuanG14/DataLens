import type { ColumnStats, DetectedDataType } from '@/features/import/types';

function missingCount(values: (string | null)[]): number {
  return values.filter((v) => v === null).length;
}

function uniqueCount(values: (string | null)[]): number {
  return new Set(values.filter((v): v is string => v !== null)).size;
}

function mostCommon(values: (string | null)[], limit = 5): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (v === null) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

/**
 * Builds the right shape of stats for a column depending on its detected
 * type — numeric columns get min/max/average, categorical columns get
 * frequency counts, date columns get a range. This is the metadata Phase 7
 * (the analytics engine) will read to decide what charts make sense.
 */
export function computeColumnStats(values: (string | null)[], dataType: DetectedDataType): ColumnStats {
  if (dataType === 'integer' || dataType === 'number') {
    const nums = values.filter((v): v is string => v !== null).map(Number);
    const sum = nums.reduce((acc, n) => acc + n, 0);
    return {
      kind: 'numeric',
      min: nums.length > 0 ? Math.min(...nums) : 0,
      max: nums.length > 0 ? Math.max(...nums) : 0,
      average: nums.length > 0 ? sum / nums.length : 0,
      missingCount: missingCount(values),
      uniqueCount: uniqueCount(values),
    };
  }

  if (dataType === 'date') {
    const timestamps = values.filter((v): v is string => v !== null).map((v) => Date.parse(v));
    return {
      kind: 'date',
      earliest: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString().slice(0, 10) : '',
      latest: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString().slice(0, 10) : '',
      missingCount: missingCount(values),
    };
  }

  // boolean, string, and unknown columns all get categorical-style stats —
  // frequency counts are meaningful for all three.
  return {
    kind: 'categorical',
    missingCount: missingCount(values),
    uniqueCount: uniqueCount(values),
    mostCommon: mostCommon(values),
  };
}
