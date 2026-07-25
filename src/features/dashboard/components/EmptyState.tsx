import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onLoadSampleData: () => void;
  loading?: boolean;
}

export function EmptyState({ onLoadSampleData, loading }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-24 px-6 bg-white border border-slate-200 rounded-lg">
      <Sparkles className="w-10 h-10 text-brand mb-4" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-slate-900 mb-2">No data yet</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Import a CSV using the button above, or load a sample dataset to see the dashboard in
        action.
      </p>
      <button
        onClick={onLoadSampleData}
        disabled={loading}
        className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-teal-900/20 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Loading sample data…' : 'Load sample data'}
      </button>
    </div>
  );
}
