import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';

interface UploadDropzoneProps {
  fileName: string | null;
  fileSizeBytes: number | null;
  fileError: string | null;
  parsing: boolean;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDropzone({
  fileName,
  fileSizeBytes,
  fileError,
  parsing,
  onSelectFile,
  onClearFile,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  };

  if (fileName && !fileError) {
    return (
      <div className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
            <p className="text-xs text-slate-500">
              {parsing ? 'Reading file…' : fileSizeBytes != null ? formatFileSize(fileSizeBytes) : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {parsing && <Loader2 className="w-4 h-4 animate-spin text-brand" aria-hidden="true" />}
          <button
            onClick={onClearFile}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Remove file"
            disabled={parsing}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        className={`flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed rounded-lg py-12 px-6 cursor-pointer transition-colors ${
          isDraggingOver ? 'border-brand bg-brand/5' : 'border-slate-300 hover:border-brand hover:bg-slate-50'
        }`}
      >
        <Upload className="w-8 h-8 text-slate-400" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-700">Drop a CSV file here, or click to browse</p>
        <p className="text-xs text-slate-400">Up to 20MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          aria-label="Upload CSV file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelectFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {fileError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {fileError}
        </p>
      )}
      {fileName && fileError && (
        <button onClick={onClearFile} className="mt-2 text-xs font-medium text-slate-500 underline">
          Choose a different file
        </button>
      )}
    </div>
  );
}
