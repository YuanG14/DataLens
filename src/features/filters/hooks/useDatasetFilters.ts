import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AnalyzableDataset, ColumnStatistics } from '@/features/analytics/types';
import { applyFilters, buildFilterOptions } from '@/features/filters/lib';
import type { ColumnFilter } from '@/features/filters/types';

function emptyFilterFor(column: string, kind: ColumnFilter['kind']): ColumnFilter {
  if (kind === 'categorical') return { kind, column, selected: [] };
  if (kind === 'numeric') return { kind, column, min: null, max: null };
  return { kind, column, from: null, to: null };
}

export function useDatasetFilters(dataset: AnalyzableDataset | null, columnStatistics: Record<string, ColumnStatistics> | null) {
  const [filters, setFilters] = useState<ColumnFilter[]>([]);

  // A different dataset invalidates whatever filters were set up for the last one.
  useEffect(() => {
    setFilters([]);
  }, [dataset]);

  const options = useMemo(
    () => (dataset && columnStatistics ? buildFilterOptions(dataset, columnStatistics) : []),
    [dataset, columnStatistics],
  );

  const filteredDataset = useMemo(() => (dataset ? applyFilters(dataset, filters) : null), [dataset, filters]);

  const addFilter = useCallback(
    (column: string, kind: ColumnFilter['kind']) => {
      setFilters((current) => (current.some((f) => f.column === column) ? current : [...current, emptyFilterFor(column, kind)]));
    },
    [],
  );

  const updateFilter = useCallback((column: string, next: ColumnFilter) => {
    setFilters((current) => current.map((f) => (f.column === column ? next : f)));
  }, []);

  const removeFilter = useCallback((column: string) => {
    setFilters((current) => current.filter((f) => f.column !== column));
  }, []);

  const clearFilters = useCallback(() => setFilters([]), []);

  const activeCount = filters.filter((f) =>
    f.kind === 'categorical' ? f.selected.length > 0 : f.kind === 'numeric' ? f.min !== null || f.max !== null : f.from !== null || f.to !== null,
  ).length;

  return { filters, options, filteredDataset, activeCount, addFilter, updateFilter, removeFilter, clearFilters };
}
