import { useEffect } from 'react';
import { useChartInstance } from '@/shared/hooks/useChartInstance';
import type { PlatformProfile } from '@/features/dashboard/lib/stats';
import { CHART_PALETTE } from '@/features/dashboard/lib/constants';

interface PlatformRadarChartProps {
  profiles: PlatformProfile[];
}

const COLORS = [CHART_PALETTE.blue, CHART_PALETTE.red, CHART_PALETTE.brand];
const BG_COLORS = [CHART_PALETTE.blueTint, CHART_PALETTE.redTint, CHART_PALETTE.brandTint];

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
