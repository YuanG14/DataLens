import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DatasetWithData } from '@/features/datasets/types';
import { fetchDatasetWithData } from '@/features/datasets/lib';
import { fromDatasetWithData } from '@/features/analytics/lib';
import { toFriendlyDataError } from '@/lib/errors';

export function useDatasetDetail(datasetId: number | null) {
  const [dataset, setDataset] = useState<DatasetWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (datasetId === null) {
      setDataset(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDataset(await fetchDatasetWithData(datasetId));
    } catch (err) {
      setError(toFriendlyDataError(err));
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const analyzable = useMemo(() => (dataset ? fromDatasetWithData(dataset) : null), [dataset]);

  return { dataset, analyzable, loading, error, reload };
}
