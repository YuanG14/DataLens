import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

/**
 * Turns whatever Supabase (or the network) throws into one short, safe
 * sentence. We deliberately don't pass raw Supabase error text straight to
 * the UI — it can be overly technical, and in a couple of cases (e.g. rate
 * limiting) it can hint at internal implementation details.
 */
export function toFriendlyAuthError(error: unknown): string {
  if (error instanceof AuthRetryableFetchError) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  if (error instanceof AuthApiError) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Incorrect email or password.';
      case 'user_already_exists':
        return 'An account with that email already exists.';
      case 'email_not_confirmed':
        return 'Please confirm your email before signing in.';
      case 'weak_password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'over_request_rate_limit':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  return 'Something went wrong. Please try again.';
}
