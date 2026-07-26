import type { AnalyzableDataset, GroupComparison } from '@/features/analytics/types';
import { MAX_CHART_CATEGORIES } from '@/features/analytics/lib/columnValues';

/**
 * Average of `numericColumn`, grouped by every value present in
 * `categoricalColumn`. Rows missing either value are left out of that
 * group's average rather than treated as a "missing" category — matches
 * the roadmap's "simply analyze the data that exists" instruction.
 */
export function computeGroupComparison(
  dataset: AnalyzableDataset,
  categoricalColumn: string,
  numericColumn: string,
): GroupComparison {
  const sums = new Map<string, { sum: number; count: number }>();

  for (const row of dataset.rows) {
    const rawCategory = row[categoricalColumn];
    const rawValue = row[numericColumn];
    if (rawCategory === null || rawCategory === undefined || rawCategory === '') continue;
    if (rawValue === null || rawValue === undefined || rawValue === '') continue;

    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    if (Number.isNaN(value)) continue;

    const category = String(rawCategory);
    const entry = sums.get(category) ?? { sum: 0, count: 0 };
    entry.sum += value;
    entry.count += 1;
    sums.set(category, entry);
  }

  const groups = [...sums.entries()]
    .map(([category, { sum, count }]) => ({ category, average: sum / count, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_CHART_CATEGORIES);

  return { categoricalColumn, numericColumn, groups };
}
