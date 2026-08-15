import { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Send,
} from 'lucide-react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  getExistingPushSubscription,
  sendTestNotification,
} from '@/services/notifications/pushService';
import { useAuthStore } from '@/stores/authStore';

export function NotificationPrompt() {
  const { user } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
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

  if (!user || !isPushSupported() || isDismissed) {
    return null;
  }

  // If already enabled and subscribed, show a compact "Notifications Enabled" badge or hide unless hovered
  if (permission === 'granted' && hasSubscription && !feedbackMsg) {
    return (
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-2 flex items-center justify-between text-xs animate-in fade-in">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Push notifications enabled</span>
          <span className="hidden sm:inline text-[var(--color-text-tertiary)] font-medium">
            — You'll be alerted when generated materials are ready.
          </span>
        </div>

        <button
          type="button"
          onClick={async () => {
            setIsSendingTest(true);
            setFeedbackMsg(null);
            const res = await sendTestNotification();
            setIsSendingTest(false);
            if (res.success) {
              setFeedbackMsg('Test push sent! Check your desktop notifications.');
              setTimeout(() => setFeedbackMsg(null), 4000);
            } else {
              setFeedbackMsg(res.error || 'Failed to send test push.');
            }
          }}
          disabled={isSendingTest}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:bg-[var(--color-primary-50)] text-[11px] font-bold text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
        >
          {isSendingTest ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-[var(--color-primary-600)]" />
              <span>Sending test…</span>
            </>
          ) : (
            <>
              <Send className="h-3 w-3 text-[var(--color-primary-600)]" />
              <span>Test notification</span>
            </>
          )}
        </button>
      </div>
    );
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
