import { useEffect, type ReactNode } from 'react';
import { supabase } from '@/services/supabase/client';
import { getProfile } from '@/services/supabase/profiles';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setSession, setProfile, setIsLoading, setIsInitialized } = useAuthStore();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setProfile(profile);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getProfile(session.user.id);
          setProfile(profile);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setProfile, setIsLoading, setIsInitialized]);

  return <>{children}</>;
}
