import type { AnalyzableDataset, CorrelationPair, CorrelationStrength } from '@/features/analytics/types';
import { analyzableNumericColumns } from '@/features/analytics/lib/columnValues';

/** Below this many paired observations, a correlation isn't reliable enough to show. */
const MIN_OBSERVATIONS_FOR_CORRELATION = 3;

/**
 * Caps how many numeric columns get pairwise-compared. Above this, the
 * combinatorics (n choose 2) produce a matrix nobody can read — the roadmap
 * explicitly asks for "top relationships" instead of an unreadable grid.
 */
export const MAX_CORRELATION_COLUMNS = 8;

export function labelCorrelationStrength(r: number): CorrelationStrength {
  const abs = Math.abs(r);
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'negligible';
}

/** Pearson correlation coefficient over the rows where both columns have a value. */
export function pearsonCorrelation(pairsXY: [number, number][]): number {
  const n = pairsXY.length;
  if (n < MIN_OBSERVATIONS_FOR_CORRELATION) return 0;

  const xs = pairsXY.map((p) => p[0]);
  const ys = pairsXY.map((p) => p[1]);
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  const denominator = Math.sqrt(sumSqX * sumSqY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/** Every row where both columns have a coercible numeric value, as [x, y] pairs. */
function pairedNumericValues(dataset: AnalyzableDataset, columnA: string, columnB: string): [number, number][] {
  const pairs: [number, number][] = [];
  for (const row of dataset.rows) {
    const rawA = row[columnA];
    const rawB = row[columnB];
    if (rawA === null || rawA === undefined || rawA === '') continue;
    if (rawB === null || rawB === undefined || rawB === '') continue;
    const a = typeof rawA === 'number' ? rawA : Number(rawA);
    const b = typeof rawB === 'number' ? rawB : Number(rawB);
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    pairs.push([a, b]);
  }
  return pairs;
}

export function computeCorrelation(
  dataset: AnalyzableDataset,
  columnA: string,
  columnB: string,
): CorrelationPair | null {
  const pairs = pairedNumericValues(dataset, columnA, columnB);
  if (pairs.length < MIN_OBSERVATIONS_FOR_CORRELATION) return null;

  const r = pearsonCorrelation(pairs);
  return {
    columnA,
    columnB,
    r: Math.round(r * 100) / 100,
    strength: labelCorrelationStrength(r),
    direction: r === 0 ? 'none' : r > 0 ? 'positive' : 'negative',
    sampleSize: pairs.length,
  };
}

/**
 * Every pairwise correlation among the dataset's numeric columns, capped to
 * MAX_CORRELATION_COLUMNS columns (chosen deterministically — first N by
 * column order) to keep the matrix readable, sorted strongest-first.
 */
export function computeCorrelationMatrix(dataset: AnalyzableDataset): CorrelationPair[] {
  const columns = analyzableNumericColumns(dataset).slice(0, MAX_CORRELATION_COLUMNS);
  const pairs: CorrelationPair[] = [];

  for (let i = 0; i < columns.length; i++) {
    for (let j = i + 1; j < columns.length; j++) {
      const pair = computeCorrelation(dataset, columns[i].name, columns[j].name);
      if (pair) pairs.push(pair);
    }
  }

  return pairs.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}
