
import { Task, Project, TimeBlock, TimeTracking } from '@/context/TaskTypes';
import { v4 as uuidv4 } from 'uuid';
import { indexedDBService, PendingOperation, EntityType, OperationType } from './indexedDBService';
import * as taskService from '@/services/taskService';
import * as projectService from '@/services/projectService';
import * as timeTrackingService from '@/services/timeTrackingService';
import * as timeBlockService from '@/services/timeBlockService';
import React, { useState, useEffect } from 'react';

/**
 * Enhanced offline sync service using IndexedDB for storage
 */
export class OfflineSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncListeners: Array<(count: number) => void> = [];
  
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
  public addSyncListener(listener: (count: number) => void): () => void {
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
    this.registerBackgroundSync();
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
   */
  private async processSingleChange(change: PendingOperation): Promise<void> {
    try {
      // Update attempt count
      change.attempts += 1;
      change.lastAttempt = Date.now();
      await indexedDBService.updatePendingOperation(change);
      
      let success = false;
      
      switch (change.entityType) {
        case 'task':
          success = await this.syncTaskChange(change);
          break;
        case 'project':
          success = await this.syncProjectChange(change);
          break;
        case 'timeTracking':
          success = await this.syncTimeTrackingChange(change);
          break;
        case 'timeBlock':
          success = await this.syncTimeBlockChange(change);
          break;
      }
      
      if (success) {
        await indexedDBService.deletePendingOperation(change.id);
        console.log(`Successfully synced change: ${change.id}`);
      } else if (change.attempts >= 5) {
        // After 5 failed attempts, mark as requiring manual resolution
        console.warn(`Sync failed after ${change.attempts} attempts for change: ${change.id}`);
        // Here you could implement a conflict resolution UI
      }
    } catch (error) {
      console.error(`Error syncing change ${change.id}:`, error);
    }
  }
  
  private async syncTaskChange(change: PendingOperation): Promise<boolean> {
    try {
      switch (change.operation) {
        case 'create':
          await taskService.createTask(change.data);
          break;
        case 'update':
          await taskService.updateTask(change.data);
          break;
        case 'delete':
          await taskService.deleteTask(change.entityId);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Error syncing task change:`, error);
      return false;
    }
  }
  
  private async syncProjectChange(change: PendingOperation): Promise<boolean> {
    try {
      switch (change.operation) {
        case 'create':
          await projectService.createProject(change.data);
          break;
        case 'update':
          await projectService.updateProject(change.data);
          break;
        case 'delete':
          await projectService.deleteProject(change.entityId);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Error syncing project change:`, error);
      return false;
    }
  }
  
  private async syncTimeTrackingChange(change: PendingOperation): Promise<boolean> {
    try {
      switch (change.operation) {
        case 'create':
          await timeTrackingService.addManualTimeTracking(change.data);
          break;
        case 'update':
          await timeTrackingService.updateTimeTracking(change.data);
          break;
        case 'delete':
          await timeTrackingService.deleteTimeTracking(change.entityId);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Error syncing time tracking change:`, error);
      return false;
    }
  }
  
  private async syncTimeBlockChange(change: PendingOperation): Promise<boolean> {
    try {
      switch (change.operation) {
        case 'create':
          await timeBlockService.createTimeBlock(change.data);
          break;
        case 'update':
          await timeBlockService.updateTimeBlock(change.data);
          break;
        case 'delete':
          await timeBlockService.deleteTimeBlock(change.entityId);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Error syncing time block change:`, error);
      return false;
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
   * Get the current count of pending changes
   */
  public async getPendingOperationsCount(): Promise<number> {
    const pendingChanges = await indexedDBService.getPendingOperations();
    return pendingChanges.length;
  }
  
  /**
   * Force sync all pending changes with the server
   */
  public syncPendingChanges(): Promise<void> {
    return this.attemptSync();
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

// Create and export a singleton instance
export const offlineSyncService = new OfflineSyncService();

// Hook to expose online status and offline operations
export const useOfflineSync = () => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  
  useEffect(() => {
    const checkPendingCount = async () => {
      const count = await offlineSyncService.getPendingOperationsCount();
      setPendingCount(count);
    };
    
    // Check count initially
    checkPendingCount();
    
    // Subscribe to updates
    const unsubscribe = offlineSyncService.addSyncListener(count => {
      setPendingCount(count);
    });
    
    return unsubscribe;
  }, []);
  
  return {
    isOnline: offlineSyncService.isAppOnline(),
    pendingChanges: pendingCount,
    syncNow: () => offlineSyncService.syncPendingChanges(),
  };
};
