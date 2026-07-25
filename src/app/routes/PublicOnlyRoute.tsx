import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';

/**
 * Wrap Login/Signup/ForgotPassword <Route> elements with this so an
 * already-signed-in user gets sent to the dashboard instead of seeing a
 * login form again. Not used on ResetPasswordPage — arriving via the
 * recovery-email link legitimately creates a session, and this guard
 * would otherwise redirect that user away before they can set a new
 * password.
 */
export function PublicOnlyRoute() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
