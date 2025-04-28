
import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestNotificationPermission, sendNotification, NotificationOptions } from '@/services/notificationService';
import { offlineSyncService } from '@/services/offlineSyncService';
import { useOnlineStatus, OnlineStatus } from '@/hooks/use-online-status';
import { syncManager } from '@/services/syncManager';

interface PWAContextType {
  isOnline: boolean;
  networkStatus: OnlineStatus;
  isPWA: boolean;
  isInstallable: boolean;
  promptInstall: () => Promise<void>;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (options: NotificationOptions) => Promise<boolean>;
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
  
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [newVersionAvailable, setNewVersionAvailable] = useState<boolean>(false);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsPWA(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default browser install prompt
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsPWA(true);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Track pending offline changes
    const checkPendingChanges = async () => {
      const count = await offlineSyncService.getPendingOperationsCount();
      setPendingChangesCount(count);
    };
    
    // Set up listener for pending changes
    const unsubscribe = offlineSyncService.addSyncListener(count => {
      setPendingChangesCount(count);
    });
    
    // Check initially
    checkPendingChanges();
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNewVersionAvailable(true);
                setWaitingServiceWorker(registration.waiting);
              }
            });
          }
        });
      });
      
      // Detect controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      unsubscribe();
    };
  }, []);

  const promptInstall = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return;
    }

    // Show the installation prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // We no longer need the prompt regardless of outcome
    setDeferredPrompt(null);
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };

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

  const syncHandler = async () => {
    if (isOnline) {
      setIsSyncing(true);
      try {
        await offlineSyncService.syncPendingChanges();
      } finally {
        setIsSyncing(false);
      }
    } else {
      console.log("Can't sync while offline");
      return Promise.reject(new Error("Cannot sync while offline"));
    }
  };
  
  const triggerBackgroundSync = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }
    
    try {
      setIsSyncing(true);
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await registration.sync.register('sync-tasks');
        console.log('Background sync requested');
        return true;
      } else {
        console.log('Background sync API not supported, falling back to manual sync');
        await offlineSyncService.syncPendingChanges();
        return true;
      }
    } catch (error) {
      console.error('Error triggering background sync:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  const updateServiceWorker = async () => {
    if (waitingServiceWorker) {
      // Send a message to the waiting service worker to skip waiting
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      setNewVersionAvailable(false);
    }
  };

  const value: PWAContextType = {
    isOnline,
    networkStatus,
    isPWA,
    isInstallable,
    promptInstall,
    notificationPermission,
    requestNotificationPermission: requestNotificationPermissionHandler,
    sendNotification,
    pendingChangesCount,
    syncPendingChanges: syncHandler,
    triggerBackgroundSync,
    isSyncing,
    newVersionAvailable,
    updateServiceWorker,
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
