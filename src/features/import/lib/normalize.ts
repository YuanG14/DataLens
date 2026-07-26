import type { DatasetColumnType } from '@/features/datasets/types';
import type {
  ColumnOverride,
  DetectedDataType,
  DetectedSchema,
  NormalizedDataset,
  ParsedCsv,
} from '@/features/import/types';
import { normalizeColumnName } from '@/features/import/lib/roleDetect';

/**
 * Maps Phase 6's fine-grained detected type down to the four/five types the
 * `dataset_columns.column_type` check constraint actually allows. 'integer'
 * and 'number' both collapse to 'numeric' (the DB doesn't need to
 * distinguish them); an 'unknown' column is stored as 'text' rather than
 * blocking import — the user can still see and re-map it later.
 */
export function toDatasetColumnType(dataType: DetectedDataType): DatasetColumnType {
  switch (dataType) {
    case 'integer':
    case 'number':
      return 'numeric';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'string':
      return 'categorical';
    default:
      return 'text';
  }
}

function coerceValue(value: string | null, dataType: DetectedDataType): unknown {
  if (value === null) return null;
  switch (dataType) {
    case 'integer':
    case 'number':
      return Number(value);
    case 'boolean':
      return ['true', 'yes', 'y'].includes(value.toLowerCase());
    case 'date': {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? value : new Date(parsed).toISOString();
    }
    default:
      return value;
  }
}

export interface NormalizeOptions {
  /** Row indexes (from ValidationResult.rows.invalidRowIndexes) to leave out. */
  excludeRowIndexes?: number[];
}

/**
 * Turns the raw parse + detected schema + user overrides into the final
 * dataset-agnostic shape: every column carries both its detected type and
 * its semantic role, and every row's values are coerced to real JS types
 * (numbers, booleans, ISO date strings) instead of raw CSV text — this is
 * what Phase 7's analytics engine and `createDataset`/`insertDatasetRows`
 * both consume.
 */
export function normalizeDataset(
  parsed: ParsedCsv,
  schema: DetectedSchema,
  overrides: Record<string, ColumnOverride>,
  datasetName: string,
  options: NormalizeOptions = {},
): NormalizedDataset {
  const excluded = new Set(options.excludeRowIndexes ?? []);
  const includedColumns = schema.columns.filter((c) => overrides[c.originalName]?.included !== false);

  const columns = includedColumns.map((col) => {
    const override = overrides[col.originalName];
    const dataType = override?.dataType ?? col.dataType;
    return {
      name: col.originalName,
      normalizedName: normalizeColumnName(col.originalName),
      displayName: col.originalName,
      dataType,
      columnType: toDatasetColumnType(dataType),
      semanticRole: override?.semanticRole ?? col.semanticRole,
      confidence: col.confidence,
    };
  });

  const rows = parsed.rows
    .filter((_, index) => !excluded.has(index))
    .map((row) => {
      const normalizedRow: Record<string, unknown> = {};
      for (const col of columns) {
        normalizedRow[col.name] = coerceValue(row[col.name], col.dataType);
      }
      return normalizedRow;
    });

  return {
    name: datasetName,
    sourceFilename: parsed.fileName,
    rowCount: rows.length,
    columns,
    rows,
  };
}
