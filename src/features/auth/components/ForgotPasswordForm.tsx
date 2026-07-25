import { useState, type FormEvent } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

export function ForgotPasswordForm() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await sendPasswordResetEmail(email);
    setSubmitting(false);

    if (result.success) {
      // Always show the same confirmation, whether or not the email is
      // registered — otherwise this form could be used to check which
      // emails have an account (a privacy leak), and it matches what
      // Supabase itself does at the API level.
      setSent(true);
    } else {
      setError(result.error ?? 'Something went wrong. Please try again.');
    }
  };

  if (sent) {
    return (
      <p className="text-sm text-slate-600">
        If an account exists for <span className="font-medium text-slate-900">{email}</span>, a
        password reset link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-teal-900/20 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {submitting ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}
