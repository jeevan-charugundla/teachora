import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission

    setError('');
    setSuccessInfo('');

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (!trimmedEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName || 'Teacher',
          },
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
          setError('Email verification is temporarily rate-limited. Please try again later or disable "Confirm Email" in Supabase Auth settings for development.');
        } else if (msg.includes('already registered') || msg.includes('user already exists')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (msg.includes('invalid') && msg.includes('email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(authError.message);
        }
        return;
      }

      // If auto-authenticated (Confirm Email is disabled)
      if (data?.session) {
        navigate('/app/profile?setup=true', { replace: true });
      } else if (data?.user) {
        setSuccessInfo('Account created successfully! You can now sign in to start creating.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1800);
      }
    } catch {
      setError('An unexpected error occurred. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="heading-1 mb-2">Create your account</h2>
      <p className="text-body mb-6">Start creating classroom-ready materials with Teachora</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successInfo && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <GoogleSignInButton
        label="Continue with Google"
        onError={(err) => setError(err)}
      />

      {/* Divider */}
      <div className="relative my-6 text-center text-xs">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <span className="relative bg-[var(--color-surface)] px-3 text-[var(--color-text-tertiary)] font-semibold uppercase tracking-wider">
          Or sign up with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="name"
            placeholder="Your full name"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 disabled:opacity-60 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              minLength={6}
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
              Creating account…
            </>
          ) : (
            'Create account with Email'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
