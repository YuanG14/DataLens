import type {
  ColumnOverride,
  DatasetValidationIssue,
  DetectedDataType,
  DetectedSchema,
  ParsedCsv,
  ValidationResult,
} from '@/features/import/types';
import { normalizeColumnName } from '@/features/import/lib/roleDetect';

/** A single dataset shouldn't blow up the browser tab — this is a soft ceiling that only produces a warning, not a hard limit. */
const LARGE_DATASET_ROW_WARNING = 50_000;

function effectiveDataType(
  columnName: string,
  schema: DetectedSchema,
  overrides: Record<string, ColumnOverride>,
): DetectedDataType {
  const override = overrides[columnName]?.dataType;
  if (override) return override;
  return schema.columns.find((c) => c.originalName === columnName)?.dataType ?? 'unknown';
}

function valueMatchesType(value: string, dataType: DetectedDataType): boolean {
  switch (dataType) {
    case 'integer':
      return /^-?\d+$/.test(value);
    case 'number':
      return /^-?\d+(\.\d+)?$/.test(value);
    case 'boolean':
      return ['true', 'false', 'yes', 'no', 'y', 'n'].includes(value.toLowerCase());
    case 'date':
      return !Number.isNaN(Date.parse(value));
    default:
      // 'string' and 'unknown' accept anything.
      return true;
  }
}

/**
 * Checks the dataset as a whole, then every row against the (possibly
 * user-edited) column types. A row with one bad cell doesn't sink the
 * whole import — it's counted as invalid and the caller decides whether to
 * skip it or cancel, per the "don't reject everything for one bad row"
 * requirement.
 */
export function validateDataset(
  parsed: ParsedCsv,
  schema: DetectedSchema,
  overrides: Record<string, ColumnOverride>,
): ValidationResult {
  const issues: DatasetValidationIssue[] = [];

  if (parsed.headers.length === 0) {
    issues.push({ level: 'error', message: 'No columns were found in this file.' });
  }
  if (parsed.rows.length === 0) {
    issues.push({ level: 'error', message: 'This file has no data rows.' });
  }

  const includedColumns = parsed.headers.filter((h) => overrides[h]?.included !== false);
  if (includedColumns.length === 0) {
    issues.push({ level: 'error', message: 'At least one column must be included to import.' });
  }

  const normalizedNames = includedColumns.map(normalizeColumnName);
  const duplicates = normalizedNames.filter((name, i) => normalizedNames.indexOf(name) !== i);
  if (duplicates.length > 0) {
    issues.push({
      level: 'error',
      message: `These columns normalize to the same name, which isn't allowed: ${[...new Set(duplicates)].join(', ')}.`,
    });
  }

  if (parsed.malformedRowCount > 0) {
    issues.push({
      level: 'warning',
      message: `${parsed.malformedRowCount} row${parsed.malformedRowCount > 1 ? 's have' : ' has'} an unexpected number of columns and will be skipped.`,
    });
  }

  if (parsed.rows.length > LARGE_DATASET_ROW_WARNING) {
    issues.push({
      level: 'warning',
      message: `This is a large file (${parsed.rows.length.toLocaleString()} rows) — import may take a moment.`,
    });
  }

  const invalidRowIndexes: number[] = [];
  parsed.rows.forEach((row, index) => {
    const rowIsValid = includedColumns.every((col) => {
      const value = row[col];
      if (value === null) return true; // missing is allowed, just not a type mismatch
      return valueMatchesType(value, effectiveDataType(col, schema, overrides));
    });
    if (!rowIsValid) invalidRowIndexes.push(index);
  });

  const rows = {
    validRowCount: parsed.rows.length - invalidRowIndexes.length,
    invalidRowCount: invalidRowIndexes.length,
    invalidRowIndexes,
  };

  if (rows.validRowCount === 0 && parsed.rows.length > 0) {
    issues.push({ level: 'error', message: 'No rows pass validation for the current column mapping.' });
  }

  const canImport = !issues.some((issue) => issue.level === 'error');

  return { issues, rows, canImport };
}
