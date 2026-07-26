import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDatasetDetail } from '@/features/datasets';
import {
  CorrelationTable,
  DataQualityPanel,
  DatasetSummaryCards,
  DynamicKpiGrid,
  RecommendedCharts,
  useDatasetAnalytics,
} from '@/features/analytics';

export function DatasetDetailPage() {
  const navigate = useNavigate();
  const { datasetId } = useParams<{ datasetId: string }>();
  const parsedId = datasetId ? Number(datasetId) : NaN;

  const { dataset, analyzable, loading, error } = useDatasetDetail(Number.isNaN(parsedId) ? null : parsedId);
  const analytics = useDatasetAnalytics(analyzable);

  return (
    <div className="text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/datasets')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            My Datasets
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{dataset?.name ?? 'Dataset'}</h1>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {error && (
          <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-sm text-slate-500">Analyzing your dataset…</div>
        ) : !analyzable || !analytics ? (
          !error && <div className="py-24 text-center text-sm text-slate-500">Dataset not found.</div>
        ) : (
          <>
            <DatasetSummaryCards summary={analytics.summary} />
            <DynamicKpiGrid kpis={analytics.kpis} />
            <DataQualityPanel dataQuality={analytics.dataQuality} />
            <CorrelationTable correlations={analytics.correlations} />
            <RecommendedCharts
              dataset={analyzable}
              recommendations={analytics.recommendations}
              columnStatistics={analytics.columnStatistics}
            />
          </>
        )}
      </main>
    </div>
  );
}
