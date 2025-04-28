
import { useState, useEffect } from 'react';
import { offlineSyncService } from '../offlineSyncService';
import { OfflineSyncHookResult } from './types';

// Hook to expose online status and offline operations
export const useOfflineSync = (): OfflineSyncHookResult => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  useEffect(() => {
    const checkPendingCount = async () => {
      const count = await offlineSyncService.getPendingOperationsCount();
      setPendingCount(count);
    };
    
    // Subscribe to updates
    const unsubscribe = offlineSyncService.addSyncListener(count => {
      setPendingCount(count);
    });
    
    // Check count initially
    checkPendingCount();
    
    return unsubscribe;
  }, []);
  
  const syncNow = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncService.syncPendingChanges();
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    isOnline: offlineSyncService.isAppOnline(),
    pendingChanges: pendingCount,
    syncNow,
    isSyncing
  };
};
