import { useMemo } from 'react';
import {
  Header,
  FilterBar,
  KpiGrid,
  InsightPanel,
  CorrelationChart,
  PlatformRadarChart,
  UsageImpactChart,
  SleepScatterChart,
  DemographicsChart,
  RecordTable,
  RiskPanel,
  EmptyState,
} from '@/features/dashboard/components';
import { useDashboardData } from '@/features/dashboard/hooks';
import {
  buildInsightText,
  calculateCorrelation,
  calculateDepressionByAgeGender,
  calculatePlatformProfiles,
  calculateStats,
  calculateUsageBrackets,
} from '@/features/dashboard/lib';
import { useAuth } from '@/features/auth';

export function DashboardPage() {
  const {
    filteredData,
    rawData,
    filters,
    setFilters,
    resetFilters,
    importRecords,
    loadSampleData,
    loading,
    mutating,
    error,
    reload,
  } = useDashboardData();
  const { user, signOut } = useAuth();

  const stats = useMemo(() => calculateStats(filteredData), [filteredData]);
  const insightText = useMemo(() => buildInsightText(stats), [stats]);
  const correlation = useMemo(() => calculateCorrelation(filteredData), [filteredData]);
  const usageBrackets = useMemo(() => calculateUsageBrackets(filteredData), [filteredData]);
  const platformProfiles = useMemo(() => calculatePlatformProfiles(filteredData), [filteredData]);
  const depressionByAgeGender = useMemo(() => calculateDepressionByAgeGender(filteredData), [filteredData]);

  return (
    <div className="text-slate-800">
      <Header onImport={importRecords} userEmail={user?.email} onSignOut={signOut} />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6"
          >
            <span>{error}</span>
            <button onClick={reload} className="font-medium underline shrink-0 ml-4">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-sm text-slate-500">Loading your data…</div>
        ) : rawData.length === 0 ? (
          !error && <EmptyState onLoadSampleData={loadSampleData} loading={mutating} />
        ) : (
          <>
            <FilterBar filters={filters} onChange={setFilters} onReset={resetFilters} />

            <KpiGrid stats={stats} />

            <InsightPanel text={insightText} />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              <CorrelationChart data={correlation} />
              <PlatformRadarChart profiles={platformProfiles} />
              <UsageImpactChart brackets={usageBrackets} />
              <SleepScatterChart data={filteredData} />
              <DemographicsChart rates={depressionByAgeGender} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <RecordTable data={filteredData} />
              <RiskPanel />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
