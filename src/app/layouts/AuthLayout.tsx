import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useAuthStore } from '@/stores/authStore';
import { APP_TAGLINE } from '@/lib/constants';

export function AuthLayout() {
  const { user, isInitialized, isLoading, isPasswordRecovery } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return null;
  }

  // Do not redirect to /app if user is accessing /reset-password or in recovery mode
  const isResetPasswordRoute = location.pathname === '/reset-password';
  if (user && !isResetPasswordRoute && !isPasswordRecovery) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[var(--color-primary-700)] p-10 text-white">
        <Logo size="lg" className="[&_span]:text-white" />
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            From idea to<br />classroom-ready<br />material.
          </h1>
          <p className="text-lg text-[var(--color-primary-200)] max-w-md">
            {APP_TAGLINE} — Create lessons, quizzes, worksheets, presentations and more with AI-powered tools designed for teachers.
          </p>
        </div>
        <p className="text-sm text-[var(--color-primary-300)]">
          © {new Date().getFullYear()} Teachora. Create. Teach. Inspire.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--color-surface)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
