import { useEffect, useRef } from 'react';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

/**
 * Creates a Chart.js instance bound to a canvas on mount and destroys it on
 * unmount, avoiding the memory leaks / duplicate-canvas issues that come from
 * calling `new Chart()` without cleanup (a risk in the original prototype's
 * global chartInstances object, which never called .destroy()).
 */
export function useChartInstance(config: ChartConfiguration) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // Chart is constructed once; data updates happen via chartRef.current.data mutation + .update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasRef, chartRef };
}
