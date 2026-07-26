/**
 * The five column types Phase 6's CSV type-detection will assign, and what
 * every later phase (analytics engine, dashboard rendering) branches on.
 * Kept identical to the `check` constraint in
 * supabase/migrations/0002_create_datasets_schema.sql — if you add a type
 * here, add it there too.
 */
export type DatasetColumnType = 'numeric' | 'categorical' | 'boolean' | 'date' | 'text';

export interface Dataset {
  id: number;
  name: string;
  description: string | null;
  sourceFilename: string | null;
  createdAt: string;
}

export interface DatasetColumn {
  id: number;
  datasetId: number;
  /** Original CSV header, e.g. "daily_social_media_hours". */
  name: string;
  /** Optional human-friendly label, e.g. "Daily Social Media Hours". */
  displayName: string | null;
  columnType: DatasetColumnType;
  /** Column order as it appeared in the source CSV. */
  position: number;
}

/**
 * One imported CSV row. `data` is keyed by DatasetColumn.name — deliberately
 * loose (`unknown`) rather than typed per-dataset, since a dataset's actual
 * shape isn't known until runtime (that's the whole point of this model).
 * Consumers should read values via the matching DatasetColumn.columnType,
 * not assume a type here.
 */
export interface DatasetRow {
  id: number;
  datasetId: number;
  rowIndex: number;
  data: Record<string, unknown>;
}

/** A column definition to create alongside a new dataset. */
export interface NewDatasetColumn {
  name: string;
  displayName?: string;
  columnType: DatasetColumnType;
  position: number;
}

export interface DatasetWithData extends Dataset {
  columns: DatasetColumn[];
  rows: DatasetRow[];
}
