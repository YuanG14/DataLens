import type { AnalyzableDataset, AnalyticsResult } from '@/features/analytics/types';
import { computeAllColumnStatistics, computeDatasetSummary } from '@/features/analytics/lib/statistics';
import { generateKpiCandidates } from '@/features/analytics/lib/kpi';
import { computeCorrelationMatrix } from '@/features/analytics/lib/correlation';
import { generateChartRecommendations } from '@/features/analytics/lib/chartRecommendations';
import { computeDataQuality } from '@/features/analytics/lib/dataQuality';
import { computeTrendAnalyses } from '@/features/analytics/lib/trendAnalysis';
import { computeAnomalies } from '@/features/analytics/lib/anomalyDetection';

/**
 * The single entry point Phase 7/9 expose: normalized data in, full
 * analytics result out. Nothing downstream (KPI cards, chart grid, quality
 * panel, insights) needs to know anything dataset-specific — it's all
 * driven by this result.
 */
export function analyzeDataset(dataset: AnalyzableDataset): AnalyticsResult {
  const summary = computeDatasetSummary(dataset);
  const columnStatistics = computeAllColumnStatistics(dataset);
  const kpis = generateKpiCandidates(dataset);
  const correlations = computeCorrelationMatrix(dataset);
  const recommendations = generateChartRecommendations(dataset, correlations);
  const dataQuality = computeDataQuality(dataset, summary);
  const trendAnalyses = computeTrendAnalyses(dataset);
  const anomalies = computeAnomalies(dataset, columnStatistics);

  return {
    summary,
    columnStatistics,
    kpis,
    correlations,
    recommendations,
    dataQuality,
    trendAnalyses,
    anomalies,
  };
}
