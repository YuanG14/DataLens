import type { AnalyzableDataset, KpiCandidate } from '@/features/analytics/types';
import type { SemanticRole } from '@/features/import/types';
import { analyzableNumericColumns, getNumericValues } from '@/features/analytics/lib/columnValues';

/** Cap on how many KPI cards the dashboard shows by default. */
export const MAX_KPI_CANDIDATES = 8;

/**
 * Semantic roles that make an obviously good "Average X" KPI, ranked most
 * useful first. Roles not listed here (including the generic
 * 'numeric_measure' fallback) still get a candidate — just a lower
 * priority — so an unrecognized numeric column doesn't get skipped
 * entirely, it just sorts to the back.
 */
const ROLE_PRIORITY: Partial<Record<SemanticRole, number>> = {
  academic_performance: 10,
  score: 9,
  stress: 9,
  anxiety: 9,
  depression: 9,
  sleep: 8,
  screen_time: 8,
  age: 7,
  percentage: 7,
  numeric_measure: 3,
};

function humanizeColumnName(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatFor(role: SemanticRole, values: number[]): KpiCandidate['format'] {
  if (role === 'percentage') return 'percentage';
  const allWhole = values.length > 0 && values.every((v) => Number.isInteger(v));
  return allWhole ? 'integer' : 'decimal';
}

/**
 * Picks which numeric columns are worth showing as "Average X" KPI cards.
 * Identifiers and high-cardinality numeric columns are already excluded by
 * `analyzableNumericColumns`; this just orders what's left by how useful
 * the semantic role makes it, and caps the count so a wide dataset doesn't
 * produce dozens of cards.
 */
export function generateKpiCandidates(dataset: AnalyzableDataset): KpiCandidate[] {
  const candidates = analyzableNumericColumns(dataset)
    .map((col) => {
      const values = getNumericValues(dataset, col.name);
      if (values.length === 0) return null;

      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const priority = ROLE_PRIORITY[col.semanticRole] ?? 5;

      const candidate: KpiCandidate & { priority: number } = {
        column: col.name,
        label: `Average ${humanizeColumnName(col.displayName || col.name)}`,
        value: average,
        format: formatFor(col.semanticRole, values),
        reason:
          col.semanticRole === 'numeric_measure' || col.semanticRole === 'unknown'
            ? 'Numeric column with enough data to average'
            : `Recognized as a "${col.semanticRole.replace(/_/g, ' ')}" column`,
        priority,
      };
      return candidate;
    })
    .filter((c): c is KpiCandidate & { priority: number } => c !== null)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, MAX_KPI_CANDIDATES);

  return candidates.map(({ priority: _priority, ...rest }) => rest);
}
