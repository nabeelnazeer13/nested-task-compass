
import { useState } from 'react';
import { offlineSyncService } from '@/services/offlineSyncService';

export interface UseOfflineSyncResult {
  pendingChangesCount: number;
  syncPendingChanges: () => Promise<void>;
  triggerBackgroundSync: () => Promise<boolean>;
  isSyncing: boolean;
}

export function useOfflineSync(): UseOfflineSyncResult {
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const syncHandler = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncService.syncPendingChanges();
    } finally {
      setIsSyncing(false);
    }
  };
  
  const triggerBackgroundSync = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }
    
    try {
      setIsSyncing(true);
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.sync) {
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

  return {
    pendingChangesCount,
    syncPendingChanges: syncHandler,
    triggerBackgroundSync,
    isSyncing
  };
}
