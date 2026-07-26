import type { Gender, Platform, StudentRecord } from '../types/dashboard';

const NUMERIC_FIELDS: (keyof StudentRecord)[] = [
  'age',
  'daily_social_media_hours',
  'sleep_hours',
  'screen_time_before_sleep',
  'academic_performance',
  'stress_level',
  'anxiety_level',
  'addiction_level',
  'depression_label',
];

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

/**
 * Parses a CSV file's text into StudentRecord[]. Unlike the original prototype
 * (which read columns by fixed position), this maps by header name so column
 * order and extra/missing columns don't silently corrupt the data.
 */
export function parseStudentCsv(text: string): StudentRecord[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1);

  const records: StudentRecord[] = [];

  for (const row of rows) {
    const cols = splitCsvLine(row);
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? cols[idx] : undefined;
    };

    const record: Partial<StudentRecord> = {
      age: Number(get('age')),
      gender: (get('gender')?.toLowerCase() as Gender) ?? 'male',
      platform_usage: (get('platform_usage') as Platform) ?? 'Instagram',
      daily_social_media_hours: Number(get('daily_social_media_hours')),
      sleep_hours: Number(get('sleep_hours')),
      screen_time_before_sleep: Number(get('screen_time_before_sleep')),
      academic_performance: Number(get('academic_performance')),
      stress_level: Number(get('stress_level')),
      anxiety_level: Number(get('anxiety_level')),
      addiction_level: Number(get('addiction_level')),
      depression_label: (Number(get('depression_label')) === 1 ? 1 : 0) as 0 | 1,
    };

    // Skip rows that don't have at least the numeric core fields intact.
    const hasValidNumbers = NUMERIC_FIELDS.every((f) => !Number.isNaN(record[f]));
    if (hasValidNumbers) {
      records.push(record as StudentRecord);
    }
  }

  return records;
}

export function exportRecordsAsCsv(data: StudentRecord[], filename = 'DataLens_Filtered_Data.csv') {
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
