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
  /** Sends a password-reset email containing a link back into the app. */
  sendPasswordResetEmail: (email: string) => Promise<AuthResult>;
  /**
   * Sets a new password. Only succeeds if the user arrived via a valid,
   * unexpired recovery link (Supabase turns that link into a temporary
   * session automatically before this is called).
   */
  updatePassword: (newPassword: string) => Promise<AuthResult>;
}
