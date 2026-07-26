import { LineChart, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { TrendAnalysis } from '@/features/analytics/types';

interface TrendAnalysisPanelProps {
  trends: TrendAnalysis[];
}

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const DIRECTION_STYLE: Record<TrendAnalysis['direction'], { icon: typeof TrendingUp; color: string; label: string }> = {
  increasing: { icon: TrendingUp, color: 'text-emerald-600', label: 'Increasing' },
  decreasing: { icon: TrendingDown, color: 'text-red-600', label: 'Decreasing' },
  flat: { icon: Minus, color: 'text-slate-400', label: 'No clear trend' },
};

/**
 * Shows every date+numeric pair with enough points for a trend line,
 * ranked by how well a straight line actually explains the movement
 * (R²) rather than by raw slope — a big slope over a bad fit is a less
 * trustworthy trend than a modest slope that tracks the data closely.
 */
export function TrendAnalysisPanel({ trends }: TrendAnalysisPanelProps) {
  if (trends.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 text-sm text-slate-500">
        Not enough date + numeric column data to analyze trends over time.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
        <LineChart className="w-5 h-5 text-brand" aria-hidden="true" />
        Trend Analysis
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        A linear fit over time for each field — R² shows how closely the trend line tracks the actual data.
      </p>
      <div className="space-y-2">
        {trends.slice(0, 8).map((trend) => {
          const style = DIRECTION_STYLE[trend.direction];
          const Icon = style.icon;
          return (
            <div
              key={`${trend.dateColumn}-${trend.numericColumn}`}
              className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${style.color}`} aria-hidden="true" />
                <span className="text-sm text-slate-700 truncate">
                  {humanize(trend.numericColumn)} over {humanize(trend.dateColumn)}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className={`font-medium ${style.color}`}>{style.label}</span>
                <span className="font-mono text-slate-400">R² = {trend.rSquared}</span>
                <span className={`px-2 py-0.5 rounded-full ${trend.significant ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {trend.significant ? `p = ${trend.pValue}` : 'not significant'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
