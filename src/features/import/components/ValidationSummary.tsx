import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ValidationResult } from '@/features/import/types';

interface ValidationSummaryProps {
  validation: ValidationResult;
  datasetName: string;
  onDatasetNameChange: (name: string) => void;
  skipInvalidRows: boolean;
  onSkipInvalidRowsChange: (skip: boolean) => void;
}

export function ValidationSummary({
  validation,
  datasetName,
  onDatasetNameChange,
  skipInvalidRows,
  onSkipInvalidRowsChange,
}: ValidationSummaryProps) {
  const { issues, rows, canImport } = validation;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="dataset-name" className="block text-sm font-medium text-slate-700 mb-1">
          Dataset name
        </label>
        <input
          id="dataset-name"
          type="text"
          value={datasetName}
          onChange={(e) => onDatasetNameChange(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          {rows.validRowCount.toLocaleString()} valid rows
        </span>
        {rows.invalidRowCount > 0 && (
          <span className="flex items-center gap-1.5 text-amber-700">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            {rows.invalidRowCount.toLocaleString()} invalid rows
          </span>
        )}
      </div>

      {rows.invalidRowCount > 0 && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={skipInvalidRows}
            onChange={(e) => onSkipInvalidRowsChange(e.target.checked)}
          />
          Skip invalid rows and import the rest
        </label>
      )}

      {issues.length > 0 && (
        <ul className="space-y-2">
          {issues.map((issue, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 text-sm rounded-lg border px-3 py-2 ${
                issue.level === 'error'
                  ? 'bg-red-50 border-red-100 text-red-700'
                  : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}
            >
              {issue.level === 'error' ? (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              )}
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}

      {!canImport && (
        <p className="text-sm text-red-600 font-medium">Fix the errors above before importing.</p>
      )}
    </div>
  );
}
