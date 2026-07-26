import { supabase } from '@/lib/supabase/client';
import type { Dataset, DatasetColumn, DatasetRow, DatasetWithData, NewDatasetColumn } from '@/features/datasets/types';

const DATASETS_TABLE = 'datasets';
const COLUMNS_TABLE = 'dataset_columns';
const ROWS_TABLE = 'dataset_rows';

// Supabase returns raw snake_case column names; these map each row shape to
// the camelCase types the rest of the app uses.

interface DatasetRowShape {
  id: number;
  name: string;
  description: string | null;
  source_filename: string | null;
  created_at: string;
}

function mapDataset(row: DatasetRowShape): Dataset {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sourceFilename: row.source_filename,
    createdAt: row.created_at,
  };
}

interface DatasetColumnRowShape {
  id: number;
  dataset_id: number;
  name: string;
  display_name: string | null;
  column_type: DatasetColumn['columnType'];
  position: number;
}

function mapColumn(row: DatasetColumnRowShape): DatasetColumn {
  return {
    id: row.id,
    datasetId: row.dataset_id,
    name: row.name,
    displayName: row.display_name,
    columnType: row.column_type,
    position: row.position,
  };
}

interface DatasetRowDataShape {
  id: number;
  dataset_id: number;
  row_index: number;
  data: Record<string, unknown>;
}

function mapRow(row: DatasetRowDataShape): DatasetRow {
  return {
    id: row.id,
    datasetId: row.dataset_id,
    rowIndex: row.row_index,
    data: row.data,
  };
}

/** Lists the current user's datasets (newest first), not their contents. */
export async function listDatasets(): Promise<Dataset[]> {
  const { data, error } = await supabase
    .from(DATASETS_TABLE)
    .select('id, name, description, source_filename, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDataset);
}

/**
 * Creates a dataset and its column definitions together. Rows are added
 * separately via insertDatasetRows, since a large CSV's rows are usually
 * inserted in batches right after this.
 */
export async function createDataset(
  name: string,
  columns: NewDatasetColumn[],
  options?: { description?: string; sourceFilename?: string },
): Promise<Dataset> {
  const { data: datasetRow, error: datasetError } = await supabase
    .from(DATASETS_TABLE)
    .insert({
      name,
      description: options?.description ?? null,
      source_filename: options?.sourceFilename ?? null,
    })
    .select('id, name, description, source_filename, created_at')
    .single();

  if (datasetError) throw datasetError;
  const dataset = mapDataset(datasetRow);

  const { error: columnsError } = await supabase.from(COLUMNS_TABLE).insert(
    columns.map((column) => ({
      dataset_id: dataset.id,
      name: column.name,
      display_name: column.displayName ?? null,
      column_type: column.columnType,
      position: column.position,
    })),
  );

  if (columnsError) throw columnsError;
  return dataset;
}

/** Appends rows to an existing dataset, batched to stay under PostgREST's payload limit. */
export async function insertDatasetRows(
  datasetId: number,
  rows: Record<string, unknown>[],
): Promise<void> {
  const BATCH_SIZE = 500;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE).map((data, offsetInBatch) => ({
      dataset_id: datasetId,
      row_index: i + offsetInBatch,
      data,
    }));

    const { error } = await supabase.from(ROWS_TABLE).insert(batch);
    if (error) throw error;
  }
}

/** Loads one dataset along with its column definitions and all of its rows. */
export async function fetchDatasetWithData(datasetId: number): Promise<DatasetWithData> {
  const [{ data: datasetRow, error: datasetError }, { data: columnRows, error: columnsError }, { data: rowRows, error: rowsError }] =
    await Promise.all([
      supabase
        .from(DATASETS_TABLE)
        .select('id, name, description, source_filename, created_at')
        .eq('id', datasetId)
        .single(),
      supabase
        .from(COLUMNS_TABLE)
        .select('id, dataset_id, name, display_name, column_type, position')
        .eq('dataset_id', datasetId)
        .order('position', { ascending: true }),
      supabase
        .from(ROWS_TABLE)
        .select('id, dataset_id, row_index, data')
        .eq('dataset_id', datasetId)
        .order('row_index', { ascending: true }),
    ]);

  if (datasetError) throw datasetError;
  if (columnsError) throw columnsError;
  if (rowsError) throw rowsError;

  return {
    ...mapDataset(datasetRow),
    columns: (columnRows ?? []).map(mapColumn),
    rows: (rowRows ?? []).map(mapRow),
  };
}

/** Deletes a dataset; its columns and rows go with it via ON DELETE CASCADE. */
export async function deleteDataset(datasetId: number): Promise<void> {
  const { error } = await supabase.from(DATASETS_TABLE).delete().eq('id', datasetId);
  if (error) throw error;
}
