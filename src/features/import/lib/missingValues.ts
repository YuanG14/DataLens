/**
 * Raw strings that mean "no value" rather than a literal piece of data.
 * Matched case-insensitively after trimming, so " N/A ", "null", and "NA"
 * all count. A cell that's just whitespace also counts (that's the "" / " "
 * cases from the spec).
 */
const MISSING_TOKENS = new Set(['', 'null', 'n/a', 'na', 'nan', 'none', '-']);

/**
 * Normalizes a raw CSV cell: returns null for anything that represents a
 * missing value, otherwise the trimmed original string. We deliberately
 * *don't* try to guess further — a value like "0" or "false" is real data,
 * not a missing marker, even though it might look empty-ish in some domains.
 */
export function normalizeCell(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (MISSING_TOKENS.has(trimmed.toLowerCase())) return null;
  return trimmed;
}
