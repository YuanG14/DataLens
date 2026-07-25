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

function App() {
  const { filteredData, filters, setFilters, resetFilters, importRecords } = useDashboardData();

  const stats = useMemo(() => calculateStats(filteredData), [filteredData]);
  const insightText = useMemo(() => buildInsightText(stats), [stats]);
  const correlation = useMemo(() => calculateCorrelation(filteredData), [filteredData]);
  const usageBrackets = useMemo(() => calculateUsageBrackets(filteredData), [filteredData]);
  const platformProfiles = useMemo(() => calculatePlatformProfiles(filteredData), [filteredData]);
  const depressionByAgeGender = useMemo(() => calculateDepressionByAgeGender(filteredData), [filteredData]);

  return (
    <div className="text-slate-800">
      <Header onImport={importRecords} />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
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
      </main>
    </div>
  );
}

export default App;
