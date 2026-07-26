import type { AnalyzableDataset, ChartRecommendation, GroupComparison } from '@/features/analytics/types';
import { computeGroupComparison, computeTimeSeries } from '@/features/analytics/lib';
import type { TimeSeriesPoint } from '@/features/analytics/lib/timeSeries';

export interface TrendEvidence {
  dateColumn: string;
  numericColumn: string;
  points: TimeSeriesPoint[];
  /** Difference between the second-half average and the first-half average. */
  delta: number;
  direction: 'increasing' | 'decreasing' | 'flat';
}

/**
 * Group comparisons and time series aren't part of `AnalyticsResult` itself
 * (see Phase 7's `RecommendedCharts.tsx`, which derives them the same way)
 * — this recomputes them from the same chart recommendations so the
 * insight engine looks at exactly what the dashboard is already showing,
 * never a separate calculation.
 */
export function deriveGroupComparisons(dataset: AnalyzableDataset, recommendations: ChartRecommendation[]): GroupComparison[] {
  return recommendations
    .filter((rec): rec is Extract<ChartRecommendation, { type: 'group-comparison' }> => rec.type === 'group-comparison')
    .map((rec) => computeGroupComparison(dataset, rec.categoricalColumn, rec.numericColumn))
    .filter((comparison) => comparison.groups.length >= 2);
}

const MIN_POINTS_FOR_TREND = 4;

export function deriveTrends(dataset: AnalyzableDataset, recommendations: ChartRecommendation[]): TrendEvidence[] {
  const trends: TrendEvidence[] = [];

  for (const rec of recommendations) {
    if (rec.type !== 'time-series') continue;
    const points = computeTimeSeries(dataset, rec.dateColumn, rec.numericColumn);
    if (points.length < MIN_POINTS_FOR_TREND) continue;

    const mid = Math.floor(points.length / 2);
    const firstHalf = points.slice(0, mid);
    const secondHalf = points.slice(mid);
    const avg = (pts: TimeSeriesPoint[]) => pts.reduce((sum, p) => sum + p.value, 0) / pts.length;
    const firstAvg = avg(firstHalf);
    const secondAvg = avg(secondHalf);
    const delta = secondAvg - firstAvg;

    // A move smaller than 5% of the first-half average isn't worth calling a trend.
    const threshold = Math.abs(firstAvg) * 0.05;
    const direction: TrendEvidence['direction'] = Math.abs(delta) < threshold ? 'flat' : delta > 0 ? 'increasing' : 'decreasing';

    trends.push({ dateColumn: rec.dateColumn, numericColumn: rec.numericColumn, points, delta, direction });
  }

  return trends;
}
