import type { AnalyzableDataset, DataQuality, DataQualityWarning, DatasetSummary } from '@/features/analytics/types';
import { HIGH_CARDINALITY_RATIO, missingCountFor, uniqueRatio } from '@/features/analytics/lib/columnValues';

const HIGH_MISSING_THRESHOLD = 0.1; // 10% missing on a single column is worth flagging
const HIGH_UNIQUE_CATEGORY_COUNT = 15; // a categorical column with this many distinct values is unwieldy to chart

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function computeDataQuality(dataset: AnalyzableDataset, summary: DatasetSummary): DataQuality {
  const warnings: DataQualityWarning[] = [];

  if (dataset.rowCount === 0) {
    warnings.push({ level: 'warning', message: 'This dataset has no rows to analyze.' });
    return { summary, warnings };
  }

  for (const col of dataset.columns) {
    const missing = missingCountFor(dataset, col.name);
    const missingRatio = missing / dataset.rowCount;
    if (missingRatio >= HIGH_MISSING_THRESHOLD) {
      warnings.push({
        level: 'warning',
        message: `${Math.round(missingRatio * 100)}% of ${humanize(col.displayName || col.name)} values are missing`,
      });
    }

    if (col.columnType === 'categorical') {
      const ratio = uniqueRatio(dataset, col.name);
      const approxUnique = Math.round(ratio * dataset.rowCount);
      if (ratio >= HIGH_CARDINALITY_RATIO && dataset.rowCount > 5) {
        warnings.push({
          level: 'info',
          message: `${humanize(col.displayName || col.name)} looks like an identifier (nearly all values are unique) and is excluded from charts`,
        });
      } else if (approxUnique > HIGH_UNIQUE_CATEGORY_COUNT) {
        warnings.push({
          level: 'info',
          message: `${humanize(col.displayName || col.name)} contains ${approxUnique} unique categories`,
        });
      }
    }
  }

  return { summary, warnings };
}
