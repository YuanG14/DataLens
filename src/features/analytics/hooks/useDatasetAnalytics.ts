import { useMemo } from 'react';
import type { AnalyzableDataset } from '@/features/analytics/types';
import { analyzeDataset } from '@/features/analytics/lib';

/**
 * Runs the analytics engine once per distinct dataset and caches the
 * result — statistics, correlations, and chart recommendations are all
 * derived state, so they shouldn't be recalculated on every render (e.g.
 * every keystroke in an unrelated filter).
 */
export function useDatasetAnalytics(dataset: AnalyzableDataset | null) {
  return useMemo(() => (dataset ? analyzeDataset(dataset) : null), [dataset]);
}
