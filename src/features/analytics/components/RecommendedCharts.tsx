import { useMemo } from 'react';
import type { AnalyzableDataset, ChartRecommendation, ColumnStatistics } from '@/features/analytics/types';
import { buildHistogramBins, computeGroupComparison, computeTimeSeries, getNumericValues } from '@/features/analytics/lib';
import { HistogramChart } from '@/features/analytics/components/charts/HistogramChart';
import { CategoricalDistributionChart } from '@/features/analytics/components/charts/CategoricalDistributionChart';
import { GroupComparisonChart } from '@/features/analytics/components/charts/GroupComparisonChart';
import { ScatterRelationshipChart } from '@/features/analytics/components/charts/ScatterRelationshipChart';
import { TimeSeriesChart } from '@/features/analytics/components/charts/TimeSeriesChart';
import { EmptyChartState } from '@/features/analytics/components/EmptyChartState';

interface RecommendedChartsProps {
  dataset: AnalyzableDataset;
  recommendations: ChartRecommendation[];
  columnStatistics: Record<string, ColumnStatistics>;
}

/**
 * Chart Configuration -> Chart Renderer step: each recommendation is just a
 * config (type + which columns + why), this component is what actually
 * computes the numbers for that specific chart and picks the matching
 * presentational component. Keeping this separate from the analytics
 * engine means adding a new chart type never touches the recommendation
 * logic.
 */
export function RecommendedCharts({ dataset, recommendations, columnStatistics }: RecommendedChartsProps) {
  const scatterPointsCache = useMemo(() => {
    const cache = new Map<string, { x: number; y: number }[]>();
    for (const rec of recommendations) {
      if (rec.type !== 'scatter') continue;
      const points: { x: number; y: number }[] = [];
      for (const row of dataset.rows) {
        const rawX = row[rec.xColumn];
        const rawY = row[rec.yColumn];
        if (rawX === null || rawX === undefined || rawX === '') continue;
        if (rawY === null || rawY === undefined || rawY === '') continue;
        const x = typeof rawX === 'number' ? rawX : Number(rawX);
        const y = typeof rawY === 'number' ? rawY : Number(rawY);
        if (Number.isNaN(x) || Number.isNaN(y)) continue;
        points.push({ x, y });
      }
      cache.set(`${rec.xColumn}|${rec.yColumn}`, points);
    }
    return cache;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset, recommendations]);

  if (recommendations.length === 0) {
    return <EmptyChartState title="Recommended Visualizations" message="No suitable columns were found to chart yet." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {recommendations.map((rec, index) => {
        switch (rec.type) {
          case 'histogram': {
            const values = getNumericValues(dataset, rec.column);
            if (values.length === 0) return <EmptyChartState key={index} title={rec.title} />;
            return <HistogramChart key={index} title={rec.title} bins={buildHistogramBins(values)} />;
          }

          case 'categorical-distribution': {
            const stats = columnStatistics[rec.column];
            if (!stats || stats.kind !== 'categorical' || stats.topCategories.length === 0) {
              return <EmptyChartState key={index} title={rec.title} />;
            }
            return <CategoricalDistributionChart key={index} title={rec.title} variant={rec.variant} stats={stats} />;
          }

          case 'group-comparison': {
            const comparison = computeGroupComparison(dataset, rec.categoricalColumn, rec.numericColumn);
            if (comparison.groups.length === 0) return <EmptyChartState key={index} title={rec.title} />;
            return <GroupComparisonChart key={index} title={rec.title} comparison={comparison} />;
          }

          case 'scatter': {
            const points = scatterPointsCache.get(`${rec.xColumn}|${rec.yColumn}`) ?? [];
            if (points.length === 0) return <EmptyChartState key={index} title={rec.title} />;
            return (
              <ScatterRelationshipChart
                key={index}
                title={rec.title}
                xLabel={rec.xColumn}
                yLabel={rec.yColumn}
                points={points}
                correlation={rec.correlation}
              />
            );
          }

          case 'time-series': {
            const points = computeTimeSeries(dataset, rec.dateColumn, rec.numericColumn);
            if (points.length === 0) return <EmptyChartState key={index} title={rec.title} />;
            return <TimeSeriesChart key={index} title={rec.title} yLabel={rec.numericColumn} points={points} />;
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
