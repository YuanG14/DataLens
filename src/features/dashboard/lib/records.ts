import { supabase } from '@/lib/supabase/client';
import type { StudentRecord } from '@/features/dashboard/types';

const TABLE = 'student_records';

// id/user_id/created_at are DB bookkeeping columns the UI never needs, so
// they're left out of the select — what comes back already matches
// StudentRecord shape exactly.
const COLUMNS =
  'age, gender, platform_usage, daily_social_media_hours, sleep_hours, ' +
  'screen_time_before_sleep, academic_performance, stress_level, anxiety_level, ' +
  'addiction_level, depression_label';

/** Loads every record belonging to the current user (enforced by RLS). */
export async function fetchRecords(): Promise<StudentRecord[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('id', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as StudentRecord[];
}

/**
 * Replaces everything the current user has stored with a new dataset —
 * mirrors the old "importing a CSV replaces the in-memory data" behavior,
 * just persisted now. RLS means this can only ever affect the current
 * user's own rows, no matter what's passed in.
 */
export async function replaceRecords(records: StudentRecord[]): Promise<void> {
  const { error: deleteError } = await supabase.from(TABLE).delete().not('id', 'is', null);
  if (deleteError) throw deleteError;

  if (records.length === 0) return;

  // PostgREST/Supabase has a payload size limit, so large imports go in
  // batches rather than one giant insert.
  const BATCH_SIZE = 500;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase.from(TABLE).insert(batch);
    if (insertError) throw insertError;
  }
}
