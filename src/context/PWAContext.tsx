
import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestNotificationPermission, sendNotification, NotificationOptions } from '@/services/notificationService';
import { offlineSyncService } from '@/services/offlineSyncService';

interface PWAContextType {
  isOnline: boolean;
  isPWA: boolean;
  isInstallable: boolean;
  promptInstall: () => Promise<void>;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (options: NotificationOptions) => Promise<boolean>;
  pendingChangesCount: number;
  syncPendingChanges: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(
    offlineSyncService.getPendingChanges().length
  );

  useEffect(() => {
    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsPWA(true);
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
    const checkPendingChanges = () => {
      setPendingChangesCount(offlineSyncService.getPendingChanges().length);
    };
    
    // Check initially and every 30 seconds
    checkPendingChanges();
    const interval = setInterval(checkPendingChanges, 30000);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearInterval(interval);
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
    await offlineSyncService.syncPendingChanges();
    setPendingChangesCount(offlineSyncService.getPendingChanges().length);
  };

  const value: PWAContextType = {
    isOnline,
    isPWA,
    isInstallable,
    promptInstall,
    notificationPermission,
    requestNotificationPermission: requestNotificationPermissionHandler,
    sendNotification,
    pendingChangesCount,
    syncPendingChanges: syncHandler,
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
