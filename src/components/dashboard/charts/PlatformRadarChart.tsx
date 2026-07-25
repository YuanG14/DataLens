import { useEffect } from 'react';
import { useChartInstance } from '../../../hooks/useChartInstance';
import type { PlatformProfile } from '../../../lib/stats';

interface PlatformRadarChartProps {
  profiles: PlatformProfile[];
}

const COLORS = ['#4A90E2', '#E74C3C', '#008080'];
const BG_COLORS = ['#4A90E222', '#E74C3C22', '#00808022'];

export function PlatformRadarChart({ profiles }: PlatformRadarChartProps) {
  const { canvasRef, chartRef } = useChartInstance({
    type: 'radar',
    data: {
      labels: ['Stress', 'Anxiety', 'Addiction', 'Depression Rate', 'Sleep Hours'],
      datasets: [],
    },
    options: { responsive: true, maintainAspectRatio: false },
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets = profiles.map((p, i) => ({
      label: p.platform,
      data: [p.stress, p.anxiety, p.addiction, p.depressionRateX10, p.sleep],
      borderColor: COLORS[i],
      backgroundColor: BG_COLORS[i],
    }));
    chart.update();
  }, [chartRef, profiles]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4">Platform Comparison</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} role="img" aria-label="Radar chart comparing platforms across risk metrics"></canvas>
      </div>
    </div>
  );
}
