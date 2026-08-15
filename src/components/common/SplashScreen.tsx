import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // 1.8 seconds splash duration before handoff to /login or /app
    const timer = setTimeout(() => {
      if (user) {
        navigate('/app', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div
      className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center bg-[var(--color-surface)] px-6 selection:bg-teal-100"
      role="status"
      aria-label="Teachora loading splash screen"
    >
      <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-6">
        {/* Logo Container with 0ms -> 300ms entrance animation */}
        <div className="relative animate-in fade-in zoom-in-95 duration-500 ease-out motion-reduce:animate-none">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0D9488] shadow-lg shadow-teal-700/20 flex items-center justify-center p-3 sm:p-4 transition-transform hover:scale-105">
            <svg
              className="w-full h-full"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z"
                fill="#fff"
                opacity="0.95"
              />
              <path
                d="M22 15l4 4-4 4"
                stroke="#FBBF24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Branding & Subtitle with delayed entrance animation */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 fill-mode-backwards motion-reduce:animate-none">
            Teachora
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-backwards motion-reduce:animate-none">
            Your AI-powered teaching assistant
          </p>
        </div>

        {/* Subtle Loading Spinner */}
        <div className="pt-2 animate-in fade-in duration-500 delay-500 fill-mode-backwards motion-reduce:animate-none">
          <div className="h-5 w-5 rounded-full border-2 border-teal-600/20 border-t-teal-600 animate-spin" />
        </div>
      </div>
    </div>
  );
}
