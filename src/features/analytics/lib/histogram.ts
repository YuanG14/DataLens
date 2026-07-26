export interface HistogramBin {
  label: string;
  count: number;
}

/**
 * Buckets numeric values into evenly-sized bins (Chart.js has no built-in
 * histogram type, so this turns raw values into bar-chart-ready buckets).
 * Falls back to one bin per distinct value when the range is degenerate
 * (all values identical) so a constant column doesn't divide by zero.
 */
export function buildHistogramBins(values: number[], binCount = 8): HistogramBin[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ label: `${min}`, count: values.length }];
  }

  const binSize = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, () => 0);

  for (const value of values) {
    const index = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[index]++;
  }

  return bins.map((count, i) => {
    const start = min + i * binSize;
    const end = i === binCount - 1 ? max : start + binSize;
    return { label: `${start.toFixed(1)}–${end.toFixed(1)}`, count };
  });
}
