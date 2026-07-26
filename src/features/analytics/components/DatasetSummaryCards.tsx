import { Hash, Rows3, Tags, Calendar, AlertTriangle } from 'lucide-react';
import type { DatasetSummary } from '@/features/analytics/types';

interface DatasetSummaryCardsProps {
  summary: DatasetSummary;
}

export function DatasetSummaryCards({ summary }: DatasetSummaryCardsProps) {
  const items = [
    { label: 'Rows', value: summary.rowCount.toLocaleString(), icon: Rows3, colorClass: 'text-slate-600' },
    { label: 'Numeric Columns', value: summary.numericColumnCount, icon: Hash, colorClass: 'text-blue-600' },
    { label: 'Categorical Columns', value: summary.categoricalColumnCount, icon: Tags, colorClass: 'text-purple-600' },
    { label: 'Date Columns', value: summary.dateColumnCount, icon: Calendar, colorClass: 'text-teal-600' },
    {
      label: 'Missing Values',
      value: `${summary.missingPercentage.toFixed(1)}%`,
      icon: AlertTriangle,
      colorClass: summary.missingPercentage >= 10 ? 'text-amber-600' : 'text-slate-600',
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8" aria-label="Dataset summary">
      {items.map((item) => (
        <div key={item.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
            <item.icon className={`w-4 h-4 ${item.colorClass}`} aria-hidden="true" />
          </div>
          <div className="text-xl font-black text-slate-800">{item.value}</div>
        </div>
      ))}
    </section>
  );
}
