import type { DetectedDataType } from '@/features/import/types';

const BOOLEAN_TOKENS = new Set(['true', 'false', 'yes', 'no', 'y', 'n']);

const INTEGER_PATTERN = /^-?\d+$/;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
// ISO (2026-01-01), slash (01/01/2026 or 2026/01/01), or dash (01-01-2026) —
// deliberately requires a separator so plain numbers never match.
const DATE_PATTERN = /^\d{4}-\d{1,2}-\d{1,2}$|^\d{1,2}\/\d{1,2}\/\d{2,4}$|^\d{1,2}-\d{1,2}-\d{4}$/;

/**
 * Looks at every non-missing value in a column and picks the type that all
 * (or an overwhelming majority of) values agree on. We check the most
 * specific type first (boolean, then date, then integer, then number) so
 * e.g. a column of "0"/"1" isn't accidentally called a date, and one where
 * every value happens to be a whole number is called 'integer' rather than
 * the more general 'number'.
 *
 * Note: bare "0"/"1" values are classified as integer, not boolean — only
 * explicit words (true/false/yes/no/y/n) count as boolean, since 0/1 is
 * just as likely to be a numeric label (like a depression score) as a flag.
 */
export function detectColumnType(values: (string | null)[]): DetectedDataType {
  const present = values.filter((v): v is string => v !== null);
  if (present.length === 0) return 'unknown';

  const lower = present.map((v) => v.toLowerCase());

  if (lower.every((v) => BOOLEAN_TOKENS.has(v))) return 'boolean';
  if (present.every((v) => DATE_PATTERN.test(v) && !Number.isNaN(Date.parse(v)))) return 'date';
  if (present.every((v) => INTEGER_PATTERN.test(v))) return 'integer';
  if (present.every((v) => NUMBER_PATTERN.test(v))) return 'number';

  // Mixed bag of plain, mostly-alphabetic text -> string. If it's a
  // scattered mix of numbers and text (inconsistent data), 'unknown' is
  // more honest than forcing it into 'string'.
  const looksLikeText = present.every((v) => /[a-zA-Z]/.test(v));
  return looksLikeText ? 'string' : 'unknown';
}
