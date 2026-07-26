import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ParsedCsv } from '@/features/import/types';

const PAGE_SIZE = 10;

interface DatasetPreviewProps {
  parsed: ParsedCsv;
}

export function DatasetPreview({ parsed }: DatasetPreviewProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(parsed.rows.length / PAGE_SIZE));
  const pageRows = parsed.rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 mb-4">
        <span>
          File: <span className="font-medium text-slate-700">{parsed.fileName}</span>
        </span>
        <span>
          Rows: <span className="font-medium text-slate-700">{parsed.rows.length.toLocaleString()}</span>
        </span>
        <span>
          Columns: <span className="font-medium text-slate-700">{parsed.headers.length}</span>
        </span>
        {parsed.malformedRowCount > 0 && (
          <span className="text-amber-700">{parsed.malformedRowCount} malformed row(s) will be skipped</span>
        )}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {parsed.headers.map((header) => (
                <th key={header} className="text-left font-semibold text-slate-600 px-3 py-2 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                {parsed.headers.map((header) => (
                  <td key={header} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                    {row[header] ?? <span className="text-slate-300 italic">missing</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page === pageCount - 1}
              className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
