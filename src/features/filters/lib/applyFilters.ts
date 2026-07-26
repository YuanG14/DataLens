import type { AnalyzableDataset } from '@/features/analytics/types';
import type { ColumnFilter } from '@/features/filters/types';

function isActive(filter: ColumnFilter): boolean {
  if (filter.kind === 'categorical') return filter.selected.length > 0;
  if (filter.kind === 'numeric') return filter.min !== null || filter.max !== null;
  return filter.from !== null || filter.to !== null;
}

function rowPasses(row: Record<string, unknown>, filter: ColumnFilter): boolean {
  const raw = row[filter.column];

  if (filter.kind === 'categorical') {
    if (raw === null || raw === undefined || raw === '') return false;
    return filter.selected.includes(String(raw));
  }

  if (filter.kind === 'numeric') {
    if (raw === null || raw === undefined || raw === '') return false;
    const value = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isNaN(value)) return false;
    if (filter.min !== null && value < filter.min) return false;
    if (filter.max !== null && value > filter.max) return false;
    return true;
  }

  // date
  if (raw === null || raw === undefined || raw === '') return false;
  const timestamp = Date.parse(String(raw));
  if (Number.isNaN(timestamp)) return false;
  if (filter.from !== null && timestamp < Date.parse(filter.from)) return false;
  if (filter.to !== null && timestamp > Date.parse(filter.to)) return false;
  return true;
}

/**
 * Filters rows only — columns and their metadata are untouched, so
 * everything downstream (Phase 7 analytics, Phase 8 insights, Phase 9
 * trend/anomaly analysis) just sees a smaller `AnalyzableDataset` and
 * recomputes on it exactly as it would on any other dataset. A row must
 * pass every active filter (AND, not OR) to remain.
 */
export function applyFilters(dataset: AnalyzableDataset, filters: ColumnFilter[]): AnalyzableDataset {
  const active = filters.filter(isActive);
  if (active.length === 0) return dataset;

  const rows = dataset.rows.filter((row) => active.every((filter) => rowPasses(row, filter)));
  return { ...dataset, rows, rowCount: rows.length };
}
