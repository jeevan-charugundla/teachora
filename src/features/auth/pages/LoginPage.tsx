import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission

    setError('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (msg.includes('email not confirmed')) {
          setError('Please confirm your email address before signing in, or disable "Confirm Email" in Supabase settings for development.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data?.session) {
        navigate('/app', { replace: true });
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="heading-1 mb-2">Welcome back</h2>
      <p className="text-body mb-8">Sign in to your Teachora account</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-[var(--color-text-primary)]">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 pr-10 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
          Create account
        </Link>
      </p>
    </div>
  );
}
