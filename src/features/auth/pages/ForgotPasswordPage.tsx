import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Loader2, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submit

    setError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Execute Supabase Auth reset password for email request
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (resetError) {
        const msg = resetError.message.toLowerCase();
        if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
          setError('Too many reset requests. Please wait a little while before trying again.');
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setError("We couldn't send the reset link. Please check your connection and try again.");
        } else {
          setError(resetError.message || 'Something went wrong. Please try again.');
        }
        return;
      }

      setIsSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Icon */}
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4 mx-auto">
        {isSent ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <KeyRound className="h-6 w-6" />}
      </div>

      {!isSent ? (
        <>
          <h2 className="heading-1 text-2xl font-bold text-center mb-2 text-[var(--color-text-primary)]">
            Forgot your password?
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending reset link…
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <h2 className="heading-1 text-2xl font-bold text-center mb-2 text-[var(--color-text-primary)]">
            Check your email
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            If an account exists for <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>, you'll receive a password reset link shortly.
          </p>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 text-xs text-[var(--color-text-secondary)] mb-6">
            <p className="mb-2 font-medium">Didn't receive the email?</p>
            <p className="mb-3">Check your spam folder or click below to resend.</p>
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Back to Sign in */}
      <div className="mt-8 pt-4 border-t border-[var(--color-border)] text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
