import type { AnalyzableDataset, ColumnStatistics } from '@/features/analytics/types';
import { analyzableCategoricalColumns, analyzableNumericColumns, dateColumns } from '@/features/analytics/lib';
import type { FilterOption } from '@/features/filters/types';

/**
 * Filter controls are built once from the *unfiltered* dataset's column
 * statistics, not recomputed as filters get applied — otherwise a numeric
 * slider's own min/max would shrink every time you moved it, which reads
 * as broken rather than as filtering. Only inclusion criteria (which
 * columns count as categorical/numeric/date) come from the same
 * `analyzable*Columns` helpers Phase 7 already uses, so a column that's
 * excluded from charts (an identifier, near-unique free text) is excluded
 * here too.
 */
export function buildFilterOptions(dataset: AnalyzableDataset, columnStatistics: Record<string, ColumnStatistics>): FilterOption[] {
  const options: FilterOption[] = [];

  for (const col of analyzableCategoricalColumns(dataset)) {
    const stats = columnStatistics[col.name];
    if (!stats || stats.kind !== 'categorical' || stats.uniqueCount === 0) continue;
    // topCategories is capped at 8 for display elsewhere, but a filter control
    // needs every distinct value, so it's rebuilt directly from the rows here.
    const counts = new Map<string, number>();
    for (const row of dataset.rows) {
      const raw = row[col.name];
      if (raw === null || raw === undefined || raw === '') continue;
      const value = String(raw);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    const values = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value);
    if (values.length < 2) continue; // nothing to filter if every row shares one value

    options.push({ column: col.name, displayName: col.displayName || col.name, kind: 'categorical', values });
  }

  for (const col of analyzableNumericColumns(dataset)) {
    const stats = columnStatistics[col.name];
    if (!stats || stats.kind !== 'numeric' || stats.count === 0 || stats.min === stats.max) continue;
    options.push({ column: col.name, displayName: col.displayName || col.name, kind: 'numeric', min: stats.min, max: stats.max });
  }

  for (const col of dateColumns(dataset)) {
    const stats = columnStatistics[col.name];
    if (!stats || stats.kind !== 'date' || !stats.earliest || stats.earliest === stats.latest) continue;
    options.push({ column: col.name, displayName: col.displayName || col.name, kind: 'date', earliest: stats.earliest, latest: stats.latest });
  }

  return options;
}
