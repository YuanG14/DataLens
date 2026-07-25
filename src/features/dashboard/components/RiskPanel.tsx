import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { estimateRisk, RISK_COLOR_CLASS } from '@/features/dashboard/lib/risk';
import type { RiskLevel } from '@/features/dashboard/types';

export function RiskPanel() {
  const [hours, setHours] = useState(4);
  const [sleep, setSleep] = useState(7);
  const [result, setResult] = useState<RiskLevel | null>(null);

  return (
    <div className="bg-brand text-white p-8 rounded-2xl shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShieldCheck aria-hidden="true" /> Risk Assessment
        </h3>
        <p className="text-teal-100 text-sm mb-6">
          Enter data to see a statistical estimate based on current dataset patterns.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="riskHours" className="block text-xs font-bold uppercase text-teal-200 mb-2">
              Soc Media (Daily Hrs)
            </label>
            <input
              type="number"
              id="riskHours"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full bg-teal-800/50 border border-teal-600 rounded-lg p-3 text-sm outline-none"
            />
          </div>
          <div>
            <label htmlFor="riskSleep" className="block text-xs font-bold uppercase text-teal-200 mb-2">
              Sleep (Daily Hrs)
            </label>
            <input
              type="number"
              id="riskSleep"
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full bg-teal-800/50 border border-teal-600 rounded-lg p-3 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setResult(estimateRisk(hours, sleep))}
            className="w-full bg-white text-brand font-bold py-3 rounded-xl transition-all hover:bg-teal-50"
          >
            Check Profile
          </button>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-teal-600 text-center">
        <p className="text-xs uppercase font-bold text-teal-200">Predicted Risk</p>
        <h4 className={`text-2xl font-black mt-1 ${result ? RISK_COLOR_CLASS[result] : ''}`}>
          {result ?? 'Ready'}
        </h4>
      </div>
    </div>
  );
}
