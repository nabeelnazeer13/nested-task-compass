
import { v4 as uuidv4 } from 'uuid';
import { indexedDBService, PendingOperation, EntityType, OperationType } from '../indexedDBService';
import { syncManager } from '../syncManager';
import { Task, Project, TimeTracking, TimeBlock } from '@/context/TaskTypes';
import { registerBackgroundSync } from './backgroundSyncRegister';
import { 
  syncTaskChange, 
  syncProjectChange, 
  syncTimeTrackingChange, 
  syncTimeBlockChange 
} from './entitySyncOperations';
import { OfflineSyncInterface, OfflineSyncListener } from './types';

/**
 * Enhanced offline sync service using IndexedDB for storage
 */
export class OfflineSyncService implements OfflineSyncInterface {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncListeners: Array<OfflineSyncListener> = [];
  
  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Set up periodic sync attempts when online
    setInterval(() => {
      if (this.isOnline) {
        this.attemptSync();
      }
    }, 60000); // Try every minute
  }

  private handleOnline = async () => {
    console.log('App is online. Attempting to sync pending changes...');
    this.isOnline = true;
    await this.attemptSync();
  };

  private handleOffline = () => {
    console.log('App is offline. Changes will be saved locally.');
    this.isOnline = false;
    this.notifySyncListeners();
  };

  public isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add a listener for sync status changes
   */
  public addSyncListener(listener: OfflineSyncListener): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifySyncListeners(): void {
    this.getPendingOperationsCount().then(count => {
      this.syncListeners.forEach(listener => listener(count));
    });
  }

  /**
   * Record a task change that needs to be synced when back online
   */
  public async addTaskChange(
    operation: OperationType,
    data: Task
  ): Promise<void> {
    await this.addPendingChange('task', operation, data);
    
    // Update local data in IndexedDB
    if (operation === 'create' || operation === 'update') {
      await indexedDBService.saveTask(data);
    } else if (operation === 'delete') {
      await indexedDBService.deleteTask(data.id);
    }
  }

  /**
   * Record a project change that needs to be synced when back online
   */
  public async addProjectChange(
    operation: OperationType,
    data: Project
  ): Promise<void> {
    await this.addPendingChange('project', operation, data);
    
    // Update local data in IndexedDB
    if (operation === 'create' || operation === 'update') {
      await indexedDBService.saveProject(data);
    } else if (operation === 'delete') {
      await indexedDBService.deleteProject(data.id);
    }
  }

  /**
   * Record a time tracking change that needs to be synced when back online
   */
  public async addTimeTrackingChange(
    operation: OperationType,
    data: TimeTracking
  ): Promise<void> {
    await this.addPendingChange('timeTracking', operation, data);
    
    // Update local data in IndexedDB
    if (operation === 'create' || operation === 'update') {
      await indexedDBService.saveTimeTracking(data);
    } else if (operation === 'delete') {
      await indexedDBService.deleteTimeTracking(data.id);
    }
  }

  /**
   * Record a time block change that needs to be synced when back online
   */
  public async addTimeBlockChange(
    operation: OperationType,
    data: TimeBlock
  ): Promise<void> {
    await this.addPendingChange('timeBlock', operation, data);
    
    // Update local data in IndexedDB
    if (operation === 'create' || operation === 'update') {
      await indexedDBService.saveTimeBlock(data);
    } else if (operation === 'delete') {
      await indexedDBService.deleteTimeBlock(data.id);
    }
  }
  
  /**
   * Generic method to record any entity change
   */
  private async addPendingChange(
    entityType: EntityType,
    operation: OperationType,
    data: any
  ): Promise<void> {
    const change: PendingOperation = {
      id: uuidv4(),
      entityType,
      entityId: data.id,
      operation,
      data,
      timestamp: Date.now(),
      attempts: 0
    };

    await indexedDBService.addPendingOperation(change);
    this.notifySyncListeners();

    // If we're online, try to sync immediately
    if (this.isOnline) {
      this.attemptSync();
    }

    // Register for background sync if available
    registerBackgroundSync();
  }

  /**
   * Try to sync all pending changes with the server
   */
  public async attemptSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      const pendingChanges = await indexedDBService.getPendingOperations();
      if (pendingChanges.length === 0) {
        this.syncInProgress = false;
        return;
      }

      console.log(`Attempting to sync ${pendingChanges.length} pending changes`);
      
      // Process changes in the order they were created
      const sortedChanges = [...pendingChanges].sort((a, b) => a.timestamp - b.timestamp);
      
      const maxBatchSize = 5; // Process in small batches to avoid long operations
      const batch = sortedChanges.slice(0, maxBatchSize);
      
      const syncPromises = batch.map(change => this.processSingleChange(change));
      await Promise.allSettled(syncPromises);
      
    } catch (error) {
      console.error('Error during sync attempt:', error);
    } finally {
      this.syncInProgress = false;
      this.notifySyncListeners();
      
      // If there are still pending changes, schedule another attempt
      const remainingCount = await this.getPendingOperationsCount();
      if (remainingCount > 0 && this.isOnline) {
        setTimeout(() => this.attemptSync(), 5000);
      }
    }
  }
  
  /**
   * Process a single change
   * This method is exposed for use by the SyncManager
   */
  public async processSingleChange(change: PendingOperation): Promise<boolean> {
    try {
      // Update attempt count
      change.attempts += 1;
      change.lastAttempt = Date.now();
      await indexedDBService.updatePendingOperation(change);
      
      let success = false;
      
      switch (change.entityType) {
        case 'task':
          success = await syncTaskChange(change);
          break;
        case 'project':
          success = await syncProjectChange(change);
          break;
        case 'timeTracking':
          success = await syncTimeTrackingChange(change);
          break;
        case 'timeBlock':
          success = await syncTimeBlockChange(change);
          break;
      }
      
      if (success) {
        await indexedDBService.deletePendingOperation(change.id);
        console.log(`Successfully synced change: ${change.id}`);
        return true;
      } else if (change.attempts >= 5) {
        // After 5 failed attempts, mark as requiring manual resolution
        console.warn(`Sync failed after ${change.attempts} attempts for change: ${change.id}`);
        // Here you could implement a conflict resolution UI
        return false;
      }
      return false;
    } catch (error) {
      console.error(`Error syncing change ${change.id}:`, error);
      return false;
    }
  }

  /**
   * Get the current list of pending changes
   */
  public async getPendingOperations(): Promise<PendingOperation[]> {
    return await indexedDBService.getPendingOperations();
  }

  /**
   * Get the current count of pending changes
   */
  public async getPendingOperationsCount(): Promise<number> {
    const pendingChanges = await indexedDBService.getPendingOperations();
    return pendingChanges.length;
  }
  
  /**
   * Force sync all pending changes with the server
   * Now uses the SyncManager for better retry handling
   */
  public async syncPendingChanges(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync while offline');
      return;
    }
    
    console.log('Manual sync triggered, using SyncManager');
    const result = await syncManager.syncAll();
    console.log(`Sync complete: ${result.success} succeeded, ${result.failed} failed`);
    this.notifySyncListeners();
  }
  
  /**
   * Delete a pending operation
   */
  public async deletePendingOperation(id: string): Promise<void> {
    await indexedDBService.deletePendingOperation(id);
    this.notifySyncListeners();
  }
  
  /**
   * Clear all pending changes
   */
  public async clearPendingChanges(): Promise<void> {
    const operations = await indexedDBService.getPendingOperations();
    await Promise.all(operations.map(op => indexedDBService.deletePendingOperation(op.id)));
    this.notifySyncListeners();
  }

  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}
