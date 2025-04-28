// Check if the browser supports notifications
const notificationsSupported = 'Notification' in window;

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  data?: any;
  requireInteraction?: boolean;
  tag?: string;
}

/**
 * Request permission to send notifications
 * @returns Promise<boolean> - Whether permission was granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  // If we already have permission, return true
  if (Notification.permission === 'granted') {
    return true;
  }

  // If permission is denied, return false
  if (Notification.permission === 'denied') {
    console.warn('Notification permission was previously denied');
    return false;
  }

  // Otherwise, request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Send a notification
 * @param options Notification options
 * @returns Promise<boolean> - Whether notification was sent
 */
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  // First ensure we have permission
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  try {
    // If serviceworker is active, use it to show the notification
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        tag: options.tag
      });
      return true;
    } else {
      // Fall back to regular Notification API
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
      });
      return true;
    }
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
}

/**
 * Schedule a notification for a future time
 * @param options Notification options
 * @param delayMs Delay in milliseconds before showing notification
 * @returns Promise<number> - Timeout ID for cancellation
 */
export function scheduleNotification(
  options: NotificationOptions, 
  delayMs: number
): Promise<number> {
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(async () => {
      await sendNotification(options);
      resolve(timeoutId);
    }, delayMs);
    resolve(timeoutId);
  });
}

/**
 * Cancel a scheduled notification
 * @param timeoutId The timeout ID returned by scheduleNotification
 */
export function cancelScheduledNotification(timeoutId: number): void {
  window.clearTimeout(timeoutId);
}
