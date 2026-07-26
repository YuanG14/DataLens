import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import type { ColumnAnomalies } from '@/features/analytics/types';

interface AnomalyPanelProps {
  anomalies: ColumnAnomalies[];
}

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function AnomalyRow({ anomalies }: { anomalies: ColumnAnomalies }) {
  const [expanded, setExpanded] = useState(false);
  const extremeCount = anomalies.outliers.filter((o) => o.severity === 'extreme').length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50/60 hover:bg-slate-100 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert className={`w-4 h-4 shrink-0 ${extremeCount > 0 ? 'text-red-500' : 'text-amber-500'}`} aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700 truncate">{humanize(anomalies.column)}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
          <span>
            {anomalies.outlierCount} unusual value{anomalies.outlierCount === 1 ? '' : 's'} ({anomalies.outlierPercentage.toFixed(1)}%)
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 py-3 text-xs text-slate-600 space-y-2">
          <p className="text-slate-400">
            Expected range: {anomalies.lowerBound} – {anomalies.upperBound} (1.5× the interquartile range beyond the typical spread)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {anomalies.outliers.map((point) => (
              <span
                key={point.rowIndex}
                title={`Row ${point.rowIndex + 1}`}
                className={`font-mono px-2 py-0.5 rounded-full ${
                  point.severity === 'extreme' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {point.value}
              </span>
            ))}
          </div>
          {anomalies.outlierCount > anomalies.outliers.length && (
            <p className="text-slate-400">+ {anomalies.outlierCount - anomalies.outliers.length} more not shown</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Surfaces statistically unusual values per numeric column (Tukey's IQR
 * fences) — flags them for review, never removes or "corrects" them. A
 * dataset with no outliers renders nothing alarming, just a quiet
 * confirmation.
 */
export function AnomalyPanel({ anomalies }: AnomalyPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-brand" aria-hidden="true" />
        Anomaly Detection
      </h3>
      <p className="text-xs text-slate-500 mb-4">Values well outside a column's typical range — worth a second look, not necessarily errors.</p>

      {anomalies.length === 0 ? (
        <p className="text-sm text-slate-500">No unusual values detected in the numeric columns.</p>
      ) : (
        <div className="space-y-2">
          {anomalies.map((a) => (
            <AnomalyRow key={a.column} anomalies={a} />
          ))}
        </div>
      )}
    </div>
  );
}
