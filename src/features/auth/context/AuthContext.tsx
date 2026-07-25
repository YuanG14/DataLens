import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { toFriendlyAuthError } from '@/features/auth/lib/errors';
import type { AuthContextValue, AuthResult } from '@/features/auth/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Env vars aren't set — don't hang on a loading spinner forever, and
      // don't attempt a network call that we already know will fail.
      setLoading(false);
      return;
    }

    // 1. On first load, ask Supabase if a session already exists (e.g. the
    //    user refreshed the page). Supabase persists sessions in
    //    localStorage by default, so this is what makes a login "survive"
    //    a refresh.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2. Subscribe to future changes — sign in, sign out, token refresh —
    //    so every component reading `session`/`user` re-renders automatically.
    //    Supabase, not our React state, is the source of truth; this
    //    listener just mirrors it into the component tree.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication is not configured yet.' };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: toFriendlyAuthError(error) };
    return { success: true };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Authentication is not configured yet.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: toFriendlyAuthError(error) };
    return { success: true };
  };

  const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

/** Read auth state/actions from anywhere inside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
