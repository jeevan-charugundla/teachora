import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSent(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-[var(--color-success-500)]" />
        </div>
        <h2 className="heading-1 mb-2">Check your email</h2>
        <p className="text-body mb-8">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="heading-1 mb-2">Reset your password</h2>
      <p className="text-body mb-8">Enter your email and we'll send you a reset link</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
