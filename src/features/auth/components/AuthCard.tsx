import type { ReactNode } from 'react';
import { BrainCircuit } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Centered card shell shared by Login/Signup/ForgotPassword/ResetPassword
 * pages, so they look like one consistent flow rather than four unrelated
 * screens. Mirrors the brand styling already used in Header.tsx.
 */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 text-brand mb-6">
          <BrainCircuit className="w-8 h-8" aria-hidden="true" />
          <span className="text-xl font-bold tracking-tight text-slate-900">MindState</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mb-6">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="text-center text-sm text-slate-500 mt-6">{footer}</div>}
      </div>
    </div>
  );
}
