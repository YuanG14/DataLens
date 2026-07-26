import type { AnalyzableColumn, AnalyzableDataset } from '@/features/analytics/types';
import type { DatasetColumnType, DatasetWithData } from '@/features/datasets/types';
import type { DetectedDataType, NormalizedDataset } from '@/features/import/types';
import { detectSemanticRole, normalizeColumnName } from '@/features/import/lib/roleDetect';

/** Straight passthrough — the import wizard's NormalizedDataset already carries everything the engine needs. */
export function fromNormalizedDataset(dataset: NormalizedDataset): AnalyzableDataset {
  return {
    name: dataset.name,
    rowCount: dataset.rowCount,
    columns: dataset.columns.map((col) => ({
      name: col.name,
      displayName: col.displayName,
      columnType: col.columnType,
      semanticRole: col.semanticRole,
    })),
    rows: dataset.rows,
  };
}

/** Coarse stand-in for the fine-grained DetectedDataType — dataset_columns only persists the 5-way DatasetColumnType. */
function representativeDataType(columnType: DatasetColumnType): DetectedDataType {
  switch (columnType) {
    case 'numeric':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    default:
      return 'string';
  }
}

/**
 * A dataset loaded back from Supabase (`datasets`/`dataset_columns`/`dataset_rows`)
 * doesn't have `semanticRole` persisted anywhere — only the coarse
 * `columnType` is stored. This re-runs Phase 6's own (deterministic,
 * explainable) role detector against the column name and its actual stored
 * values, so a reloaded dataset gets the same KPI/chart prioritization a
 * freshly-imported one would.
 */
export function fromDatasetWithData(dataset: DatasetWithData): AnalyzableDataset {
  const rows = dataset.rows.map((r) => r.data);
  const rowCount = rows.length;

  const columns: AnalyzableColumn[] = [...dataset.columns]
    .sort((a, b) => a.position - b.position)
    .map((col) => {
      const values = rows.map((row) => row[col.name]);
      const present = values.filter((v) => v !== null && v !== undefined && v !== '');
      const uniqueCount = new Set(present.map((v) => String(v))).size;
      const uniqueRatio = rowCount > 0 ? uniqueCount / rowCount : 0;

      const { role } = detectSemanticRole(col.name, representativeDataType(col.columnType), uniqueRatio);

      return {
        name: col.name,
        displayName: col.displayName ?? col.name,
        columnType: col.columnType,
        semanticRole: role,
      };
    });

  return {
    name: dataset.name,
    rowCount,
    columns,
    rows,
  };
}

// Re-exported so callers don't need to reach into import/lib directly just for this.
export { normalizeColumnName };
