import { Lightbulb } from 'lucide-react';

interface InsightPanelProps {
  text: string;
}

/**
 * NOTE: this panel currently renders a rule-based template string
 * (see lib/stats.ts#buildInsightText), not an LLM-generated insight.
 * The "AI-generated insights" feature from the roadmap is a later phase —
 * this component just needs its data source swapped when that lands.
 */
export function InsightPanel({ text }: InsightPanelProps) {
  return (
    <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl mb-8 flex items-start gap-4">
      <Lightbulb className="text-brand w-6 h-6 flex-shrink-0" aria-hidden="true" />
      <div>
        <h3 className="font-bold text-teal-900">Key Insight</h3>
        <p className="text-teal-800 text-sm mt-1" aria-live="polite">
          {text}
        </p>
      </div>
    </div>
  );
}
