import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import { paletteColor } from '@/features/analytics/components/palette';
import type { CategoricalStats } from '@/features/analytics/types';

interface CategoricalDistributionChartProps {
  title: string;
  variant: 'doughnut' | 'bar';
  stats: CategoricalStats;
}

export function CategoricalDistributionChart({ title, variant, stats }: CategoricalDistributionChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: variant,
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: variant === 'doughnut', position: 'bottom' } },
      scales: variant === 'bar' ? { y: { beginAtZero: true } } : undefined,
    },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = stats.topCategories.map((c) => c.value);
    chart.data.datasets = [
      {
        label: 'Count',
        data: stats.topCategories.map((c) => c.count),
        backgroundColor: stats.topCategories.map((_, i) => paletteColor(i)),
      },
    ];
    chart.update();
  }, [chartRef, stats, variant]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label={`${variant === 'doughnut' ? 'Doughnut' : 'Bar'} chart: ${title}`}></canvas>
      </div>
    </div>
  );
}
