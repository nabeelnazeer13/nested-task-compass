
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOnlineStatus, OnlineStatus } from '@/hooks/use-online-status';
import { offlineSyncService } from '@/services/offlineSyncService';
import { usePWANotifications, UseNotificationsResult } from '@/hooks/use-pwa-notifications';
import { usePWAInstallation, UseInstallationResult } from '@/hooks/use-pwa-installation';
import { useServiceWorkerUpdates, UseServiceWorkerUpdatesResult } from '@/hooks/use-service-worker-updates';
import { useOfflineSync, UseOfflineSyncResult } from '@/hooks/use-offline-sync';
import { 
  initNotificationSystem,
  scheduleDailySummary,
  updateTaskReminders,
  sendTodaySummaryNotification
} from '@/services/scheduledNotificationService';
import { useTaskContext } from '@/context/TaskContext';
import { Task } from './TaskTypes';

interface PWAContextType {
  isOnline: boolean;
  networkStatus: OnlineStatus;
  isPWA: boolean;
  isInstallable: boolean;
  promptInstall: () => Promise<void>;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (options: any) => Promise<boolean>;
  pendingChangesCount: number;
  syncPendingChanges: () => Promise<void>;
  triggerBackgroundSync: () => Promise<boolean>;
  isSyncing: boolean;
  newVersionAvailable: boolean;
  updateServiceWorker: () => Promise<void>;
  scheduleDailyNotification: (time?: string) => void;
  scheduleTaskNotification: (task: Task) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const networkStatus = useOnlineStatus();
  const isOnline = networkStatus.isOnline;
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    // Use stored preference or default to true
    const stored = localStorage.getItem('notificationsEnabled');
    return stored !== null ? stored === 'true' : true;
  });
  
  // Use our custom hooks
  const notificationsFeatures = usePWANotifications();
  const installationFeatures = usePWAInstallation();
  const serviceWorkerFeatures = useServiceWorkerUpdates();
  const offlineSyncFeatures = useOfflineSync();
  
  // Get tasks from context to use in notifications
  const { tasks } = useTaskContext();
  
  useEffect(() => {
    const checkPendingChanges = async () => {
      const count = await offlineSyncService.getPendingOperationsCount();
      setPendingChangesCount(count);
    };
    
    const unsubscribe = offlineSyncService.addSyncListener(count => {
      setPendingChangesCount(count);
    });
    
    checkPendingChanges();
    
    return unsubscribe;
  }, []);

  // Initialize notification system when permission is granted
  useEffect(() => {
    if (notificationsFeatures.notificationPermission === 'granted' && notificationsEnabled) {
      initNotificationSystem();
    }
  }, [notificationsFeatures.notificationPermission, notificationsEnabled]);

  // Save notifications preference
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  // Listen for messages from service worker
  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        console.log('Notification clicked:', event.data);
        
        // Handle different notification types
        if (event.data.notificationType === 'daily') {
          // Navigate to calendar view for daily summary
          window.location.href = '/?view=calendar';
        } else if (event.data.notificationType === 'reminder' && event.data.taskId) {
          // Show the task details
          const task = tasks.find(t => t.id === event.data.taskId);
          if (task) {
            // Logic to show task details would go here
            console.log('Opening task:', task.title);
            // You could dispatch an event or update state to open the task
          }
        }
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [tasks]);

  const scheduleDailyNotification = (time?: string) => {
    if (!notificationsEnabled) return;
    
    let targetTime: Date | undefined;
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // If the time is in the past for today, schedule it for tomorrow
      if (targetTime < new Date()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
    }
    
    scheduleDailySummary(targetTime);
  };

  const scheduleTaskNotification = (task: Task) => {
    if (!notificationsEnabled) return;
    
    if (task.dueDate && task.timeSlot) {
      updateTaskReminders(task);
    }
  };

  const handleSetNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    
    if (enabled) {
      // If enabling notifications, re-initialize the system
      initNotificationSystem();
      
      // Send today's summary notification immediately if during day hours (8am-8pm)
      const hour = new Date().getHours();
      if (hour >= 8 && hour < 20 && tasks.length > 0) {
        sendTodaySummaryNotification(tasks);
      }
    }
  };

  const value: PWAContextType = {
    isOnline,
    networkStatus,
    ...installationFeatures,
    ...notificationsFeatures,
    pendingChangesCount,
    ...offlineSyncFeatures,
    ...serviceWorkerFeatures,
    scheduleDailyNotification,
    scheduleTaskNotification,
    notificationsEnabled,
    setNotificationsEnabled: handleSetNotificationsEnabled
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
