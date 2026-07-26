import type { Gender, Platform, StudentRecord } from '@/features/dashboard/types';

const REQUIRED_HEADERS = [
  'age',
  'gender',
  'platform_usage',
  'daily_social_media_hours',
  'sleep_hours',
  'screen_time_before_sleep',
  'academic_performance',
  'stress_level',
  'anxiety_level',
  'addiction_level',
  'depression_label',
] as const;

const NUMERIC_FIELDS: (keyof StudentRecord)[] = [
  'age',
  'daily_social_media_hours',
  'sleep_hours',
  'screen_time_before_sleep',
  'academic_performance',
  'stress_level',
  'anxiety_level',
  'addiction_level',
];

const GENDERS: Gender[] = ['male', 'female'];
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'Both'];

/** Case/whitespace-insensitive match against a fixed set of allowed values. */
function normalizeEnum<T extends string>(raw: string | undefined, allowed: readonly T[]): T | null {
  if (!raw) return null;
  const needle = raw.trim().toLowerCase();
  return allowed.find((value) => value.toLowerCase() === needle) ?? null;
}

/** Splits a single CSV line, handling simple double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export interface CsvParseResult {
  records: StudentRecord[];
  /** Header names from REQUIRED_HEADERS that weren't found in the file at all. */
  missingHeaders: string[];
  /** Rows that had all required headers but failed validation (bad number/enum value). */
  skippedRows: number;
  totalRows: number;
}

/**
 * Parses a CSV file's text into StudentRecord[]. Maps columns by header name
 * (case-insensitive) rather than fixed position, and is case/whitespace
 * tolerant on gender/platform_usage — "Male", " male ", "INSTAGRAM" all
 * match. Returns diagnostics instead of silently returning an empty array,
 * so the caller can tell the user *why* nothing imported.
 */
export function parseStudentCsv(text: string): CsvParseResult {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { records: [], missingHeaders: [...REQUIRED_HEADERS], skippedRows: 0, totalRows: 0 };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  const rows = lines.slice(1);
  if (missingHeaders.length > 0) {
    return { records: [], missingHeaders, skippedRows: 0, totalRows: rows.length };
  }

  const records: StudentRecord[] = [];
  let skippedRows = 0;

  for (const row of rows) {
    const cols = splitCsvLine(row);
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? cols[idx] : undefined;
    };

    const gender = normalizeEnum(get('gender'), GENDERS);
    const platform_usage = normalizeEnum(get('platform_usage'), PLATFORMS);

    const record: Partial<StudentRecord> = {
      age: Number(get('age')),
      gender: gender ?? undefined,
      platform_usage: platform_usage ?? undefined,
      daily_social_media_hours: Number(get('daily_social_media_hours')),
      sleep_hours: Number(get('sleep_hours')),
      screen_time_before_sleep: Number(get('screen_time_before_sleep')),
      academic_performance: Number(get('academic_performance')),
      stress_level: Number(get('stress_level')),
      anxiety_level: Number(get('anxiety_level')),
      addiction_level: Number(get('addiction_level')),
      depression_label: (Number(get('depression_label')) === 1 ? 1 : 0) as 0 | 1,
    };

    const hasValidNumbers = NUMERIC_FIELDS.every((f) => !Number.isNaN(record[f]));
    const hasValidEnums = gender !== null && platform_usage !== null;

    if (hasValidNumbers && hasValidEnums) {
      records.push(record as StudentRecord);
    } else {
      skippedRows++;
    }
  }

  return { records, missingHeaders: [], skippedRows, totalRows: rows.length };
}

export function exportRecordsAsCsv(data: StudentRecord[], filename = 'MindState_Filtered_Data.csv') {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((record) =>
    headers.map((h) => String(record[h as keyof StudentRecord])).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
