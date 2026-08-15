import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  label?: string;
  onError?: (error: string) => void;
  className?: string;
}

export function GoogleSignInButton({
  label = 'Continue with Google',
  onError,
  className = '',
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading) return; // Prevent duplicate clicks
    setIsLoading(true);
    onError?.('');

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error('Google Sign-In error:', error);
        let errorMsg = 'Failed to connect to Google. Please try again.';
        const msg = error.message.toLowerCase();
        if (msg.includes('provider is not enabled') || msg.includes('provider_not_enabled')) {
          errorMsg = 'Google authentication is currently disabled in Supabase. Please contact support.';
        } else if (msg.includes('popup_closed') || msg.includes('user_cancelled')) {
          errorMsg = 'Google sign-in was cancelled.';
        } else {
          errorMsg = error.message;
        }
        onError?.(errorMsg);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected Google Sign-In error:', err);
      onError?.(err?.message || 'An unexpected error occurred during Google sign-in.');
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-2xs ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary-600)]" />
          <span>Connecting to Google…</span>
        </>
      ) : (
        <>
          {/* SVG Google 'G' Logo */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
