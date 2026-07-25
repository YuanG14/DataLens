import { Link, useNavigate } from 'react-router-dom';
import { AuthCard, ResetPasswordForm } from '@/features/auth';
import { useAuth } from '@/features/auth/context/AuthContext';

export function ResetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  // No session here means either the link was opened without a valid
  // Supabase recovery token, or it already expired — Supabase never
  // created the temporary session updatePassword() depends on.
  if (!session) {
    return (
      <AuthCard title="Link expired or invalid" subtitle="Please request a new password reset link.">
        <Link
          to="/forgot-password"
          className="block text-center w-full bg-brand text-white py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-teal-900/20 hover:opacity-90 transition-all"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="You're signed in via your reset link.">
      <ResetPasswordForm onSuccess={() => navigate('/', { replace: true })} />
    </AuthCard>
  );
}
