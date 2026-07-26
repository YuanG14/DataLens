import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import { ANALYTICS_PALETTE } from '@/features/analytics/components/palette';

interface TimeSeriesChartProps {
  title: string;
  yLabel: string;
  points: { date: string; value: number }[];
}

export function TimeSeriesChart({ title, yLabel, points }: TimeSeriesChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { title: { display: true, text: yLabel } } },
    },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.labels = points.map((p) => p.date);
    chart.data.datasets = [
      {
        label: yLabel,
        data: points.map((p) => Math.round(p.value * 100) / 100),
        borderColor: ANALYTICS_PALETTE[0],
        backgroundColor: `${ANALYTICS_PALETTE[0]}22`,
        fill: true,
        tension: 0.25,
      },
    ];
    chart.update();
  }, [chartRef, points, yLabel]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">{title}</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label={`Line chart: ${title}`}></canvas>
      </div>
    </div>
  );
}
