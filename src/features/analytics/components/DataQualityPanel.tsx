import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import type { DataQuality } from '@/features/analytics/types';

interface DataQualityPanelProps {
  dataQuality: DataQuality;
}

export function DataQualityPanel({ dataQuality }: DataQualityPanelProps) {
  const { warnings } = dataQuality;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-brand" aria-hidden="true" />
        Data Quality
      </h3>

      {warnings.length === 0 ? (
        <p className="text-sm text-slate-500">No data quality issues detected.</p>
      ) : (
        <ul className="space-y-2">
          {warnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {warning.level === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span className={warning.level === 'warning' ? 'text-amber-700' : 'text-slate-600'}>
                {warning.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
