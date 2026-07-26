import type { AnalyzableDataset, AnalyticsResult, CorrelationPair, GroupComparison, KpiCandidate } from '@/features/analytics/types';
import type { Insight, InsightConfidence } from '@/features/insights/types';
import { deriveGroupComparisons, deriveTrends, type TrendEvidence } from '@/features/insights/lib/evidence';

const SENSITIVE_ROLES = new Set(['stress', 'anxiety', 'depression']);

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatKpiValue(kpi: KpiCandidate): string {
  if (kpi.format === 'percentage') return `${Math.round(kpi.value * 10) / 10}%`;
  if (kpi.format === 'integer') return `${Math.round(kpi.value)}`;
  return `${Math.round(kpi.value * 100) / 100}`;
}

/** A candidate insight plus the score used to rank it against every other non-summary candidate. */
interface ScoredInsight {
  insight: Insight;
  score: number;
}

// ---------------------------------------------------------------------------
// Summary — always shown, always first, never competes for a ranking slot.
// ---------------------------------------------------------------------------

function buildSummaryInsight(dataset: AnalyzableDataset, analytics: AnalyticsResult, variant: number): Insight {
  const { summary } = analytics;
  const parts: string[] = [`${summary.numericColumnCount} numeric`];
  if (summary.categoricalColumnCount > 0) parts.push(`${summary.categoricalColumnCount} categorical`);
  if (summary.dateColumnCount > 0) parts.push(`${summary.dateColumnCount} date`);

  const description =
    variant === 0
      ? `This dataset contains ${summary.rowCount.toLocaleString()} records across ${summary.columnCount} variables, including ${parts.join(', ')} fields.`
      : `${dataset.name} has ${summary.rowCount.toLocaleString()} rows and ${summary.columnCount} columns — a mix of ${parts.join(', ')} fields.`;

  return {
    id: 'summary',
    category: 'summary',
    title: 'Dataset Overview',
    description,
    evidence: `${summary.rowCount} rows × ${summary.columnCount} columns`,
    confidence: 'high',
  };
}

// ---------------------------------------------------------------------------
// Key findings — the top KPI(s) already prioritized by Phase 7.
// ---------------------------------------------------------------------------

function buildKeyFindingInsights(kpis: KpiCandidate[]): ScoredInsight[] {
  return kpis.slice(0, 3).map((kpi, index) => ({
    score: 55 - index * 5,
    insight: {
      id: `kpi-${kpi.column}`,
      category: 'key-finding',
      title: kpi.label,
      description: `${kpi.label} across this dataset is ${formatKpiValue(kpi)}.`,
      evidence: `${kpi.label} = ${formatKpiValue(kpi)}`,
      confidence: 'medium',
    },
  }));
}

// ---------------------------------------------------------------------------
// Relationships — correlations, always phrased as association not causation.
// ---------------------------------------------------------------------------

function relationshipConfidence(pair: CorrelationPair): InsightConfidence {
  if (pair.strength === 'strong') return 'high';
  if (pair.strength === 'moderate') return 'medium';
  return 'low';
}

function buildRelationshipInsights(correlations: CorrelationPair[], variant: number): ScoredInsight[] {
  return correlations
    .filter((pair) => pair.strength !== 'negligible')
    .map((pair) => {
      const colA = humanize(pair.columnA);
      const colB = humanize(pair.columnB);
      const strengthWord = pair.strength;
      const directionPhrase = pair.direction === 'positive' ? 'tend to rise together' : 'move in opposite directions';

      const description =
        variant === 0
          ? `${colA} and ${colB} show a ${strengthWord} ${pair.direction} relationship in this sample — the two ${directionPhrase}. This describes an association in the data, not a cause-and-effect relationship.`
          : `Records with higher ${colA} ${pair.direction === 'positive' ? 'also tend to have higher' : 'tend to have lower'} ${colB} (${strengthWord} relationship). Correlation, not causation.`;

      return {
        score: Math.abs(pair.r) * 100,
        insight: {
          id: `corr-${pair.columnA}-${pair.columnB}`,
          category: 'relationship' as const,
          title: `${colA} & ${colB}`,
          description,
          evidence: `r = ${pair.r} (n = ${pair.sampleSize})`,
          confidence: relationshipConfidence(pair),
        },
      };
    });
}

// ---------------------------------------------------------------------------
// Group differences
// ---------------------------------------------------------------------------

function groupDifferenceConfidence(comparison: GroupComparison, relativeGap: number): InsightConfidence {
  const smallestGroup = Math.min(...comparison.groups.map((g) => g.count));
  if (smallestGroup < 5) return 'low';
  if (relativeGap >= 0.4) return 'high';
  if (relativeGap >= 0.15) return 'medium';
  return 'low';
}

function buildGroupDifferenceInsights(comparisons: GroupComparison[], variant: number): ScoredInsight[] {
  return comparisons
    .map((comparison) => {
      const sorted = [...comparison.groups].sort((a, b) => b.average - a.average);
      const highest = sorted[0];
      const lowest = sorted[sorted.length - 1];
      if (highest.category === lowest.category) return null;

      const overallAvg = comparison.groups.reduce((s, g) => s + g.average * g.count, 0) / comparison.groups.reduce((s, g) => s + g.count, 0);
      const relativeGap = overallAvg !== 0 ? (highest.average - lowest.average) / Math.abs(overallAvg) : 0;
      if (relativeGap < 0.05) return null;

      const numericLabel = humanize(comparison.numericColumn);
      const categoricalLabel = humanize(comparison.categoricalColumn);
      const round = (n: number) => Math.round(n * 100) / 100;

      const description =
        variant === 0
          ? `Average ${numericLabel} varies by ${categoricalLabel}: ${highest.category} averages ${round(highest.average)}, compared with ${round(lowest.average)} for ${lowest.category}.`
          : `Among ${categoricalLabel} groups, ${highest.category} has the highest average ${numericLabel} (${round(highest.average)}), while ${lowest.category} has the lowest (${round(lowest.average)}).`;

      const insight: ScoredInsight = {
        score: relativeGap * 80,
        insight: {
          id: `group-${comparison.categoricalColumn}-${comparison.numericColumn}`,
          category: 'group-difference',
          title: `${numericLabel} by ${categoricalLabel}`,
          description,
          evidence: `${highest.category}: ${round(highest.average)} (n=${highest.count}) vs ${lowest.category}: ${round(lowest.average)} (n=${lowest.count})`,
          confidence: groupDifferenceConfidence(comparison, relativeGap),
        },
      };
      return insight;
    })
    .filter((x): x is ScoredInsight => x !== null);
}

// ---------------------------------------------------------------------------
// Trends
// ---------------------------------------------------------------------------

function trendConfidence(trend: TrendEvidence): InsightConfidence {
  if (trend.points.length >= 8) return 'high';
  if (trend.points.length >= 6) return 'medium';
  return 'low';
}

function buildTrendInsights(trends: TrendEvidence[], variant: number): ScoredInsight[] {
  return trends
    .filter((t) => t.direction !== 'flat')
    .map((trend) => {
      const numericLabel = humanize(trend.numericColumn);
      const dateLabel = humanize(trend.dateColumn);
      const firstAvg = trend.points[0]?.value ?? 0;
      const relativeMove = firstAvg !== 0 ? Math.abs(trend.delta) / Math.abs(firstAvg) : 0;

      const description =
        variant === 0
          ? `Average ${numericLabel} has been ${trend.direction} over the period covered by ${dateLabel} in this dataset.`
          : `Looking across ${dateLabel}, ${numericLabel} trends ${trend.direction} over time in this sample.`;

      return {
        score: relativeMove * 70,
        insight: {
          id: `trend-${trend.dateColumn}-${trend.numericColumn}`,
          category: 'trend' as const,
          title: `${numericLabel} Trend`,
          description,
          evidence: `${trend.direction === 'increasing' ? '+' : ''}${Math.round(trend.delta * 100) / 100} change, second half vs first half`,
          confidence: trendConfidence(trend),
        },
      };
    });
}

// ---------------------------------------------------------------------------
// Data quality
// ---------------------------------------------------------------------------

function buildDataQualityInsights(analytics: AnalyticsResult): ScoredInsight[] {
  return analytics.dataQuality.warnings
    .filter((w) => w.level === 'warning')
    .map((warning, index) => ({
      score: 45 - index * 5,
      insight: {
        id: `quality-${index}`,
        category: 'data-quality' as const,
        title: 'Data Quality',
        description: `${warning.message}, which may affect analysis involving this field.`,
        evidence: warning.message,
        confidence: 'medium' as const,
      },
    }));
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

const TARGET_INSIGHT_COUNT = 5;

export function isSensitiveDomain(dataset: AnalyzableDataset): boolean {
  return dataset.columns.some((col) => SENSITIVE_ROLES.has(col.semanticRole));
}

/**
 * Turns Phase 7's `AnalyticsResult` into a short, prioritized list of
 * plain-English insights. Every insight is generated from a rule keyed off
 * an actual computed value (a correlation, a KPI, a group average, a
 * warning) — nothing here can produce a title/description/evidence set
 * that doesn't correspond to a real number already sitting in `analytics`.
 *
 * `offset` shifts which slice of the ranked, non-summary pool gets shown —
 * this is what "Regenerate" uses to surface the next-most-relevant
 * insights instead of repeating the same ones. `variant` swaps in
 * alternate phrasing for the same facts.
 */
export function generateInsights(
  dataset: AnalyzableDataset,
  analytics: AnalyticsResult,
  options: { offset?: number; variant?: number } = {},
): { insights: Insight[]; isSensitiveDomain: boolean; poolSize: number } {
  const offset = options.offset ?? 0;
  const variant = (options.variant ?? 0) % 2;

  const groupComparisons = deriveGroupComparisons(dataset, analytics.recommendations);
  const trends = deriveTrends(dataset, analytics.recommendations);

  const pool: ScoredInsight[] = [
    ...buildKeyFindingInsights(analytics.kpis),
    ...buildRelationshipInsights(analytics.correlations, variant),
    ...buildGroupDifferenceInsights(groupComparisons, variant),
    ...buildTrendInsights(trends, variant),
    ...buildDataQualityInsights(analytics),
  ].sort((a, b) => b.score - a.score);

  const summary = buildSummaryInsight(dataset, analytics, variant);
  const remainingSlots = TARGET_INSIGHT_COUNT - 1;

  const rotated = pool.length > 0 ? [...pool.slice(offset % pool.length), ...pool.slice(0, offset % pool.length)] : [];
  const chosen = rotated.slice(0, remainingSlots).map((s) => s.insight);

  return {
    insights: [summary, ...chosen],
    isSensitiveDomain: isSensitiveDomain(dataset),
    poolSize: pool.length,
  };
}
