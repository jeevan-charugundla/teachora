import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="heading-1 text-2xl font-bold mb-2 text-[var(--color-text-primary)]">
          Password reset complete!
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Your password has been successfully updated. Redirecting to sign in…
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors"
        >
          Sign in to Teachora
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4 mx-auto">
        <KeyRound className="h-6 w-6" />
      </div>

      <h2 className="heading-1 text-2xl font-bold text-center mb-2 text-[var(--color-text-primary)]">
        Set new password
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
        Choose a secure password for your Teachora account.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] pr-10 focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
            Confirm New Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter new password"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 transition-colors shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating password…
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
