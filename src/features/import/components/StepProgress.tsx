import { Check } from 'lucide-react';
import { IMPORT_STEPS } from '@/features/import/types';
import type { ImportStep } from '@/features/import/types';

const ORDER: ImportStep[] = ['upload', 'preview', 'map', 'validate', 'import'];

interface StepProgressProps {
  current: ImportStep;
}

export function StepProgress({ current }: StepProgressProps) {
  const currentIndex = ORDER.indexOf(current === 'done' ? 'import' : current);

  return (
    <ol className="flex items-center gap-2 mb-8" aria-label="Import progress">
      {IMPORT_STEPS.map((step, index) => {
        const isDone = index < currentIndex || current === 'done';
        const isCurrent = index === currentIndex && current !== 'done';

        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 ${
                isDone
                  ? 'bg-brand text-white'
                  : isCurrent
                    ? 'bg-brand/10 text-brand border-2 border-brand'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span className={`text-sm ${isCurrent ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
              {step.label}
            </span>
            {index < IMPORT_STEPS.length - 1 && <span className="w-6 h-px bg-slate-200 ml-1" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
