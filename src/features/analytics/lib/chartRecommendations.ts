import type { AnalyzableDataset, ChartRecommendation, CorrelationPair } from '@/features/analytics/types';
import {
  MAX_DOUGHNUT_CATEGORIES,
  analyzableCategoricalColumns,
  analyzableNumericColumns,
  dateColumns,
  uniqueRatio,
} from '@/features/analytics/lib/columnValues';

// Caps keep a wide dataset from producing an unreadable wall of charts —
// each is a deliberate "sensible limit", not an arbitrary one.
const MAX_HISTOGRAMS = 4;
const MAX_DISTRIBUTIONS = 4;
const MAX_GROUP_COMPARISONS = 3;
const MAX_SCATTERS = 3;
const MAX_TIME_SERIES = 3;

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function describeCorrelation(pair: CorrelationPair): string {
  if (pair.direction === 'none') return `No meaningful relationship detected (r = ${pair.r})`;
  const strengthWord = pair.strength === 'negligible' ? 'a negligible' : `a ${pair.strength}`;
  const directionWord = pair.direction === 'positive' ? 'positive' : 'negative';
  return `${strengthWord[0].toUpperCase()}${strengthWord.slice(1)} ${directionWord} relationship (r = ${pair.r}) — correlation, not causation`;
}

/**
 * The full set of chart recommendations for a dataset: numeric
 * distributions, categorical distributions, categorical+numeric group
 * comparisons, numeric+numeric scatter plots (backed by real correlation),
 * and date+numeric time series. Every recommendation traces back to a
 * column-type rule, never a specific field name.
 */
export function generateChartRecommendations(
  dataset: AnalyzableDataset,
  correlations: CorrelationPair[],
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];
  const numericCols = analyzableNumericColumns(dataset);
  const categoricalCols = analyzableCategoricalColumns(dataset);
  const dateCols = dateColumns(dataset);

  // 1. Numeric distribution -> histogram
  for (const col of numericCols.slice(0, MAX_HISTOGRAMS)) {
    recommendations.push({
      type: 'histogram',
      title: `${humanize(col.displayName || col.name)} Distribution`,
      column: col.name,
      reason: 'Numeric column — distribution shows the shape of the data',
    });
  }

  // 2. Categorical distribution -> doughnut (few categories) or bar (many)
  for (const col of categoricalCols.slice(0, MAX_DISTRIBUTIONS)) {
    const categoryCount = Math.round(uniqueRatio(dataset, col.name) * dataset.rowCount);
    recommendations.push({
      type: 'categorical-distribution',
      variant: categoryCount > MAX_DOUGHNUT_CATEGORIES ? 'bar' : 'doughnut',
      title: `${humanize(col.displayName || col.name)} Breakdown`,
      column: col.name,
      reason: 'Categorical column — shows how records are distributed across categories',
    });
  }

  // 3. Categorical + numeric -> group comparison bar chart
  let groupComparisonsAdded = 0;
  outer: for (const catCol of categoricalCols) {
    for (const numCol of numericCols) {
      if (groupComparisonsAdded >= MAX_GROUP_COMPARISONS) break outer;
      recommendations.push({
        type: 'group-comparison',
        title: `Average ${humanize(numCol.displayName || numCol.name)} by ${humanize(catCol.displayName || catCol.name)}`,
        categoricalColumn: catCol.name,
        numericColumn: numCol.name,
        reason: 'Categorical + numeric relationship',
      });
      groupComparisonsAdded++;
    }
  }

  // 4. Numeric + numeric -> scatter plot, backed by the strongest real correlations
  for (const pair of correlations.slice(0, MAX_SCATTERS)) {
    recommendations.push({
      type: 'scatter',
      title: `${humanize(pair.columnA)} vs ${humanize(pair.columnB)}`,
      xColumn: pair.columnA,
      yColumn: pair.columnB,
      correlation: pair,
      reason: describeCorrelation(pair),
    });
  }

  // 5. Date + numeric -> time series line chart
  let timeSeriesAdded = 0;
  outerDate: for (const dateCol of dateCols) {
    for (const numCol of numericCols) {
      if (timeSeriesAdded >= MAX_TIME_SERIES) break outerDate;
      recommendations.push({
        type: 'time-series',
        title: `${humanize(numCol.displayName || numCol.name)} Over Time`,
        dateColumn: dateCol.name,
        numericColumn: numCol.name,
        reason: 'Date + numeric relationship — trend over time',
      });
      timeSeriesAdded++;
    }
  }

  return recommendations;
}
