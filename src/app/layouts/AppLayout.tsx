import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { LoadingState } from '@/components/common/LoadingState';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export function AppLayout() {
  const { user, isLoading, isInitialized } = useAuthStore();
  const isOnline = useOnlineStatus();

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="Loading Teachora…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {/* Offline banner */}
        {!isOnline && (
          <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Some features may be unavailable.</span>
          </div>
        )}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
