import { BarChart3 } from 'lucide-react';

interface EmptyChartStateProps {
  title: string;
  message?: string;
}

/** Shown in place of a chart whenever the analytics engine couldn't calculate something suitable — never a broken canvas. */
export function EmptyChartState({ title, message = 'No suitable data available for this visualization.' }: EmptyChartStateProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
      <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400">
        <BarChart3 className="w-8 h-8 mb-2" aria-hidden="true" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
