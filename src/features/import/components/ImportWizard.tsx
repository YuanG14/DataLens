import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCsvImport } from '@/features/import/hooks';
import { StepProgress } from '@/features/import/components/StepProgress';
import { UploadDropzone } from '@/features/import/components/UploadDropzone';
import { DatasetPreview } from '@/features/import/components/DatasetPreview';
import { ColumnMappingTable } from '@/features/import/components/ColumnMappingTable';
import { ValidationSummary } from '@/features/import/components/ValidationSummary';

interface ImportWizardProps {
  /** Called after a dataset has been successfully imported (e.g. to navigate away). */
  onImported?: () => void;
}

export function ImportWizard({ onImported }: ImportWizardProps) {
  const {
    step,
    fileName,
    fileSizeBytes,
    fileError,
    parsing,
    parsed,
    schema,
    overrides,
    validation,
    skipInvalidRows,
    datasetName,
    importing,
    importError,
    canGoToMap,
    selectFile,
    clearFile,
    setColumnOverride,
    goToMapping,
    goToValidation,
    setSkipInvalidRows,
    setDatasetName,
    confirmImport,
    setStep,
  } = useCsvImport();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <StepProgress current={step} />

      {step === 'upload' && (
        <UploadDropzone
          fileName={fileName}
          fileSizeBytes={fileSizeBytes}
          fileError={fileError}
          parsing={parsing}
          onSelectFile={selectFile}
          onClearFile={clearFile}
        />
      )}

      {step === 'preview' && parsed && (
        <div className="space-y-6">
          <DatasetPreview parsed={parsed} />
          <div className="flex justify-between">
            <button onClick={clearFile} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Back
            </button>
            <button
              onClick={goToMapping}
              disabled={!canGoToMap}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Continue to Schema Review
            </button>
          </div>
        </div>
      )}

      {step === 'map' && schema && (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">
            Review the detected type and role for each column. Uncheck a column to leave it out, or correct any
            guess the system got wrong — especially anything marked <span className="font-medium">low</span>{' '}
            confidence.
          </p>
          <ColumnMappingTable columns={schema.columns} overrides={overrides} onChange={setColumnOverride} />
          <div className="flex justify-between">
            <button onClick={() => setStep('preview')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Back
            </button>
            <button
              onClick={goToValidation}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            >
              Continue to Validation
            </button>
          </div>
        </div>
      )}

      {step === 'validate' && validation && (
        <div className="space-y-6">
          <ValidationSummary
            validation={validation}
            datasetName={datasetName}
            onDatasetNameChange={setDatasetName}
            skipInvalidRows={skipInvalidRows}
            onSkipInvalidRowsChange={setSkipInvalidRows}
          />
          {importError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {importError}
            </p>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep('map')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Back
            </button>
            <button
              onClick={confirmImport}
              disabled={!validation.canImport || !datasetName.trim()}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Import Dataset
            </button>
          </div>
        </div>
      )}

      {step === 'import' && (
        <div className="flex flex-col items-center py-16 gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-brand" aria-hidden="true" />
          <p className="text-sm">{importing ? 'Importing your dataset…' : 'Finishing up…'}</p>
        </div>
      )}

      {step === 'done' && parsed && (
        <div className="flex flex-col items-center text-center py-16 gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-slate-900">Dataset imported</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            "{datasetName}" was imported successfully. The analytics engine that turns this into charts and
            insights is coming in a later phase.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={clearFile}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Import another file
            </button>
            {onImported && (
              <button
                onClick={onImported}
                className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
