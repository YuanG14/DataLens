import { useEffect } from 'react';
import { useChartInstance } from '../../../hooks/useChartInstance';
import { CORRELATION_LABELS } from '../../../lib/stats';

interface CorrelationChartProps {
  data: number[];
}

export function CorrelationChart({ data }: CorrelationChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'bar',
    data: {
      labels: CORRELATION_LABELS,
      datasets: [{ label: 'Correlation with Depression', data: [], backgroundColor: '#008080' }],
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets[0].data = data;
    chart.update();
  }, [chartRef, data]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm xl:col-span-2">
      <h3 className="font-bold text-slate-800 mb-4">Correlation: Risk Predictors</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label="Bar chart of correlation between risk factors and depression"></canvas>
      </div>
    </div>
  );
}
