import { Gauge } from 'lucide-react';
import type { KpiCandidate } from '@/features/analytics/types';

interface DynamicKpiGridProps {
  kpis: KpiCandidate[];
}

function formatValue(kpi: KpiCandidate): string {
  switch (kpi.format) {
    case 'integer':
      return Math.round(kpi.value).toLocaleString();
    case 'percentage':
      return `${kpi.value.toFixed(1)}%`;
    default:
      return kpi.value.toFixed(2);
  }
}

export function DynamicKpiGrid({ kpis }: DynamicKpiGridProps) {
  if (kpis.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 text-sm text-slate-500">
        No numeric columns were found to summarize as KPIs.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi) => (
        <div
          key={kpi.column}
          title={kpi.reason}
          className="kpi-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</span>
            <Gauge className="w-4 h-4 text-brand" aria-hidden="true" />
          </div>
          <div className="text-2xl font-black text-slate-800">{formatValue(kpi)}</div>
        </div>
      ))}
    </section>
  );
}
