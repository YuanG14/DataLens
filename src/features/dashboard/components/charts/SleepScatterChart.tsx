import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import type { StudentRecord } from '@/features/dashboard/types';
import { CHART_PALETTE, SCATTER_SAMPLE_SIZE } from '@/features/dashboard/lib/constants';

interface SleepScatterChartProps {
  data: StudentRecord[];
}

export function SleepScatterChart({ data }: SleepScatterChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'scatter',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Screen Time Before Sleep' } },
        y: { title: { display: true, text: 'Total Sleep Hours' } },
      },
    },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    // Sampling for render performance, same as the original prototype.
    const sample = data.slice(0, SCATTER_SAMPLE_SIZE);
    chart.data.datasets = [
      {
        label: 'Individual Profiles',
        data: sample.map((d) => ({ x: d.screen_time_before_sleep, y: d.sleep_hours })),
        backgroundColor: sample.map((d) =>
          d.depression_label === 1 ? CHART_PALETTE.red : CHART_PALETTE.brandFaded
        ),
      },
    ];
    chart.update();
  }, [chartRef, data]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Sleep vs. Screen Time</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label="Scatter plot of sleep hours versus pre-sleep screen time"></canvas>
      </div>
    </div>
  );
}
