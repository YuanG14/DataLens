import { useMemo } from 'react';
import { Header } from './components/dashboard/Header';
import { FilterBar } from './components/dashboard/FilterBar';
import { KpiGrid } from './components/dashboard/KpiGrid';
import { InsightPanel } from './components/dashboard/InsightPanel';
import { CorrelationChart } from './components/dashboard/charts/CorrelationChart';
import { PlatformRadarChart } from './components/dashboard/charts/PlatformRadarChart';
import { UsageImpactChart } from './components/dashboard/charts/UsageImpactChart';
import { SleepScatterChart } from './components/dashboard/charts/SleepScatterChart';
import { DemographicsChart } from './components/dashboard/charts/DemographicsChart';
import { RecordTable } from './components/dashboard/RecordTable';
import { RiskPanel } from './components/dashboard/RiskPanel';
import { useDashboardData } from './hooks/useDashboardData';
import {
  buildInsightText,
  calculateCorrelation,
  calculateDepressionByAgeGender,
  calculatePlatformProfiles,
  calculateStats,
  calculateUsageBrackets,
} from './lib/stats';

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
