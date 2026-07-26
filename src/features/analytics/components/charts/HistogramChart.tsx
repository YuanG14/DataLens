import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import { ANALYTICS_PALETTE } from '@/features/analytics/components/palette';
import type { HistogramBin } from '@/features/analytics/lib';

interface HistogramChartProps {
  title: string;
  bins: HistogramBin[];
}

export function HistogramChart({ title, bins }: HistogramChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Count' } } },
    },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = bins.map((b) => b.label);
    chart.data.datasets = [
      { label: 'Count', data: bins.map((b) => b.count), backgroundColor: ANALYTICS_PALETTE[0] },
    ];
    chart.update();
  }, [chartRef, bins]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label={`Histogram: ${title}`}></canvas>
      </div>
    </div>
  );
}
