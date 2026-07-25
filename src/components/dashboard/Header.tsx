import { useRef } from 'react';
import { BrainCircuit, FileDown, Upload } from 'lucide-react';
import { parseStudentCsv } from '../../lib/csv';
import type { StudentRecord } from '../../types/dashboard';

interface HeaderProps {
  onImport: (records: StudentRecord[]) => void;
}

export function Header({ onImport }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const records = parseStudentCsv(text);
        if (records.length > 0) {
          onImport(records);
        }
      }
    };
    reader.readAsText(file);
    // Allow re-selecting the same file later.
    event.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand">
          <BrainCircuit className="w-8 h-8" aria-hidden="true" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            MindState <span className="text-brand font-medium text-sm ml-2">v1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Import CSV dataset"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Upload className="w-4 h-4" aria-hidden="true" /> Import CSV
          </button>
          <button
            onClick={() => window.print()}
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-teal-900/20 hover:opacity-90 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" aria-hidden="true" /> Export PDF
          </button>
        </div>
      </div>
    </header>
  );
}
