
import { Task, Project } from '@/context/TaskTypes';
import { v4 as uuidv4 } from 'uuid';

// Define sync operations
type SyncOperation = 'create' | 'update' | 'delete';

// Define the structure of pending changes to be synced
interface PendingChange {
  id: string;
  entityType: 'task' | 'project';
  entityId: string;
  operation: SyncOperation;
  data: Task | Project;
  timestamp: number;
}

const STORAGE_KEY = 'offline-pending-changes';

/**
 * Store pending changes when working offline
 */
export class OfflineSyncService {
  private pendingChanges: PendingChange[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.loadFromStorage();
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    console.log('App is online. Attempting to sync pending changes...');
    this.isOnline = true;
    this.syncPendingChanges();
  };

  private handleOffline = () => {
    console.log('App is offline. Changes will be saved locally.');
    this.isOnline = false;
  };

  public isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Record a change that needs to be synced when back online
   */
  public addPendingChange(
    entityType: 'task' | 'project',
    operation: SyncOperation,
    data: Task | Project
  ): void {
    const change: PendingChange = {
      id: uuidv4(),
      entityType,
      entityId: data.id,
      operation,
      data,
      timestamp: Date.now(),
    };

    this.pendingChanges.push(change);
    this.saveToStorage();

    // If we're online, try to sync immediately
    if (this.isOnline) {
      this.syncPendingChanges();
    }

    // Register for background sync if available
    this.registerBackgroundSync();
  }

  /**
   * Try to sync all pending changes with the server
   */
  public async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.pendingChanges.length === 0) {
      return;
    }

    console.log(`Attempting to sync ${this.pendingChanges.length} pending changes`);
    
    // Process changes in the order they were created
    const sortedChanges = [...this.pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
    
    const successfulSyncs: string[] = [];

    for (const change of sortedChanges) {
      try {
        let success = false;

        // Here you would implement the actual syncing logic with your server
        // This would depend on your API structure
        switch (change.operation) {
          case 'create':
            // API call to create entity
            console.log(`Syncing: Create ${change.entityType} operation`);
            success = true; // Replace with actual API result
            break;
            
          case 'update':
            // API call to update entity
            console.log(`Syncing: Update ${change.entityType} operation`);
            success = true; // Replace with actual API result
            break;
            
          case 'delete':
            // API call to delete entity
            console.log(`Syncing: Delete ${change.entityType} operation`);
            success = true; // Replace with actual API result
            break;
        }

        if (success) {
          console.log(`Successfully synced change: ${change.id}`);
          successfulSyncs.push(change.id);
        }
      } catch (error) {
        console.error(`Error syncing change ${change.id}:`, error);
      }
    }

    // Remove successfully synced changes
    if (successfulSyncs.length > 0) {
      this.pendingChanges = this.pendingChanges.filter(
        (change) => !successfulSyncs.includes(change.id)
      );
      this.saveToStorage();
    }
  }

  /**
   * Register for background sync if the API is available
   */
  private registerBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check if the sync API is available
        if ('sync' in registration) {
          // TypeScript doesn't recognize the sync API directly
          // Using any to bypass the TypeScript error
          (registration as any).sync.register('sync-tasks').catch((error: Error) => {
            console.error('Error registering background sync:', error);
          });
        }
      });
    }
  }

  /**
   * Save pending changes to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pendingChanges));
    } catch (error) {
      console.error('Error saving pending changes to localStorage:', error);
    }
  }

  /**
   * Load pending changes from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.pendingChanges = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending changes from localStorage:', error);
    }
  }

  /**
   * Get the current pending changes
   */
  public getPendingChanges(): PendingChange[] {
    return [...this.pendingChanges];
  }

  /**
   * Clear all pending changes
   */
  public clearPendingChanges(): void {
    this.pendingChanges = [];
    this.saveToStorage();
  }

  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Create and export a singleton instance
export const offlineSyncService = new OfflineSyncService();

// Hook to expose online status
export const useOfflineSync = () => {
  return {
    isOnline: offlineSyncService.isAppOnline(),
    pendingChanges: offlineSyncService.getPendingChanges(),
    syncNow: () => offlineSyncService.syncPendingChanges(),
  };
};
