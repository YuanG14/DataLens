import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FilterState, StudentRecord } from '@/features/dashboard/types';
import { generateMockData } from '@/features/dashboard/lib/mockData';
import { AGE_MAX } from '@/features/dashboard/lib/constants';
import { fetchRecords, replaceRecords } from '@/features/dashboard/lib/records';
import { toFriendlyDataError } from '@/features/dashboard/lib/errors';
import { useAuth } from '@/features/auth/context/AuthContext';

const DEFAULT_FILTERS: FilterState = {
  maxAge: AGE_MAX,
  gender: 'all',
  platform: 'all',
  depression: 'all',
};

export function useDashboardData() {
  const { user } = useAuth();
  const [rawData, setRawData] = useState<StudentRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      // Signed out (or not yet resolved) — nothing to fetch, and no stale
      // data from a previous user should stick around.
      setRawData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const records = await fetchRecords();
      setRawData(records);
    } catch (err) {
      setError(toFriendlyDataError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refetch whenever the signed-in user changes (login, logout, or
  // switching accounts) so one user never sees another's cached data.
  useEffect(() => {
    reload();
  }, [reload]);

  const filteredData = useMemo(() => {
    return rawData.filter((d) => {
      return (
        d.age <= filters.maxAge &&
        (filters.gender === 'all' || d.gender === filters.gender) &&
        (filters.platform === 'all' || d.platform_usage === filters.platform) &&
        (filters.depression === 'all' || d.depression_label.toString() === filters.depression)
      );
    });
  }, [rawData, filters]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  /** Persists a new dataset (CSV import or sample data), replacing the old one. */
  const importRecords = useCallback(
    async (records: StudentRecord[]) => {
      setMutating(true);
      setError(null);
      try {
        await replaceRecords(records);
        await reload();
        setFilters(DEFAULT_FILTERS);
      } catch (err) {
        setError(toFriendlyDataError(err));
      } finally {
        setMutating(false);
      }
    },
    [reload],
  );

  const loadSampleData = useCallback(() => importRecords(generateMockData()), [importRecords]);

  return {
    rawData,
    filteredData,
    filters,
    setFilters,
    resetFilters,
    importRecords,
    loadSampleData,
    loading,
    mutating,
    error,
    reload,
  };
}
