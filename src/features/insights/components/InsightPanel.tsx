import { AlertTriangle, FileText, GitCompareArrows, LineChart, Loader2, RefreshCw, Sparkles, TrendingUp, Users } from 'lucide-react';
import type { AnalyzableDataset, AnalyticsResult } from '@/features/analytics/types';
import { useDatasetInsights } from '@/features/insights/hooks/useDatasetInsights';
import type { Insight, InsightCategory, InsightConfidence } from '@/features/insights/types';

interface InsightPanelProps {
  dataset: AnalyzableDataset;
  analytics: AnalyticsResult;
}

const CATEGORY_ICON: Record<InsightCategory, typeof Sparkles> = {
  summary: FileText,
  'key-finding': TrendingUp,
  relationship: GitCompareArrows,
  'group-difference': Users,
  trend: LineChart,
  'data-quality': AlertTriangle,
};

const CONFIDENCE_STYLE: Record<InsightConfidence, string> = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-slate-100 text-slate-500 border-slate-200',
};

function InsightCard({ insight }: { insight: Insight }) {
  const Icon = CATEGORY_ICON[insight.category];
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
          <h4 className="font-semibold text-sm text-slate-800 truncate">{insight.title}</h4>
        </div>
        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLE[insight.confidence]}`}>
          {insight.confidence}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-2 leading-relaxed">{insight.description}</p>
      <p className="text-xs font-mono text-slate-400">Evidence: {insight.evidence}</p>
    </div>
  );
}

export function InsightPanel({ dataset, analytics }: InsightPanelProps) {
  const { status, insights, isSensitiveDomain, canRegenerate, error, generate, regenerate } = useDatasetInsights(dataset, analytics);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand" aria-hidden="true" />
          AI-Powered Insights
        </h3>
        {status === 'success' && (
          <button
            onClick={regenerate}
            disabled={!canRegenerate}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand disabled:opacity-40 disabled:hover:text-slate-500"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Regenerate
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-4">Based on your dataset's statistics — every insight below is tied to a computed value, not invented.</p>

      {status === 'initial' && (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <p className="text-sm text-slate-500 mb-4">Generate plain-English insights from this dataset's analytics.</p>
          <button
            onClick={generate}
            className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Generate Insights
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center text-center py-10 text-slate-500">
          <Loader2 className="w-6 h-6 mb-3 animate-spin text-brand" aria-hidden="true" />
          <p className="text-sm">Analyzing dataset…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={generate} className="text-sm font-semibold text-brand hover:underline">
            Try again
          </button>
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
          {isSensitiveDomain && (
            <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
              AI-generated insights are descriptive observations from the uploaded dataset and should not be interpreted as medical or clinical advice.
            </p>
          )}
        </>
      )}
    </div>
  );
}
