import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user, isInitialized, setIsPasswordRecovery } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);

  // Verify recovery session validity upon mount
  useEffect(() => {
    // Check if URL hash indicates an expired/invalid link (e.g. #error=unauthorized_client&error_code=404...)
    const hash = location.hash || window.location.hash;
    if (hash.includes('error=') || hash.includes('error_code=')) {
      setIsLinkInvalid(true);
      return;
    }

    // Check if session or recovery user exists
    if (isInitialized && !user && !session) {
      // Give a tiny grace period to allow Supabase SDK to parse access_token hash from URL
      const timer = setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setIsLinkInvalid(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, user, session, location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);

    if (!password || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        const msg = updateError.message.toLowerCase();
        if (msg.includes('same password') || msg.includes('should be different')) {
          setError('New password must be different from your old password.');
        } else if (msg.includes('rate limit')) {
          setError('Too many update attempts. Please wait a moment and try again.');
        } else {
          setError(updateError.message || 'Failed to update password. Please try again.');
        }
        return;
      }

      setIsSuccess(true);
      setIsPasswordRecovery(false);

      // Sign out recovery session cleanly so user logs in afresh with new password
      await supabase.auth.signOut().catch(() => {});
    } catch {
      setError('An unexpected error occurred while updating your password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Invalid or Expired Reset Link View
  if (isLinkInvalid) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto mb-4 border border-amber-200">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="heading-1 text-2xl font-bold mb-2 text-[var(--color-text-primary)]">
          Link expired or invalid
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          This password reset link is invalid or has expired. Please request a new reset link to proceed.
        </p>

        <Link
          to="/forgot-password"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors shadow-xs"
        >
          Request a new reset link
        </Link>

        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
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

  // 2. Success View
  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="heading-1 text-2xl font-bold mb-2 text-[var(--color-text-primary)]">
          Password updated successfully
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Your Teachora password has been changed. You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors shadow-xs"
        >
          Continue to sign in
        </button>
      </div>
    );
  }

  // 3. Reset Password Form View
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4 mx-auto">
        <KeyRound className="h-6 w-6" />
      </div>

      <h2 className="heading-1 text-2xl font-bold text-center mb-2 text-[var(--color-text-primary)]">
        Reset your password
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
        Create a new password for your Teachora account.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              minLength={6}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] pr-10 focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="Re-enter new password"
              minLength={6}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] pr-10 focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating password…
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </div>
  );
}
