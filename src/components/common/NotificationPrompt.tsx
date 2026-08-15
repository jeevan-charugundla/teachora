import { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  getExistingPushSubscription,
} from '@/services/notifications/pushService';
import { useAuthStore } from '@/stores/authStore';

export function NotificationPrompt() {
  const { user } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isPushSupported()) return;

    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);

    // Check if dismissed in localStorage for this session
    const dismissedSession = sessionStorage.getItem('teachora_notif_dismissed');
    if (dismissedSession === 'true') {
      setIsDismissed(true);
    }

    async function checkSubscription() {
      const sub = await getExistingPushSubscription();
      if (sub) {
        setHasSubscription(true);
      }
    }
    checkSubscription();
  }, [user]);

  if (!user || !isPushSupported() || isDismissed || (permission === 'granted' && hasSubscription && !feedbackMsg)) {
    return null;
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setFeedbackMsg(null);

    const res = await subscribeToPush();
    setIsLoading(false);
    setPermission(res.permission);

    if (res.success) {
      setHasSubscription(true);
      setFeedbackMsg('Notifications enabled successfully! 🎉');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } else {
      if (res.permission === 'denied') {
        setFeedbackMsg('Notification permission was blocked in browser settings.');
      } else {
        setFeedbackMsg(res.error || 'Could not enable notifications.');
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('teachora_notif_dismissed', 'true');
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border-b border-orange-200/80 px-4 py-3 sm:px-6 animate-in fade-in slide-in-from-top-2">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 mt-0.5 sm:mt-0">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-orange-950 flex items-center gap-2">
              <span>Stay updated</span>
              {feedbackMsg && <span className="text-xs font-semibold text-orange-700">({feedbackMsg})</span>}
            </h4>
            <p className="text-xs text-orange-800/90 font-medium">
              Get notified when your Teachora teaching materials are ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permission === 'denied' ? (
            <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              Allow notifications in browser site settings
            </span>
          ) : (
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Requesting permission…</span>
                </>
              ) : (
                <>
                  <Bell className="h-3.5 w-3.5" />
                  <span>Enable notifications</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-orange-800/70 hover:text-orange-950 hover:bg-orange-200/50 transition-colors"
            title="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
