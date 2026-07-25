import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard, SignupForm } from '@/features/auth';

export function SignupPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthCard
      title="Create your account"
      subtitle={submitted ? undefined : 'Get started with MindState in a few seconds.'}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Account created. If email confirmation is enabled for this project, check your inbox
            for a confirmation link before signing in.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-teal-900/20 hover:opacity-90 transition-all"
          >
            Go to sign in
          </button>
        </div>
      ) : (
        <SignupForm onSubmitted={() => setSubmitted(true)} />
      )}
    </AuthCard>
  );
}
