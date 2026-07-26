import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Database, FileDown, LayoutGrid, LogOut, Upload, X } from 'lucide-react';
import { parseStudentCsv } from '@/features/dashboard/lib/csv';
import type { StudentRecord } from '@/features/dashboard/types';

interface HeaderProps {
  onImport: (records: StudentRecord[]) => void;
  /** Signed-in user's email, shown next to the sign-out button. */
  userEmail?: string | null;
  onSignOut?: () => void;
}

interface ImportMessage {
  type: 'error' | 'warning' | 'success';
  text: string;
}

export function Header({ onImport, userEmail, onSignOut }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      const { records, missingHeaders, skippedRows, totalRows } = parseStudentCsv(text);

      if (missingHeaders.length > 0) {
        setImportMessage({
          type: 'error',
          text: `CSV is missing required column${missingHeaders.length > 1 ? 's' : ''}: ${missingHeaders.join(', ')}.`,
        });
        return;
      }

      if (records.length === 0) {
        setImportMessage({
          type: 'error',
          text: 'No valid rows found in this CSV. Check that gender, platform_usage, and the numeric columns match the expected format.',
        });
        return;
      }

      onImport(records);

      if (skippedRows > 0) {
        setImportMessage({
          type: 'warning',
          text: `Imported ${records.length} of ${totalRows} rows. ${skippedRows} row${skippedRows > 1 ? 's were' : ' was'} skipped due to invalid data.`,
        });
      } else {
        setImportMessage({ type: 'success', text: `Imported ${records.length} rows.` });
      }
    };
    reader.readAsText(file);
    // Allow re-selecting the same file later.
    event.target.value = '';
  };

  const messageStyles: Record<ImportMessage['type'], string> = {
    error: 'text-red-600 bg-red-50 border-red-100',
    warning: 'text-amber-700 bg-amber-50 border-amber-100',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand">
          <BrainCircuit className="w-8 h-8" aria-hidden="true" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            DataLens <span className="text-brand font-medium text-sm ml-2">v1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/datasets"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" /> My Datasets
          </Link>
          <Link
            to="/import"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Database className="w-4 h-4" aria-hidden="true" /> Import Any Dataset
          </Link>
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
          {onSignOut && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {userEmail && <span className="text-sm text-slate-500 hidden sm:inline">{userEmail}</span>}
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {importMessage && (
        <div
          role="alert"
          className={`flex items-center justify-between text-sm border-t px-6 py-2 ${messageStyles[importMessage.type]}`}
        >
          <span>{importMessage.text}</span>
          <button onClick={() => setImportMessage(null)} aria-label="Dismiss">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  );
}
