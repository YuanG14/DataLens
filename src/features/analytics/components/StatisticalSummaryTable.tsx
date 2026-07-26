import { Sigma } from 'lucide-react';
import type { ColumnStatistics } from '@/features/analytics/types';

interface StatisticalSummaryTableProps {
  columnStatistics: Record<string, ColumnStatistics>;
}

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function skewLabel(skewness: number): string {
  if (Math.abs(skewness) < 0.5) return 'symmetric';
  if (skewness > 0) return 'right-skewed';
  return 'left-skewed';
}

/**
 * The full descriptive-statistics breakdown per numeric column — mean,
 * median, spread, quartiles, and skew — one level more detailed than the
 * KPI cards, which only show the mean. This is what the anomaly panel's
 * bounds are derived from, shown explicitly so the numbers are checkable.
 */
export function StatisticalSummaryTable({ columnStatistics }: StatisticalSummaryTableProps) {
  const numericEntries = Object.entries(columnStatistics).filter((entry): entry is [string, Extract<ColumnStatistics, { kind: 'numeric' }>] => entry[1].kind === 'numeric');

  if (numericEntries.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 text-sm text-slate-500">
        No numeric columns to summarize.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Sigma className="w-5 h-5 text-brand" aria-hidden="true" />
        Statistical Summary
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <th className="pb-2 pr-4">Column</th>
              <th className="pb-2 pr-4">Mean</th>
              <th className="pb-2 pr-4">Median</th>
              <th className="pb-2 pr-4">Std Dev</th>
              <th className="pb-2 pr-4">Q1</th>
              <th className="pb-2 pr-4">Q3</th>
              <th className="pb-2 pr-4">IQR</th>
              <th className="pb-2">Shape</th>
            </tr>
          </thead>
          <tbody>
            {numericEntries.map(([name, stats]) => (
              <tr key={name} className="border-b border-slate-50 last:border-0">
                <td className="py-2 pr-4 text-slate-700">{humanize(name)}</td>
                <td className="py-2 pr-4 font-mono text-slate-600">{round(stats.mean)}</td>
                <td className="py-2 pr-4 font-mono text-slate-600">{round(stats.median)}</td>
                <td className="py-2 pr-4 font-mono text-slate-600">{round(stats.stdDev)}</td>
                <td className="py-2 pr-4 font-mono text-slate-500">{round(stats.q1)}</td>
                <td className="py-2 pr-4 font-mono text-slate-500">{round(stats.q3)}</td>
                <td className="py-2 pr-4 font-mono text-slate-500">{round(stats.iqr)}</td>
                <td className="py-2 text-slate-500">{skewLabel(stats.skewness)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
