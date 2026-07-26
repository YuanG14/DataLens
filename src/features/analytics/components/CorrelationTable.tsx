import type { CorrelationPair } from '@/features/analytics/types';

interface CorrelationTableProps {
  correlations: CorrelationPair[];
}

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const STRENGTH_COLOR: Record<CorrelationPair['strength'], string> = {
  strong: 'text-red-600',
  moderate: 'text-orange-600',
  weak: 'text-slate-500',
  negligible: 'text-slate-400',
};

/**
 * Shows the strongest numeric relationships as a short list rather than a
 * full N×N matrix — with more than a handful of numeric columns a full
 * grid becomes unreadable, so this surfaces "top relationships" instead,
 * per the roadmap's explicit guidance.
 */
export function CorrelationTable({ correlations }: CorrelationTableProps) {
  if (correlations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 text-sm text-slate-500">
        Not enough numeric columns to compute correlations.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-1">Strongest Relationships</h3>
      <p className="text-xs text-slate-500 mb-4">Correlation describes a pattern in the data — it doesn't prove one thing causes another.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <th className="pb-2 pr-4">Columns</th>
              <th className="pb-2 pr-4">r</th>
              <th className="pb-2 pr-4">Strength</th>
              <th className="pb-2">Direction</th>
            </tr>
          </thead>
          <tbody>
            {correlations.slice(0, 10).map((pair) => (
              <tr key={`${pair.columnA}-${pair.columnB}`} className="border-b border-slate-50 last:border-0">
                <td className="py-2 pr-4 text-slate-700">
                  {humanize(pair.columnA)} × {humanize(pair.columnB)}
                </td>
                <td className="py-2 pr-4 font-mono text-slate-600">{pair.r}</td>
                <td className={`py-2 pr-4 font-medium capitalize ${STRENGTH_COLOR[pair.strength]}`}>{pair.strength}</td>
                <td className="py-2 text-slate-500 capitalize">{pair.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
