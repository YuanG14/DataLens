import type { AnalyzableDataset } from '@/features/analytics/types';

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

/**
 * Builds a sorted, one-point-per-day time series for a date+numeric column
 * pair. Multiple rows on the same date are averaged together rather than
 * plotted as separate points — the roadmap explicitly warns not to assume
 * one row equals one day.
 */
export function computeTimeSeries(dataset: AnalyzableDataset, dateColumn: string, numericColumn: string): TimeSeriesPoint[] {
  const byDate = new Map<string, { sum: number; count: number }>();

  for (const row of dataset.rows) {
    const rawDate = row[dateColumn];
    const rawValue = row[numericColumn];
    if (rawDate === null || rawDate === undefined || rawDate === '') continue;
    if (rawValue === null || rawValue === undefined || rawValue === '') continue;

    const parsed = Date.parse(String(rawDate));
    if (Number.isNaN(parsed)) continue;
    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    if (Number.isNaN(value)) continue;

    const dayKey = new Date(parsed).toISOString().slice(0, 10);
    const entry = byDate.get(dayKey) ?? { sum: 0, count: 0 };
    entry.sum += value;
    entry.count += 1;
    byDate.set(dayKey, entry);
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([date, { sum, count }]) => ({ date, value: sum / count }));
}
