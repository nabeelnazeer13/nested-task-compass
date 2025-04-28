
import React from 'react';
import { usePWA } from '@/context/PWAContext';
import { WifiOff, CloudSync, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

export const OfflineStatusBar = () => {
  const { isOnline, pendingChangesCount, syncPendingChanges } = usePWA();

  if (isOnline && pendingChangesCount === 0) {
    return null;
  }

  const handleSync = async () => {
    if (!isOnline) {
      toast.error("Can't sync while offline. Please check your connection.");
      return;
    }

    toast.promise(syncPendingChanges(), {
      loading: 'Syncing your changes...',
      success: 'All changes synced successfully!',
      error: 'There was a problem syncing your changes.',
    });
  };

  return (
    <div className={`py-2 px-4 flex items-center justify-between ${
      isOnline ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <CloudSync size={18} className="text-amber-600" />
        ) : (
          <WifiOff size={18} className="text-red-600" />
        )}
        <span className="text-sm font-medium">
          {!isOnline 
            ? "You're offline. Changes will sync when you're back online." 
            : `${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''} pending to sync.`
          }
        </span>
      </div>
      {isOnline && pendingChangesCount > 0 && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs bg-amber-100 border-amber-200 hover:bg-amber-200"
          onClick={handleSync}
        >
          <Cloud className="h-3.5 w-3.5 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
};
