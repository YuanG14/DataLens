import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnalyzableDataset, AnalyticsResult } from '@/features/analytics/types';
import { generateInsights } from '@/features/insights/lib';
import type { Insight } from '@/features/insights/types';

export type InsightsStatus = 'initial' | 'loading' | 'success' | 'error';

interface UseDatasetInsightsResult {
  status: InsightsStatus;
  insights: Insight[];
  isSensitiveDomain: boolean;
  canRegenerate: boolean;
  /** Size of the ranked insight pool (excludes the always-shown summary card). 0 means no relationships, trends, group differences, or quality warnings were found. */
  poolSize: number;
  error: string | null;
  generate: () => void;
  regenerate: () => void;
}

// Purely a UX pause so "Generating insights…" is perceptible — the engine
// itself is synchronous local computation, not a network call.
const GENERATION_DELAY_MS = 500;

export function useDatasetInsights(dataset: AnalyzableDataset | null, analytics: AnalyticsResult | null): UseDatasetInsightsResult {
  const [status, setStatus] = useState<InsightsStatus>('initial');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isSensitiveDomain, setIsSensitiveDomain] = useState(false);
  const [poolSize, setPoolSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const roundRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A different dataset invalidates whatever insights were showing.
  useEffect(() => {
    setStatus('initial');
    setInsights([]);
    setError(null);
    roundRef.current = 0;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dataset, analytics]);

  const run = useCallback(
    (round: number) => {
      if (!dataset || !analytics) return;
      setStatus('loading');
      setError(null);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        try {
          const result = generateInsights(dataset, analytics, { offset: round * 4, variant: round });
          setInsights(result.insights);
          setIsSensitiveDomain(result.isSensitiveDomain);
          setPoolSize(result.poolSize);
          setStatus('success');
        } catch {
          // The analytics dashboard must keep working even if insight generation fails.
          setStatus('error');
          setError('Unable to generate insights. Your statistical analytics are still available.');
        }
      }, GENERATION_DELAY_MS);
    },
    [dataset, analytics],
  );

  const generate = useCallback(() => {
    roundRef.current = 0;
    run(0);
  }, [run]);

  const regenerate = useCallback(() => {
    roundRef.current += 1;
    run(roundRef.current);
  }, [run]);

  return {
    status,
    insights,
    isSensitiveDomain,
    canRegenerate: poolSize > 3,
    poolSize,
    error,
    generate,
    regenerate,
  };
}
