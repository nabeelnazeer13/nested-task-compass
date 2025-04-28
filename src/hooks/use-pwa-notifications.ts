
import { useState } from 'react';
import { requestNotificationPermission, sendNotification, NotificationOptions } from '@/services/notificationService';

export interface UseNotificationsResult {
  notificationPermission: string;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (options: NotificationOptions) => Promise<boolean>;
}

export function usePWANotifications(): UseNotificationsResult {
  const [notificationPermission, setNotificationPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermissionHandler = async () => {
    const result = await requestNotificationPermission();
    await checkNotificationPermission();
    return result;
  };

  return {
    notificationPermission,
    requestNotificationPermission: requestNotificationPermissionHandler,
    sendNotification,
  };
}
