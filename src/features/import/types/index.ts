import type { DatasetColumnType } from '@/features/datasets/types';

/**
 * Fine-grained type Phase 6 infers by looking at a column's actual values.
 * This is intentionally more granular than `DatasetColumnType` (the four/five
 * types the `dataset_columns` table can store) — 'integer' vs 'number' is
 * useful in the mapping UI, but the database only needs 'numeric'. See
 * `toDatasetColumnType` in `lib/normalize.ts` for the mapping down.
 */
export type DetectedDataType = 'string' | 'integer' | 'number' | 'boolean' | 'date' | 'unknown';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Semantic roles the mapper can guess from a column's name/type. Mental-
 * health-specific roles are included because it's this app's primary use
 * case, but every role here is optional — a column left as 'unknown' just
 * means the user picks the role themselves, nothing breaks.
 */
export type SemanticRole =
  | 'identifier'
  | 'name'
  | 'age'
  | 'gender'
  | 'date'
  | 'category'
  | 'numeric_measure'
  | 'score'
  | 'percentage'
  | 'boolean'
  | 'stress'
  | 'anxiety'
  | 'depression'
  | 'sleep'
  | 'screen_time'
  | 'academic_performance'
  | 'unknown';

/** One raw parsed row: values keyed by the CSV's original header text. */
export type RawRow = Record<string, string | null>;

export interface ParsedCsv {
  fileName: string;
  fileSizeBytes: number;
  /** Original header strings, in file order. */
  headers: string[];
  rows: RawRow[];
  /** Rows PapaParse flagged as malformed (wrong field count, etc). */
  malformedRowCount: number;
}

export interface NumericColumnStats {
  kind: 'numeric';
  min: number;
  max: number;
  average: number;
  missingCount: number;
  uniqueCount: number;
}

export interface CategoricalColumnStats {
  kind: 'categorical';
  missingCount: number;
  uniqueCount: number;
  /** Up to 5 most frequent raw values, most common first. */
  mostCommon: { value: string; count: number }[];
}

export interface DateColumnStats {
  kind: 'date';
  earliest: string;
  latest: string;
  missingCount: number;
}

export type ColumnStats = NumericColumnStats | CategoricalColumnStats | DateColumnStats;

export interface DetectedColumn {
  /** Original header exactly as it appeared in the CSV. */
  originalName: string;
  /** Lowercased, trimmed, non-alphanumeric-stripped — used for alias matching. */
  normalizedName: string;
  dataType: DetectedDataType;
  semanticRole: SemanticRole;
  confidence: ConfidenceLevel;
  stats: ColumnStats;
}

export interface DetectedSchema {
  columns: DetectedColumn[];
}

/** User-editable overrides layered on top of what detection guessed. */
export interface ColumnOverride {
  dataType?: DetectedDataType;
  semanticRole?: SemanticRole;
  /** Set to false to exclude this column from the imported dataset entirely. */
  included?: boolean;
}

export interface RowValidationResult {
  validRowCount: number;
  invalidRowCount: number;
  /** Index (into ParsedCsv.rows) of each row that failed validation. */
  invalidRowIndexes: number[];
}

export interface DatasetValidationIssue {
  level: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  issues: DatasetValidationIssue[];
  rows: RowValidationResult;
  /** False if any 'error'-level issue is present — blocks import. */
  canImport: boolean;
}

/** Fully normalized, dataset-agnostic shape ready for createDataset/insertDatasetRows. */
export interface NormalizedDataset {
  name: string;
  sourceFilename: string;
  rowCount: number;
  columns: {
    name: string;
    normalizedName: string;
    displayName: string;
    dataType: DetectedDataType;
    columnType: DatasetColumnType;
    semanticRole: SemanticRole;
    confidence: ConfidenceLevel;
  }[];
  /** Rows keyed by original column name, values coerced to their detected type (or null). */
  rows: Record<string, unknown>[];
}

export type ImportStep = 'upload' | 'preview' | 'map' | 'validate' | 'import' | 'done';

export const IMPORT_STEPS: { id: ImportStep; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Preview' },
  { id: 'map', label: 'Review Schema' },
  { id: 'validate', label: 'Validate' },
  { id: 'import', label: 'Import' },
];
