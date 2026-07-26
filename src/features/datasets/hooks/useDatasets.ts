import { useCallback, useEffect, useState } from 'react';
import type { Dataset } from '@/features/datasets/types';
import { deleteDataset, listDatasets } from '@/features/datasets/lib';
import { toFriendlyDataError } from '@/lib/errors';

export function useDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDatasets(await listDatasets());
    } catch (err) {
      setError(toFriendlyDataError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = useCallback(
    async (datasetId: number) => {
      await deleteDataset(datasetId);
      await reload();
    },
    [reload],
  );

  return { datasets, loading, error, reload, remove };
}
