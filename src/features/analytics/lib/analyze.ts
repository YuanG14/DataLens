import type { AnalyzableDataset, AnalyticsResult } from '@/features/analytics/types';
import { computeAllColumnStatistics, computeDatasetSummary } from '@/features/analytics/lib/statistics';
import { generateKpiCandidates } from '@/features/analytics/lib/kpi';
import { computeCorrelationMatrix } from '@/features/analytics/lib/correlation';
import { generateChartRecommendations } from '@/features/analytics/lib/chartRecommendations';
import { computeDataQuality } from '@/features/analytics/lib/dataQuality';

/**
 * The single entry point Phase 7 exposes: normalized data in, full analytics
 * result out. Nothing downstream (KPI cards, chart grid, quality panel)
 * needs to know anything dataset-specific — it's all driven by this result.
 */
export function analyzeDataset(dataset: AnalyzableDataset): AnalyticsResult {
  const summary = computeDatasetSummary(dataset);
  const columnStatistics = computeAllColumnStatistics(dataset);
  const kpis = generateKpiCandidates(dataset);
  const correlations = computeCorrelationMatrix(dataset);
  const recommendations = generateChartRecommendations(dataset, correlations);
  const dataQuality = computeDataQuality(dataset, summary);

  return {
    summary,
    columnStatistics,
    kpis,
    correlations,
    recommendations,
    dataQuality,
  };
}
