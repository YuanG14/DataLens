import { RefreshCcw } from 'lucide-react';
import type { FilterState } from '../../types/dashboard';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="ageFilter" className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Age Range (13-19)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="ageFilter"
              min={13}
              max={19}
              value={filters.maxAge}
              onChange={(e) => onChange({ ...filters, maxAge: Number(e.target.value) })}
              className="w-full accent-brand"
            />
            <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded" aria-live="polite">
              {filters.maxAge}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="genderFilter" className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Gender
          </label>
          <select
            id="genderFilter"
            value={filters.gender}
            onChange={(e) => onChange({ ...filters, gender: e.target.value as FilterState['gender'] })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-teal-500/20"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="platformFilter" className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Platform
          </label>
          <select
            id="platformFilter"
            value={filters.platform}
            onChange={(e) => onChange({ ...filters, platform: e.target.value as FilterState['platform'] })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-teal-500/20"
          >
            <option value="all">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div>
          <label htmlFor="depressionFilter" className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Depression Label
          </label>
          <select
            id="depressionFilter"
            value={filters.depression}
            onChange={(e) => onChange({ ...filters, depression: e.target.value as FilterState['depression'] })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-teal-500/20"
          >
            <option value="all">All Cases</option>
            <option value="1">Depression Detected</option>
            <option value="0">No Depression</option>
          </select>
        </div>

        <button
          onClick={onReset}
          className="text-slate-400 hover:text-brand p-2 transition-colors"
          aria-label="Reset filters"
        >
          <RefreshCcw className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
