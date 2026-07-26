import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ImportWizard } from '@/features/import';

export function ImportPage() {
  const navigate = useNavigate();

  return (
    <div className="text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to dashboard
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Import Dataset</h1>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <ImportWizard onImported={(datasetId) => navigate(`/datasets/${datasetId}`)} />
      </main>
    </div>
  );
}
