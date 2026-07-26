import type { AnalyzableDataset, TrendAnalysis } from '@/features/analytics/types';
import { analyzableNumericColumns, dateColumns } from '@/features/analytics/lib/columnValues';
import { pearsonCorrelation } from '@/features/analytics/lib/correlation';
import { computeTimeSeries } from '@/features/analytics/lib/timeSeries';
import { correlationPValue, isSignificant } from '@/features/analytics/lib/significance';

const MIN_POINTS_FOR_TREND = 4;
// Keeps the date-column × numeric-column combinatorics bounded on wide datasets,
// same rationale as MAX_CORRELATION_COLUMNS in correlation.ts.
const MAX_DATE_COLUMNS = 3;
const MAX_NUMERIC_COLUMNS = 6;

/** A trend is only worth calling "increasing"/"decreasing" if the move is both statistically significant and not tiny relative to where it started. */
const MIN_RELATIVE_MOVE = 0.05;

/**
 * Ordinary-least-squares fit of `value` against elapsed days since the
 * first point, over the one-point-per-day series `computeTimeSeries`
 * already builds. Reuses `pearsonCorrelation` for r (R² = r²) and the same
 * t-test used for correlation significance, since testing "is this slope
 * 0" is the identical test to "is this correlation 0" for simple
 * regression.
 */
export function computeTrendAnalyses(dataset: AnalyzableDataset): TrendAnalysis[] {
  const dates = dateColumns(dataset).slice(0, MAX_DATE_COLUMNS);
  const numerics = analyzableNumericColumns(dataset).slice(0, MAX_NUMERIC_COLUMNS);
  const results: TrendAnalysis[] = [];

  for (const dateCol of dates) {
    for (const numCol of numerics) {
      const points = computeTimeSeries(dataset, dateCol.name, numCol.name);
      if (points.length < MIN_POINTS_FOR_TREND) continue;

      const firstDay = Date.parse(points[0].date);
      const xs = points.map((p) => (Date.parse(p.date) - firstDay) / (1000 * 60 * 60 * 24));
      const ys = points.map((p) => p.value);

      const n = xs.length;
      const meanX = xs.reduce((s, v) => s + v, 0) / n;
      const meanY = ys.reduce((s, v) => s + v, 0) / n;
      const sumXY = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
      const sumXX = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
      if (sumXX === 0) continue; // every point landed on the same day — no time axis to regress against

      const slopePerDay = sumXY / sumXX;
      const r = pearsonCorrelation(xs.map((x, i) => [x, ys[i]] as [number, number]));
      const rSquared = r * r;
      const pValue = correlationPValue(r, n);
      const significant = isSignificant(pValue);

      const firstValue = ys[0];
      const totalMove = slopePerDay * (xs[n - 1] - xs[0]);
      const relativeMove = firstValue !== 0 ? Math.abs(totalMove) / Math.abs(firstValue) : Math.abs(totalMove);

      const direction: TrendAnalysis['direction'] =
        !significant || relativeMove < MIN_RELATIVE_MOVE ? 'flat' : slopePerDay > 0 ? 'increasing' : 'decreasing';

      results.push({
        dateColumn: dateCol.name,
        numericColumn: numCol.name,
        slopePerDay: Math.round(slopePerDay * 10000) / 10000,
        rSquared: Math.round(rSquared * 1000) / 1000,
        direction,
        pValue: Math.round(pValue * 10000) / 10000,
        significant,
        pointCount: n,
      });
    }
  }

  return results.sort((a, b) => b.rSquared - a.rSquared);
}
