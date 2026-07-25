/**
 * Turns a Supabase/Postgres error into one short, safe sentence for the UI.
 * We don't show raw Postgres error text — it can include column/constraint
 * names that are implementation details, not something a user needs.
 */
export function toFriendlyDataError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (message.includes('row-level security') || message.includes('permission denied')) {
    return "You don't have permission to do that.";
  }

  return 'Could not load your data. Please try again.';
}
