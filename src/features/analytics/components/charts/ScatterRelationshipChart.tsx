import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import { ANALYTICS_PALETTE } from '@/features/analytics/components/palette';
import type { CorrelationPair } from '@/features/analytics/types';

/** Only plots this many points for render performance on large datasets. */
const SCATTER_SAMPLE_SIZE = 300;

interface ScatterRelationshipChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
  correlation: CorrelationPair | null;
}

export function ScatterRelationshipChart({ title, xLabel, yLabel, points, correlation }: ScatterRelationshipChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'scatter',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: xLabel } },
        y: { title: { display: true, text: yLabel } },
      },
    },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const sample = points.slice(0, SCATTER_SAMPLE_SIZE);
    chart.data.datasets = [
      { label: title, data: sample, backgroundColor: `${ANALYTICS_PALETTE[0]}aa` },
    ];
    chart.update();
  }, [chartRef, points, title]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      {correlation && (
        <p className="text-xs text-slate-500 mb-3">
          r = {correlation.r} ({correlation.strength}, {correlation.direction}) — correlation, not causation
        </p>
      )}
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label={`Scatter plot: ${title}`}></canvas>
      </div>
    </div>
  );
}
