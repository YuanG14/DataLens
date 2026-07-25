import { useMemo, useState } from 'react';
import type { FilterState, StudentRecord } from '../types/dashboard';
import { generateMockData } from '../lib/mockData';

const DEFAULT_FILTERS: FilterState = {
  maxAge: 19,
  gender: 'all',
  platform: 'all',
  depression: 'all',
};

export function useDashboardData() {
  const [rawData, setRawData] = useState<StudentRecord[]>(() => generateMockData());
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

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

  const importRecords = (records: StudentRecord[]) => {
    setRawData(records);
    setFilters(DEFAULT_FILTERS);
  };

  return {
    rawData,
    filteredData,
    filters,
    setFilters,
    resetFilters,
    importRecords,
  };
}
