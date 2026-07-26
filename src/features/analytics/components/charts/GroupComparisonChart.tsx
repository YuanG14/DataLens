import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import { ANALYTICS_PALETTE } from '@/features/analytics/components/palette';
import type { GroupComparison } from '@/features/analytics/types';

interface GroupComparisonChartProps {
  title: string;
  comparison: GroupComparison;
}

export function GroupComparisonChart({ title, comparison }: GroupComparisonChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Average' } } },
    },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = comparison.groups.map((g) => g.category);
    chart.data.datasets = [
      {
        label: 'Average',
        data: comparison.groups.map((g) => Math.round(g.average * 100) / 100),
        backgroundColor: ANALYTICS_PALETTE[1],
      },
    ];
    chart.update();
  }, [chartRef, comparison]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label={`Bar chart: ${title}`}></canvas>
      </div>
    </div>
  );
}
