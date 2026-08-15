import { supabase } from '@/services/supabase/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  jobId?: string;
}

/**
 * Utility to convert base64url VAPID public key string to Uint8Array buffer
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const cleanKey = base64String.trim();
  const padding = '='.repeat((4 - (cleanKey.length % 4)) % 4);
  const base64 = (cleanKey + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const DEFAULT_VAPID_PUBLIC_KEY =
  'BG5JCkkGFecY3XZg7ohM5rd3HVh1by6iyRZQ90X6yBFSS40RRVvl21sNGB0wE6QbAwC0ft0zy-IcGUwUwxwtzQc';

/**
 * Get active VAPID public key with robust production fallback
 */
export function getVapidPublicKey(): string {
  const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return DEFAULT_VAPID_PUBLIC_KEY;
}

/**
 * Diagnostic helper to verify VAPID Public Key configuration without leaking the secret
 */
export function getVapidConfigStatus(): { configured: boolean; length: number } {
  const key = getVapidPublicKey();
  return { configured: Boolean(key), length: key.length };
}

/**
 * Check if the browser supports Push Notifications and Service Workers
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Register Service Worker if supported and return single active registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    // Check if Service Worker is already registered by VitePWA
    let registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }

    await navigator.serviceWorker.ready;
    return registration;
  } catch (err: any) {
    console.error('Service Worker registration error:', err);
    return null;
  }
}

/**
 * Get current browser Notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request Notification permission from the teacher
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Get existing PushSubscription if available
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error('Error fetching existing push subscription:', err);
    return null;
  }
}

/**
 * Save PushSubscription to Supabase push_subscriptions table
 */
export async function savePushSubscription(
  subscription: PushSubscription
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userErr || !user) {
      return { success: false, error: 'Please sign in to enable push notifications.' };
    }

    const keyJSON = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const p256dh = keyJSON.keys?.p256dh;
    const authKey = keyJSON.keys?.auth;

    if (!endpoint || !p256dh || !authKey) {
      return { success: false, error: 'Browser created an incomplete push subscription.' };
    }

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh,
          auth: authKey,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, endpoint' }
      );

    if (dbError) {
      console.error('Error saving push subscription to Supabase:', dbError);
      return {
        success: false,
        error: `Browser push subscription created, but saving to database failed (${dbError.message || dbError.code || 'RLS violation'})`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error('savePushSubscription error:', err);
    return { success: false, error: err?.message || 'Failed to save push subscription.' };
  }
}

/**
 * Full Subscription Workflow: Request Permission -> Get Browser PushSubscription -> Save in Supabase
 */
export async function subscribeToPush(): Promise<{
  success: boolean;
  permission: NotificationPermission;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: false, permission: 'denied', error: 'Push notifications are not supported in this browser.' };
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return { success: false, permission, error: 'Notification permission was not granted by browser.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return { success: false, permission, error: 'Service worker not active or registered.' };
    }

    const existingSubscription = await registration.pushManager.getSubscription();

    // Required diagnostic logging
    console.log('Push diagnostics:', {
      permission: Notification.permission,
      serviceWorkerState: registration.active?.state,
      serviceWorkerScope: registration.scope,
      serviceWorkerURL: registration.active?.scriptURL,
      hasExistingSubscription: Boolean(existingSubscription),
      hasVapidPublicKey: Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      vapidPublicKeyLength: import.meta.env.VITE_VAPID_PUBLIC_KEY?.length,
    });

    // Reuse existing subscription if present
    if (existingSubscription !== null) {
      console.log('Reusing existing browser push subscription.');
      const saveResult = await savePushSubscription(existingSubscription);
      if (!saveResult.success) {
        return { success: false, permission, error: saveResult.error };
      }
      return { success: true, permission };
    }

    const vapidPublicKey = getVapidPublicKey();
    const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);

    // Isolated PushManager.subscribe() execution
    let subscription: PushSubscription | null = null;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey as unknown as BufferSource,
      });
    } catch (pushErr: any) {
      console.error('PushManager.subscribe failed:', {
        name: pushErr?.name,
        message: pushErr?.message,
        stack: pushErr?.stack,
      });
      const errName = pushErr?.name || 'PushError';
      const errMsg = pushErr?.message || 'PushManager.subscribe rejected by browser';
      return {
        success: false,
        permission,
        error: `${errName}: ${errMsg}`,
      };
    }

    if (!subscription) {
      return { success: false, permission, error: 'Browser returned null push subscription.' };
    }

    const saveResult = await savePushSubscription(subscription);
    if (!saveResult.success) {
      return { success: false, permission, error: saveResult.error };
    }

    return { success: true, permission };
  } catch (err: any) {
    console.error('subscribeToPush error:', err);
    return { success: false, permission, error: err?.message || 'Unexpected push subscription failure.' };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) return { success: true };

  try {
    const registration = await registerServiceWorker();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', sessionData.session.user.id)
            .eq('endpoint', endpoint);
        }
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('unsubscribeFromPush error:', err);
    return { success: false, error: err?.message || 'Failed to unsubscribe.' };
  }
}

/**
 * Trigger an authenticated test push notification
 */
export async function sendTestNotification(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return { success: false, error: 'You must be signed in to send a test notification.' };
    }

    const response = await supabase.functions.invoke('send-push', {
      body: {
        title: 'Teachora notifications are working 🎉',
        body: 'Your browser is successfully connected to Teachora notifications.',
        url: '/app/workspace',
      },
    });

    if (response.error) {
      return { success: false, error: response.error.message || 'Failed to trigger test notification.' };
    }

    const resBody = response.data;
    if (!resBody?.success) {
      return { success: false, error: resBody?.error?.message || resBody?.message || 'Test notification failed.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('sendTestNotification error:', err);
    return { success: false, error: err?.message || 'Network error triggering test notification.' };
  }
}

/**
 * Send generation completion notification for any creation type
 */
export async function sendGenerationCompletionNotification(options: {
  creationType: string;
  topic: string;
  grade?: string;
  projectId: string;
  jobId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return { success: false, error: 'Not authenticated' };

    const typeLabels: Record<string, { emoji: string; title: string }> = {
      lesson: { emoji: '📚', title: 'lesson' },
      notes: { emoji: '📝', title: 'notes' },
      presentation: { emoji: '🎨', title: 'presentation' },
      video: { emoji: '🎬', title: 'video' },
      assignment: { emoji: '✏️', title: 'assignment' },
      worksheet: { emoji: '📄', title: 'worksheet' },
      activity: { emoji: '🎯', title: 'activity' },
      flashcards: { emoji: '🃏', title: 'flashcards' },
      quiz: { emoji: '❓', title: 'quiz' },
      'mock-test': { emoji: '📝', title: 'mock test' },
      'question-paper': { emoji: '📋', title: 'question paper' },
      exam: { emoji: '🎓', title: 'exam' },
      diagram: { emoji: '🖼️', title: 'diagram' },
      'mind-map': { emoji: '🧠', title: 'mind map' },
      chart: { emoji: '📊', title: 'chart' },
      infographic: { emoji: '🎨', title: 'infographic' },
    };

    const info = typeLabels[options.creationType] || { emoji: '✨', title: options.creationType };
    const displayTopic = options.topic ? ` on ${options.topic}` : '';

    const payload: PushNotificationPayload = {
      title: `Your ${info.title} is ready ${info.emoji}`,
      body: `Your ${options.grade || 'classroom'} ${info.title}${displayTopic} has finished generating.`,
      url: `/app/workspace`,
      jobId: options.jobId || `${options.projectId}-${Date.now()}`,
      data: {
        projectId: options.projectId,
        creationType: options.creationType,
      },
    };

    const response = await supabase.functions.invoke('send-push', {
      body: payload,
    });

    if (response.error) {
      console.warn('send-push invocation notice:', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('sendGenerationCompletionNotification notice:', err);
    return { success: false, error: err?.message };
  }
}
