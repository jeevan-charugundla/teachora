import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { Loader2, ArrowLeft, Mail, KeyRound, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [method, setMethod] = useState<'link' | 'otp'>('link');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Send Reset Email Link or OTP Code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (method === 'otp') {
        // Request OTP code email
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          setError(otpError.message);
          return;
        }

        setStep('verify');
      } else {
        // Request Magic Link / Reset Password Link email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/reset-password` }
        );

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setStep('verify');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode.trim().length < 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP code token
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: method === 'otp' ? 'email' : 'recovery',
      });

      if (verifyErr) {
        setError(verifyErr.message || 'Invalid or expired OTP code.');
        return;
      }

      if (data.session) {
        // Navigate to password reset page
        navigate('/reset-password');
      } else {
        setError('Verification successful, but session was not established. Please try resetting again.');
      }
    } catch {
      setError('Failed to verify code. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4 mx-auto">
        {step === 'verify' ? <ShieldCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
      </div>

      <h2 className="heading-1 text-2xl font-bold text-center mb-2 text-[var(--color-text-primary)]">
        {step === 'verify' ? 'Enter Verification Code' : 'Reset your password'}
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">
        {step === 'verify'
          ? `We sent a security verification code to ${email}`
          : 'Choose how you want to receive your password reset verification'}
      </p>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="space-y-4">
          {/* Option Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] mb-4">
            <button
              type="button"
              onClick={() => setMethod('link')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                method === 'link'
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary-700)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email Link
            </button>
            <button
              type="button"
              onClick={() => setMethod('otp')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                method === 'otp'
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary-700)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> 6-Digit OTP
            </button>
          </div>

          <div>
            <label htmlFor="reset-email" className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
              Teacher Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="teacher@school.edu"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 transition-colors shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending verification…
              </>
            ) : method === 'otp' ? (
              'Send 6-Digit OTP Code'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-[var(--color-text-secondary)]">
              {method === 'otp'
                ? `Enter the 6-digit OTP code sent to ${email}`
                : `We sent a reset link to ${email}. You can also enter your 6-digit code below:`}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1.5 text-center">
              6-Digit Security OTP Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              placeholder="1 2 3 4 5 6"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-center text-xl tracking-[0.3em] font-mono font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 transition-colors shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying code…
              </>
            ) : (
              'Verify & Reset Password'
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium"
            >
              Change email address
            </button>

            <button
              type="button"
              onClick={handleRequestReset}
              className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-semibold"
            >
              Resend code
            </button>
          </div>
        </form>
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
