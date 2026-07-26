import type { AnalyzableColumn, AnalyzableDataset } from '@/features/analytics/types';

/**
 * A column counts as an "identifier" (excluded from KPIs, histograms, and
 * group comparisons) if almost every value is unique — that's the signal
 * an ID/UUID/row-number column gives regardless of what it's named,
 * matching the roadmap's "avoid IDs, avoid high-cardinality numeric
 * identifiers" requirement without hardcoding column names.
 */
export const HIGH_CARDINALITY_RATIO = 0.9;

/** Categories beyond this count are considered "too many" for a doughnut chart. */
export const MAX_DOUGHNUT_CATEGORIES = 6;

/** Hard ceiling on how many categories a distribution chart will ever plot. */
export const MAX_CHART_CATEGORIES = 12;

export function getRawValues(dataset: AnalyzableDataset, column: string): unknown[] {
  return dataset.rows.map((row) => row[column]);
}

/** Non-null numeric values for a column, coercing anything Number() can parse. */
export function getNumericValues(dataset: AnalyzableDataset, column: string): number[] {
  const values: number[] = [];
  for (const row of dataset.rows) {
    const raw = row[column];
    if (raw === null || raw === undefined || raw === '') continue;
    const num = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isNaN(num)) values.push(num);
  }
  return values;
}

/** Non-null values for a column, stringified — used for categorical/date frequency work. */
export function getPresentStringValues(dataset: AnalyzableDataset, column: string): string[] {
  const values: string[] = [];
  for (const row of dataset.rows) {
    const raw = row[column];
    if (raw === null || raw === undefined || raw === '') continue;
    values.push(String(raw));
  }
  return values;
}

export function missingCountFor(dataset: AnalyzableDataset, column: string): number {
  return dataset.rows.filter((row) => {
    const raw = row[column];
    return raw === null || raw === undefined || raw === '';
  }).length;
}

export function uniqueRatio(dataset: AnalyzableDataset, column: string): number {
  if (dataset.rowCount === 0) return 0;
  const present = getPresentStringValues(dataset, column);
  if (present.length === 0) return 0;
  return new Set(present).size / dataset.rowCount;
}

/**
 * Below this many rows, "nearly every value is unique" is expected for any
 * ordinary numeric measure (e.g. 4 stress scores out of 10 are very likely
 * to all differ) — it isn't evidence of an identifier column. The ratio
 * heuristic only becomes meaningful once there's enough rows for repeats
 * to be a reasonable expectation. Below this threshold we rely solely on
 * the semantic-role check (name-based identifier detection), which isn't
 * sample-size dependent.
 */
const MIN_ROWS_FOR_CARDINALITY_CHECK = 20;

export function isHighCardinality(dataset: AnalyzableDataset, column: AnalyzableColumn): boolean {
  if (dataset.rowCount < MIN_ROWS_FOR_CARDINALITY_CHECK) return false;
  return uniqueRatio(dataset, column.name) >= HIGH_CARDINALITY_RATIO;
}

export function numericColumns(dataset: AnalyzableDataset): AnalyzableColumn[] {
  return dataset.columns.filter((c) => c.columnType === 'numeric');
}

export function categoricalColumns(dataset: AnalyzableDataset): AnalyzableColumn[] {
  return dataset.columns.filter((c) => c.columnType === 'categorical' || c.columnType === 'boolean');
}

export function dateColumns(dataset: AnalyzableDataset): AnalyzableColumn[] {
  return dataset.columns.filter((c) => c.columnType === 'date');
}

/**
 * Numeric columns that make sense as KPIs/histograms/correlation inputs —
 * excludes identifier-like columns. Deliberately does NOT use the
 * cardinality-ratio heuristic here (unlike the categorical version below):
 * a continuous measure like price or revenue is *expected* to be almost
 * entirely unique in any reasonably sized dataset, so that ratio can't
 * distinguish "this is an ID" from "this is just a real-valued
 * measurement" — only the name-based semantic-role detector can. Relying
 * on cardinality here silently dropped exactly the kind of column
 * correlation/trend/anomaly analysis most needs to see.
 */
export function analyzableNumericColumns(dataset: AnalyzableDataset): AnalyzableColumn[] {
  return numericColumns(dataset).filter((col) => col.semanticRole !== 'identifier');
}

/** Categorical columns worth charting — excludes identifier-like and near-unique free text. */
export function analyzableCategoricalColumns(dataset: AnalyzableDataset): AnalyzableColumn[] {
  return categoricalColumns(dataset).filter(
    (col) => col.semanticRole !== 'identifier' && col.semanticRole !== 'name' && !isHighCardinality(dataset, col),
  );
}
