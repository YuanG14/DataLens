import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Trash2, Upload } from 'lucide-react';
import { useDatasets } from '@/features/datasets';

export function DatasetsPage() {
  const navigate = useNavigate();
  const { datasets, loading, error, remove } = useDatasets();

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    await remove(id);
  };

  return (
    <div className="text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to dashboard
            </button>
            <h1 className="text-lg font-semibold text-slate-900">My Datasets</h1>
          </div>
          <Link
            to="/import"
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:opacity-90"
          >
            <Upload className="w-4 h-4" aria-hidden="true" /> Import Dataset
          </Link>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {error && (
          <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-sm text-slate-500">Loading your datasets…</div>
        ) : datasets.length === 0 ? (
          <div className="flex flex-col items-center text-center py-24 px-6 bg-white border border-slate-200 rounded-lg">
            <Database className="w-10 h-10 text-brand mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No datasets yet</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Import a CSV to see dynamic analytics generated automatically from its columns.
            </p>
            <Link
              to="/import"
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-teal-900/20 hover:opacity-90"
            >
              Import a dataset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-800 break-words pr-2">{dataset.name}</h3>
                  <button
                    onClick={() => handleDelete(dataset.id, dataset.name)}
                    aria-label={`Delete ${dataset.name}`}
                    className="text-slate-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Imported {new Date(dataset.createdAt).toLocaleDateString()}
                  {dataset.sourceFilename ? ` · ${dataset.sourceFilename}` : ''}
                </p>
                <Link
                  to={`/datasets/${dataset.id}`}
                  className="mt-auto text-sm font-semibold text-brand hover:underline"
                >
                  View analytics →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
