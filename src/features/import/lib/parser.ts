import Papa from 'papaparse';
import type { ParsedCsv, RawRow } from '@/features/import/types';
import { normalizeCell } from '@/features/import/lib/missingValues';

/** 20MB is generous for a CSV of survey/tabular data while still keeping parsing fast in-browser. */
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export type FileValidationError =
  | 'empty'
  | 'too-large'
  | 'wrong-extension'
  | 'wrong-mime-type';

const FILE_VALIDATION_MESSAGES: Record<FileValidationError, string> = {
  empty: 'This file is empty.',
  'too-large': 'This file is larger than 20MB. Try a smaller export or split it into multiple files.',
  'wrong-extension': 'Please select a .csv file.',
  'wrong-mime-type': "This doesn't look like a CSV file.",
};

export function describeFileValidationError(error: FileValidationError): string {
  return FILE_VALIDATION_MESSAGES[error];
}

/**
 * Cheap, synchronous checks before we spend time parsing: extension, MIME
 * type (when the browser supplies one — many OSes leave it blank for CSV,
 * so an empty type is not itself rejected), and size. Content is
 * validated separately, by actually parsing it.
 */
export function validateFile(file: File): FileValidationError | null {
  if (file.size === 0) return 'empty';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'too-large';
  if (!file.name.toLowerCase().endsWith('.csv')) return 'wrong-extension';
  if (file.type && !['text/csv', 'application/vnd.ms-excel', 'text/plain'].includes(file.type)) {
    return 'wrong-mime-type';
  }
  return null;
}

/**
 * Parses CSV text (already read from a file) into headers + rows,
 * normalizing missing-value tokens (see missingValues.ts) as it goes. Uses
 * PapaParse rather than a hand-rolled splitter so quoted commas, escaped
 * quotes ("" inside a quoted field), and rows with the wrong number of
 * columns are all handled correctly instead of silently producing garbage.
 */
export function parseCsvText(text: string, meta: { fileName: string; fileSizeBytes: number }): ParsedCsv {
  const results = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const headers = results.meta.fields ?? [];
  if (headers.length === 0) {
    throw new Error('No header row found — the first line of the file should list column names.');
  }

  const malformedRowCount = results.errors.filter((e) => e.type === 'FieldMismatch').length;

  const rows: RawRow[] = results.data.map((record) => {
    const row: RawRow = {};
    for (const header of headers) {
      row[header] = normalizeCell(record[header]);
    }
    return row;
  });

  return { fileName: meta.fileName, fileSizeBytes: meta.fileSizeBytes, headers, rows, malformedRowCount };
}

/**
 * Reads a File's contents as text and hands them to parseCsvText. Uses
 * Blob.text() (standard on File in every modern browser) rather than
 * PapaParse's own file-streaming mode, which depends on FileReader/
 * FileReaderSync — this keeps the actual parsing logic in parseCsvText,
 * where it can be unit-tested with plain strings.
 */
export async function parseCsvFile(file: File): Promise<ParsedCsv> {
  const text = await file.text();
  return parseCsvText(text, { fileName: file.name, fileSizeBytes: file.size });
}
