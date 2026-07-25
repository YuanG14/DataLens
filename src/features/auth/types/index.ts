import type { Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  /** Friendly, already-mapped message — safe to show directly in the UI. */
  error?: string;
}

export interface AuthContextValue {
  /** Null until the initial session check finishes. */
  session: Session | null;
  /** Convenience accessor for session?.user. */
  user: User | null;
  /** True only during the initial "do we already have a session?" check. */
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}
