import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function useOnlineStatus() {
  const { isOnline, setIsOnline } = useUIStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  return isOnline;
}
