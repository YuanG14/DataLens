import { Filter, X } from 'lucide-react';
import type { ColumnFilter } from '@/features/filters/types';
import type { FilterOption } from '@/features/filters/types';

interface FilterBarProps {
  options: FilterOption[];
  filters: ColumnFilter[];
  activeCount: number;
  totalRowCount: number;
  filteredRowCount: number;
  onAdd: (column: string, kind: ColumnFilter['kind']) => void;
  onUpdate: (column: string, next: ColumnFilter) => void;
  onRemove: (column: string) => void;
  onClear: () => void;
}

function CategoricalControl({ option, filter, onUpdate }: { option: FilterOption; filter: Extract<ColumnFilter, { kind: 'categorical' }>; onUpdate: (next: ColumnFilter) => void }) {
  const toggle = (value: string) => {
    const selected = filter.selected.includes(value) ? filter.selected.filter((v) => v !== value) : [...filter.selected, value];
    onUpdate({ ...filter, selected });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {(option.values ?? []).map((value) => {
        const active = filter.selected.includes(value);
        return (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
              active ? 'bg-brand text-white border-brand' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}

function NumericControl({ option, filter, onUpdate }: { option: FilterOption; filter: Extract<ColumnFilter, { kind: 'numeric' }>; onUpdate: (next: ColumnFilter) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={filter.min ?? ''}
        placeholder={`Min (${option.min})`}
        onChange={(e) => onUpdate({ ...filter, min: e.target.value === '' ? null : Number(e.target.value) })}
        className="w-28 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand"
      />
      <span className="text-slate-400 text-sm">–</span>
      <input
        type="number"
        value={filter.max ?? ''}
        placeholder={`Max (${option.max})`}
        onChange={(e) => onUpdate({ ...filter, max: e.target.value === '' ? null : Number(e.target.value) })}
        className="w-28 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand"
      />
    </div>
  );
}

function DateControl({ option, filter, onUpdate }: { option: FilterOption; filter: Extract<ColumnFilter, { kind: 'date' }>; onUpdate: (next: ColumnFilter) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={filter.from ?? ''}
        min={option.earliest}
        max={option.latest}
        onChange={(e) => onUpdate({ ...filter, from: e.target.value || null })}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand"
      />
      <span className="text-slate-400 text-sm">–</span>
      <input
        type="date"
        value={filter.to ?? ''}
        min={option.earliest}
        max={option.latest}
        onChange={(e) => onUpdate({ ...filter, to: e.target.value || null })}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand"
      />
    </div>
  );
}

/**
 * Lets the user narrow the dataset down before every other analytics panel
 * sees it — everything downstream (KPIs, correlations, trends, anomalies,
 * insights, charts) recomputes from the filtered rows, never the full set,
 * so a filter here changes the whole page consistently rather than just
 * one chart.
 */
export function FilterBar({ options, filters, activeCount, totalRowCount, filteredRowCount, onAdd, onUpdate, onRemove, onClear }: FilterBarProps) {
  const availableOptions = options.filter((o) => !filters.some((f) => f.column === o.column));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand" aria-hidden="true" />
          Filters
          {activeCount > 0 && <span className="text-xs font-bold bg-brand/10 text-brand px-2 py-0.5 rounded-full">{activeCount} active</span>}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            Showing {filteredRowCount.toLocaleString()} of {totalRowCount.toLocaleString()} rows
          </span>
          {activeCount > 0 && (
            <button onClick={onClear} className="text-xs font-medium text-slate-500 hover:text-brand">
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-3">
        {filters.map((filter) => {
          const option = options.find((o) => o.column === filter.column);
          if (!option) return null;
          return (
            <div key={filter.column} className="flex items-start gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50/60">
              <span className="text-sm font-medium text-slate-700 w-32 shrink-0 pt-1">{option.displayName}</span>
              <div className="flex-1 min-w-0">
                {filter.kind === 'categorical' && <CategoricalControl option={option} filter={filter} onUpdate={(next) => onUpdate(filter.column, next)} />}
                {filter.kind === 'numeric' && <NumericControl option={option} filter={filter} onUpdate={(next) => onUpdate(filter.column, next)} />}
                {filter.kind === 'date' && <DateControl option={option} filter={filter} onUpdate={(next) => onUpdate(filter.column, next)} />}
              </div>
              <button onClick={() => onRemove(filter.column)} className="text-slate-400 hover:text-red-500 shrink-0">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      {availableOptions.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const option = options.find((o) => o.column === e.target.value);
            if (option) onAdd(option.column, option.kind);
          }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500 focus:outline-none focus:border-brand"
        >
          <option value="">+ Add filter…</option>
          {availableOptions.map((option) => (
            <option key={option.column} value={option.column}>
              {option.displayName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
