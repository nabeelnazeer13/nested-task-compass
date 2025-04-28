
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOnlineStatus, OnlineStatus } from '@/hooks/use-online-status';
import { offlineSyncService } from '@/services/offlineSyncService';
import { usePWANotifications, UseNotificationsResult } from '@/hooks/use-pwa-notifications';
import { usePWAInstallation, UseInstallationResult } from '@/hooks/use-pwa-installation';
import { useServiceWorkerUpdates, UseServiceWorkerUpdatesResult } from '@/hooks/use-service-worker-updates';
import { useOfflineSync, UseOfflineSyncResult } from '@/hooks/use-offline-sync';

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
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const networkStatus = useOnlineStatus();
  const isOnline = networkStatus.isOnline;
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  
  // Use our custom hooks
  const notificationsFeatures = usePWANotifications();
  const installationFeatures = usePWAInstallation();
  const serviceWorkerFeatures = useServiceWorkerUpdates();
  const offlineSyncFeatures = useOfflineSync();
  
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

  const value: PWAContextType = {
    isOnline,
    networkStatus,
    ...installationFeatures,
    ...notificationsFeatures,
    pendingChangesCount,
    ...offlineSyncFeatures,
    ...serviceWorkerFeatures
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
