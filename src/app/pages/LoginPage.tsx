import { Link, useNavigate } from 'react-router-dom';
import { AuthCard, LoginForm } from '@/features/auth';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back — enter your details to continue."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm onSuccess={() => navigate('/', { replace: true })} />
    </AuthCard>
  );
}
