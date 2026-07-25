import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import type { UsageBracket } from '@/features/dashboard/lib/stats';
import { CHART_PALETTE } from '@/features/dashboard/lib/constants';

interface UsageImpactChartProps {
  brackets: UsageBracket[];
}

export function UsageImpactChart({ brackets }: UsageImpactChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'bar',
    data: { labels: ['<2h', '2-4h', '4-6h', '6h+'], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets = [
      { label: 'Anxiety', data: brackets.map((b) => b.anxiety), backgroundColor: CHART_PALETTE.blue },
      { label: 'Addiction', data: brackets.map((b) => b.addiction), backgroundColor: CHART_PALETTE.purple },
    ];
    chart.update();
  }, [chartRef, brackets]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Social Media Hours vs. Mental Health</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label="Bar chart of anxiety and addiction by usage bracket"></canvas>
      </div>
    </div>
  );
}
