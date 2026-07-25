import { useEffect } from 'react';
import { useChartInstance } from '../../../hooks/useChartInstance';
import type { AgeGenderDepressionRate } from '../../../lib/stats';

interface DemographicsChartProps {
  rates: AgeGenderDepressionRate[];
}

export function DemographicsChart({ rates }: DemographicsChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'line',
    data: { labels: [13, 14, 15, 16, 17, 18, 19], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets = [
      { label: 'Male %', data: rates.map((r) => r.malePct), borderColor: '#4A90E2' },
      { label: 'Female %', data: rates.map((r) => r.femalePct), borderColor: '#9B59B6' },
    ];
    chart.update();
  }, [chartRef, rates]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Demographics: Depression by Age/Gender</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label="Line chart of depression rate by age and gender"></canvas>
      </div>
    </div>
  );
}
