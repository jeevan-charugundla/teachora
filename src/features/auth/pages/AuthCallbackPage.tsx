import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { ensureProfileForUser } from '@/services/supabase/profiles';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setSession, setProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Check for URL error parameters in hash or search
        const hash = window.location.hash;
        const search = window.location.search;
        const hashParams = new URLSearchParams(hash.substring(1));
        const searchParams = new URLSearchParams(search);

        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
        const errorCode = hashParams.get('error') || searchParams.get('error');

        if (errorCode || errorDesc) {
          console.error('OAuth error callback:', errorCode, errorDesc);
          if (isMounted) {
            setError(errorDesc || 'Authentication failed or was cancelled. Please try again.');
            setIsProcessing(false);
          }
          return;
        }

        // 2. Retrieve session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error on callback:', sessionError);
          if (isMounted) {
            setError(sessionError.message || 'Unable to complete sign-in. Please try again.');
            setIsProcessing(false);
          }
          return;
        }

        if (session?.user) {
          // Ensure profile exists and sync Google metadata
          const profile = await ensureProfileForUser(session.user);

          if (isMounted) {
            setSession(session);
            setUser(session.user);
            setProfile(profile);
            setIsProcessing(false);
            navigate('/app', { replace: true });
          }
          return;
        }

        // 3. Fallback: Listen for SIGNED_IN auth state change if session isn't immediate
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (!isMounted) return;

          if (event === 'SIGNED_IN' && currentSession?.user) {
            const profile = await ensureProfileForUser(currentSession.user);
            setSession(currentSession);
            setUser(currentSession.user);
            setProfile(profile);
            setIsProcessing(false);
            subscription.unsubscribe();
            navigate('/app', { replace: true });
          }
        });

        // Timeout guard (6 seconds)
        const timeout = setTimeout(() => {
          if (isMounted) {
            subscription.unsubscribe();
            setError((prev) => prev || 'Authentication timed out. Please return to login and try again.');
            setIsProcessing(false);
          }
        }, 6000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Unexpected AuthCallback error:', err);
        if (isMounted) {
          setError(err?.message || 'An unexpected error occurred during sign-in.');
          setIsProcessing(false);
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, setSession, setUser, setProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-background)]">
      <div className="w-full max-w-md card p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg text-center space-y-4">
        {isProcessing ? (
          <div className="py-8 space-y-4 animate-in fade-in">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary-600)] mx-auto" />
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Completing Sign-In</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Connecting your Google account to Teachora…</p>
            </div>
          </div>
        ) : error ? (
          <div className="py-6 space-y-4 animate-in fade-in">
            <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950">Authentication Issue</h3>
              <p className="text-xs text-red-700 mt-1 max-w-xs mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white text-xs font-bold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Login
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
