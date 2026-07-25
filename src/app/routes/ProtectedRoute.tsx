import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';

/**
 * Wrap protected <Route> elements with this. It reads session state from
 * useAuth() (which mirrors Supabase's own session) rather than storing any
 * auth flag of its own — Supabase stays the single source of truth.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    // Avoid a flash of the login page while we're still checking for an
    // existing session on first load.
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
