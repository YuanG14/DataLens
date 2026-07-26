import type { ColumnOverride, DetectedColumn, DetectedDataType, SemanticRole } from '@/features/import/types';

const DATA_TYPE_OPTIONS: DetectedDataType[] = ['string', 'integer', 'number', 'boolean', 'date', 'unknown'];

const SEMANTIC_ROLE_OPTIONS: SemanticRole[] = [
  'identifier',
  'name',
  'age',
  'gender',
  'date',
  'category',
  'numeric_measure',
  'score',
  'percentage',
  'boolean',
  'stress',
  'anxiety',
  'depression',
  'sleep',
  'screen_time',
  'academic_performance',
  'unknown',
];

const CONFIDENCE_STYLES: Record<DetectedColumn['confidence'], string> = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-slate-100 text-slate-500 border-slate-200',
};

function statsSummary(column: DetectedColumn): string {
  const { stats } = column;
  if (stats.kind === 'numeric') {
    return `min ${stats.min} · max ${stats.max} · avg ${stats.average.toFixed(1)} · ${stats.missingCount} missing`;
  }
  if (stats.kind === 'date') {
    return `${stats.earliest || '—'} to ${stats.latest || '—'} · ${stats.missingCount} missing`;
  }
  return `${stats.uniqueCount} unique · ${stats.missingCount} missing`;
}

interface ColumnMappingTableProps {
  columns: DetectedColumn[];
  overrides: Record<string, ColumnOverride>;
  onChange: (columnName: string, patch: ColumnOverride) => void;
}

export function ColumnMappingTable({ columns, overrides, onChange }: ColumnMappingTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left font-semibold text-slate-600 px-3 py-2">Include</th>
            <th className="text-left font-semibold text-slate-600 px-3 py-2">Column</th>
            <th className="text-left font-semibold text-slate-600 px-3 py-2">Detected Type</th>
            <th className="text-left font-semibold text-slate-600 px-3 py-2">Semantic Role</th>
            <th className="text-left font-semibold text-slate-600 px-3 py-2">Confidence</th>
            <th className="text-left font-semibold text-slate-600 px-3 py-2">Stats</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((column) => {
            const override = overrides[column.originalName];
            const included = override?.included !== false;
            const dataType = override?.dataType ?? column.dataType;
            const semanticRole = override?.semanticRole ?? column.semanticRole;

            return (
              <tr key={column.originalName} className="border-b border-slate-100 last:border-0 align-top">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={(e) => onChange(column.originalName, { included: e.target.checked })}
                    aria-label={`Include ${column.originalName}`}
                  />
                </td>
                <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">{column.originalName}</td>
                <td className="px-3 py-2">
                  <select
                    value={dataType}
                    disabled={!included}
                    onChange={(e) => onChange(column.originalName, { dataType: e.target.value as DetectedDataType })}
                    className="border border-slate-200 rounded-md px-2 py-1 text-sm disabled:opacity-40"
                  >
                    {DATA_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={semanticRole}
                    disabled={!included}
                    onChange={(e) => onChange(column.originalName, { semanticRole: e.target.value as SemanticRole })}
                    className="border border-slate-200 rounded-md px-2 py-1 text-sm disabled:opacity-40"
                  >
                    {SEMANTIC_ROLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLES[column.confidence]}`}
                  >
                    {column.confidence}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{statsSummary(column)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
