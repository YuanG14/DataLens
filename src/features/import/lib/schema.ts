import type { DetectedColumn, DetectedSchema, ParsedCsv } from '@/features/import/types';
import { detectColumnType } from '@/features/import/lib/typeDetect';
import { computeColumnStats } from '@/features/import/lib/stats';
import { detectSemanticRole, normalizeColumnName } from '@/features/import/lib/roleDetect';

/**
 * Runs schema detection over an entire parsed CSV: for every column, infers
 * its data type from the actual values (never just the header name),
 * computes summary statistics, and guesses a semantic role. This is the
 * single entry point the "Review Schema" step and Phase 7 both build on.
 */
export function detectSchema(parsed: ParsedCsv): DetectedSchema {
  const columns: DetectedColumn[] = parsed.headers.map((originalName) => {
    const values = parsed.rows.map((row) => row[originalName]);
    const dataType = detectColumnType(values);
    const stats = computeColumnStats(values, dataType);
    const uniqueCount = stats.kind === 'numeric' || stats.kind === 'categorical' ? stats.uniqueCount : 0;
    const uniqueRatio = parsed.rows.length > 0 ? uniqueCount / parsed.rows.length : 0;
    const { role, confidence } = detectSemanticRole(originalName, dataType, uniqueRatio);

    return {
      originalName,
      normalizedName: normalizeColumnName(originalName),
      dataType,
      semanticRole: role,
      confidence,
      stats,
    };
  });

  return { columns };
}
