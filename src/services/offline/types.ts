
import { Task, Project, TimeTracking, TimeBlock } from '@/context/TaskTypes';
import { EntityType, OperationType, PendingOperation } from '../indexedDBService';

export interface OfflineSyncListener {
  (count: number): void;
}

export interface SyncResult {
  success: number;
  failed: number;
}

export interface OfflineSyncInterface {
  isAppOnline(): boolean;
  addSyncListener(listener: OfflineSyncListener): () => void;
  addTaskChange(operation: OperationType, data: Task): Promise<void>;
  addProjectChange(operation: OperationType, data: Project): Promise<void>;
  addTimeTrackingChange(operation: OperationType, data: TimeTracking): Promise<void>;
  addTimeBlockChange(operation: OperationType, data: TimeBlock): Promise<void>;
  getPendingOperations(): Promise<PendingOperation[]>;
  getPendingOperationsCount(): Promise<number>;
  syncPendingChanges(): Promise<void>;
  processSingleChange(change: PendingOperation): Promise<boolean>;
  deletePendingOperation(id: string): Promise<void>;
  clearPendingChanges(): Promise<void>;
  cleanup(): void;
}

export interface OfflineSyncHookResult {
  isOnline: boolean;
  pendingChanges: number;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
}
