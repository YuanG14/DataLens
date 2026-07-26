/**
 * One active filter on a column. Every dataset column is exactly one of
 * these three shapes — same three-way split Phase 7's `ColumnStatistics`
 * already uses, so a filter's shape always matches how that column's
 * stats were computed.
 */
export type ColumnFilter =
  | { kind: 'categorical'; column: string; selected: string[] }
  | { kind: 'numeric'; column: string; min: number | null; max: number | null }
  | { kind: 'date'; column: string; from: string | null; to: string | null };

/** What a filterable column looks like before the user has touched it — the bounds/choices to build a control from. */
export interface FilterOption {
  column: string;
  displayName: string;
  kind: 'categorical' | 'numeric' | 'date';
  /** Present only when kind === 'categorical'. Every distinct value, most frequent first. */
  values?: string[];
  /** Present only when kind === 'numeric'. */
  min?: number;
  max?: number;
  /** Present only when kind === 'date'. ISO yyyy-mm-dd. */
  earliest?: string;
  latest?: string;
}
