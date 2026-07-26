import { useCallback, useMemo, useState } from 'react';
import { createDataset, insertDatasetRows } from '@/features/datasets/lib';
import type { ColumnOverride, DetectedSchema, ParsedCsv, ValidationResult } from '@/features/import/types';
import {
  describeFileValidationError,
  detectSchema,
  normalizeDataset,
  parseCsvFile,
  validateDataset,
  validateFile,
} from '@/features/import/lib';

export function useCsvImport() {
  const [step, setStep] = useState<'upload' | 'preview' | 'map' | 'validate' | 'import' | 'done'>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [schema, setSchema] = useState<DetectedSchema | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ColumnOverride>>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);
  const [datasetName, setDatasetName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [createdDatasetId, setCreatedDatasetId] = useState<number | null>(null);

  const selectFile = useCallback(async (file: File) => {
    setFileError(null);
    setFileName(file.name);
    setFileSizeBytes(file.size);

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(describeFileValidationError(validationError));
      return;
    }

    setParsing(true);
    try {
      const result = await parseCsvFile(file);
      if (result.rows.length === 0) {
        setFileError('No data rows found — check that the file has a header row plus at least one row of data.');
        return;
      }
      setParsed(result);
      setSchema(detectSchema(result));
      setOverrides({});
      setDatasetName(file.name.replace(/\.csv$/i, ''));
      setStep('preview');
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Could not read this file as CSV.');
    } finally {
      setParsing(false);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFileName(null);
    setFileSizeBytes(null);
    setFileError(null);
    setParsed(null);
    setSchema(null);
    setOverrides({});
    setValidation(null);
    setImportError(null);
    setCreatedDatasetId(null);
    setStep('upload');
  }, []);

  const setColumnOverride = useCallback((columnName: string, patch: ColumnOverride) => {
    setOverrides((prev) => ({ ...prev, [columnName]: { ...prev[columnName], ...patch } }));
  }, []);

  const goToMapping = useCallback(() => setStep('map'), []);

  const goToValidation = useCallback(() => {
    if (!parsed || !schema) return;
    setValidation(validateDataset(parsed, schema, overrides));
    setStep('validate');
  }, [parsed, schema, overrides]);

  const confirmImport = useCallback(async () => {
    if (!parsed || !schema || !validation) return;
    setImporting(true);
    setImportError(null);
    setStep('import');

    try {
      const normalized = normalizeDataset(
        parsed,
        schema,
        overrides,
        datasetName.trim() || parsed.fileName,
        { excludeRowIndexes: skipInvalidRows ? validation.rows.invalidRowIndexes : [] },
      );

      const dataset = await createDataset(
        normalized.name,
        normalized.columns.map((col, position) => ({
          name: col.name,
          displayName: col.displayName,
          columnType: col.columnType,
          position,
        })),
        { sourceFilename: normalized.sourceFilename },
      );

      await insertDatasetRows(dataset.id, normalized.rows);
      setCreatedDatasetId(dataset.id);
      setStep('done');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Something went wrong while importing this dataset.');
      setStep('validate');
    } finally {
      setImporting(false);
    }
  }, [parsed, schema, overrides, validation, datasetName, skipInvalidRows]);

  const canGoToMap = parsed !== null && schema !== null;

  return useMemo(
    () => ({
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
      createdDatasetId,
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
    }),
    [
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
      createdDatasetId,
      canGoToMap,
      selectFile,
      clearFile,
      setColumnOverride,
      goToMapping,
      goToValidation,
      confirmImport,
    ],
  );
}
